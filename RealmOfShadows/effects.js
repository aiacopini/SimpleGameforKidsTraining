// ============================================================================
// REALM OF SHADOWS - Particle & Visual Effects System
// 800x600 canvas, 2D top-down action RPG
// ============================================================================

// ---------------------------------------------------------------------------
// 1. Particle Class
// ---------------------------------------------------------------------------
class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.color = '#ffffff';
    this.endColor = null;
    this.size = 2;
    this.startSize = 2;
    this.endSize = 0;
    this.alpha = 1;
    this.alphaDecay = 0;
    this.gravity = 0;
    this.friction = 1;
    this.type = 'circle';
    this.rotation = 0;
    this.rotSpeed = 0;
    this.active = false;
    this.props = {};
  }

  init(x, y, vx, vy, life, color, size, type, props) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color || '#ffffff';
    this.endColor = (props && props.endColor) || null;
    this.size = size || 2;
    this.startSize = size || 2;
    this.endSize = (props && props.endSize !== undefined) ? props.endSize : 0;
    this.alpha = (props && props.alpha !== undefined) ? props.alpha : 1;
    this.alphaDecay = (props && props.alphaDecay !== undefined) ? props.alphaDecay : 0;
    this.gravity = (props && props.gravity !== undefined) ? props.gravity : 0;
    this.friction = (props && props.friction !== undefined) ? props.friction : 1;
    this.type = type || 'circle';
    this.rotation = (props && props.rotation !== undefined) ? props.rotation : 0;
    this.rotSpeed = (props && props.rotSpeed !== undefined) ? props.rotSpeed : 0;
    this.active = true;
    this.props = props || {};
    return this;
  }

  update(dt) {
    if (!this.active) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.vy += this.gravity * dt;
    this.vx *= Math.pow(this.friction, dt * 60);
    this.vy *= Math.pow(this.friction, dt * 60);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.rotation += this.rotSpeed * dt;

    var t = 1 - (this.life / this.maxLife);

    if (this.alphaDecay > 0) {
      this.alpha = Math.max(0, 1 - t * this.alphaDecay);
    } else {
      this.alpha = Math.max(0, 1 - t);
    }

    this.size = this.startSize + (this.endSize - this.startSize) * t;
    if (this.size < 0) this.size = 0;

    if (this.endColor) {
      this.color = Particle.lerpColor(this.props._startColor || this.color, this.endColor, t);
    }

    if (this.props.flicker) {
      this.alpha *= 0.7 + Math.random() * 0.3;
    }

    if (this.props.oscillateX) {
      this.x += Math.sin(this.life * this.props.oscillateX) * 0.5;
    }
    if (this.props.oscillateY) {
      this.y += Math.sin(this.life * this.props.oscillateY) * 0.5;
    }

    if (this.props.blink) {
      var blinkPhase = Math.sin(this.life * this.props.blink);
      if (blinkPhase < -0.3) this.alpha *= 0.1;
    }
  }

  draw(ctx) {
    if (!this.active || this.alpha <= 0 || this.size <= 0) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

    if (this.props.glow) {
      ctx.shadowBlur = this.props.glow;
      ctx.shadowColor = this.color;
    }

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;

    switch (this.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, this.size), 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'square':
        ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(-this.size * 0.866, this.size * 0.5);
        ctx.lineTo(this.size * 0.866, this.size * 0.5);
        ctx.closePath();
        ctx.fill();
        break;

      case 'line':
        var len = this.props.length || this.size * 3;
        var angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle - this.rotation);
        ctx.lineWidth = Math.max(0.5, this.size * 0.5);
        ctx.beginPath();
        ctx.moveTo(-len * 0.5, 0);
        ctx.lineTo(len * 0.5, 0);
        ctx.stroke();
        break;

      case 'spark':
        var sparkLen = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 0.08;
        sparkLen = Math.max(2, Math.min(sparkLen, 12));
        var sparkAngle = Math.atan2(this.vy, this.vx);
        ctx.rotate(sparkAngle - this.rotation);
        ctx.lineWidth = Math.max(0.5, this.size * 0.6);
        ctx.beginPath();
        ctx.moveTo(-sparkLen, 0);
        ctx.lineTo(sparkLen, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sparkLen, 0, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'snow':
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, this.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha *= 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, this.size * 1.5), 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ember':
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, this.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha *= 0.4;
        ctx.shadowBlur = this.size * 4;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, this.size * 1.8), 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'dust':
        ctx.globalAlpha *= 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.3, this.size), 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ring':
        ctx.lineWidth = Math.max(0.5, this.props.ringWidth || 2);
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1, this.size), 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'star':
        this._drawStar(ctx, 0, 0, this.props.points || 4, this.size, this.size * 0.4);
        ctx.fill();
        break;

      case 'feather':
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(0.5, this.size * 2), Math.max(0.3, this.size * 0.5), 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'splinter':
        ctx.lineWidth = Math.max(0.5, this.size * 0.4);
        ctx.beginPath();
        ctx.moveTo(-this.size * 1.5, 0);
        ctx.lineTo(this.size * 1.5, 0);
        ctx.stroke();
        break;

      case 'smoke':
        var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, this.size));
        var smokeCol = this.color;
        grad.addColorStop(0, smokeCol);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1, this.size), 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'shard':
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 1.5);
        ctx.lineTo(-this.size * 0.6, 0);
        ctx.lineTo(0, this.size * 0.8);
        ctx.lineTo(this.size * 0.6, 0);
        ctx.closePath();
        ctx.fill();
        break;

      case 'bone':
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size * 1.5, -this.size * 0.3, this.size * 3, this.size * 0.6);
        ctx.beginPath();
        ctx.arc(-this.size * 1.5, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.size * 1.5, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      default:
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, this.size), 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  _drawStar(ctx, cx, cy, points, outerR, innerR) {
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var r = i % 2 === 0 ? outerR : innerR;
      var a = (Math.PI * i) / points - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath();
  }

  isAlive() {
    return this.active && this.life > 0;
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.color = '#ffffff';
    this.endColor = null;
    this.size = 2;
    this.startSize = 2;
    this.endSize = 0;
    this.alpha = 1;
    this.alphaDecay = 0;
    this.gravity = 0;
    this.friction = 1;
    this.type = 'circle';
    this.rotation = 0;
    this.rotSpeed = 0;
    this.active = false;
    this.props = {};
  }

  static lerpColor(a, b, t) {
    var ar = parseInt(a.slice(1, 3), 16);
    var ag = parseInt(a.slice(3, 5), 16);
    var ab = parseInt(a.slice(5, 7), 16);
    var br = parseInt(b.slice(1, 3), 16);
    var bg = parseInt(b.slice(3, 5), 16);
    var bb = parseInt(b.slice(5, 7), 16);
    var rr = Math.round(ar + (br - ar) * t);
    var rg = Math.round(ag + (bg - ag) * t);
    var rb = Math.round(ab + (bb - ab) * t);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
  }
}

