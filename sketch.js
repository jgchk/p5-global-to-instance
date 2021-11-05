const vDup = (v) => createVector(v.x, v.y, v.z)
const vMag = (v) => vDup(v).mag()
const vDir = (v) => vDup(v).normalize()
const vRot = (v, angle) => vDup(v).rotate(angle)
const vAdd = (...vectors) => vectors.reduce((a, b) => p5.Vector.add(a, b))
const vSub = (a, b) => p5.Vector.sub(a, b)
const vMult = (a, b) => p5.Vector.mult(a, b)
const vDiv = (a, b) => p5.Vector.div(a, b)

const DEFAULT_SIZE = 1000
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const DIM = Math.min(WIDTH, HEIGHT)
const M = DIM / DEFAULT_SIZE

function random_hash() {
  let x = '0123456789abcdef',
    hash = '0x'
  for (let i = 64; i > 0; --i) {
    hash += x[Math.floor(Math.random() * x.length)]
  }
  return hash
}
tokenData = {
  hash: random_hash(),
  tokenId: '123000456',
}

let seed = parseInt(tokenData.hash.slice(0, 16), 16)
let randomDecimal = () => {
  /* Algorithm "xor" from p. 4 of Marsaglia, "Xorshift RNGs" */
  seed ^= seed << 13
  seed ^= seed >> 17
  seed ^= seed << 5
  return ((seed < 0 ? ~seed + 1 : seed) % 1000) / 1000
}
let randomFloat = (min, max) => min + (max - min) * randomDecimal()
let randomInt = (min, max) => Math.floor(randomFloat(min, max + 1))
let randomBool = () => randomDecimal() < 0.5
let randomNormal = (min = 0, max = 1, skew = 1) => {
  let u = 0,
    v = 0
  while (u === 0) u = randomDecimal() //Converting [0,1) to (0,1)
  while (v === 0) v = randomDecimal()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0) num = randomNormal(min, max, skew)
  // resample between 0 and 1 if out of range
  else {
    num = Math.pow(num, skew) // Skew
    num *= max - min // Stretch to fill range
    num += min // offset to min
  }
  return num
}
let randomChoiceWeighted = (choices) => {
  const totalWeight = choices
    .map((choice) => choice[0])
    .reduce((a, b) => a + b, 0)

  let threshold = randomFloat(0, totalWeight)

  let total = 0
  for (let i = 0; i < choices.length - 1; i++) {
    total += choices[i][0]
    if (total >= threshold) return choices[i][1]
  }

  return choices[choices.length - 1][1]
}
let randomChoice = (choices) =>
  randomChoiceWeighted(choices.map((choice) => [1, choice]))

let wrap = (m, n) => (n >= 0 ? n % m : ((n % m) + m) % m)

let displayTypeChoices
let displayType
let physicalWidth

let numSinesChoices
let numSines
let rarityChoices
let rarity
let startRatio
let period
let max
let frameFnChoices
let frameFn
let ratioFnChoices
let ratioFn
let numLinesChoices
let numLines

let colorChoices
let bkg
let colors
let colorTimePeriod
let colorSpacePeriod
let colorFrameModifier

let flipVertical
let flipHorizontal
let rotation
let startRotation

