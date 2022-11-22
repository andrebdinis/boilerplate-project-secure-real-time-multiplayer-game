//--------------------- SOCKET.IO CLIENT-SIDE (BROWSER) --------------------- added!

import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import controls_keyboard from './controls/controls-keyboard.mjs'
import controls_touchscreen from './controls/controls-touchscreen.mjs'
import { settings } from './settings.mjs';
import { playerArt, coinArt } from './art.mjs'; // Preload game assets
import { randomInt, randomObjKey } from './util/random.mjs' // Randomize other player's art
import { getTime } from './util/time.mjs'

const socket = io()

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
let frame; // animation frame
let currPlayers = []; // list of online players
let item; // coin
let itemsLeft; // how many coins remain to be caught until game over
let gameOver; // Game over state: 'win' or 'lose'

// FPS Variables
let calculating=false;
let animFrameTime, fps;
animFrameTime = fps = 0;


// When page loads, starts listening for server.js requests
window.addEventListener('load', (e) => {
  setTimeout(startGame, 100)
  // If after 1 second the game hasn't start drawing, set message 'Refresh page' on the black screen
  setTimeout(() => {
    if (!frame) {
      drawDefaultMessage('Please refresh the page')
      // After 5 seconds page is automatically refreshed
      setTimeout(() => location.reload(), 5000)
    }
  }, 1000)
});


function startGame() {
  socket.on('initiate', ({ GAME_STATE, id, players, coin, coinsLeft, ip }) => {
    console.clear();
    console.log(`${getTime()}: I'm connected as CPU-${id.slice(0,4)}`);
  
    // Stops animation if there is one ongoing
    // (keeps from refreshing the page)
    cancelAnimationFrame(frame);

    // If player enters in game over state, restart game (refresh page) for everyone
    if (GAME_STATE === 'GAMEOVER') { socket.emit('restart-game') }
  
    // Create main player when we log in
    const mainPlayer = new Player({ id, main: true, imageRef: randomObjKey(playerArt.otherPlayerArt), ip, username: id.slice(0,4) })
  
    controls_keyboard(mainPlayer, socket);
    controls_touchscreen(mainPlayer, socket);

    logPlayersAlreadyConnected(players)

    // When a player logs in,
    // update list of connected players (received from server) + add our main player
    currPlayers = players.map(val => new Player(val)).concat(mainPlayer);
    // and create current coin (received from server)
    item = new Collectible(coin);
    // and update how many coins left until game over
    itemsLeft = coinsLeft;

    
    // Send main player to server
    socket.emit('new-player', mainPlayer);
    
    // Add new player when someone logs in
    socket.on('new-player', obj => {
      const playerIds = currPlayers.map(player => player.id);
      if (!playerIds.includes(obj.id)) {
        currPlayers.push(new Player(obj));
        console.log(`${getTime()}: Connected CPU-${obj.id.slice(0,4)}`)
      }
    });

    // Update scoring player's score
    socket.on('update-player', playerObj => {
      const scoringPlayer = currPlayers.find(obj => obj.id === playerObj.id);
      scoringPlayer.score = playerObj.score;
    });
  
    // Handle movement
    socket.on('move-player', ({ id, direction, posObj }) => {
      const movingPlayer = currPlayers.find(obj => obj.id === id);
      movingPlayer.moveDir(direction);
      forceSyncInCaseOfLag(movingPlayer, posObj);
    });
    socket.on('stop-player', ({ id, direction, posObj }) => {
      const stoppingPlayer = currPlayers.find(obj => obj.id === id);
      stoppingPlayer.stopDir(direction);
      forceSyncInCaseOfLag(stoppingPlayer, posObj);
    });

    // Handle new coin gen
    socket.on('new-coin', newCoin => item = new Collectible(newCoin));

    // Handle coins remaining value
    socket.on('coins-left', coinsLeft => itemsLeft = coinsLeft);

    // Handle gameOver state
    socket.on('game-over', result => gameOver = result);

    // Handle restarting game (one player pushes 'ENTER' when on game over state)
    socket.on('restart-game', () => {
      setTimeout( () => location.reload(), randomInt(50,100,1))
    })

    // Handle player disconnection
    socket.on('remove-player', id => {
      console.log(`${getTime()}: Disconnected CPU-${id.slice(0,4)}`);
      currPlayers = currPlayers.filter(player => player.id !== id);
      // If a player disconnects in game over state, make everyone's page refresh to start a new game at the same time
      if (gameOver) { socket.emit('restart-game') }
    });

    // Start drawing loop (with requestAnimationFrame(draw))
    draw();
  });
}

