
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
  this.fontColor('black');
  this.font('helvetica, arial, sans-serif');
}

/**
 * Inherit from `P`.
 */

Progress.prototype.__proto__ = P.prototype;

/**
 * Set progress size to `n`.
 *
 * @param {Number} n
 * @return {Progress}
 * @api public
 */

Progress.prototype.size = function(n){
  this.el.width = n;
  this.el.height = n;
  autoscale(this.el);
  return this;
};

/**
 * Update percentage to `n`.
 *
 * @param {Number} n
 * @return {Progress}
 * @api public
 */

Progress.prototype.update = function(n, animate){
  this.percent = n;
  this.draw(this.ctx);
  return this;
};

/**
 * Animate percentage to `n`.
 *
 * @param {Number} n
 * @param {String} animation
 * @return {Progress}
 * @api public
 */

Progress.prototype.animate = function(n, animation){
  var self = this;

  animation || (animation = 'linear');

  raf.cancel(self.animation);

  var duration = Math.abs(n - this.percent) * 2000 / 100
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
      var val = ease[animation](p);
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
 * Set font `color`.
 *
 * @param {String} color
 * @return {Progress}
 * @api public
 */

Progress.prototype.fontColor = function(color){
  this._fontColor = color;
  return this;
};

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
    , fontColor = this._fontColor
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
  ctx.arc(x, y, rad - lineWidth, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,1)';
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