function setup() {
  createCanvas(WIDTH, HEIGHT)
  background(0)

  let b = [
    [8, 1, 400, -0.5],
    [7, 33, 200, 0.1],
    [7, 49, 200, 0.3],
    [7, 50, 100, 0.1],
    [8, 66, 300, 0.4],
    [9, 99, 800, 0.825],
    [8, 100, 800, 0.25],
  ]
  ;[numSines, startRatio, period, max] = randomChoice(b)
  // ;[numSines, startRatio, period, max] = b[6]

  displayTypeChoices = [
    [4, 'organic'],
    // [2, 'language'],
    [1, 'language'],
    ...(startRatio !== 49 ? [[1, 'physical']] : []),
  ]
  displayType = randomChoiceWeighted(displayTypeChoices)
  displayType = 'organic'

  physicalWidth = randomChoice([1, 2, 3, 5, 8])

  frameFnChoices = [
    [2, () => frameCount],
    [
      1,
      () => {
        let slope = 1
        let period = 500
        let max = slope * period
        return max * Math.sin(frameCount / period)
      },
    ],
  ]
  frameFn = randomChoiceWeighted(frameFnChoices)
  // frameFn = frameFnChoices[0][1]

  ratioFnChoices = [
    // static
    ...(startRatio !== 1 ? [[4, () => startRatio]] : []),
    // full evolve
    [1, () => startRatio + frameCount * 0.001],
    // partial evolve
    [2, () => startRatio + max * Math.sin(frameCount / (period / PI))],
  ]
  ratioFn = randomChoiceWeighted(ratioFnChoices)
  // ratioFn = ratioFnChoices[1][1]

  numLinesChoices = [
    [1, 100],
    ...(displayType === 'language' ? [[1, 200]] : []),
  ]
  numLines = randomChoiceWeighted(numLinesChoices)
  numLines = 100

  colorChoices = [
    [
      10,
      // rainbow
      () => {
        colorMode(HSB)
        return [color(0), [color(0, 100, 100), color(359.999, 100, 100)]]
      },
    ],
    [
      10,
      // matrix
      () => [color(0), [color(0, 255, 0), color(0, 0)]],
    ],
    [
      100,
      // chance
      () => [
        color('#401959'),
        [
          color('#D98299'),
          color('#A64178'),
          color('#3F1A73'),
          color('#A64178'),
          color('#D98299'),
          color('#A64178'),
          color('#3F1A73'),
        ],
      ],
    ],
    [
      100,
      // mirai
      () => [color('#0D0D0D'), [color('#BF3434'), color('#8C2727')]],
    ],
    [
      100,
      // whale
      () => [
        color('#052026'),
        [color('#A7E4F2'), color('#012840'), color('#1D6373')],
      ],
    ],
    [
      100,
      // blueprint
      () => [
        color('#F2F2F2'),
        [
          color('#457ABF'),
          color('#5E88BF'),
          color('#457ABF'),
          color('#96B3D9'),
          color('#CEDEF2'),
          color('#5E88BF'),
          color('#96B3D9'),
          color('#457ABF'),
        ],
      ],
    ],
    [
      100,
      // getz
      () => [
        color('#191919'),
        [
          color('#F81B20'),
          color('#F74D16'),
          color('#F7800D'),
          color('#F74D16'),
          color('#F81B20'),
        ],
      ],
    ],
    [
      100,
      // citrus
      () => [
        color(0),
        [
          // color('#D9078F'),
          // color('#F266C1'),
          color('#F2BD1D'),
          color('#F2A922'),
          color('#F26938'),
          // color('#D9078F'),
        ],
      ],
    ],
    [
      100,
      // purrp
      () => [
        color('#D9CCC5'),
        [color('#A284BF'), color('#692CBF'), color('#8760BF')],
      ],
    ],
    [
      100,
      // cloud
      () => [
        color('#3D46F2'),
        [
          color('#3D46F2'),
          color('#415CF2'),
          color('#6B7FF2'),
          color('#91A0F2'),
          color('#BDC5F2'),
          color('#91A0F2'),
          color('#6B7FF2'),
          color('#415CF2'),
          color('#3D46F2'),
        ],
      ],
    ],
    [
      100,
      // seft
      () => [color('#F2F2F2'), [color('#F2958D'), color('#F2C7BD')]],
    ],
  ]
  ;[bkg, colors] = randomChoiceWeighted(colorChoices)()
  // ;[bkg, colors] = colorChoices[11][1]()

  colorTimePeriod = randomChoice([100])
  colorSpacePeriod = randomChoice([0.5, 1, 2])
  colorFrameModifier = randomFloat(0.2, 0.8)

  flipVertical = randomBool()
  flipHorizontal = randomBool()
  rotation = randomChoiceWeighted([
    [2, 0],
    [1, 1],
    [1, -1],
  ])
  startRotation = randomChoice([0, 90, 180, 270])

  console.log({
    frameFunction: frameFn,
    startRatio,
    ratioFunction: ratioFn,
    displayType,
    physicalWidth,
    numSines,
    numLines,
    bkg,
    colors,
    colorTimePeriod,
    colorSpacePeriod,
    colorFrameModifier,
    flipVertical,
    flipHorizontal,
  })
}

