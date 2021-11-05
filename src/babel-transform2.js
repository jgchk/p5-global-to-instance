const babel = require('@babel/core')
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '../sketch.js')
const code = fs.readFileSync(file, 'utf-8')

const p5Ident = '$_p'

const p5scopeFuncs = [
  'preload',
  'setup',
  'draw',
  'windowResized',
  'mouseMoved',
  'mouseDragged',
  'mousePressed',
  'mouseReleased',
  'mouseClicked',
  'doubleClicked',
  'mouseWheel',
  'touchStarted',
  'touchMoved',
  'touchEnded',
  'keyPressed',
  'keyReleased',
  'keyTyped',
  'deviceMoved',
  'deviceTurned',
  'deviceShaken',
]

const p5callFuncs = [
  'createCanvas',
  'createGraphics',
  'resizeCanvas',
  'noCanvas',
  'blendMode',

  // Color.Settings
  'background',
  'clear',
  'colorMode',
  'fill',
  'noFill',
  'noStroke',
  'stroke',

  // Color.Creating_and_Reading
  'alpha',
  'blue',
  'brightness',
  'color',
  'green',
  'hue',
  'lerpColor',
  'lightness',
  'red',
  'saturation',

  // Structure
  'remove',
  'noLoop',
  'loop',
  'push',
  'pop',
  'redraw',

  // Shape.2D_Primitives
  'arc',
  'ellipse',
  'line',
  'point',
  'quad',
  'rect',
  'triangle',

  // Shape.3D_Models
  'loadModel',
  'model',

  // Shape.3D_Primitives
  'plane',
  'box',
  'sphere',
  'cylinder',
  'cone',
  'ellipsoid',
  'torus',

  // Shape.Attributes
  'ellipseMode',
  'noSmooth',
  'rectMode',
  'smooth',
  'strokeCap',
  'strokeJoin',
  'strokeWeight',

  // Shape.Curves
  'bezier',
  'bezierDetail',
  'bezierPoint',
  'bezierTangent',
  'curve',
  'curveDetail',
  'curveTightness',
  'curvePoint',
  'curveTangent',

  // Shape.Vertex
  'beginContour',
  'beginShape',
  'bezierVertex',
  'curveVertex',
  'endContour',
  'endShape',
  'quadraticVertex',
  'vertex',

  // Environment
  'print',
  'cursor',
  'frameRate',
  'noCursor',
  'fullscreen',
  'pixelDensity',
  'displayDensity',
  'getURL',
  'getURLPath',
  'getURLParams',

  // Transform
  'applyMatrix',
  'resetMatrix',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'shearX',
  'shearY',
  'translate',

  // Data.Array_Functions
  'append',
  'arrayCopy',
  'concat',
  'reverse',
  'shorten',
  'shuffle',
  'sort',
  'splice',
  'subset',

  // Data.Conversion
  'float',
  'int',
  'str',
  'boolean',
  'byte',
  'char',
  'unchar',
  'hex',
  'unhex',

  // Data.String_Functions
  'join',
  'match',
  'matchAll',
  'nf',
  'nfc',
  'nfp',
  'nfs',
  'split',
  'splitTokens',
  'trim',

  // Events
  'setMoveThreshold',
  'setShakeThreshold',
  'keyIsDown',

  // Image
  'createImage',
  'saveCanvas',
  'saveFrames',
  'loadImage',
  'image',
  'tint',
  'noTint',
  'imageMode',
  'blend',
  'copy',
  'filter',
  'get',
  'loadPixels',
  'set',
  'updatePixels',

  // IO
  'loadJSON',
  'loadStrings',
  'loadTable',
  'loadXML',
  'httpGet',
  'httpPost',
  'httpDo',
  'createWriter',
  'write',
  'print',
  'flush',
  'close',
  'save',
  'saveJSON',
  'saveStrings',
  'saveTable',
  'downloadFile',

  // Math
  'createVector',
  'constrain',
  'dist',
  'lerp',
  'mag',
  'map',
  'norm',
  'sq',
  'noise',
  'noiseDetail',
  'noiseSeed',
  'degrees',
  'radians',
  'angleMode',

  // Typography
  'textAlign',
  'textLeading',
  'textSize',
  'textStyle',
  'textWidth',
  'textAscent',
  'textDescent',
  'loadFont',
  'text',
  'textFont',

  // Lights_Camera
  'camera',
  'perspective',
  'ortho',
  'ambientLight',
  'directionalLight',
  'pointLight',
  'loadShader',
  'shader',
  'normalMaterial',
  'texture',
  'ambientMaterial',
  'specularMaterial',
]

const p5vars = [
  // Constants
  'HALF_PI',
  'PI',
  'QUARTER_PI',
  'TAU',
  'TWO_PI',
  'HSB',

  // Environment
  'frameCount',
  'focused',
  'displayWidth',
  'displayHeight',
  'windowWidth',
  'windowHeight',
  'width',
  'height',

  // Events.Mobile
  'deviceOrientation',
  'accelerationX',
  'accelerationY',
  'accelerationZ',
  'pAccelerationX',
  'pAccelerationY',
  'pAccelerationZ',
  'rotationX',
  'rotationY',
  'rotationZ',
  'pRotationX',
  'pRotationY',
  'pRotationZ',
  'turnAxis',
  'touches',

  // Events.Desktop
  'keyIsPressed',
  'key',
  'keyCode',
  'mouseX',
  'mouseY',
  'pmouseX',
  'pmouseY',
  'winMouseX',
  'winMouseY',
  'pwinMouseX',
  'pwinMouseY',
  'mouseButton',
  'mouseIsPressed',

  'pixels',
]

const { types: t } = babel

const output = babel.transformSync(code, {
  plugins: [
    {
      name: 'ast-transform', // not required
      visitor: {
        Program(path) {
          path.node.body = [
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier('p5'))],
              t.stringLiteral('p5')
            ),
            t.exportDefaultDeclaration(
              t.arrowFunctionExpression(
                [t.identifier(p5Ident)],
                t.blockStatement(path.node.body)
              )
            ),
          ]
        },
        CallExpression(path) {
          if (!t.isIdentifier(path.node.callee)) return
          const name = path.node.callee.name
          if (!p5callFuncs.includes(name)) return
          path.node.callee = t.memberExpression(
            t.identifier(p5Ident),
            t.identifier(name)
          )
        },
        FunctionDeclaration(path) {
          const name = path.node.id.name
          if (!p5scopeFuncs.includes(name)) return
          console.log(path.node.id.name)
          path.replaceWith(
            t.assignmentExpression(
              '=',
              t.memberExpression(t.identifier(p5Ident), t.identifier(name)),
              t.functionExpression(
                path.node.id,
                path.node.params,
                path.node.body
              )
            )
          )
        },
        Identifier(path) {
          const name = path.node.name
          if (!p5vars.includes(name)) return
          if (path.parent && t.isMemberExpression(path.parent)) return
          console.log(name)
          console.log(path.parent)
          path.replaceWith(
            t.memberExpression(t.identifier(p5Ident), t.identifier(name))
          )
        },
      },
    },
  ],
})

console.log(output.code)
const outputFile = path.join(__dirname, '../sketch.inst.js')
fs.writeFileSync(outputFile, output.code, 'utf-8')
