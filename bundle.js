(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteriod = require('./asteriod.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var asteriods = [];
var level = 0;
var lives = 3;
var score = 0;
var invincible = false;
var laserShot = new Audio();
laserShot.src = encodeURI('audio/laser.wav');
var laserHit = new Audio();
laserHit.src = encodeURI('audio/laserHit.wav');
var shipExplode = new Audio();
shipExplode.src = encodeURI('audio/shipExplode.wav');
nextLevel();

var lightBeams = [];
//shoot();

/*window.onkeydown = function(event) {
    switch(event.keyCode) {
      case '32': // spacebar
        shoot();
        break;
    }
  }*/

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

function nextLevel() {
  score += 10*level;
  level++;
  lives = 3;
  spawnShip();
  asteriods = [];
  lightBeams = [];
  for(var i=0; i<(8+(level*2)); i++) {
    getAsteriod();
  }
}

function gameOver() {
  level = 0;
  score = 0;
  nextLevel();
}

function getAsteriod() {
  //variables
  var touching = 0;
  var randX;
  var randY;

  //size of asteriod
  var randSize = Math.ceil(Math.random() * 3);
  if(randSize == 0) {
    randSize = 1;
  }

  //radius of asteriod
  var randRadius = randSize * 10;

  do {
    touching = 0;
    randX = Math.floor(Math.random() * canvas.width);
    randY = Math.floor(Math.random() * canvas.height);
    if(asteriods.length > 0) {
      asteriods.forEach(function(asteriod) {
        var xDist = Math.abs(asteriod.x-randX);
        var yDist = Math.abs(asteriod.y-randY);
        var radDist = asteriod.radius+randRadius;
        if(((xDist*xDist)+(yDist*yDist)) < (radDist*radDist)) {
          touching++;
        }
      });
      xDist = Math.abs((canvas.width/2)-randX);
      yDist = Math.abs((canvas.height/2)-randY);
      radDist = 100+randRadius;
      if(((xDist*xDist)+(yDist*yDist)) < (radDist*radDist)) {
        touching++;
      }
    }
  }while(touching > 0);
  touching = 0;

  //color determination
  var color;
  if(randSize == 1) {
    color = 'orange';
  }
  if(randSize == 2) {
    color = 'yellow';
  }
  if(randSize == 3) {
    color = 'red';
  }

  asteriods.push(new Asteriod({x: randX,y: randY}, canvas, randSize, color));
}

function shoot() {
  var ship = player.position;
  var frontX = ship.x;
  var frontY = ship.y-(10*Math.sin(player.angle+(Math.PI/2)));
  lightBeams.push({xa: frontX, ya: frontY, xb: frontX+(20*Math.cos(player.angle+(Math.PI/2))), yb: frontY-(20*Math.sin(player.angle+(Math.PI/2))), angle: player.angle+(Math.PI/2)});
  laserShot.play();
}

function collideAsteriods() {
  for(var a=0; a<asteriods.length; a++) {
    for(var b=0; b<asteriods.length; b++) {
      if(a != b) {
        var x = Math.abs(asteriods[a].x - asteriods[b].x);
        var y = Math.abs(asteriods[a].y - asteriods[b].y);
        var r = asteriods[a].radius + asteriods[b].radius;
        if((x*x)+(y*y) <= (r*r)) {
          var distInside = (Math.sqrt(r*r))-(Math.sqrt((x*x)+(y*y)));
          var tempVx = asteriods[a].vx;
          var tempVy = asteriods[a].vy;
          asteriods[a].vx = asteriods[b].vx;
          asteriods[a].vy = asteriods[b].vy;
          asteriods[b].vx = tempVx;
          asteriods[b].vy = tempVy;
          asteriods[a].x += (distInside*asteriods[a].vx*1.2);
          asteriods[a].y += (distInside*asteriods[a].vy*1.2);
          asteriods[b].x += (distInside*asteriods[b].vx*1.2);
          asteriods[b].y += (distInside*asteriods[b].vy*1.2);
        }
      }
    }
  }
}

function collideShip() {
  if(invincible != true) {
    var ship = player.position;
    var angle = player.angle;

    var x = [];
    var y = [];
    x.push(ship.x);
    y.push(ship.y-(10*Math.sin(angle)));
    x.push(ship.x+(10*Math.cos(angle)));
    y.push(ship.y+(10*Math.sin(angle)));
    x.push(ship.x);
    y.push(ship.y);
    x.push(ship.x-(10*Math.cos(angle)));
    y.push(ship.y+(10*Math.sin(angle)));
    x.push(ship.x);
    y.push(ship.y-(10*Math.sin(angle)));

    var dist = [];
    dist.push(22.36);
    dist.push(14.14);
    dist.push(14.14);
    dist.push(22.36);

    asteriods.forEach(function(asteriod) {
      for(var i=0; i<4; i++) {
        var xFirst = Math.abs(asteriod.x-x[i]);
        var yFirst = Math.abs(asteriod.y-y[i]);
        var sideFirst = Math.sqrt((xFirst*xFirst)+(yFirst*yFirst));
        var xSecond = Math.abs(asteriod.x-x[i+1]);
        var ySecond = Math.abs(asteriod.y-y[i+1]);
        var sideSecond = Math.sqrt((xSecond*xSecond)+(ySecond*ySecond));
        var top = (dist[i]*dist[i])+(sideSecond*sideSecond)-(sideFirst*sideFirst);
        var bottom = 2*dist[i]*sideSecond;
        var theta = Math.acos(top/bottom);
        if(Math.sin(theta)*sideSecond <= asteriod.radius && invincible != true) {
          lives--;
          invincible = true;
          if(lives == 0) {
            gameOver();
          }
          else {
            shipExplode.play();
            spawnShip();
          }
        }
      }
    });
  }
}

function collideLightBeam() {
  var broke = false;
  for(var i=0; i<lightBeams.length; i++) {
    for(var j=0; j<asteriods.length; j++) {
      var x = Math.abs(lightBeams[i].xb-asteriods[j].x);
      var y = Math.abs(lightBeams[i].yb-asteriods[j].y);
      if((x*x)+(y*y) < asteriods[j].radius*asteriods[j].radius) {
        broke = true;
        var x = asteriods[j].x;
        var y = asteriods[j].y;
        var size = asteriods[j].size;
        var vx = asteriods[j].vx;
        var vy = asteriods[j].vy;
        asteriods.splice(j,1);

        size--;
        if(size != 0) {
          var radius = size * 7;
          vxa = Math.cos(Math.acos(vx)+(Math.PI/2));
          vya = Math.sin(Math.asin(vy)+(Math.PI/2));
          vxb = Math.cos(Math.acos(vx)-(Math.PI/2));
          vyb = Math.cos(Math.asin(vy)-(Math.PI/2));
          firstX = x + vxa*(radius+4);
          firstY = y + vya*(radius+4);
          secondX = x + vxb*(radius+4);
          secondY = y + vyb*(radius+4);
          var color;
          if(size == 1) {
            color = 'orange';
          }
          if(size == 2) {
            color = 'yellow';
          }
          asteriods.push(new Asteriod({x: firstX,y: firstY}, canvas, size, color));
          asteriods.push(new Asteriod({x: secondX,y: secondY}, canvas, size, color));
          laserHit.play();
        }
      }
    }
    if(broke) {
      lightBeams.splice(i,1);
    }
  }
}

function endBeam(index) {
  lightBeams.splice(index,1);
}

function spawnShip() {
  invincible = true;
  console.log(lives);
  console.log(lives);
  player.spawn();
  setTimeout(function() {
    invincible = false;
  }, 3000);
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  if(asteriods.length == 0) {
    nextLevel();
  }
  if(invincible) {
    player.color = 'purple';
  }
  else {
    player.color = 'white';
  }
  player.update(elapsedTime);
  // TODO: Update the game objects
  asteriods.forEach(function(asteriod) {
    asteriod.update(elapsedTime);
  });
  collideAsteriods();
  collideShip();
  if(player.shots>0) {
    shoot();
    player.shots=0;
  }
  var shootSpeed = 3;
  var shotsOffScreen = []
  for(var i=0; i<lightBeams.length; i++) {
    lightBeams[i].xa += Math.cos(lightBeams[i].angle)*shootSpeed;
    lightBeams[i].ya -= Math.sin(lightBeams[i].angle)*shootSpeed;
    lightBeams[i].xb += Math.cos(lightBeams[i].angle)*shootSpeed;
    lightBeams[i].yb -= Math.sin(lightBeams[i].angle)*shootSpeed;
    if(lightBeams[i].xb < 0) shotsOffScreen.push(i);
    if(lightBeams[i].xb > canvas.width) shotsOffScreen.push(i);
    if(lightBeams[i].yb < 0) shotsOffScreen.push(i);
    if(lightBeams[i].yb > canvas.height) shotsOffScreen.push(i);
  }
  for(var i=0; i<shotsOffScreen.length; i++) {
    lightBeams.splice(shotsOffScreen[i],1);
  }
  collideLightBeam();
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for(var i=0; i<lives; i++) {
    ctx.beginPath();
    ctx.moveTo(20+(25*i), 10);
    ctx.lineTo(30+(25*i), 30);
    ctx.lineTo(20+(25*i), 20);
    ctx.lineTo(10+(25*i), 30);
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.stroke();
  }
  player.render(elapsedTime, ctx);
  asteriods.forEach(function(asteriod) {
    asteriod.render(elapsedTime, ctx);
  });
  for(var i=0; i<lightBeams.length; i++) {
    ctx.beginPath();
    ctx.moveTo(lightBeams[i].xa, lightBeams[i].ya);
    ctx.lineTo(lightBeams[i].xb, lightBeams[i].yb);
    ctx.closePath();
    ctx.strokeStyle = 'green';
    ctx.stroke();
  }
  ctx.font = "20px calibri";
  ctx.fillStyle = 'white';
  ctx.fillText('level ' + level, 10, 460);

  ctx.font = "20px calibri";
  ctx.fillStyle = 'white';
  ctx.fillText('score: ' + score, 640, 30);
}

},{"./asteriod.js":2,"./game.js":3,"./player.js":4}],2:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Asteriod class
 */
