import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import controls from './controls.mjs'
import { playerArt, itemArt, getItemImage } from './art.mjs'
import { uid, getRandomCoordinates, getDistancedRandomCoordinates, getRandomArt } from './random.mjs'
import { component, textComponent, gamingFrameComponent } from './components/components.mjs'

var background, title_controls, title_coinRace, title_rank
var gamingFrame, playerOne, playerTwo, item
var currPlayers = []
function findPlayer(arr, socket_id) {
  for (let p of arr) {
    if (p.id == socket_id)
      return true
  }
  return false
}
//var obstacle; var obstacles = []; var score;
const colors = {
  white: 'rgba(255, 255, 255, 1)', // "white"
  darkBlue: 'rgba(0, 36, 57, 1)'
}
function getGamingFrameConfig() {
  const border = 5
  return {
    border : 5,
    width : gameArea.canvas.width - (border * 2),
    height : gameArea.canvas.height - (50 + border),
    strokeStyle : colors.white,
    lineWidth : '3',
    x : border,
    y : 50
  }
}
function constructGameArea() {
  const gameAreaConstruction = {
    canvas : document.getElementById('game-window'),
    status: 'constructed',
    start : function() {
      console.log('GAME AREA: START()')
      this.canvas.width = 640
      this.canvas.height = 480
      this.context = this.canvas.getContext('2d', { alpha: false, willReadFrequently: true })
      this.frameNo = 0 // frames counter
      this.gamingFrame = getGamingFrameConfig()
      this.interval = setInterval(updateGameArea, 20) // component is drawn and cleared 50 times per second
      // Keyboard Controls
      window.addEventListener('keydown', function(e) {
        gameArea.keys = (gameArea.keys || [])
        gameArea.keys[e.keyCode] = true
      })
      window.addEventListener('keyup', function(e) {
        gameArea.keys[e.keyCode] = false
      })
      this.status = 'started'
    },
    clear : function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      status = 'cleared'
    },
    stop : function() {
      clearInterval(this.interval)
      status = 'stopped'
    }
  }
  return gameAreaConstruction
}
var gameArea = constructGameArea()




function startGame() {
  console.log('START GAME')

  // Create Background Component
  background = new component(gameArea.canvas.width, gameArea.canvas.height, colors.darkBlue, 0, 0)

  // Create Text Components
  title_controls = new textComponent('13px', 'Press Start 2P', 'left', colors.white, 10, 35)
  title_coinRace = new textComponent('16px', 'Press Start 2P', 'center', colors.white, gameArea.canvas.width / 2, 35)
  title_rank = new textComponent('13px', 'Press Start 2P', 'right', colors.white, gameArea.canvas.width - 10, 35)

  const gfConfig = getGamingFrameConfig()

  // Create Gaming Frame Component
  gamingFrame = new gamingFrameComponent(gfConfig.width, gfConfig.height, gfConfig.strokeStyle, gfConfig.lineWidth, gfConfig.x, gfConfig.y)

  // Create Player One
  //(...)

  // Create Item
  //(...)

  gameArea.start()
}

function restartGame(gameArea) {
  console.log('RESTART GAME')
  gameArea.stop()
  gameArea = constructGameArea()
  gameArea.status = 'restarting...'
  startGame()
}

function updateGameArea() {
  console.log('[--UPDATE GAME AREA--]')

  // Checks for Collision with Item
  if (item) {
    currPlayers.map((player) => {
      if (player.collisionWith(item)) {   
        player.score += item.value
        console.log(`Player ${player.id} Score:`, player.score)
        let newCoords = getDistancedRandomCoordinates(getGamingFrameConfig(), player)
        item = new Collectible({ id: uid(), image: getRandomArt(itemArt), width: 25, height: 25, x: newCoords.x, y: newCoords.y, value: 1 })
        socket.emit('new-coin', item)
      }
    
      if (player.score == 5) {
        console.log(`SCORE\nPlayer ${player.id}:`, player.score)
        alert('GAME OVER')
        restartGame(gameArea)
      }
    })
  }

  // Clear Canvas
  gameArea.clear()

  // Frame Increment
  gameArea.frameNo += 1
  
  // Keyboard Controls ("WSAD" or "Arrows")
  currPlayers.map((player) => controls(gameArea, player, playerArt, socket))
  //controls(gameArea, playerOne, playerArt)

  // Draw Background
  background.update()

  // Draw "Controls: WASD"
  title_controls.text = 'Controls: WASD'
  title_controls.update()

  // Draw "Coin Race"
  title_coinRace.text = 'Coin Race'
  title_coinRace.update()

  // Draw "Rank: 1 / 1"
  title_rank.text = 'Rank: 1 / 1'
  title_rank.update()
  
  // Draw Gaming Frame
  gamingFrame.update()

  // Draw and Update All Players
  currPlayers.map((player) => {
    player.newPos()
    player.update()
  })

  if (item) {
    item.newPos()
    item.update()
  }
  

}