// ---------------------------------------------------------------------------
// Particle Object Pool
// ---------------------------------------------------------------------------
const ParticlePool = {
  pool: [],
  maxSize: 2000,

  get() {
    for (var i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].active) {
        this.pool[i].reset();
        return this.pool[i];
      }
    }
    if (this.pool.length < this.maxSize) {
      var p = new Particle();
      this.pool.push(p);
      return p;
    }
    var oldest = this.pool[0];
    var lowestLife = oldest.life;
    for (var i = 1; i < this.pool.length; i++) {
      if (this.pool[i].life < lowestLife) {
        oldest = this.pool[i];
        lowestLife = this.pool[i].life;
      }
    }
    oldest.reset();
    return oldest;
  },

  emit(x, y, vx, vy, life, color, size, type, props) {
    var p = this.get();
    if (props && props.endColor) {
      props._startColor = color;
    }
    p.init(x, y, vx, vy, life, color, size, type, props);
    return p;
  },

  updateAll(dt) {
    for (var i = 0; i < this.pool.length; i++) {
      if (this.pool[i].active) {
        this.pool[i].update(dt);
      }
    }
  },

  drawAll(ctx, camera) {
    for (var i = 0; i < this.pool.length; i++) {
      if (this.pool[i].active) {
        var p = this.pool[i];
        var sx = p.x - (camera ? camera.x : 0);
        var sy = p.y - (camera ? camera.y : 0);
        if (sx > -50 && sx < 850 && sy > -50 && sy < 650) {
          ctx.save();
          if (camera) {
            ctx.translate(-camera.x, -camera.y);
          }
          p.draw(ctx);
          ctx.restore();
        }
      }
    }
  },

  activeCount() {
    var count = 0;
    for (var i = 0; i < this.pool.length; i++) {
      if (this.pool[i].active) count++;
    }
    return count;
  }
};

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------
function _rand(min, max) {
  return min + Math.random() * (max - min);
}

function _randInt(min, max) {
  return Math.floor(_rand(min, max + 1));
}

function _randAngle() {
  return Math.random() * Math.PI * 2;
}

function _randFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function _spreadXY(speed, angle, spread) {
  var a = angle + _rand(-spread, spread);
  return { x: Math.cos(a) * speed, y: Math.sin(a) * speed };
}

