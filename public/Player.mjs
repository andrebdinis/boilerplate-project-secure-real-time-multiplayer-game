import gameArea from './game.mjs'

class Player {
  constructor({id, image, width, height, x, y, score, isMain=false}) {
    this.id = id
    this.image = image
    //this.src = this.image.src.slice(this.image.src.indexOf('cpu'))
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.speedX = 0
    this.speedY = 0
    this.score = score
    this.isMain = isMain
    this.update = function() {
      let ctx = gameArea.context
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
    this.newPos = function() {
      this.x += this.speedX
      this.y += this.speedY
      this.hitWalls()
    }
    this.hitWalls = function() {
      var rockTop = gameArea.gamingFrame.y
      var rockBottom = gameArea.gamingFrame.height
      var rockLeft = gameArea.gamingFrame.x
      var rockRight = gameArea.gamingFrame.width + gameArea.gamingFrame.border - this.width
      if (this.y < rockTop) this.y = rockTop
      if (this.y > rockBottom) this.y = rockBottom
      if (this.x < rockLeft) this.x = rockLeft
      if (this.x > rockRight) this.x = rockRight
    }
    this.collisionWith = function(otherObj) {
      const to_inside = 10
      var myLeft = this.x + to_inside
      var myRight = this.x + (this.width) - to_inside
      var myTop = this.y + to_inside
      var myBottom = this.y + (this.height) - to_inside
      var otherLeft = otherObj.x
      var otherRight = otherObj.x + (otherObj.width)
      var otherTop = otherObj.y
      var otherBottom = otherObj.y + (otherObj.height)
      var collision = true
      if ((myRight < otherLeft) ||
          (myLeft > otherRight) ||
          (myTop > otherBottom) ||
          (myBottom < otherTop)) {
        collision = false
      }
      return collision
    }
  }

  movePlayer(dir, speed) {
    
  }

  collision(item) {
    
  }

  calculateRank(arr) {
    
  }
}

export default Player;