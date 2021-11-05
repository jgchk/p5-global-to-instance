import p5 from "p5";
export default ($_p => {
  const vDup = v => $_p.createVector(v.x, v.y, v.z);

  const vMag = v => vDup(v).mag();

  const vDir = v => vDup(v).normalize();

  const vRot = (v, angle) => vDup(v).rotate(angle);

  const vAdd = (...vectors) => vectors.reduce((a, b) => p5.Vector.add(a, b));

  const vSub = (a, b) => p5.Vector.sub(a, b);

  const vMult = (a, b) => p5.Vector.mult(a, b);

  const vDiv = (a, b) => p5.Vector.div(a, b);

  const DEFAULT_SIZE = 1000;
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  const DIM = Math.min(WIDTH, HEIGHT);
  const M = DIM / DEFAULT_SIZE;

  function random_hash() {
    let x = '0123456789abcdef',
        hash = '0x';

    for (let i = 64; i > 0; --i) {
      hash += x[Math.floor(Math.random() * x.length)];
    }

    return hash;
  }

  tokenData = {
    hash: random_hash(),
    tokenId: '123000456'
  };
  let seed = parseInt(tokenData.hash.slice(0, 16), 16);

  let randomDecimal = () => {
    /* Algorithm "xor" from p. 4 of Marsaglia, "Xorshift RNGs" */
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return (seed < 0 ? ~seed + 1 : seed) % 1000 / 1000;
  };

  let randomFloat = (min, max) => min + (max - min) * randomDecimal();

  let randomInt = (min, max) => Math.floor(randomFloat(min, max + 1));

  let randomBool = () => randomDecimal() < 0.5;

  let randomNormal = (min = 0, max = 1, skew = 1) => {
    let u = 0,
        v = 0;

    while (u === 0) u = randomDecimal(); //Converting [0,1) to (0,1)


    while (v === 0) v = randomDecimal();

    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1

    if (num > 1 || num < 0) num = randomNormal(min, max, skew); // resample between 0 and 1 if out of range
    else {
      num = Math.pow(num, skew); // Skew

      num *= max - min; // Stretch to fill range

      num += min; // offset to min
    }
    return num;
  };

  let randomChoiceWeighted = choices => {
    const totalWeight = choices.map(choice => choice[0]).reduce((a, b) => a + b, 0);
    let threshold = randomFloat(0, totalWeight);
    let total = 0;

    for (let i = 0; i < choices.length - 1; i++) {
      total += choices[i][0];
      if (total >= threshold) return choices[i][1];
    }

    return choices[choices.length - 1][1];
  };

  let randomChoice = choices => randomChoiceWeighted(choices.map(choice => [1, choice]));

  let wrap = (m, n) => n >= 0 ? n % m : (n % m + m) % m;

  let displayTypeChoices;
  let displayType;
  let physicalWidth;
  let numSinesChoices;
  let numSines;
  let rarityChoices;
  let rarity;
  let startRatio;
  let period;
  let max;
  let frameFnChoices;
  let frameFn;
  let ratioFnChoices;
  let ratioFn;
  let numLinesChoices;
  let numLines;
  let colorChoices;
  let bkg;
  let colors;
  let colorTimePeriod;
  let colorSpacePeriod;
  let colorFrameModifier;
  let flipVertical;
  let flipHorizontal;
  let rotation;
  let startRotation;

  $_p.setup = function setup() {
    $_p.createCanvas(WIDTH, HEIGHT);
    $_p.background(0);
    let b = [[8, 1, 400, -0.5], [7, 33, 200, 0.1], [7, 49, 200, 0.3], [7, 50, 100, 0.1], [8, 66, 300, 0.4], [9, 99, 800, 0.825], [8, 100, 800, 0.25]];
    [numSines, startRatio, period, max] = randomChoice(b); // ;[numSines, startRatio, period, max] = b[6]

    displayTypeChoices = [[4, 'organic'], // [2, 'language'],
    [1, 'language'], ...(startRatio !== 49 ? [[1, 'physical']] : [])];
    displayType = randomChoiceWeighted(displayTypeChoices);
    displayType = 'organic';
    physicalWidth = randomChoice([1, 2, 3, 5, 8]);
    frameFnChoices = [[2, () => $_p.frameCount], [1, () => {
      let slope = 1;
      let period = 500;
      let max = slope * period;
      return max * Math.sin($_p.frameCount / period);
    }]];
    frameFn = randomChoiceWeighted(frameFnChoices); // frameFn = frameFnChoices[0][1]

    ratioFnChoices = [// static
    ...(startRatio !== 1 ? [[4, () => startRatio]] : []), // full evolve
    [1, () => startRatio + $_p.frameCount * 0.001], // partial evolve
    [2, () => startRatio + max * Math.sin($_p.frameCount / (period / $_p.PI))]];
    ratioFn = randomChoiceWeighted(ratioFnChoices); // ratioFn = ratioFnChoices[1][1]

    numLinesChoices = [[1, 100], ...(displayType === 'language' ? [[1, 200]] : [])];
    numLines = randomChoiceWeighted(numLinesChoices);
    numLines = 100;
    colorChoices = [[10, // rainbow
    () => {
      $_p.colorMode($_p.HSB);
      return [$_p.color(0), [$_p.color(0, 100, 100), $_p.color(359.999, 100, 100)]];
    }], [10, // matrix
    () => [$_p.color(0), [$_p.color(0, 255, 0), $_p.color(0, 0)]]], [100, // chance
    () => [$_p.color('#401959'), [$_p.color('#D98299'), $_p.color('#A64178'), $_p.color('#3F1A73'), $_p.color('#A64178'), $_p.color('#D98299'), $_p.color('#A64178'), $_p.color('#3F1A73')]]], [100, // mirai
    () => [$_p.color('#0D0D0D'), [$_p.color('#BF3434'), $_p.color('#8C2727')]]], [100, // whale
    () => [$_p.color('#052026'), [$_p.color('#A7E4F2'), $_p.color('#012840'), $_p.color('#1D6373')]]], [100, // blueprint
    () => [$_p.color('#F2F2F2'), [$_p.color('#457ABF'), $_p.color('#5E88BF'), $_p.color('#457ABF'), $_p.color('#96B3D9'), $_p.color('#CEDEF2'), $_p.color('#5E88BF'), $_p.color('#96B3D9'), $_p.color('#457ABF')]]], [100, // getz
    () => [$_p.color('#191919'), [$_p.color('#F81B20'), $_p.color('#F74D16'), $_p.color('#F7800D'), $_p.color('#F74D16'), $_p.color('#F81B20')]]], [100, // citrus
    () => [$_p.color(0), [// color('#D9078F'),
    // color('#F266C1'),
    $_p.color('#F2BD1D'), $_p.color('#F2A922'), $_p.color('#F26938') // color('#D9078F'),
    ]]], [100, // purrp
    () => [$_p.color('#D9CCC5'), [$_p.color('#A284BF'), $_p.color('#692CBF'), $_p.color('#8760BF')]]], [100, // cloud
    () => [$_p.color('#3D46F2'), [$_p.color('#3D46F2'), $_p.color('#415CF2'), $_p.color('#6B7FF2'), $_p.color('#91A0F2'), $_p.color('#BDC5F2'), $_p.color('#91A0F2'), $_p.color('#6B7FF2'), $_p.color('#415CF2'), $_p.color('#3D46F2')]]], [100, // seft
    () => [$_p.color('#F2F2F2'), [$_p.color('#F2958D'), $_p.color('#F2C7BD')]]]];
    [bkg, colors] = randomChoiceWeighted(colorChoices)(); // ;[bkg, colors] = colorChoices[11][1]()

    colorTimePeriod = randomChoice([100]);
    colorSpacePeriod = randomChoice([0.5, 1, 2]);
    colorFrameModifier = randomFloat(0.2, 0.8);
    flipVertical = randomBool();
    flipHorizontal = randomBool();
    rotation = randomChoiceWeighted([[2, 0], [1, 1], [1, -1]]);
    startRotation = randomChoice([0, 90, 180, 270]);
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
      flipHorizontal
    });
  };

  $_p.draw = function draw() {
    if ($_p.frameCount % 30 === 0) console.log($_p.frameRate());
    $_p.background(bkg);
    $_p.strokeWeight(2 * (DIM / 500));
    $_p.translate($_p.width / 2, $_p.height / 2); // move to middle of screen

    $_p.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    $_p.rotate(startRotation + $_p.frameCount * 0.005 * rotation);
    let ratio = ratioFn();
    let frameModifier = 0.00001233732 + 0.001043024 * Math.exp(-0.04280945 * ratio);

    if (displayType === 'physical') {
      const pointSets = [];

      for (let i = 0; i < numLines; i++) {
        let baseAngle = i * ($_p.TWO_PI / numLines);
        let angle = (baseAngle + frameFn() * frameModifier) % $_p.TWO_PI;
        let points = getSpiroPoints(angle, ratio);
        pointSets.push(points);
      }

      let maxRing = pointSets[0].length - 1;
      let maxAlong = pointSets.length;

      for (let ring = 1; ring < maxRing; ring++) {
        for (let along = 0; along < maxAlong; along++) {
          let s = (ring + $_p.frameCount * 0.01) % maxRing;
          let p = $_p.map(s, 0, maxRing, 0, 1);
          let c = makeGradient(colors, p);
          $_p.noFill();
          $_p.stroke(c);
          let base = pointSets[along][ring];
          let left = pointSets[wrap(maxAlong, along - physicalWidth)][ring + 1];
          let right = pointSets[wrap(maxAlong, along + physicalWidth)][ring + 1];
          $_p.beginShape();
          $_p.vertex(left.x, left.y);
          $_p.vertex(base.x, base.y);
          $_p.vertex(right.x, right.y);
          $_p.endShape();
        }
      }
    } else {
      for (let i = 0; i < numLines; i++) {
        let baseAngle = i * ($_p.TWO_PI / numLines);
        let angle = (baseAngle + frameFn() * frameModifier) % $_p.TWO_PI;
        let points = getSpiroPoints(angle, ratio);

        if (displayType === 'organic') {
          let s = (i * colorSpacePeriod + $_p.frameCount * colorFrameModifier) % colorTimePeriod;
          let p = $_p.map(s, 0, colorTimePeriod, 0, 1);
          let c = makeGradient(colors, p);
          $_p.stroke(c);
          $_p.noFill();
          $_p.beginShape();

          for (let point of points) {
            $_p.curveVertex(point.x, point.y);
          }

          $_p.endShape();
        } else if (displayType === 'language') {
          let s = (i * colorSpacePeriod + $_p.frameCount * colorFrameModifier) % colorTimePeriod;
          let p = $_p.map(s, 0, colorTimePeriod, 0, 1);
          let c = makeGradient(colors, p);
          $_p.stroke(c);
          $_p.noFill();
          $_p.beginShape();

          for (let i = 0; i < points.length - 1; i++) {
            let a = points[i];
            let b = points[i + 1];
            $_p.vertex(a.x, a.y);
            let c = vAdd(a, vSub(b, a).rotate($_p.PI / 2));
            $_p.vertex(c.x, c.y);
          }

          $_p.endShape();
        }
      }
    }
  };

  let getSpiroPoints = (angle, ratio) => {
    let points = [$_p.createVector(0, 0)];
    let totalRot = 0;

    for (let i = 0; i < numSines; i++) {
      let radius = DIM / 5 / (i + 1);
      let currSine = $_p.PI + (angle + angle * i * ratio) % $_p.TWO_PI;
      let pLast = points[points.length - 1];
      let pCurr = $_p.createVector(0, 1).rotate(totalRot).rotate(currSine).mult(radius);
      let p = p5.Vector.add(pLast, pCurr);
      points.push(p);
      totalRot = (totalRot + currSine) % $_p.TWO_PI;
    }

    return points;
  };

  let makeGradient = (colors, amt) => {
    if (colors.length === 1) return colors[0];
    let amtEach = 1 / (colors.length - 1);
    let c1, c2;
    let amtMin, amtMax;
    let colorIndex = Math.min(Math.floor($_p.map(amt, 0, 1, 0, colors.length - 1)), colors.length - 2);
    c1 = colors[colorIndex];
    c2 = colors[colorIndex + 1];
    amtMin = colorIndex * amtEach;
    amtMax = (colorIndex + 1) * amtEach;
    return $_p.lerpColor(c1, c2, $_p.map(amt, amtMin, amtMax, 0, 1));
  };
});