const controls = (player, socket) => {
  
  const getKey = e => {
    // Letter Keys (WSAD) || Arrow Keys (UpDownLeftRight)
    if (e.code === "KeyW" || e.code === "ArrowUp") return 'up';
    if (e.code === "KeyS" || e.code === "ArrowDown") return 'down';
    if (e.code === "KeyA" || e.code === "ArrowLeft") return 'left';
    if (e.code === "KeyD" || e.code === "ArrowRight") return 'right';
  }

  document.onkeydown = e => {
    let direction = getKey(e);
    if (direction) {
      player.moveDir(direction);
      socket.emit('move-player', direction, { x: player.x, y: player.y });
    }
  }

  document.onkeyup = e => {
    let direction = getKey(e);
    if (direction) {
      player.stopDir(direction);
      socket.emit('stop-player', direction, { x: player.x, y: player.y });
    }
  }
}

export default controls;
