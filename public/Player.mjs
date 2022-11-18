import { generateStartPos, settings } from './settings.mjs';

class Player {
  constructor({ x = generateStartPos.x(5), y = generateStartPos.y(5), w = settings.player.width, h = settings.player.height, score = 0, imageRef, main, id, ip, username }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speedX = 5;
    this.speedY = 5;
    this.score = score;
    this.id = id;
    this.ip = ip;
    this.username = username;
    this.movementDirection = {};
    this.isMain = main;
    this.imageRef = imageRef; // image name from otherPlayerArt
  }

  draw(context, coin, imgObj, currPlayers) {
    const allDirections = Object.keys(this.movementDirection)
    const currentDirections = allDirections.filter(dir => this.movementDirection[dir]);
    currentDirections.forEach(dir => this.movePlayer(dir, this.speedX, this.speedY));

    if (this.isMain) {
      context.font = `13px ${settings.fontFamily}`;
      context.fillText(this.calculateRank(currPlayers), 560, 32.5);
      context.drawImage(imgObj.mainPlayerArt, this.x, this.y, this.w, this.h);
    }
    else {
        context.drawImage(imgObj.otherPlayerArt[this.imageRef], this.x, this.y, this.w, this.h);
    }
    
    // draw player's username above its head
    context.fillStyle = settings.colors.white
    context.font = `9px ${settings.fontFamily}`;
    context.fillText('CPU-'+this.username, this.x+(this.w/2), this.y);

    if (this.collision(coin)) {
      coin.caught = true;
      coin.catcherId = this.id;
    }
  }

  moveDir(direction) { this.movementDirection[direction] = true; }
  stopDir(direction) { this.movementDirection[direction] = false; }

  movePlayer(direction, speedX, speedY) {
    if (!this.hitWalls(direction, speedX, speedY)) {
      this.move(direction, speedX, speedY)
    }
  }
  move(direction, speedX, speedY) {
    (direction === 'up')    ? this.y -= speedY : this.y -= 0;
    (direction === 'down')  ? this.y += speedY : this.y += 0;
    (direction === 'left')  ? this.x -= speedX : this.x -= 0;
    (direction === 'right') ? this.x += speedX : this.x += 0;
  }
  hitWalls(direction, speedX, speedY) {
    const stillBelowTopWall    = this.y - speedY >= settings.gameArea.minY
    const stillAboveBottomWall = this.y + speedY <= settings.gameArea.maxY
    const stillAfterLeftWall   = this.x - speedX >= settings.gameArea.minX
    const stillBeforeRightWall = this.x + speedX <= settings.gameArea.maxX
    if (direction === 'up')     return stillBelowTopWall    ? false : true;
    if (direction === 'down')   return stillAboveBottomWall ? false : true;
    if (direction === 'left')   return stillAfterLeftWall   ? false : true;
    if (direction === 'right')  return stillBeforeRightWall ? false : true;
  }

  collision(item) {
    let myHead = this.y
    let myFeet = this.y + this.h
    let myLeft = this.x
    let myRight = this.x + this.w;
    let otherTop = item.y
    let otherBottom = item.y + item.h
    let otherLeft = item.x
    let otherRight = item.x + item.w;
    let collidesOtherTop = myFeet > otherTop
    let collidesOtherBottom = myHead < otherBottom
    let collidesOtherLeft = myRight > otherLeft
    let collidesOtherRight = myLeft < otherRight
    
    if (collidesOtherTop &&
       collidesOtherBottom &&
       collidesOtherLeft &&
       collidesOtherRight) return true
    else return false
  }

  calculateRank(arr) {
    const totalPlayers = arr.length
    const sortedScores = arr.sort((a, b) => b.score - a.score);
    
    let mainPlayerRank;
    if (this.score === 0) {
      mainPlayerRank = totalPlayers // last place
    } else {
      const playerIndexOnArray = sortedScores.findIndex(obj => obj.id === this.id)
      mainPlayerRank = playerIndexOnArray + 1
    }

    return `Rank: ${mainPlayerRank} / ${totalPlayers}`
  }
}

export default Player;
