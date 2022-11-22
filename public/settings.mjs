import { randomInt } from './util/random.mjs'

const canvas = { width: 640, height: 480 }
const player = { width: 45, height: 45 }
const collectible = { width: 15, height: 15 }
const border = 5; // Between edge of canvas and play field
const infoBar = 45;
const gameArea = {
  minX: (canvas.width / 2) - (canvas.width - 10) / 2,
  minY: (canvas.height / 2) - (canvas.height - 100) / 2,
  width: canvas.width - (border * 2),
  height: (canvas.height - infoBar) - (border * 2),
  maxX: (canvas.width - player.width) - border,
  maxY: (canvas.height - player.height) - border
}
const colors = {
  darkBrown: '#220', // FCC's original brown
  white: 'rgba(255, 255, 255, 1)', // "white"
  gray: 'rgba(200, 200, 200, 0.5)',
  darkBlue: 'rgba(0, 36, 57, 1)'
}
const fontFamily = `'Press Start 2P'`

const settings = {
  canvas,
  player,
  collectible,
  border,
  infoBar,
  gameArea,
  colors,
  fontFamily
}

const generateStartPosX = (multiple) => {
  return randomInt(settings.gameArea.minX, settings.gameArea.maxX, multiple)
};
const generateStartPosY = (multiple) => {
  return randomInt(settings.gameArea.minY, settings.gameArea.maxY, multiple)
};
const generateStartPos = {
  x: (multiple) => generateStartPosX(multiple),
  y: (multiple) => generateStartPosY(multiple)
}

export {
  settings,
  generateStartPos
}