// ---------------------------------------------------------------------------
// 2. Particle Factory
// ---------------------------------------------------------------------------
const ParticleFactory = {

  // ---- Attack Effects ----

  arrowTrail: function(x, y, particles) {
    var count = _randInt(1, 2);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#d4c5a0', '#c8b88a', '#f0e6d0', '#b8a878']);
      ParticlePool.emit(
        x + _rand(-3, 3), y + _rand(-3, 3),
        _rand(-15, 15), _rand(-15, 15),
        _rand(0.2, 0.4),
        col, _rand(1, 2.5), 'feather',
        { gravity: 20, friction: 0.96, rotSpeed: _rand(-3, 3), alphaDecay: 1.5 }
      );
    }
  },

  magicBoltTrail: function(x, y, particles) {
    var count = _randInt(2, 3);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#6666ff', '#9966ff', '#aaaaff', '#7744ee']);
      ParticlePool.emit(
        x + _rand(-4, 4), y + _rand(-4, 4),
        _rand(-20, 20), _rand(-20, 20),
        _rand(0.2, 0.5),
        col, _rand(1, 3), 'star',
        { glow: 8, rotSpeed: _rand(-5, 5), endSize: 0, alphaDecay: 1.2, endColor: '#220066', _startColor: col, points: 4 }
      );
    }
  },

  magicBoltImpact: function(x, y, particles) {
    var count = _randInt(8, 12);
    for (var i = 0; i < count; i++) {
      var angle = _randAngle();
      var speed = _rand(60, 180);
      var col = _randFrom(['#6666ff', '#9966ff', '#ccaaff', '#aaaaff', '#5533cc']);
      ParticlePool.emit(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.3, 0.7),
        col, _rand(2, 5), _randFrom(['circle', 'star']),
        { glow: 12, friction: 0.92, endSize: 0, alphaDecay: 1.0, endColor: '#110033', _startColor: col, points: 4 }
      );
    }
    for (var i = 0; i < 3; i++) {
      ParticlePool.emit(
        x + _rand(-5, 5), y + _rand(-5, 5),
        0, 0,
        _rand(0.1, 0.25),
        '#ccaaff', _rand(8, 15), 'ring',
        { glow: 15, endSize: 30, alphaDecay: 3.0, ringWidth: 2 }
      );
    }
  },

  arrowImpact: function(x, y, particles) {
    var count = _randInt(4, 7);
    for (var i = 0; i < count; i++) {
      var angle = _randAngle();
      var speed = _rand(30, 100);
      var col = _randFrom(['#8B7355', '#A0926B', '#C4B07B', '#6B5B3E']);
      ParticlePool.emit(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.2, 0.5),
        col, _rand(1, 3), 'splinter',
        { gravity: 150, friction: 0.95, rotSpeed: _rand(-8, 8), alphaDecay: 1.2 }
      );
    }
  },

  // ---- Super Weapon Effects ----

  rainOfArrows: function(x, y, w, h, particles) {
    var count = _randInt(3, 6);
    for (var i = 0; i < count; i++) {
      var px = x + _rand(0, w);
      var py = y + _rand(-40, -10);
      ParticlePool.emit(
        px, py,
        _rand(-10, 10), _rand(180, 280),
        _rand(0.3, 0.6),
        '#8B7355', _rand(1.5, 3), 'line',
        { gravity: 80, friction: 0.99, rotation: Math.PI * 0.5 + _rand(-0.2, 0.2), length: _rand(8, 14) }
      );
    }
    if (Math.random() < 0.3) {
      var impX = x + _rand(0, w);
      var impY = y + _rand(0, h);
      this.arrowImpact(impX, impY, particles);
    }
  },

  frostTrail: function(x, y, particles) {
    var count = _randInt(2, 4);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#aaeeff', '#ccffff', '#88ccff', '#ffffff', '#66bbee']);
      ParticlePool.emit(
        x + _rand(-6, 6), y + _rand(-6, 6),
        _rand(-25, 25), _rand(-25, 25),
        _rand(0.3, 0.7),
        col, _rand(1, 4), _randFrom(['shard', 'star', 'snow']),
        { glow: 6, friction: 0.93, rotSpeed: _rand(-4, 4), endSize: 0, alphaDecay: 1.0, points: 6 }
      );
    }
  },

  phoenixExplosion: function(x, y, particles) {
    var count = _randInt(30, 45);
    for (var i = 0; i < count; i++) {
      var angle = _randAngle();
      var speed = _rand(80, 300);
      var col = _randFrom(['#ff6600', '#ff3300', '#ffaa00', '#ffdd00', '#ff4400', '#ffcc00']);
      var endCol = _randFrom(['#aa2200', '#661100', '#882200']);
      ParticlePool.emit(
        x + _rand(-5, 5), y + _rand(-5, 5),
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.5, 1.5),
        col, _rand(3, 10), _randFrom(['ember', 'circle', 'spark']),
        { glow: 15, gravity: -30, friction: 0.94, endColor: endCol, _startColor: col, endSize: 0, flicker: true, alphaDecay: 0.8 }
      );
    }
    for (var i = 0; i < 5; i++) {
      ParticlePool.emit(
        x, y, 0, 0,
        _rand(0.2, 0.5),
        '#ffcc44', _rand(15, 30), 'ring',
        { glow: 20, endSize: 80 + i * 20, alphaDecay: 4.0, ringWidth: 3 }
      );
    }
    for (var i = 0; i < 8; i++) {
      var angle = _randAngle();
      var speed = _rand(20, 60);
      ParticlePool.emit(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.8, 2.0),
        '#ff8800', _rand(8, 18), 'smoke',
        { gravity: -40, friction: 0.97, endColor: '#331100', _startColor: '#ff8800', endSize: 25, alphaDecay: 0.7 }
      );
    }
  },

  burningGround: function(x, y, radius, particles) {
    var count = _randInt(2, 5);
    for (var i = 0; i < count; i++) {
      var angle = _randAngle();
      var dist = _rand(0, radius);
      var px = x + Math.cos(angle) * dist;
      var py = y + Math.sin(angle) * dist;
      var col = _randFrom(['#ff6600', '#ff3300', '#ffaa00', '#ff8800']);
      ParticlePool.emit(
        px, py,
        _rand(-10, 10), _rand(-60, -20),
        _rand(0.3, 0.8),
        col, _rand(2, 6), _randFrom(['ember', 'circle']),
        { gravity: -20, friction: 0.96, endColor: '#441100', _startColor: col, endSize: 0, flicker: true, glow: 8, alphaDecay: 1.0 }
      );
    }
    if (Math.random() < 0.4) {
      var angle = _randAngle();
      var dist = _rand(0, radius * 0.7);
      ParticlePool.emit(
        x + Math.cos(angle) * dist, y + Math.sin(angle) * dist,
        _rand(-5, 5), _rand(-30, -10),
        _rand(0.5, 1.2),
        '#884400', _rand(5, 12), 'smoke',
        { gravity: -25, friction: 0.97, endSize: 15, alphaDecay: 0.8, endColor: '#221100', _startColor: '#884400' }
      );
    }
  },

  chainLightning: function(x1, y1, x2, y2, particles) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var segments = Math.max(4, Math.floor(dist / 15));
    var nx = dx / dist;
    var ny = dy / dist;
    var perpX = -ny;
    var perpY = nx;

    for (var i = 0; i <= segments; i++) {
      var t = i / segments;
      var px = x1 + dx * t + perpX * _rand(-12, 12);
      var py = y1 + dy * t + perpY * _rand(-12, 12);
      var col = _randFrom(['#aaddff', '#88ccff', '#ffffff', '#66aaff', '#ccddff']);
      ParticlePool.emit(
        px, py,
        _rand(-30, 30), _rand(-30, 30),
        _rand(0.08, 0.2),
        col, _rand(1, 3), 'spark',
        { glow: 12, friction: 0.9, alphaDecay: 3.0 }
      );
    }
    for (var i = 0; i < 3; i++) {
      var t = _rand(0.1, 0.9);
      var px = x1 + dx * t;
      var py = y1 + dy * t;
      ParticlePool.emit(
        px, py,
        0, 0,
        _rand(0.05, 0.15),
        '#ffffff', _rand(5, 10), 'circle',
        { glow: 20, endSize: 0, alphaDecay: 5.0 }
      );
    }
  },

  blizzardParticles: function(x, y, radius, particles) {
    var count = _randInt(3, 6);
    for (var i = 0; i < count; i++) {
      var angle = _randAngle();
      var dist = _rand(0, radius);
      var px = x + Math.cos(angle) * dist;
      var py = y + Math.sin(angle) * dist;
      var col = _randFrom(['#ffffff', '#cceeFF', '#aaddff', '#eeffff']);
      var windAngle = angle + Math.PI * 0.5;
      ParticlePool.emit(
        px, py,
        Math.cos(windAngle) * _rand(30, 80) + _rand(-10, 10),
        Math.sin(windAngle) * _rand(30, 80) + _rand(10, 30),
        _rand(0.5, 1.5),
        col, _rand(1, 4), 'snow',
        { friction: 0.98, oscillateX: _rand(3, 8), alphaDecay: 0.8 }
      );
    }
    if (Math.random() < 0.3) {
      var angle = _randAngle();
      var dist = _rand(0, radius);
      ParticlePool.emit(
        x + Math.cos(angle) * dist, y + Math.sin(angle) * dist,
        _rand(-20, 20), _rand(-20, 20),
        _rand(0.3, 0.6),
        '#aaddff', _rand(1, 3), 'shard',
        { glow: 5, rotSpeed: _rand(-5, 5), friction: 0.95, alphaDecay: 1.2 }
      );
    }
  },

  meteorShadow: function(x, y, radius, particles) {
    ParticlePool.emit(
      x, y, 0, 0,
      0.05,
      'rgba(0,0,0,0.5)', radius, 'circle',
      { alphaDecay: 0, endSize: radius }
    );
  },

  meteorImpact: function(x, y, particles) {
    var count = _randInt(50, 70);
    for (var i = 0; i < count; i++) {
      var angle = _randAngle();
      var speed = _rand(100, 400);
      var col = _randFrom(['#ff6600', '#ff3300', '#ffaa00', '#ffdd00', '#ff4400', '#993300', '#cc5500']);
      var endCol = _randFrom(['#441100', '#220000', '#331100']);
      ParticlePool.emit(
        x + _rand(-8, 8), y + _rand(-8, 8),
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.5, 2.0),
        col, _rand(2, 12), _randFrom(['ember', 'circle', 'spark', 'square']),
        { glow: 10, gravity: 100, friction: 0.95, endColor: endCol, _startColor: col, endSize: 0, flicker: true, alphaDecay: 0.6 }
      );
    }
    for (var i = 0; i < 10; i++) {
      var angle = _randAngle();
      var speed = _rand(30, 80);
      ParticlePool.emit(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.8, 2.5),
        '#884400', _rand(10, 25), 'smoke',
        { gravity: -50, friction: 0.96, endColor: '#221100', _startColor: '#884400', endSize: 35, alphaDecay: 0.5 }
      );
    }
    for (var i = 0; i < 6; i++) {
      ParticlePool.emit(
        x, y, 0, 0,
        _rand(0.15, 0.5),
        '#ffaa33', _rand(10, 20), 'ring',
        { glow: 25, endSize: 120 + i * 25, alphaDecay: 3.5, ringWidth: 3 - i * 0.3 }
      );
    }
    for (var i = 0; i < 15; i++) {
      var angle = _randAngle();
      var speed = _rand(60, 200);
      ParticlePool.emit(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.4, 1.0),
        '#664422', _rand(3, 8), 'square',
        { gravity: 200, friction: 0.96, rotSpeed: _rand(-10, 10), alphaDecay: 1.0 }
      );
    }
    ScreenFX.shake(12, 0.6);
    ScreenFX.flash('#ff6600', 0.15);
  },

  arcaneNovaRing: function(x, y, radius, particles) {
    var segments = Math.max(12, Math.floor(radius / 5));
    for (var i = 0; i < segments; i++) {
      var angle = (Math.PI * 2 * i) / segments + _rand(-0.1, 0.1);
      var px = x + Math.cos(angle) * radius;
      var py = y + Math.sin(angle) * radius;
      var col = _randFrom(['#9933ff', '#bb55ff', '#7722cc', '#cc77ff', '#aa44ee']);
      ParticlePool.emit(
        px, py,
        Math.cos(angle) * _rand(10, 40), Math.sin(angle) * _rand(10, 40),
        _rand(0.3, 0.7),
        col, _rand(2, 5), _randFrom(['circle', 'star']),
        { glow: 10, friction: 0.93, endSize: 0, alphaDecay: 1.2, points: 4 }
      );
    }
    ParticlePool.emit(
      x, y, 0, 0,
      0.4,
      '#9933ff', radius * 0.5, 'ring',
      { glow: 20, endSize: radius, alphaDecay: 3.0, ringWidth: 3 }
    );
  },

  shadowArrowTrail: function(x, y, particles) {
    var count = _randInt(2, 3);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#4400aa', '#330088', '#220066', '#550099']);
      ParticlePool.emit(
        x + _rand(-4, 4), y + _rand(-4, 4),
        _rand(-15, 15), _rand(-15, 15),
        _rand(0.3, 0.7),
        col, _rand(3, 7), 'smoke',
        { friction: 0.95, gravity: -15, endSize: 10, alphaDecay: 0.9, endColor: '#110022', _startColor: col }
      );
    }
  },

  // ---- Death Effects ----

  bloodSplatter: function(x, y, color, particles) {
    var baseColor = color || '#cc0000';
    var count = _randInt(6, 10);
    var dirAngle = _randAngle();
    for (var i = 0; i < count; i++) {
      var angle = dirAngle + _rand(-0.8, 0.8);
      var speed = _rand(40, 150);
      var col;
      if (baseColor === '#cc0000') {
        col = _randFrom(['#cc0000', '#aa0000', '#880000', '#dd2222', '#990000']);
      } else if (baseColor === '#00cc00' || baseColor === '#00aa00') {
        col = _randFrom(['#00cc00', '#00aa00', '#008800', '#22dd22', '#009900']);
      } else {
        col = baseColor;
      }
      ParticlePool.emit(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.3, 0.8),
        col, _rand(2, 5), 'circle',
        { gravity: 120, friction: 0.94, endSize: _rand(1, 3), alphaDecay: 0.8 }
      );
    }
    for (var i = 0; i < 3; i++) {
      var angle = dirAngle + _rand(-0.5, 0.5);
      var speed = _rand(20, 60);
      var col = baseColor;
      ParticlePool.emit(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.5, 1.2),
        col, _rand(4, 8), 'circle',
        { gravity: 80, friction: 0.92, endSize: _rand(2, 4), alphaDecay: 0.6 }
      );
    }
  },

  boneShatter: function(x, y, particles) {
    var count = 8;
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + _rand(-0.3, 0.3);
      var speed = _rand(60, 160);
      var col = _randFrom(['#e8dcc8', '#d4c8a8', '#f0e8d8', '#c8b898', '#b8a888']);
      ParticlePool.emit(
        x + _rand(-3, 3), y + _rand(-3, 3),
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.5, 1.2),
        col, _rand(2, 5), 'bone',
        { gravity: 200, friction: 0.95, rotSpeed: _rand(-10, 10), alphaDecay: 0.7 }
      );
    }
    for (var i = 0; i < 4; i++) {
      ParticlePool.emit(
        x + _rand(-5, 5), y + _rand(-5, 5),
        _rand(-15, 15), _rand(-30, -5),
        _rand(0.3, 0.6),
        '#d4c8a8', _rand(1, 2), 'dust',
        { gravity: 30, friction: 0.97, alphaDecay: 1.2 }
      );
    }
  },

  greenSmokePoof: function(x, y, particles) {
    var count = _randInt(8, 14);
    for (var i = 0; i < count; i++) {
      var angle = _randAngle();
      var speed = _rand(20, 70);
      var col = _randFrom(['#33aa33', '#22bb22', '#44cc44', '#55aa55', '#228822']);
      ParticlePool.emit(
        x + _rand(-5, 5), y + _rand(-5, 5),
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.4, 1.0),
        col, _rand(5, 15), 'smoke',
        { gravity: -20, friction: 0.94, endColor: '#113311', _startColor: col, endSize: 20, alphaDecay: 0.8 }
      );
    }
  },

  shadowDissolve: function(x, y, particles) {
    var count = _randInt(10, 18);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#220044', '#110022', '#330055', '#1a0033', '#2a0055']);
      ParticlePool.emit(
        x + _rand(-12, 12), y + _rand(-12, 12),
        _rand(-15, 15), _rand(-80, -20),
        _rand(0.6, 1.8),
        col, _rand(3, 10), 'smoke',
        { gravity: -30, friction: 0.97, endSize: 15, alphaDecay: 0.6, glow: 5 }
      );
    }
    for (var i = 0; i < 5; i++) {
      ParticlePool.emit(
        x + _rand(-8, 8), y + _rand(-8, 8),
        _rand(-20, 20), _rand(-50, -10),
        _rand(0.3, 0.8),
        '#6633aa', _rand(1, 3), 'star',
        { gravity: -20, friction: 0.96, glow: 8, endSize: 0, alphaDecay: 1.0, rotSpeed: _rand(-4, 4), points: 4 }
      );
    }
  },

  fireExplosion: function(x, y, particles) {
    var count = _randInt(20, 30);
    for (var i = 0; i < count; i++) {
      var angle = _randAngle();
      var speed = _rand(50, 200);
      var col = _randFrom(['#ff6600', '#ff3300', '#ffaa00', '#ffdd00', '#ff8800']);
      var endCol = _randFrom(['#441100', '#220000', '#661100']);
      ParticlePool.emit(
        x + _rand(-5, 5), y + _rand(-5, 5),
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.4, 1.2),
        col, _rand(3, 8), _randFrom(['ember', 'circle', 'spark']),
        { glow: 10, gravity: -20, friction: 0.94, endColor: endCol, _startColor: col, endSize: 0, flicker: true, alphaDecay: 0.7 }
      );
    }
    for (var i = 0; i < 4; i++) {
      var angle = _randAngle();
      var speed = _rand(15, 40);
      ParticlePool.emit(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(0.6, 1.5),
        '#663300', _rand(8, 16), 'smoke',
        { gravity: -40, friction: 0.97, endColor: '#221100', _startColor: '#663300', endSize: 22, alphaDecay: 0.6 }
      );
    }
    ScreenFX.shake(6, 0.3);
  },

  bossDeathExplosion: function(x, y, particles) {
    var colorSets = [
      ['#ff6600', '#ff3300', '#ffaa00'],
      ['#6666ff', '#9966ff', '#ccaaff'],
      ['#ffffff', '#ffddaa', '#ffeecc'],
      ['#ff0000', '#ff4444', '#ff8888'],
      ['#ffdd00', '#ffcc00', '#ffee66']
    ];

    for (var stage = 0; stage < 5; stage++) {
      var colors = colorSets[stage];
      var delay = stage * 0.08;
      var count = _randInt(10, 15);
      for (var i = 0; i < count; i++) {
        var angle = _randAngle();
        var speed = _rand(60 + stage * 30, 200 + stage * 40);
        var col = _randFrom(colors);
        ParticlePool.emit(
          x + _rand(-10, 10), y + _rand(-10, 10),
          Math.cos(angle) * speed, Math.sin(angle) * speed,
          _rand(0.5, 2.0) + delay,
          col, _rand(3, 10), _randFrom(['ember', 'circle', 'spark', 'star']),
          { glow: 15, gravity: _rand(-50, 30), friction: 0.94, endSize: 0, flicker: true, alphaDecay: 0.5, points: 4 }
        );
      }
    }

    for (var i = 0; i < 8; i++) {
      ParticlePool.emit(
        x, y, 0, 0,
        0.15 + i * 0.1,
        _randFrom(['#ffdd00', '#ff6600', '#9966ff', '#ffffff']),
        _rand(15, 25), 'ring',
        { glow: 25, endSize: 100 + i * 30, alphaDecay: 3.0, ringWidth: 4 - i * 0.3 }
      );
    }

    for (var i = 0; i < 12; i++) {
      var angle = _randAngle();
      var speed = _rand(20, 60);
      ParticlePool.emit(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        _rand(1.0, 3.0),
        '#664422', _rand(10, 25), 'smoke',
        { gravity: -60, friction: 0.97, endColor: '#221100', _startColor: '#664422', endSize: 35, alphaDecay: 0.4 }
      );
    }

    ScreenFX.shake(18, 1.2);
    ScreenFX.flash('#ffffff', 0.3);
  },

  // ---- Pickup Effects ----

  pickupSparkle: function(x, y, color, particles) {
    var col = color || '#ffdd44';
    var count = _randInt(4, 6);
    for (var i = 0; i < count; i++) {
      ParticlePool.emit(
        x + _rand(-8, 8), y + _rand(-8, 8),
        _rand(-20, 20), _rand(-80, -30),
        _rand(0.4, 0.8),
        col, _rand(1.5, 3.5), 'star',
        { glow: 8, gravity: -20, friction: 0.96, endSize: 0, alphaDecay: 1.2, rotSpeed: _rand(-6, 6), points: 4 }
      );
    }
  },

  orbGlow: function(x, y, color, particles) {
    var col = color || '#ffaa00';
    var count = _randInt(1, 2);
    for (var i = 0; i < count; i++) {
      var angle = _randAngle();
      var dist = _rand(8, 16);
      ParticlePool.emit(
        x + Math.cos(angle) * dist, y + Math.sin(angle) * dist,
        Math.cos(angle) * _rand(5, 15), Math.sin(angle) * _rand(5, 15),
        _rand(0.3, 0.6),
        col, _rand(1, 3), 'circle',
        { glow: 10, friction: 0.95, endSize: 0, alphaDecay: 1.5 }
      );
    }
  },

  // ---- Environmental / Ambient ----

  torchSparks: function(x, y, particles) {
    var count = _randInt(1, 2);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#ffaa00', '#ffcc33', '#ff8800', '#ffdd44']);
      ParticlePool.emit(
        x + _rand(-4, 4), y + _rand(-4, 0),
        _rand(-10, 10), _rand(-50, -20),
        _rand(0.3, 0.8),
        col, _rand(1, 2.5), 'ember',
        { gravity: -15, friction: 0.97, endSize: 0, flicker: true, alphaDecay: 1.0, glow: 6 }
      );
    }
  },

  dustMotes: function(x, y, particles) {
    var count = _randInt(1, 2);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#999988', '#aaaaaa', '#888877', '#bbbbaa']);
      ParticlePool.emit(
        x + _rand(-20, 20), y + _rand(-20, 20),
        _rand(-5, 5), _rand(-5, 5),
        _rand(2, 5),
        col, _rand(0.5, 1.5), 'dust',
        { friction: 0.99, oscillateX: _rand(1, 3), oscillateY: _rand(1, 3), alphaDecay: 0.5, alpha: 0.4 }
      );
    }
  },

  embers: function(x, y, particles) {
    var count = _randInt(1, 3);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#ff6600', '#ff4400', '#ff8800', '#ffaa00']);
      ParticlePool.emit(
        x + _rand(-10, 10), y + _rand(-5, 5),
        _rand(-8, 8), _rand(-40, -15),
        _rand(1.0, 3.0),
        col, _rand(1, 3), 'ember',
        { gravity: -10, friction: 0.99, endColor: '#441100', _startColor: col, endSize: 0.5, flicker: true, alphaDecay: 0.5, oscillateX: _rand(2, 5), glow: 5 }
      );
    }
  },

  snowflakes: function(x, y, w, particles) {
    var count = _randInt(1, 3);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#ffffff', '#eeeeff', '#ddddff', '#ccddff']);
      ParticlePool.emit(
        x + _rand(0, w), y - 10,
        _rand(-15, 15), _rand(20, 50),
        _rand(3, 7),
        col, _rand(1, 3), 'snow',
        { gravity: 5, friction: 0.99, oscillateX: _rand(2, 6), alphaDecay: 0.3, alpha: _rand(0.5, 0.9) }
      );
    }
  },

  fireflies: function(x, y, w, h, particles) {
    if (Math.random() > 0.3) return;
    var col = _randFrom(['#aaff44', '#88ff22', '#ccff66', '#ffee44', '#bbff55']);
    ParticlePool.emit(
      x + _rand(0, w), y + _rand(0, h),
      _rand(-8, 8), _rand(-8, 8),
      _rand(2, 5),
      col, _rand(1, 2.5), 'circle',
      { friction: 0.99, oscillateX: _rand(1, 4), oscillateY: _rand(1, 4), glow: 10, alphaDecay: 0.4, blink: _rand(3, 8) }
    );
  },

  fogWisps: function(x, y, particles) {
    var col = _randFrom(['#888899', '#999aaa', '#777788']);
    ParticlePool.emit(
      x + _rand(-30, 30), y + _rand(-20, 20),
      _rand(-5, 5), _rand(-3, 3),
      _rand(4, 8),
      col, _rand(15, 35), 'smoke',
      { friction: 0.995, endSize: _rand(25, 50), alphaDecay: 0.3, alpha: _rand(0.1, 0.25), oscillateX: _rand(0.5, 2) }
    );
  },

  lavaBubbles: function(x, y, particles) {
    if (Math.random() > 0.4) return;
    var col = _randFrom(['#ff6600', '#ff4400', '#ffaa00', '#ff8800']);
    ParticlePool.emit(
      x + _rand(-10, 10), y + _rand(-5, 5),
      _rand(-3, 3), _rand(-20, -8),
      _rand(0.3, 0.8),
      col, _rand(2, 5), 'circle',
      { gravity: 15, friction: 0.98, endSize: _rand(5, 8), alphaDecay: 1.5, glow: 8 }
    );
    ParticlePool.emit(
      x + _rand(-8, 8), y + _rand(-8, 0),
      _rand(-5, 5), _rand(-15, -5),
      _rand(0.2, 0.4),
      '#ffcc44', _rand(1, 2), 'spark',
      { gravity: 10, friction: 0.95, alphaDecay: 2.0, glow: 5 }
    );
  },

  iceCrystals: function(x, y, particles) {
    var count = _randInt(1, 2);
    for (var i = 0; i < count; i++) {
      var col = _randFrom(['#aaeeff', '#88ccff', '#ccffff', '#66bbee', '#ffffff']);
      ParticlePool.emit(
        x + _rand(-15, 15), y + _rand(-15, 15),
        _rand(-5, 5), _rand(-5, 5),
        _rand(1, 3),
        col, _rand(1, 2.5), _randFrom(['shard', 'star']),
        { friction: 0.99, glow: 6, endSize: 0, alphaDecay: 0.5, rotSpeed: _rand(-2, 2), blink: _rand(3, 6), points: 6 }
      );
    }
  }
};

