function uid() {
  return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
};

function randomInt (min, max, multiple=1) {
  return Math.floor(Math.random() * ((max - min + 1) / multiple)) * multiple + min;
};

function calcDistanceBetweenPoints(obj1, obj2) {
  let squared_sideA = (obj2.x - obj1.x)**2
  let squared_sideB = (obj2.y - obj1.y)**2
  let sum_of_squares = (squared_sideA + squared_sideB)
  let distance = Math.sqrt( sum_of_squares )
  return distance
}

function getLinearEquation(p1, p2) {
  // p1 - origin, p2 - target
  let m = (p2.y - p1.y) / (p2.x - p1.x)
  let b = p2.y - (m * p2.x)
  return { slope: m, y_intersect: b }
  // y = m*x + b
  // y = (y2-y1 / x2-x1) * x + b
  // b = y - (m*x)
}

function randomCoordinates(obj) {
  let x = randomInt(obj.x, obj.width)
  let y = randomInt(obj.y, obj.height)
  return { x: x, y: y }
}

function randomObjKey(obj) {
  let arr = Object.keys(obj)
  let rand_index = randomInt(0, arr.length-1)
  let chosen_key = arr[rand_index]
  return chosen_key
}

function randomObjValue(obj) {
  let chosen_key = randomObjKey(obj)
  let chosen_value = obj[chosen_key]
  return chosen_value
}

export { uid, randomInt, randomCoordinates, randomObjKey, calcDistanceBetweenPoints }