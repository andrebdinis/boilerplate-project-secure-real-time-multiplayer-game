function controls(gameArea, player, playerArt, socket) {
  if (player.isMain) {
    player.speedX = 0
    player.speedY = 0
    function checkGameAreaKeys() {
      const UP = gameArea.keys && (gameArea.keys[87] || gameArea.keys[38])
      const DOWN = gameArea.keys && (gameArea.keys[83] || gameArea.keys[40])
      const LEFT = gameArea.keys && (gameArea.keys[65] || gameArea.keys[37])
      const RIGHT = gameArea.keys && (gameArea.keys[68] || gameArea.keys[39])
      if (UP) move('up')
      if (DOWN) move('down')
      if (LEFT) move('left')
      if (RIGHT) move('right')
      //if (!UP && !DOWN && !LEFT && !RIGHT) clearMove()
    }
    function move(dir) {
      //player.image = playerArt.windowsArt
      if (dir == 'up') player.speedY = -10
      if (dir == 'down') player.speedY = 10
      if (dir == 'left') player.speedX = -10
      if (dir == 'right') player.speedX = 10
      if (!dir) clearMove()
      socket.emit('move-player', player)
    }
    function clearMove() {
      //player.image = playerArt.googleArt
      player.speedX = 0
      player.speedY = 0
    }
  
    checkGameAreaKeys()
    
  }
}

export default controls

// Logs Pressed Keyboard Keys over DOM
/*function checkKey(e) {
  let event = window.event ? window.event : e;
  console.log(`${String.fromCodePoint(event.keyCode)} ${event.keyCode}`)
}
document.addEventListener('keydown', checkKey, false)*/
//document.onkeydown = checkKey;