// ---------------------------------------------------------------------------
// 3. Lighting System
// ---------------------------------------------------------------------------
const Lighting = {
  ambientDarkness: 0.6,
  lights: [],
  _offscreenCanvas: null,
  _offscreenCtx: null,

  _levelAmbient: [0.55, 0.45, 0.5, 0.55, 0.4],

  init: function(levelIndex) {
    this.lights = [];
    this.ambientDarkness = this._levelAmbient[levelIndex] || 0.5;

    if (!this._offscreenCanvas) {
      this._offscreenCanvas = document.createElement('canvas');
      this._offscreenCanvas.width = 800;
      this._offscreenCanvas.height = 600;
      this._offscreenCtx = this._offscreenCanvas.getContext('2d');
    }
  },

  addLight: function(x, y, radius, color, intensity, flicker) {
    this.lights.push({
      x: x,
      y: y,
      radius: radius || 100,
      color: color || '#ffaa44',
      intensity: intensity !== undefined ? intensity : 1.0,
      flicker: flicker || false
    });
  },

  clearLights: function() {
    this.lights = [];
  },

  _drawLightCircle: function(ctx, x, y, radius, color, intensity) {
    var r = parseInt(color.slice(1, 3), 16);
    var g = parseInt(color.slice(3, 5), 16);
    var b = parseInt(color.slice(5, 7), 16);

    var grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + intensity + ')');
    grad.addColorStop(0.4, 'rgba(' + r + ',' + g + ',' + b + ',' + (intensity * 0.6) + ')');
    grad.addColorStop(0.7, 'rgba(' + r + ',' + g + ',' + b + ',' + (intensity * 0.2) + ')');
    grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  },

  draw: function(ctx, camera, player, torches, levelIndex) {
    var oc = this._offscreenCtx;
    var camX = camera ? camera.x : 0;
    var camY = camera ? camera.y : 0;

    oc.clearRect(0, 0, 800, 600);

    var darknessAlpha = this.ambientDarkness;
    if (levelIndex === 4) darknessAlpha = Math.max(0.25, darknessAlpha);

    var darkR = 5, darkG = 5, darkB = 15;
    if (levelIndex === 0) { darkR = 10; darkG = 10; darkB = 30; }
    else if (levelIndex === 1) { darkR = 15; darkG = 10; darkB = 5; }
    else if (levelIndex === 2) { darkR = 5; darkG = 15; darkB = 10; }
    else if (levelIndex === 3) { darkR = 5; darkG = 10; darkB = 25; }
    else if (levelIndex === 4) { darkR = 20; darkG = 8; darkB = 3; }

    oc.fillStyle = 'rgba(' + darkR + ',' + darkG + ',' + darkB + ',' + darknessAlpha + ')';
    oc.fillRect(0, 0, 800, 600);

    oc.globalCompositeOperation = 'destination-out';

    if (player) {
      var px = (player.x || 0) + (player.width || 16) * 0.5 - camX;
      var py = (player.y || 0) + (player.height || 16) * 0.5 - camY;
      var playerRadius = 120;
      var playerFlicker = playerRadius + Math.sin(Date.now() * 0.003) * 3;

      var grad = oc.createRadialGradient(px, py, 0, px, py, playerFlicker);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
      grad.addColorStop(0.6, 'rgba(255,255,255,0.4)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      oc.fillStyle = grad;
      oc.beginPath();
      oc.arc(px, py, playerFlicker, 0, Math.PI * 2);
      oc.fill();
    }

    if (torches && torches.length > 0) {
      for (var i = 0; i < torches.length; i++) {
        var t = torches[i];
        var tx = (t.x || 0) - camX;
        var ty = (t.y || 0) - camY;
        if (tx < -150 || tx > 950 || ty < -150 || ty > 750) continue;
        var tRadius = 80 + Math.random() * 20 + Math.sin(Date.now() * 0.005 + i * 1.7) * 8;

        var grad = oc.createRadialGradient(tx, ty, 0, tx, ty, tRadius);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
        grad.addColorStop(0.7, 'rgba(255,255,255,0.2)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        oc.fillStyle = grad;
        oc.beginPath();
        oc.arc(tx, ty, tRadius, 0, Math.PI * 2);
        oc.fill();
      }
    }

    for (var i = 0; i < this.lights.length; i++) {
      var l = this.lights[i];
      var lx = l.x - camX;
      var ly = l.y - camY;
      if (lx < -200 || lx > 1000 || ly < -200 || ly > 800) continue;

      var lr = l.radius;
      if (l.flicker) {
        lr += Math.sin(Date.now() * 0.008 + i * 2.3) * (l.radius * 0.1);
        lr += Math.random() * 3;
      }

      var grad = oc.createRadialGradient(lx, ly, 0, lx, ly, lr);
      grad.addColorStop(0, 'rgba(255,255,255,' + l.intensity + ')');
      grad.addColorStop(0.5, 'rgba(255,255,255,' + (l.intensity * 0.5) + ')');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      oc.fillStyle = grad;
      oc.beginPath();
      oc.arc(lx, ly, lr, 0, Math.PI * 2);
      oc.fill();
    }

    oc.globalCompositeOperation = 'source-over';

    // Now draw a colored glow layer back on top of the cut-out areas
    oc.globalCompositeOperation = 'destination-over';

    // Add warm colored light from player
    if (player) {
      var px = (player.x || 0) + (player.width || 16) * 0.5 - camX;
      var py = (player.y || 0) + (player.height || 16) * 0.5 - camY;
      var warmGrad = oc.createRadialGradient(px, py, 0, px, py, 60);
      warmGrad.addColorStop(0, 'rgba(255,220,180,0.08)');
      warmGrad.addColorStop(1, 'rgba(255,220,180,0)');
      oc.fillStyle = warmGrad;
      oc.fillRect(0, 0, 800, 600);
    }

    if (torches && torches.length > 0) {
      for (var i = 0; i < torches.length; i++) {
        var t = torches[i];
        var tx = (t.x || 0) - camX;
        var ty = (t.y || 0) - camY;
        if (tx < -150 || tx > 950 || ty < -150 || ty > 750) continue;
        var warmGrad = oc.createRadialGradient(tx, ty, 0, tx, ty, 50);
        warmGrad.addColorStop(0, 'rgba(255,200,100,0.06)');
        warmGrad.addColorStop(1, 'rgba(255,200,100,0)');
        oc.fillStyle = warmGrad;
        oc.fillRect(0, 0, 800, 600);
      }
    }

    oc.globalCompositeOperation = 'source-over';

    // Draw colored glow on the main canvas from dynamic lights
    ctx.save();
    for (var i = 0; i < this.lights.length; i++) {
      var l = this.lights[i];
      var lx = l.x - camX;
      var ly = l.y - camY;
      if (lx < -200 || lx > 1000 || ly < -200 || ly > 800) continue;

      var lr = l.radius * 0.6;
      if (l.flicker) lr += Math.random() * 5;

      ctx.globalAlpha = l.intensity * 0.15;
      ctx.globalCompositeOperation = 'lighter';
      this._drawLightCircle(ctx, lx, ly, lr, l.color, l.intensity * 0.3);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    ctx.drawImage(this._offscreenCanvas, 0, 0);
  },

  drawColorGrade: function(ctx, levelIndex) {
    ctx.save();

    var overlay;
    switch (levelIndex) {
      case 0:
        overlay = 'rgba(40,60,100,0.08)';
        break;
      case 1:
        overlay = 'rgba(120,90,40,0.06)';
        break;
      case 2:
        overlay = 'rgba(40,80,60,0.07)';
        break;
      case 3:
        overlay = 'rgba(60,80,120,0.09)';
        break;
      case 4:
        overlay = 'rgba(120,50,20,0.08)';
        break;
      default:
        overlay = 'rgba(0,0,0,0)';
        break;
    }

    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, 800, 600);

    // Subtle vignette per level
    var vigGrad = ctx.createRadialGradient(400, 300, 150, 400, 300, 500);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, 800, 600);

    ctx.restore();
  }
};

