import gameArea from '../game.mjs'

//USAGE EXAMPLE:
//playerOne = new component(35, 35, './public/icons/google.png', 50, 10, "image")
//playerTwo = new component(30, 30, "blue", 50, 10)
//obstacle = new component(10, 40, "red", 100, 10)
//score = new component('25px', 'Press Start 2P', 'black', (gameArea.canvas.width / 2) - 100, 40, "text")

// Component (rectangle or image)
function component(width, height, color, x, y, type) {
  this.type = type // type of component indicator
  if (type == 'image') {
    const src = color
    this.image = new Image()
    this.image.src = src
  }
  this.width = width // size indicators
  this.height = height
  this.speedX = 0 // speed indicators
  this.speedY = 0
  this.x = x // coordinate indicators
  this.y = y
  this.update = function() {
    let ctx = gameArea.context
    if (type == 'image') {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    } else {
      ctx.fillStyle = color
      ctx.fillRect(this.x, this.y, this.width, this.height)
    }
  }
  this.newPos = function() {
    this.x += this.speedX
    this.y += this.speedY
    this.hitWalls()
  }
  this.hitWalls = function() {
    var rockTop = 0
    var rockBottom = gameArea.canvas.height - this.height
    var rockLeft = 0
    var rockRight = gameArea.width - this.width
    if (this.y < rockTop) this.y = rockTop
    if (this.y > rockBottom) this.y = rockBottom
    if (this.x < rockLeft) this.x = rockLeft
    if (this.x > rockRight) this.x = rockRight
  }
  this.collisionWith = function(otherObj) {
    var myLeft = this.x
    var myRight = this.x + (this.width)
    var myTop = this.y
    var myBottom = this.y + (this.height)
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

// Text Component
function textComponent(fontSize, fontFamily, textAlign, color, x, y) {
  this.fontSize = fontSize
  this.fontFamily = fontFamily
  this.textAlign = textAlign
  this.color = color
  this.x = x
  this.y = y
  this.update = function() {
    let ctx = gameArea.context
    ctx.font = this.fontSize + " '" + this.fontFamily + "'"
    ctx.textAlign = this.textAlign
    ctx.fillStyle = this.color
    ctx.fillText(this.text, this.x, this.y)
  }
}

// Gaming Rectangle
function gamingFrameComponent(width, height, lineColor, lineWidth, x, y) {
  this.width = width
  this.height = height
  this.strokeStyle = lineColor
  this.lineWidth = lineWidth
  this.x = x
  this.y = y
  this.update = function() {
    let ctx = gameArea.context
    ctx.strokeStyle = this.strokeStyle
    ctx.lineWidth = this.lineWidth
    ctx.strokeRect(this.x, this.y, this.width, this.height)
  }
}

export { component, textComponent, gamingFrameComponent }