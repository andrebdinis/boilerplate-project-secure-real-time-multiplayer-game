function uid() {
  return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
};

function randomIntFromInterval(min, max) {
  return Math.floor(min + Math.random()*(max - min + 1))
}

function calcDistanceBetweenPoints(pA, pB) {
  let squared_sideA = (pB.x - pA.x)**2
  let squared_sideB = (pB.y - pA.y)**2
  let sum_of_squares = (squared_sideA + squared_sideB)
  let distance = Math.sqrt( sum_of_squares )
  return distance
}

function getRandomCoordinates(gamingFrameRange) {
  let newX = randomIntFromInterval(gamingFrameRange.x, gamingFrameRange.width)
  let newY = randomIntFromInterval(gamingFrameRange.y, gamingFrameRange.height)
  return { x: newX, y: newY }
}

function getDistancedRandomCoordinates(gamingFrameRange, objA) {
  let distance = 0
  let min_distance_desired = randomIntFromInterval(100, gamingFrameRange.width)
  let newCoords
  while (distance < min_distance_desired) {
    newCoords = getRandomCoordinates(gamingFrameRange)
    distance = calcDistanceBetweenPoints(objA, newCoords)
  }
  return newCoords
}

function getRandomArt(objArt) {
  let arr = Object.keys(objArt)
  let rand_index = randomIntFromInterval(0, arr.length-1)
  let chosen_key = arr[rand_index]
  return objArt[chosen_key]
}

export { uid, getRandomCoordinates, getDistancedRandomCoordinates, getRandomArt }