// ---------------------------------------------------------------------------
// 4. Screen Effects
// ---------------------------------------------------------------------------
const ScreenFX = {
  shakeIntensity: 0,
  shakeDuration: 0,
  shakeTimer: 0,
  shakeOffsetX: 0,
  shakeOffsetY: 0,
  flashColor: null,
  flashAlpha: 0,
  flashDuration: 0,
  flashTimer: 0,

  shake: function(intensity, duration) {
    if (intensity > this.shakeIntensity) {
      this.shakeIntensity = intensity;
    }
    this.shakeDuration = Math.max(this.shakeDuration, duration);
    this.shakeTimer = 0;
  },

  flash: function(color, duration) {
    this.flashColor = color;
    this.flashAlpha = 1;
    this.flashDuration = duration;
    this.flashTimer = 0;
  },

  update: function(dt) {
    if (this.shakeDuration > 0) {
      this.shakeTimer += dt;
      if (this.shakeTimer >= this.shakeDuration) {
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      } else {
        var progress = this.shakeTimer / this.shakeDuration;
        var currentIntensity = this.shakeIntensity * (1 - progress);
        this.shakeOffsetX = (Math.random() * 2 - 1) * currentIntensity;
        this.shakeOffsetY = (Math.random() * 2 - 1) * currentIntensity;
      }
    }

    if (this.flashAlpha > 0) {
      this.flashTimer += dt;
      var flashProgress = this.flashTimer / this.flashDuration;
      this.flashAlpha = Math.max(0, 1 - flashProgress);
    }
  },

  applyShake: function(ctx) {
    if (this.shakeDuration > 0) {
      ctx.save();
      ctx.translate(Math.round(this.shakeOffsetX), Math.round(this.shakeOffsetY));
    }
  },

  removeShake: function(ctx) {
    if (this.shakeDuration > 0) {
      ctx.restore();
    }
  },

  drawFlash: function(ctx) {
    if (this.flashAlpha > 0 && this.flashColor) {
      ctx.save();
      ctx.globalAlpha = this.flashAlpha * 0.6;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, 800, 600);
      ctx.restore();
    }
  },

  drawDamageVignette: function(ctx, playerHpPercent) {
    if (playerHpPercent >= 0.5) return;

    var intensity = 1 - (playerHpPercent / 0.5);
    intensity = Math.min(1, intensity);

    var pulseIntensity = intensity;
    if (playerHpPercent < 0.2) {
      pulseIntensity *= 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
    }

    ctx.save();

    var grad = ctx.createRadialGradient(400, 300, 150, 400, 300, 450);
    grad.addColorStop(0, 'rgba(150,0,0,0)');
    grad.addColorStop(0.5, 'rgba(150,0,0,0)');
    grad.addColorStop(0.8, 'rgba(150,0,0,' + (pulseIntensity * 0.3) + ')');
    grad.addColorStop(1, 'rgba(100,0,0,' + (pulseIntensity * 0.6) + ')');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Inner glow edge
    var edgeAlpha = pulseIntensity * 0.15;
    ctx.strokeStyle = 'rgba(255,0,0,' + edgeAlpha + ')';
    ctx.lineWidth = 8;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255,0,0,' + (pulseIntensity * 0.3) + ')';
    ctx.strokeRect(4, 4, 792, 592);

    ctx.restore();
  },

  drawBossIntro: function(ctx, progress) {
    ctx.save();

    var barHeight = 60;
    var currentBarHeight = barHeight * Math.min(1, progress * 2);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 800, currentBarHeight);
    ctx.fillRect(0, 600 - currentBarHeight, 800, currentBarHeight);

    if (progress > 0.3 && progress < 0.8) {
      var zoomProgress = (progress - 0.3) / 0.5;
      var zoomAmount = Math.sin(zoomProgress * Math.PI) * 0.03;

      ctx.translate(400, 300);
      ctx.scale(1 + zoomAmount, 1 + zoomAmount);
      ctx.translate(-400, -300);
    }

    if (progress > 0.5) {
      var vignetteProgress = (progress - 0.5) / 0.5;
      var vigAlpha = vignetteProgress * 0.4;
      var grad = ctx.createRadialGradient(400, 300, 100, 400, 300, 500);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,' + vigAlpha + ')');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);
    }

    if (progress > 0.2 && progress < 0.9) {
      var glowP = (progress - 0.2) / 0.7;
      var glowAlpha = Math.sin(glowP * Math.PI) * 0.08;
      ctx.fillStyle = 'rgba(255,50,50,' + glowAlpha + ')';
      ctx.fillRect(0, 0, 800, 600);
    }

    ctx.restore();
  }
};

