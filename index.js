
/**
 * Dependencies.
 */

var P = require('progress')
  , raf = require('raf')
  , ease = require('ease')
  , autoscale = require('autoscale-canvas');

/**
 * Expose `Progress`.
 */

module.exports = Progress;

/**
 * Initialize a new `Progress` indicator.
 */

function Progress(){
  P.apply(this, arguments);

  this.size(50);
  this.fontSize(24);
  this.color('rgba(31,190,242,1)');
  this.font('helvetica, arial, sans-serif');
  this.background('rgba(255,255,255,1)');
}

/**
 * Inherit from `P`.
 */

Progress.prototype.__proto__ = P.prototype;

/**
 * Animate percentage to `n`.
 *
 * @param {Number} n
 * @param {String} easing
 * @return {Progress}
 * @api public
 */

Progress.prototype.animate = function(n, easing){
  var self = this;

  easing || (easing = 'linear');

  raf.cancel(self.animation);

  var duration = 2000 //Math.abs(n - this.percent) * 2000 / 100
    , start = Date.now()
    , end = start + duration
    , startx = this.percent
    , x = startx
    , destx = n;

  function step(){
    self.animation = raf(function(){
      var now = Date.now();
      if (now - start >= duration) return self.update(n);
      var p = (now - start) / duration;
      var val = ease[easing](p);
      x = startx + (destx - startx) * val;
      self.update(x);
      step();

      // self.update(n > self.percent ? Math.min(self.percent + 1, n) : Math.max(self.percent - 1, n));
      // if(self.percent !== n) step();
    });
  }

  step();
  return this;
}

/**
 * Set outter `color`.
 *
 * @param {String} col
 * @return {Progress}
 * @api public
 */

Progress.prototype.color = function(col){
  this._color = col;
  return this;
}

/**
 * Set background color.
 *
 * @param {String} color
 * @return {Progress}
 * @api public
 */

Progress.prototype.background = function(color){
  this._backgroundColor = color;
  return this;
}

/**
 * Draw on `ctx`.
 *
 * @param {CanvasRenderingContext2d} ctx
 * @return {Progress}
 * @api private
 */

Progress.prototype.draw = function(ctx){
  var percent = Math.min(this.percent, 100)
    , ratio = window.devicePixelRatio || 1
    , size = this.el.width / ratio
    , half = size / 2
    , x = half
    , y = half
    , rad = half - 1
    , fontSize = this._fontSize
    , color = this._color
    , lineWidth = rad / 3;

  var start = 1.5 * Math.PI;
  var angle = start + (Math.PI * 2 * (percent / 100));

  ctx.clearRect(0, 0, size, size);

  // inner circle
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = 'rgba(238,238,238,1)';
  ctx.fill();

  // outer circle
  ctx.strokeStyle = color;
  ctx.lineWidth   = lineWidth * 2;
  ctx.beginPath();
  ctx.arc(x, y, rad - lineWidth, start, angle, false);
  ctx.stroke();

  // label circle
  ctx.beginPath();
  ctx.arc(x, y, rad - lineWidth, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fillStyle = this._backgroundColor;
  ctx.fill();

  // percent/label text
  ctx.font = fontSize + 'px ' + this._font;
  var text = this._test || (percent | 0) + '%'
    , w = ctx.measureText(text).width;

  ctx.fillStyle = color;
  ctx.fillText(
       text
    , x - w / 2 + 1
    , y + fontSize / 2 - 1);

  return this;
};