// Condition for applying an action every 'n' frames
function everyInterval(n) {
  if ((gameArea.frameNo / n) % 1 == 0) return true
  return false
}







window.addEventListener('load', (event) => {
  console.log('PAGE LOADED!')

  // Socket says to server he wants to start its game
  // so it creates a coin for all sockets to see
  //let newCoords = getDistancedRandomCoordinates(gfConfig, playerOne)
  socket.emit('startGame')

  // Server allowed for socket to start the game
  socket.on('startGame', ({ id, players, coin }) => {

    // Does a coin already exist in game?
    if(typeof coin != 'object') {
      // Create new Coin
      let newCoords = getRandomCoordinates(getGamingFrameConfig())
      item = new Collectible({ id: uid(), image: getRandomArt(itemArt), width: 25, height: 25, x: newCoords.x, y: newCoords.y, value: 1 })
      socket.emit('new-coin', item)
    }
    else {
      // Use the existing Coin
      if(typeof coin == 'object') {
        let src = coin.src
        coin.image = getItemImage(src)
        item = new Collectible(coin)
      }
    }

    // If this socket has not its game started...
    if(!(gameArea.status == 'started')) {

      startGame()

      // Create Main Player
      let newCoords = getRandomCoordinates(getGamingFrameConfig())
      let mainPlayer = new Player({ id: id, image: playerArt.player1, width: 50, height: 50, x: newCoords.x, y: newCoords.y, score: 0, isMain: true })
  
      // Populate already online players + new Main Player
      currPlayers = players.slice().map((obj) => {
        obj.image = playerArt.player2
        obj.isMain = false
        return new Player(obj)
      }).concat(mainPlayer)
      
      // Send new Main Player to Server
      socket.emit('new-player', mainPlayer)
    }
    // else socket already has its game started
    else {}
    
    // Socket receives a new player from Server
    // If he doesn't have on its online players,
    // he shall add him as a secondary player
    socket.on('new-player', (newPlayer) => {
      let hasPlayer = currPlayers.slice().filter((p) => p.id == newPlayer.id).length
      if (!hasPlayer) {
        let otherPlayer = new Player(newPlayer)
        otherPlayer.image = playerArt.player2
        otherPlayer.isMain = false
        currPlayers.push(otherPlayer)
      }
    })

    socket.on('new-coin', (newCoin) => {
      let src = newCoin.src
      newCoin.image = getItemImage(src)
      item = new Collectible(newCoin)
    })

    socket.on('remove-player', id => {
      console.log('REMOVE-PLAYER', id)
      currPlayers = currPlayers.slice().filter((player) => player.id != id)
    })

   
  });

  socket.on('current-sockets', (currentSockets) => {
    console.log('Current Sockets:', currentSockets.length)
  })

}, false)
//window.addEventListener('load', /*(event)=>{}*/ startGame, false)
//window.onload = startGame()
//document.addEventListener('DOMContentLoaded', function(e) {}, false)

//--------------------- SOCKET.IO CLIENT-SIDE (BROWSER) ---------------------
// NOTE: "index.html" file already has initiated socket.io client-side from the same domain / same-origin as the server (inside a <script> element). Thus, it is not necessary to import or instantiate it.
// THUS, NOT NECESSARY TO:
//1. import { io } from "socket.io-client";
//2. const socket = io();

/*socket.on("connect", () => {
  console.log(`CLIENT: Socket ${socket.id} connected`)
})
socket.on("disconnect", () => {
  console.log("Socket disconnected")
});*/
  
export default gameArea