const draw = (animationFrameTimeStamp) => {
  // showTimeStamps(animationFrameTimeStamp, frame)
  animFrameTime = animationFrameTimeStamp;

  clearCanvas();

  drawBackgroundColor();
  drawGameAreaBorder();
  drawControlsText();
  drawGameTitle();

  startDrawingFPS();
  drawCoinsLeft();

  // Calculate score and draw players each frame
  currPlayers.forEach(player => {
    player.draw(context, item, playerArt, currPlayers);
  });
  
  // Draw current coin
  item.draw(context, coinArt);
  
  // Destroy caught coin
  if (item.caught) {
    socket.emit('destroy-coin', { catcherId: item.catcherId, coinValue: item.value, coinId: item.id });
  }
  
  if (gameOver) {
    drawGameOverMessage();
    
    // On Game Over, "ENTER" keybind is activated to be possible to refresh everyone's page to start a new game at the same time
    document.onkeydown = (e) => {
      if (e.code === 'Enter') {
        socket.emit('restart-game')
      }
    }
  }
  
  if (!gameOver) frame = requestAnimationFrame(draw);
}


// DRAW FUNCTIONS

function clearCanvas() {
  context.clearRect(0, 0, settings.canvas.width, settings.canvas.height);
}

function drawBackgroundColor() {
  context.fillStyle = settings.colors.darkBlue;
  context.fillRect(0, 0, settings.canvas.width, settings.canvas.height);
}

function drawGameAreaBorder() {
  context.strokeStyle = settings.colors.white;
  context.strokeRect(settings.gameArea.minX, settings.gameArea.minY, settings.gameArea.width, settings.gameArea.height);
}

function drawControlsText() {
  context.fillStyle = settings.colors.white;
  context.font = `13px ${settings.fontFamily}`;
  context.textAlign = 'center';
  context.fillText('Controls: WASD', 100, 32.5);
}

function drawGameTitle() {
  context.fillStyle = settings.colors.white;
  context.font = `16px ${settings.fontFamily}`;
  context.fillText('Coin Race', settings.canvas.width / 2, 32.5);
}

function drawGameOverMessage() {
  context.fillStyle = 'white';
  
  context.font = `15px ${settings.fontFamily}`;
  let [message1, message2, message3] = victoryOrLossMessage();
  const width = settings.canvas.width / 2;
  const height = (settings.canvas.height / 2) - 50;
  context.fillText(message1, width, height);
  
  context.font = `13px ${settings.fontFamily}`;
  context.fillText(message2, width, height + 40);
  context.fillText(message3, width, height + 60);
}
function victoryOrLossMessage() {
  let msg1, msg2, msg3;
  if(gameOver == 'win') {
    msg1 = `Congratulations, you ${gameOver.toUpperCase()}!`
    msg2 = `Refresh the page to dominate again.`
    msg3 = `(Press ENTER to refresh everyone's page)`
    
  } else {
    msg1 = `Sorry, you ${gameOver.toUpperCase()}!`
    msg2 = `Refresh the page to have your vengeance.`
    msg3 = `(Press ENTER to refresh everyone's page)`
  }
  return [msg1, msg2, msg3]
}

function startDrawingFPS() {
  if (!calculating) {
    calculating = true;
    let startFrame = frame
    setTimeout(() => {
      let endFrame = frame
      fps = endFrame - startFrame
      drawFPS();
      calculating = false;
    }, 1000)
  }
  drawFPS();
}
function drawFPS() {
  context.save()
  context.fillStyle = settings.colors.gray;
  context.font = `8px ${settings.fontFamily}`;
  context.textAlign = 'left'
  context.fillText(`FPS:${fps?fps:'--'}  Frame:${frame}
 Time:${(animFrameTime/1000).toFixed(3)}s`, settings.gameArea.minX + 5, settings.gameArea.minY + 15);
  context.restore()
}

function drawCoinsLeft() {
  context.save()
  context.fillStyle = settings.colors.gray;
  context.font = `9px ${settings.fontFamily}`;
  context.textAlign = "right";
  context.fillText('Coins Remaining:'+String(itemsLeft).padStart(2,'0'), (settings.gameArea.maxX) - 75, settings.gameArea.minY + 15);
  context.restore()
}


// DRAW A MESSAGE ON BLACK CANVAS SCREEN
function drawDefaultMessage(msg) {
  const height = (settings.canvas.height / 2) - 50
  context.fillStyle = settings.colors.white;
  context.textAlign = 'center';
  context.font = `15px ${settings.fontFamily}`;
  context.fillText(msg, settings.canvas.width / 2, height);
}


// FOR 'MOVE-PLAYER' AND 'STOP-PLAYER' LISTENERS
function forceSyncInCaseOfLag(player, posObj) {
  player.x = posObj.x;
  player.y = posObj.y;
}

// LOG PLAYERS ALREADY CONNECTED
function logPlayersAlreadyConnected(players) {
  if(players.length > 0) {
    let str = `${getTime()}: CPU's already connected:`
    players.map((player) => console.log(str += `\n- CPU-${player.id.slice(0,4)}`))
  }
}

// FOR BENCHMARK / METRIC PURPOSES
function showTimeStamps(animationFrameTimeStamp, frame) {
  console.log("DOMHighResTimeStamp (ms):", animationFrameTimeStamp)
  console.log("Animation Frame:", frame)
  console.log("Performance.now():", performance.now())
}

