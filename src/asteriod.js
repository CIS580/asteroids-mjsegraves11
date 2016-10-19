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
