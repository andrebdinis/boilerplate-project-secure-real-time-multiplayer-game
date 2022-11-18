// Paths
const pathFCC = 'https://cdn.freecodecamp.org/demo-projects/images/';
const pathLocal = './public/art/'

const loadImage = (src) => {
  const img = new Image();
  img.src = src;
  return img;
}

const playerArt = {
  mainPlayerArt: loadImage(pathLocal + 'cpu_grey.png'),
  otherPlayerArt: {
    cpu_green: loadImage(pathLocal + 'cpu_green.png'),
    cpu_brown: loadImage(pathLocal + 'cpu_brown.png'),
    cpu_purple: loadImage(pathLocal + 'cpu_purple.png')
  }
}

const coinArt = {
  bronzeCoinArt : loadImage(pathFCC + 'bronze-coin.png'),
  silverCoinArt : loadImage(pathFCC + 'silver-coin.png'),
  goldCoinArt : loadImage(pathFCC + 'gold-coin.png'),
  bitcoinCoinArt: loadImage(pathLocal + 'coin_bitcoin.png')
}

export { playerArt, coinArt }