module.exports = exports = Asteriod;

/**
 * @constructor Asteriod
 * Creates a new asteriod object
 * @param {Postition} position object specifying an x and y
 */
function Asteriod(position, canvas, size, color) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.x = position.x;
  this.y = position.y;
  this.size = size;
  this.radius = size * 7;
  this.color = color;
  this.vx = Math.cos(Math.random()*Math.PI*2);
  this.vy = Math.cos(Math.random()*Math.PI*2);
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Asteriod.prototype.update = function(time) {
  //this.x += ((4-this.size)*0.5)*this.vx;
  //this.y += ((4-this.size)*0.5)*this.vy;
  this.x += 1.5*this.vx;
  this.y += 1.5*this.vy;
  if(this.x < 0) this.x += this.worldWidth;
  if(this.x > this.worldWidth) this.x -= this.worldWidth;
  if(this.y < 0) this.y += this.worldHeight;
  if(this.y > this.worldHeight) this.y -= this.worldHeight;
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Asteriod.prototype.render = function(time, ctx) {
  ctx.beginPath();
  ctx.moveTo(Math.cos(Math.PI*(0))*(this.radius) + this.x, Math.sin(Math.PI*(0))*(this.radius) + this.y);
  ctx.lineTo(Math.cos(Math.PI*(1/4))*(this.radius) + this.x, Math.sin(Math.PI*(1/4))*(this.radius) + this.y);
  ctx.lineTo(Math.cos(Math.PI*(1/2))*(this.radius) + this.x, Math.sin(Math.PI*(1/2))*(this.radius) + this.y);
  ctx.lineTo(Math.cos(Math.PI*(3/4))*(this.radius) + this.x, Math.sin(Math.PI*(3/4))*(this.radius) + this.y);
  ctx.lineTo(Math.cos(Math.PI*(1))*(this.radius) + this.x, Math.sin(Math.PI*(1))*(this.radius) + this.y);
  ctx.lineTo(Math.cos(Math.PI*(5/4))*(this.radius) + this.x, Math.sin(Math.PI*(5/4))*(this.radius) + this.y);
  ctx.lineTo(Math.cos(Math.PI*(3/2))*(this.radius) + this.x, Math.sin(Math.PI*(3/2))*(this.radius) + this.y);
  ctx.lineTo(Math.cos(Math.PI*(7/4))*(this.radius) + this.x, Math.sin(Math.PI*(7/4))*(this.radius) + this.y);
  ctx.lineTo(Math.cos(Math.PI*(2))*(this.radius) + this.x, Math.sin(Math.PI*(2))*(this.radius) + this.y);
  ctx.closePath();
  ctx.strokeStyle = this.color;
  ctx.stroke();
}

},{}],3:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],4:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.radius  = 64;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.shots = 0;
  this.color = 'white';

  var self = this;
  window.onkeydown = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
      case 'v':
        self.shots = 1;
        break;
    }
  }

  window.onkeyup = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
    }
  }
}


Player.prototype.spawn = function() {
  this.position.x = this.worldWidth/2;
  this.position.y = this.worldHeight/2;
  this.velocity.x = 0;
  this.velocity.y = 0;
  this.angle = 0;
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle += 0.1;
  }
  if(this.steerRight) {
    this.angle -= 0.1;
  }
  // Apply acceleration
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle),
      y: Math.cos(this.angle)
    }
    this.velocity.x -= acceleration.x;
    this.velocity.y -= acceleration.y;
  }
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  ctx.save();

  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.strokeStyle = this.color;
  ctx.stroke();

  // Draw engine thrust
  if(this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }
  ctx.restore();
}

},{}]},{},[1]);