function draw() {
  if (frameCount % 30 === 0) console.log(frameRate())
  background(bkg)

  strokeWeight(2 * (DIM / 500))

  translate(width / 2, height / 2) // move to middle of screen
  scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)
  rotate(startRotation + frameCount * 0.005 * rotation)

  let ratio = ratioFn()
  let frameModifier =
    0.00001233732 + 0.001043024 * Math.exp(-0.04280945 * ratio)

  if (displayType === 'physical') {
    const pointSets = []
    for (let i = 0; i < numLines; i++) {
      let baseAngle = i * (TWO_PI / numLines)
      let angle = (baseAngle + frameFn() * frameModifier) % TWO_PI
      let points = getSpiroPoints(angle, ratio)
      pointSets.push(points)
    }

    let maxRing = pointSets[0].length - 1
    let maxAlong = pointSets.length
    for (let ring = 1; ring < maxRing; ring++) {
      for (let along = 0; along < maxAlong; along++) {
        let s = (ring + frameCount * 0.01) % maxRing
        let p = map(s, 0, maxRing, 0, 1)
        let c = makeGradient(colors, p)
        noFill()
        stroke(c)

        let base = pointSets[along][ring]
        let left = pointSets[wrap(maxAlong, along - physicalWidth)][ring + 1]
        let right = pointSets[wrap(maxAlong, along + physicalWidth)][ring + 1]

        beginShape()
        vertex(left.x, left.y)
        vertex(base.x, base.y)
        vertex(right.x, right.y)
        endShape()
      }
    }
  } else {
    for (let i = 0; i < numLines; i++) {
      let baseAngle = i * (TWO_PI / numLines)
      let angle = (baseAngle + frameFn() * frameModifier) % TWO_PI
      let points = getSpiroPoints(angle, ratio)

      if (displayType === 'organic') {
        let s =
          (i * colorSpacePeriod + frameCount * colorFrameModifier) %
          colorTimePeriod
        let p = map(s, 0, colorTimePeriod, 0, 1)
        let c = makeGradient(colors, p)

        stroke(c)
        noFill()
        beginShape()
        for (let point of points) {
          curveVertex(point.x, point.y)
        }
        endShape()
      } else if (displayType === 'language') {
        let s =
          (i * colorSpacePeriod + frameCount * colorFrameModifier) %
          colorTimePeriod
        let p = map(s, 0, colorTimePeriod, 0, 1)
        let c = makeGradient(colors, p)

        stroke(c)
        noFill()
        beginShape()
        for (let i = 0; i < points.length - 1; i++) {
          let a = points[i]
          let b = points[i + 1]
          vertex(a.x, a.y)

          let c = vAdd(a, vSub(b, a).rotate(PI / 2))
          vertex(c.x, c.y)
        }
        endShape()
      }
    }
  }
}

let getSpiroPoints = (angle, ratio) => {
  let points = [createVector(0, 0)]

  let totalRot = 0
  for (let i = 0; i < numSines; i++) {
    let radius = DIM / 5 / (i + 1)

    let currSine = PI + ((angle + angle * i * ratio) % TWO_PI)

    let pLast = points[points.length - 1]
    let pCurr = createVector(0, 1)
      .rotate(totalRot)
      .rotate(currSine)
      .mult(radius)
    let p = p5.Vector.add(pLast, pCurr)

    points.push(p)
    totalRot = (totalRot + currSine) % TWO_PI
  }

  return points
}

let makeGradient = (colors, amt) => {
  if (colors.length === 1) return colors[0]

  let amtEach = 1 / (colors.length - 1)

  let c1, c2
  let amtMin, amtMax

  let colorIndex = Math.min(
    Math.floor(map(amt, 0, 1, 0, colors.length - 1)),
    colors.length - 2
  )
  c1 = colors[colorIndex]
  c2 = colors[colorIndex + 1]
  amtMin = colorIndex * amtEach
  amtMax = (colorIndex + 1) * amtEach

  return lerpColor(c1, c2, map(amt, amtMin, amtMax, 0, 1))
}
