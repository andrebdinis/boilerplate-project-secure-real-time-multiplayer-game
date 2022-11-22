//------------------ GAME/SOCKET.IO SERVER-SIDE (NODE.js) --------------------- added!

let Collectible = require('./public/Collectible.mjs')
const { uid } = require('./public/util/random.mjs')
const { getTime } = require('./public/util/time.mjs')
let players // list of connected players
let coinCount, maxCoinCount, coin, coinsLeft
let result
let connsLimitPerIp = 2 // Connections Limit per IP Restriction
let GAME_STATE;

function resetGameVariables() {
  players = []
  coinCount = 0
  maxCoinCount = 25 // coins to be generated until game over
  coinsLeft = maxCoinCount // controls how many coins remain to be caught
  coin = new Collectible({ id: uid() })
  coinCount++
  result = null
}


function initiateGame(io) {
  // Initialize/Reset game variables
  resetGameVariables()
  // Start socket.io connection
  runIO(io)
}


function runIO(io) {
  GAME_STATE = 'INITIATED';
  
  io.on('connection', (socket) => {
    let ip = getIpAddress(socket);
    console.log(`${getTime()}: Connected ${socket.id}`)
    
    // Check if an IP does not make more connections than what is allowed
    let connAuthorization = connsPerIpRestriction(ip, players, connsLimitPerIp);
    socket.connAuthorization = connAuthorization
    
    if (connAuthorization === 'restricted') {
      console.log(`Denied connection.\nWarning: Limit of ${connsLimitPerIp} connections per IP address active.`)
    }
    else {
      
      // Gives time for Client-Side (game.mjs) to fully load its document in order to be able to listen server.js requests
      setTimeout(() => socket.emit('initiate', { GAME_STATE: GAME_STATE, id: socket.id, players: players, coin: coin, coinsLeft: coinsLeft, ip: ip }), 250)
        
      socket.on('new-player', (newPlayer) => {
        let hasPlayer = players.slice().filter((p) => p.id === newPlayer.id).length
        if (!hasPlayer) players.push(newPlayer)
        socket.broadcast.emit('new-player', newPlayer)
      })
    
      socket.on('move-player', (direction, posObj) => {
        socket.broadcast.emit('move-player', { id: socket.id, direction: direction, posObj: posObj})
      })
    
      socket.on('stop-player', (direction, posObj) => {
        socket.broadcast.emit('stop-player', { id: socket.id, direction: direction, posObj: posObj})
      })
      
      socket.on('destroy-coin', ({ catcherId, coinValue, coinId }) => {
        // If coin received is really the coin to be destroyed
        if(coin.id === coinId) {
          coin.id = 'null'; // necessary to keep from iterating lots of times when game ends
          coinsLeft--;
          io.emit('coins-left', coinsLeft)
    
          // Find and update player's score
          let playerObj = players.find((player) => player.id === catcherId)
          playerObj.score += coinValue
          io.emit('update-player', playerObj)
    
          // Was it the last coin to catch?
          if(coinCount === maxCoinCount) {
            GAME_STATE = 'GAMEOVER';
            
            // Get sorted list of players by score (desc. order)
            let sortedPlayers = players.slice().sort((a,b) => b.score - a.score)
            // Get the winner (player)
            let winner = sortedPlayers[0]
    
            // Send 'win' or 'lose' message to each player
            sortedPlayers.forEach((player) => {
              if(player.id === winner.id)
                io.to(winner.id).emit('game-over', 'win')
              else
                io.to(player.id).emit('game-over', 'lose')
            })
  
            // resets game variables to prepare for a new game
            setTimeout(() => resetGameVariables(io), 100)
            io.emit('coins-left', 0)
          }
          else {
            GAME_STATE = 'INITIATED';
            // Create New Coin
            coinValue = (coinValue == 1 ||
                         coinValue == 2 ||
                         coinValue == 3) ? coinValue + 1 : 1
            coin = new Collectible({ id: uid(), value: coinValue })
            io.emit('new-coin', coin)
      
            // Increment Coin Count
            coinCount++
          }
        }
      })
  
      // On game over, if one player pushes 'ENTER', all players page automatically refreshes for a new game to start at the same time
      socket.on('restart-game', () => {
        io.emit('restart-game')
        resetGameVariables()
        GAME_STATE = 'INITIATED';
      })
      
      socket.on('disconnect', () => {
        console.log(`${getTime()}: Disconnected ${socket.id}`)

        let playerFound = players.filter((p) => p.id == socket.id)
        if (playerFound.length > 0) {
          players = players.slice().filter((player) => player.id != socket.id)
          // Check if socket really connected before
          if (socket.connAuthorization === 'allowed') {
            io.emit('remove-player', socket.id)
          }
          // else did not connect before, do not display anything to client
        }
      })

    }
  })
}


function getIpAddress(socket) {
  let ip = socket.handshake.address
  ip = ip.slice(ip.lastIndexOf(':')+1)
  return ip
}

function connsPerIpRestriction(ip, players, connsLimitPerIp) {
  if (connsLimitPerIp != 0 && players.length > 0) {
    let connsPerIp = players.filter((p) => p.ip === ip).length
    if (connsPerIp >= connsLimitPerIp)
      return 'restricted'
  }
  return 'allowed'
}


module.exports = {
  initiateGame
}