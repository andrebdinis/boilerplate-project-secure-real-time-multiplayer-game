require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
//const socket = require('socket.io'); //---------> commented out!
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

// PACKAGE.JSON configuration file // ----- changed!
// - changed "start" script to delay 50s between changing code and restarting server and to not show deprecation warnings:
// "start": "nodemon --delay 50 --no-deprecation server.js"

// Socket.io Server-side (Node.js) //-------------------> added!
const httpServer = require('http').createServer(app) // returns a new instance of http.Server
// socket.io receives http server instance and sets CORS origin as true
const io = require('socket.io')(httpServer, {
  cors: {
    //origin: true
    origin: "*"
    //origin: "https://boilerplate-project-secure-real-time-multiplayer-game.andrebdinis.repl.co"
  }
})
// CORS CONFIGURATION OPTIONS: https://github.com/expressjs/cors#configuration-options
//NOTE: Since Socket.IO v3, you need to explicitly enable Cross-Origin Resource Sharing (CORS).                   

// Security Features: //----------------------------> added!
const helmet = require('helmet') // helmet@^3.21.3
app.use(helmet.noSniff()) // Prevent the client from trying to guess / sniff the MIME type
app.use(helmet.xssFilter()) // Prevent cross-site scripting (XSS) attacks
app.use(helmet.noCache()) // Nothing from the website is cached in the client
app.use(function(req, res, next) {
  res.header('X-Powered-By', 'PHP 7.4.3')
  next()
})
function getHeaderXPoweredBy(res) {
  const obj = res.header()
  const symbol_kOutHeaders = Object.getOwnPropertySymbols(obj)[3] // [Symbol(kOutHeaders)]
  const xPoweredBy = obj[symbol_kOutHeaders]['x-powered-by'] // [ 'X-Powered-By', 'PHP 7.4.3' ]
  return xPoweredBy
}

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
}); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//------------------ SOCKET.IO SERVER-SIDE (NODE.js) --------------------- added!
let Collectible = require('./public/Collectible.mjs')
let { generateStartPos, canvasCalcs } = require('./public/canvas-data.mjs')

let players = []
let coins = []
let coins_limit = 5
let coin = new Collectible({
    id: uid(),
    x: generateStartPos(canvasCalcs.playFieldMinX, canvasCalcs.playFieldMaxX, 5),
    y: generateStartPos(canvasCalcs.playFieldMinY, canvasCalcs.playFieldMaxY, 5)
  })
coins.push(coin)
let result


io.on('connection', (socket) => {
  console.log(`Connected ${socket.id}`)

  socket.emit('init', { id: socket.id, players: players, coin: coin })
    
  socket.on('new-player', (newPlayer) => {
    socket.broadcast.emit('new-player', newPlayer)
    let hasPlayer = players.slice().filter((p) => p.id === newPlayer.id).length
    if (!hasPlayer) players.push(newPlayer)
  })

  socket.on('move-player', (dir, posObj) => {
    socket.broadcast.emit('move-player', { id: socket.id, dir: dir, posObj: posObj})
  })

  socket.on('stop-player', (dir, posObj) => {
    socket.broadcast.emit('stop-player', { id: socket.id, dir: dir, posObj: posObj})
  })

  socket.on('destroy-item', async ({ playerId, coinValue, coinId }) => {
    if(coin.id === coinId) {

      // Find and Update Player's Score
      let playerObj = players.find((player) => player.id === playerId)
      playerObj.score += coinValue
      io.emit('update-player', playerObj)

      // Was It The Last Coin To Catch ?
      if(coins.length === coins_limit) {
        
        // Get Sorted List Of Players By Score (descending order) 
        let sortedPlayers = players.slice().sort((a,b) => b.score - a.score)
        // Get The Winner (Player)
        let winner = sortedPlayers[0]

        // Send 'Win' or 'Lose' message to Each Player
        sortedPlayers.forEach((player) => {
          if(player.id === winner.id) {
            io.to(winner.id).emit('end-game', 'win')
          }
          else {
            io.to(player.id).emit('end-game', 'lose')
          }
        })
        
        /*const sockets = await io.fetchSockets()

        for (let s of sockets) {
          if(s.id === winner.id) {
            s.emit('end-game', 'win')
            s.broadcast.emit('end-game', 'lose')
          }
        }*/
        
        /*for (const [_, socket] of io.of("/").sockets) {
          if(socket.id === winner.id) {
            socket.emit('end-game', 'win')
            socket.broadcast.emit('end-game', 'lose')
          }
        }*/
      }
      else {
        // Create New Coin
        coinValue = (coinValue == 1 || coinValue == 2) ? coinValue + 1 : 1
        coin = new Collectible({
          id: uid(),
          value: coinValue,
          x: generateStartPos(canvasCalcs.playFieldMinX, canvasCalcs.playFieldMaxX, 5),
          y: generateStartPos(canvasCalcs.playFieldMinY, canvasCalcs.playFieldMaxY, 5)
        })
        io.emit('new-coin', coin)
  
        // Save New Coin In Collection Of Coins
        coins.push(coin)
      }
    }
  })  

  socket.on('disconnect', () => {
    console.log(`Disconnected ${socket.id}`)
    io.emit('remove-player', socket.id)
    players = players.slice().filter((player) => player.id != socket.id)
  })
})


//---------------------------------------------------------------

// AUXILIARY FUNCTIONS

function uid() {
  return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
};

//---------------------------------------------------------------
//---------------------------------------------------------------

const portNum = process.env.PORT || 3000;

// Set up server and tests
//const server = app.listen(portNum, () => { //--------> commented out!
httpServer.listen(portNum, () => { //------------------> added!
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
