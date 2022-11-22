require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

// Package.json Config File //-------------------> changed!
// - changed "start" script to delay 200s between changing code and restarting server and to not show deprecation warnings:
// "start": "nodemon --delay 200 --no-deprecation server.js"

// Http and Socket.io //-------------------> added!
// returns a new instance of http.Server
const httpServer = require('http').createServer(app)
// socket.io receives http server instance and sets CORS origin as true
const io = require('socket.io')(httpServer, {
  cors: {
    origin: "*" // The "*" wildcard tells browsers to allow any origin to access the resource
  }
})

// Security Features: //----------------------------> added!
const helmet = require('helmet') // helmet@^3.21.3
app.use(helmet.noSniff()) // Prevent the client from trying to guess / sniff the MIME type
app.use(helmet.xssFilter()) // Prevent cross-site scripting (XSS) attacks
app.use(helmet.noCache()) // Nothing from the website is cached in the client
app.use(function(req, res, next) {
  res.header('X-Powered-By', 'PHP 7.4.3') // Changes x-powered-by header value
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

// Game/Socket.io Server-side (Node.js)--------------------- added!
const { initiateGame } = require('./gameServer.js')
initiateGame(io)

// Get port number
const portNum = process.env.PORT || 3000;

// Set up server and tests
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