// ---------------------------------------------------------------------------
// 5. Shadow Renderer
// ---------------------------------------------------------------------------
const Shadows = {
  drawEntityShadow: function(ctx, entity) {
    if (!entity) return;

    var ex = entity.x || 0;
    var ey = entity.y || 0;
    var ew = entity.width || 16;
    var eh = entity.height || 16;

    var centerX = ex + ew * 0.5;
    var bottomY = ey + eh;

    var shadowWidth = ew * 0.45;
    var shadowHeight = ew * 0.18;

    // Slight offset for pseudo-light direction (top-left light)
    var offsetX = 2;
    var offsetY = 2;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';

    ctx.beginPath();
    ctx.ellipse(
      centerX + offsetX,
      bottomY + offsetY,
      Math.max(2, shadowWidth),
      Math.max(1, shadowHeight),
      0, 0, Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }
};

// ---------------------------------------------------------------------------
// 6. Ambient Particle Manager
// ---------------------------------------------------------------------------
const AmbientParticles = {
  particles: [],
  timer: 0,
  levelIndex: 0,
  spawnInterval: 0.05,

  init: function(levelIndex) {
    this.levelIndex = levelIndex;
    this.timer = 0;

    switch (levelIndex) {
      case 0: this.spawnInterval = 0.12; break; // Crypt - moderate dust
      case 1: this.spawnInterval = 0.10; break; // Stronghold - embers and dust
      case 2: this.spawnInterval = 0.08; break; // Forest - fireflies, fog
      case 3: this.spawnInterval = 0.06; break; // Ice - snowflakes
      case 4: this.spawnInterval = 0.04; break; // Volcano - heavy particles
      default: this.spawnInterval = 0.10; break;
    }
  },

  update: function(dt, camera) {
    this.timer += dt;

    var camX = camera ? camera.x : 0;
    var camY = camera ? camera.y : 0;
    var viewLeft = camX - 50;
    var viewRight = camX + 850;
    var viewTop = camY - 50;
    var viewBottom = camY + 650;

    if (this.timer >= this.spawnInterval) {
      this.timer -= this.spawnInterval;

      var rx = _rand(viewLeft, viewRight);
      var ry = _rand(viewTop, viewBottom);

      switch (this.levelIndex) {
        case 0: // Crypt: floating dust motes, occasional cobweb wisps
          if (Math.random() < 0.7) {
            ParticleFactory.dustMotes(rx, ry);
          } else {
            // Cobweb wisps - slow, pale, wispy
            var col = _randFrom(['#888888', '#999999', '#aaaaaa']);
            ParticlePool.emit(
              rx, ry,
              _rand(-3, 3), _rand(-3, 3),
              _rand(3, 6),
              col, _rand(0.5, 1.5), 'dust',
              { friction: 0.998, oscillateX: _rand(0.5, 2), alphaDecay: 0.3, alpha: 0.25 }
            );
          }
          break;

        case 1: // Stronghold: torch embers, dust
          if (Math.random() < 0.5) {
            ParticleFactory.embers(rx, ry);
          } else {
            ParticleFactory.dustMotes(rx, ry);
          }
          break;

        case 2: // Forest: fireflies, fog wisps, floating spores
          var roll = Math.random();
          if (roll < 0.35) {
            ParticleFactory.fireflies(viewLeft, viewTop, 900, 700);
          } else if (roll < 0.6) {
            ParticleFactory.fogWisps(rx, ry);
          } else {
            // Floating spores
            var col = _randFrom(['#bbdd66', '#aacc55', '#ccee77', '#99bb44']);
            ParticlePool.emit(
              rx, ry,
              _rand(-5, 5), _rand(-15, -3),
              _rand(3, 7),
              col, _rand(0.8, 1.8), 'circle',
              { gravity: -3, friction: 0.998, oscillateX: _rand(1, 4), alphaDecay: 0.3, glow: 4, alpha: _rand(0.4, 0.7) }
            );
          }
          break;

        case 3: // Ice: snowflakes, ice crystal shimmer
          if (Math.random() < 0.7) {
            ParticleFactory.snowflakes(viewLeft, viewTop, 900);
          } else {
            ParticleFactory.iceCrystals(rx, ry);
          }
          break;

        case 4: // Volcano: heavy embers, ash, heat distortion, lava bubbles
          var roll = Math.random();
          if (roll < 0.3) {
            ParticleFactory.embers(rx, ry);
          } else if (roll < 0.55) {
            // Ash particles
            var col = _randFrom(['#555555', '#666666', '#444444', '#777777']);
            ParticlePool.emit(
              rx, _rand(viewTop, viewTop + 100),
              _rand(-8, 8), _rand(15, 40),
              _rand(3, 7),
              col, _rand(1, 3), 'dust',
              { gravity: 8, friction: 0.995, oscillateX: _rand(1, 4), alphaDecay: 0.3, alpha: _rand(0.3, 0.6) }
            );
          } else if (roll < 0.75) {
            // Heat distortion shimmer
            ParticlePool.emit(
              rx, ry,
              _rand(-3, 3), _rand(-20, -8),
              _rand(1, 3),
              '#ffaa44', _rand(8, 20), 'smoke',
              { gravity: -15, friction: 0.99, alphaDecay: 0.5, alpha: 0.05, endSize: 25 }
            );
          } else {
            ParticleFactory.lavaBubbles(rx, ry);
          }
          break;
      }
    }

    ParticlePool.updateAll(dt);
  },

  draw: function(ctx, camera) {
    ParticlePool.drawAll(ctx, camera);
  }
};
