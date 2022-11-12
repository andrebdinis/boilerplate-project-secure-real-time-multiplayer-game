import gameArea from './game.mjs'

class Collectible {
  constructor({id, image, width, height, x, y, value}) {
    this.id = id
    this.image = image
    this.src = this.image.src.slice(this.image.src.indexOf('coin'))
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.value = value
    this.update = function() {
      let ctx = gameArea.context
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
    this.newPos = function() {
      this.hitWalls()
    }
    this.hitWalls = function() {
      var rockTop = gameArea.gamingFrame.y
      var rockBottom = gameArea.gamingFrame.height + 15
      var rockLeft = gameArea.gamingFrame.x
      var rockRight = gameArea.gamingFrame.width + gameArea.gamingFrame.border - this.width
      if (this.y < rockTop) this.y = rockTop
      if (this.y > rockBottom) this.y = rockBottom
      if (this.x < rockLeft) this.x = rockLeft
      if (this.x > rockRight) this.x = rockRight
    }
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
