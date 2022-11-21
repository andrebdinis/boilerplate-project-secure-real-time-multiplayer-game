import { settings } from '../settings.mjs'


const controls_touchscreen = (player, socket) => {

  // Touch Screen Functionality
  
  const getTouchesDir = (e) => {
    let go = {};
    let touchKeys = Object.keys(e.touches);
    if (touchKeys.length) {
      //let touch = e.touches[0]
      let chT = e.touches
      let lastTouch = chT.item(chT.length-1)
      let x = lastTouch.pageX -25
      let y = lastTouch.pageY -150
      let goUp = y < player.y
      let goDown = y > (player.y + player.h)
      let goLeft = x < player.x
      let goRight = x > (player.x + player.w)
      if (goUp) go["up"] = true
      if (goDown) go["down"] = true
      if (goLeft) go["left"] = true
      if (goRight) go["right"] = true
    }
    return go;
  }

  const getTouchesStop = (dirsArr) => {
    let stop = [];
    if (dirsArr.indexOf('up') == -1)
      stop.push("up")
    if (dirsArr.indexOf('down') == -1)
      stop.push("down")
    if (dirsArr.indexOf('left') == -1)
      stop.push("left")
    if (dirsArr.indexOf('right') == -1)
      stop.push("right")
    return stop;
  }

  const getDirectionsArray = (e) => {
    let directions = getTouchesDir(e);
    let dsArr = Object.keys(directions);
    return dsArr;
  }

  const touchStop = (stopArr, socket, player) => {
    for (const i in stopArr) {
      player.stopDir(stopArr[i]);
      socket.emit('stop-player', stopArr[i], { x: player.x, y: player.y });
    }
  }

  function touchStartHandler(e, socket, player) {
    let ds = getDirectionsArray(e);
    //logTouchCoords(socket, e, player, ds);
    if (ds.length) {
      for (const i in ds) {
        player.moveDir(ds[i]);
        socket.emit('move-player', ds[i], { x: player.x, y: player.y });
      }
    }
  }
  
  function touchMoveHandler(e, socket, player) {
    touchStartHandler(e, socket, player);
    let ds = getDirectionsArray(e);
    let stopArr = getTouchesStop(ds);
    touchStop(stopArr, socket, player);
  }

  function touchEndHandler(socket, player) {
    let stopArr = ["up", "down", "left", "right"]
    touchStop(stopArr, socket, player);
  }

  
  document.ontouchstart = (e) => {
    e.preventDefault();
    touchStartHandler(e, socket, player);

    document.ontouchmove = (e) => {
      e.preventDefault();
      touchMoveHandler(e, socket, player);
    };

    document.ontouchend = (e) => {
      e.preventDefault();
      touchEndHandler(socket, player);
    }
  };

}


function logTouchCoords(socket, e, player, ds) {
  let x = (e.changedTouches[e.changedTouches.length-1].pageX) -25
  let y = (e.changedTouches[e.changedTouches.length-1].pageY) -150
  let diffX = (x > player.x) ? x - player.x : player.x - x;
  let diffY = (y > player.y) ? y - player.y : player.y - y
  socket.emit( 'console-client', 
"---------------------------"      
+ "\nPLAYER: " + "(" + player.x.toFixed(1) + ", " + player.y.toFixed(1) + ")" 
+ "\nTOUCH: " + "("+ (x.toFixed(1)) +", " + (y.toFixed(1)) + ")" + " " + JSON.stringify(ds)
+ "\nDiff: (" + (diffX.toFixed(1)) + ", " + (diffY.toFixed(1)) + ")"
);
}


export default controls_touchscreen;
