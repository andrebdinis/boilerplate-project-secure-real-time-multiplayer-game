function loadImage(src) {
  const img = new Image()
  img.src = src
  return img
}

function getItemImage(src) {
  if(src.startsWith('coin_bitcoin')) return itemArt.coin1
  if(src.startsWith('coin_ethereum')) return itemArt.coin2
  if(src.startsWith('coin_dash')) return itemArt.coin3
}

const path = './public/art/'

const itemArt = {
  coin1: loadImage(path + 'coin_bitcoin.png'),
  coin2: loadImage(path + 'coin_ethereum.png'),
  coin3: loadImage(path + 'coin_dash.png')
}

const playerArt = {
  player1: loadImage(path + 'cpu_grey.png'),
  player2: loadImage(path + 'cpu_green.png'),
  player3: loadImage(path + 'cpu_brown.png'),
  player4: loadImage(path + 'cpu_purple.png')
}

export { playerArt, itemArt, getItemImage }