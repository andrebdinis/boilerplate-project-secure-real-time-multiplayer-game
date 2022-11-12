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
  //res.set('x-powered-by', 'PHP 7.4.3')
  
  // Check if "X-Powered-By" header changed
  //const xPoweredBy = getHeaderXPoweredBy(res)
  //console.log('X-Powered-By:', xPoweredBy)
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

//--------------------------------------------------------------- // added!
//------------------ SOCKET.IO SERVER-SIDE (NODE.js) ---------------------

io.use((socket, next) => {
  next();
})

let players = []
let coin

io.on('connection', (socket) => {
  console.log(`Connected ${socket.id}`)
  io.emit('current-sockets', Object.keys(io.sockets.sockets))

  // Server receives the message that one socket wants to start its game,
  // and sends that information to all sockets so that they update themselves
  socket.on('startGame', () => {
    io.emit('startGame', { id: socket.id, players: players, coin: coin })
  })

  // Server receives a new player
  socket.on('new-player', (newPlayer) => {
    // If server has not already have the new player, adds him to its list
    let hasPlayer = players.slice().filter((p) => p.id == newPlayer.id).length
    if (!hasPlayer) {
      players.push(newPlayer)
    }
    // Server must inform all sockets EXCEPT THE SENDER of this new player
    socket.broadcast.emit('new-player', newPlayer)
  })
  
  socket.on('new-coin', (newCoin) => {
    coin = newCoin
    socket.broadcast.emit('new-coin', coin)
  })

  socket.on('disconnect', () => {
    console.log(`Disconnected ${socket.id}`)
    io.emit('current-sockets', Object.keys(io.sockets.sockets))
    
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
