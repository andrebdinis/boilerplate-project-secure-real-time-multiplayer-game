import { generateStartPos, settings } from './settings.mjs'

class Collectible {
  constructor({ x = generateStartPos.x(5), y = generateStartPos.y(5), w = settings.collectible.width, h = settings.collectible.height, value = 1, id }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.value = value;
    this.id = id;
  }

  draw(context, imgObj) {
    if (this.value === 1) {
      context.drawImage(imgObj.bronzeCoinArt, this.x, this.y, this.w, this.h);
    } else if (this.value === 2) {
      context.drawImage(imgObj.silverCoinArt, this.x, this.y, this.w, this.h);
    } else if (this.value === 3) {
      context.drawImage(imgObj.goldCoinArt, this.x, this.y, this.w, this.h);
    } else {
      context.drawImage(imgObj.bitcoinCoinArt, this.x, this.y, 40, 40); // drawn
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
