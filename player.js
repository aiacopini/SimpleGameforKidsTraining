// === PLAYER CHARACTER ===

// ---------------------------------------------------------------------------
// Projectile: Ki Blast  (Yellow energy ball, 8×8)
// ---------------------------------------------------------------------------
class KiBlast {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;          // 1 = right, -1 = left
    this.w = 8;
    this.h = 8;
    this.speed = 8;
    this.damage = 10;
    this.alive = true;
    this.age = 0;
    this.trailTimer = 0;
  }

  update(dt) {
    this.x += this.speed * this.dir * dt * 60;
    this.age += dt;
    this.trailTimer += dt;

    // Spawn trail particles every ~0.03s
    if (this.trailTimer >= 0.03) {
      this.trailTimer = 0;
      spawnParticles(
        this.x - this.dir * 4, this.y,
        3,                                       // count
        { r: 255, g: 255, b: 100 },             // color
        1.5,                                     // size
        0.6,                                     // speed
        0.25,                                    // life
        true                                     // randomDir
      );
    }

    // Remove when off-screen (generous margin for camera)
    if (this.x < camera.x - 60 || this.x > camera.x + CANVAS_W + 60 ||
        this.y < -60 || this.y > CANVAS_H + 60) {
      this.alive = false;
    }
  }

  draw(ctx) {
    const sx = this.x - camera.x;
    const sy = this.y;

    // Outer glow
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();

    // Mid glow
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ffee44';
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffcc';
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Projectile: Kamehameha Beam
// ---------------------------------------------------------------------------
class KamehamehaBeam {
  constructor(x, y) {
    this.x = x;                 // origin x (Goku's hands)
    this.y = y;                 // origin y
    this.width = 4;             // current beam width (grows)
    this.maxWidth = 24;
    this.growTime = 0.5;        // seconds to reach max width
    this.duration = 1.5;        // total lifespan in seconds
    this.age = 0;
    this.damage = 2;            // per frame (continuous)
    this.alive = true;
    this.particleTimer = 0;
  }

  update(dt) {
    this.age += dt;

    // Grow beam width
    if (this.age < this.growTime) {
      this.width = 4 + (this.maxWidth - 4) * (this.age / this.growTime);
    } else {
      this.width = this.maxWidth;
    }

    // Expire after duration
    if (this.age >= this.duration) {
      this.alive = false;
    }

    // Edge particles
    this.particleTimer += dt;
    if (this.particleTimer >= 0.04) {
      this.particleTimer = 0;
      const beamLen = CANVAS_W + camera.x - this.x;
      const rx = this.x + Math.random() * beamLen;
      const ry = this.y + (Math.random() - 0.5) * this.width;
      spawnParticles(
        rx, ry,
        1,
        { r: 100, g: 180, b: 255 },
        2,
        0.8,
        0.3,
        true
      );
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    const sx = this.x - camera.x;
    const sy = this.y;
    const beamLen = CANVAS_W - sx + 20;

    ctx.save();

    // Fade out near end of life
    const fadeStart = this.duration - 0.3;
    if (this.age > fadeStart) {
      ctx.globalAlpha = Math.max(0, 1 - (this.age - fadeStart) / 0.3);
    }

    // Outer glow
    ctx.fillStyle = 'rgba(80, 160, 255, 0.25)';
    ctx.fillRect(sx, sy - this.width * 0.75, beamLen, this.width * 1.5);

    // Main beam (blue)
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(sx, sy - this.width / 2, beamLen, this.width);

    // Inner beam (lighter blue)
    ctx.fillStyle = '#88bbff';
    const innerW = this.width * 0.5;
    ctx.fillRect(sx, sy - innerW / 2, beamLen, innerW);

    // White core
    ctx.fillStyle = '#ffffff';
    const coreW = this.width * 0.2;
    ctx.fillRect(sx, sy - coreW / 2, beamLen, coreW);

    // Origin flare (circle at hand position)
    const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.width);
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.4, 'rgba(100,180,255,0.5)');
    gradient.addColorStop(1, 'rgba(50,100,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sx, sy, this.width, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x,
      y: this.y - this.width / 2,
      w: CANVAS_W + camera.x - this.x,
      h: this.width
    };
  }
}

// ---------------------------------------------------------------------------
// Projectile: Spirit Bomb
// ---------------------------------------------------------------------------
class SpiritBomb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 16;           // starting radius
    this.maxRadius = 80;
    this.growDuration = 2.0;    // seconds to reach max size
    this.age = 0;
    this.damage = 100;
    this.alive = true;
    this.launched = false;
    this.speed = 2.5;           // slow forward after launch
    this.swirlAngle = 0;
    this.particleTimer = 0;
    this.hitTargets = new Set(); // prevent multi-hit on same enemy
  }

  update(dt) {
    this.age += dt;
    this.swirlAngle += dt * 4;

    // Growth phase
    if (!this.launched) {
      if (this.age < this.growDuration) {
        this.radius = 16 + (this.maxRadius - 16) * (this.age / this.growDuration);
      } else {
        this.radius = this.maxRadius;
        this.launched = true;
      }
    }

    // Move forward after launch
    if (this.launched) {
      this.x += this.speed * dt * 60;
    }

    // Swirling energy-gather particles
    this.particleTimer += dt;
    if (this.particleTimer >= 0.05) {
      this.particleTimer = 0;
      const angle = Math.random() * Math.PI * 2;
      const dist = this.radius + 20 + Math.random() * 40;
      const px = this.x + Math.cos(angle) * dist;
      const py = this.y + Math.sin(angle) * dist;
      spawnParticles(
        px, py,
        1,
        Math.random() > 0.5 ? { r: 200, g: 220, b: 255 } : { r: 255, g: 255, b: 255 },
        2.5,
        1.2,
        0.5,
        true
      );
    }

    // Remove when off-screen
    if (this.x - this.radius > camera.x + CANVAS_W + 100) {
      this.alive = false;
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    const sx = this.x - camera.x;
    const sy = this.y;

    ctx.save();

    // Massive outer glow
    const outerGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.radius * 1.8);
    outerGrad.addColorStop(0, 'rgba(200, 220, 255, 0.15)');
    outerGrad.addColorStop(0.5, 'rgba(100, 150, 255, 0.08)');
    outerGrad.addColorStop(1, 'rgba(50, 80, 255, 0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Swirling bands (rotating arcs)
    for (let i = 0; i < 4; i++) {
      const a = this.swirlAngle + (Math.PI / 2) * i;
      ctx.strokeStyle = `rgba(150, 200, 255, ${0.3 + 0.1 * Math.sin(this.age * 6 + i)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, this.radius * 0.7, a, a + Math.PI * 0.6);
      ctx.stroke();
    }

    // Main sphere gradient
    const mainGrad = ctx.createRadialGradient(sx - this.radius * 0.2, sy - this.radius * 0.2, 0, sx, sy, this.radius);
    mainGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    mainGrad.addColorStop(0.3, 'rgba(200, 230, 255, 0.85)');
    mainGrad.addColorStop(0.7, 'rgba(100, 160, 255, 0.6)');
    mainGrad.addColorStop(1, 'rgba(60, 100, 255, 0.3)');
    ctx.fillStyle = mainGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Bright white core
    const coreGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.radius * 0.35);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2
    };
  }

  explode() {
    // Huge explosion effect
    spawnParticles(this.x, this.y, 60, { r: 255, g: 255, b: 255 }, 6, 5, 1.0, true);
    spawnParticles(this.x, this.y, 40, { r: 100, g: 180, b: 255 }, 5, 4, 0.8, true);
    spawnParticles(this.x, this.y, 30, { r: 200, g: 220, b: 255 }, 4, 3, 0.6, true);
    shakeScreen(20, 0.6);
    playSound('spiritBombHit');
    this.alive = false;
  }
}

// ---------------------------------------------------------------------------
// Goku Player Class
// ---------------------------------------------------------------------------
class Player {
  constructor() {
    // Position & physics
    this.x = 120;
    this.y = CANVAS_H / 2;
    this.vx = 0;
    this.vy = 0;
    this.w = 32;             // Goku sprite width
    this.h = 40;             // Goku sprite height
    this.cloudW = 40;        // nimbus cloud width
    this.cloudH = 16;        // nimbus cloud height
    this.moveSpeed = 4;      // pixels per frame at 60fps

    // Stats
    this.hp = 100;
    this.maxHP = 100;
    this.ki = 0;
    this.maxKi = 100;
    this.kiRegenRate = 5;    // per second
    this.lives = 3;
    this.score = 0;

    // State management
    this.state = 'idle';     // idle, moving, attacking, charging, hit, dead
    this.facing = 1;         // 1 = right, -1 = left

    // Projectiles owned by player
    this.projectiles = [];

    // Attack cooldowns (in seconds)
    this.kiBlastCooldown = 0;
    this.kiBlastCooldownMax = 0.3;
    this.meleeCooldown = 0;
    this.meleeCooldownMax = 0.4;

    // Melee hitbox
    this.meleeActive = false;
    this.meleeTimer = 0;
    this.meleeDuration = 0.15;
    this.meleeDamage = 15;

    // Kamehameha charging
    this.chargingKame = false;
    this.kameChargeTime = 0;
    this.kameMinCharge = 0.5;
    this.kameKiCost = 30;
    this.kameFiring = false;

    // Spirit bomb
    this.spiritBombKiCost = 100;

    // Invincibility
    this.invincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 1.5;
    this.flashToggle = false;
    this.flashTimer = 0;

    // Hit stun
    this.hitStunTimer = 0;
    this.hitStunDuration = 0.3;

    // Cloud bobbing
    this.bobTime = 0;
    this.bobAmplitude = 3;
    this.bobSpeed = 3;

    // Aura particles
    this.auraTimer = 0;

    // Animation timers
    this.animTimer = 0;
    this.attackAnimTimer = 0;
    this.attackAnimDuration = 0.2;

    // Dead state
    this.dead = false;
    this.deathTimer = 0;
    this.deathDuration = 1.5;
  }

  update(dt) {
    if (this.dead) {
      this.deathTimer += dt;
      if (this.deathTimer >= this.deathDuration) {
        if (this.lives > 0) {
          this.respawn();
        }
        // else game over is handled externally
      }
      return;
    }

    this.animTimer += dt;

    // ----- Hit stun -----
    if (this.hitStunTimer > 0) {
      this.hitStunTimer -= dt;
      this.state = 'hit';
      // Still decrement invincibility
      this.updateInvincibility(dt);
      return;
    }

    // ----- Invincibility timer -----
    this.updateInvincibility(dt);

    // ----- Ki regeneration -----
    this.ki = Math.min(this.maxKi, this.ki + this.kiRegenRate * dt);

    // ----- Cooldown timers -----
    if (this.kiBlastCooldown > 0) this.kiBlastCooldown -= dt;
    if (this.meleeCooldown > 0) this.meleeCooldown -= dt;

    // ----- Melee hitbox timer -----
    if (this.meleeActive) {
      this.meleeTimer -= dt;
      if (this.meleeTimer <= 0) {
        this.meleeActive = false;
      }
    }

    // ----- Attack animation timer -----
    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= dt;
    }

    // ----- Kamehameha charge -----
    if (this.chargingKame) {
      this.kameChargeTime += dt;
      this.state = 'charging';

      // Release or key up triggers firing
      if (!keys.c && !keys.KeyC) {
        if (this.kameChargeTime >= this.kameMinCharge && this.ki >= this.kameKiCost) {
          this.fireKamehameha();
        }
        this.chargingKame = false;
        this.kameChargeTime = 0;
      }
    }

    // ----- Movement -----
    let mx = 0;
    let my = 0;
    if (!this.chargingKame && !this.kameFiring) {
      if (keys.ArrowLeft || keys.left)  { mx = -1; this.facing = -1; }
      if (keys.ArrowRight || keys.right) { mx = 1;  this.facing = 1; }
      if (keys.ArrowUp || keys.up)    my = -1;
      if (keys.ArrowDown || keys.down)  my = 1;

      // Normalize diagonal movement
      if (mx !== 0 && my !== 0) {
        const inv = 1 / Math.SQRT2;
        mx *= inv;
        my *= inv;
      }
    }

    this.vx = mx * this.moveSpeed;
    this.vy = my * this.moveSpeed;

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    // Bound to screen (relative to camera)
    const leftBound = camera.x + 16;
    const rightBound = camera.x + CANVAS_W - 16 - this.w;
    const topBound = 16;
    const bottomBound = CANVAS_H - 16 - this.h - this.cloudH;

    if (this.x < leftBound) this.x = leftBound;
    if (this.x > rightBound) this.x = rightBound;
    if (this.y < topBound) this.y = topBound;
    if (this.y > bottomBound) this.y = bottomBound;

    // ----- Determine state for drawing -----
    if (this.kameFiring) {
      this.state = 'firing';
    } else if (this.chargingKame) {
      this.state = 'charging';
    } else if (this.attackAnimTimer > 0) {
      // Keep attack state from last attack
    } else if (mx !== 0 || my !== 0) {
      this.state = 'moving';
    } else {
      this.state = 'idle';
    }

    // ----- Attacks -----
    // Z: Ki Blast
    if ((keys.z || keys.KeyZ) && !this.chargingKame && !this.kameFiring) {
      if (this.kiBlastCooldown <= 0 && this.ki >= 5) {
        this.fireKiBlast();
      }
    }

    // X: Melee
    if ((keys.x || keys.KeyX) && !this.chargingKame && !this.kameFiring) {
      if (this.meleeCooldown <= 0) {
        this.doMelee();
      }
    }

    // C: Kamehameha charge (start)
    if ((keys.c || keys.KeyC) && !this.chargingKame && !this.kameFiring) {
      if (this.ki >= this.kameKiCost) {
        this.chargingKame = true;
        this.kameChargeTime = 0;
        playSound('kameCharge');
      }
    }

    // V: Spirit Bomb
    if ((keys.v || keys.KeyV) && !this.chargingKame && !this.kameFiring) {
      if (this.ki >= this.spiritBombKiCost) {
        this.fireSpiritBomb();
      }
    }

    // ----- Cloud bobbing -----
    this.bobTime += dt * this.bobSpeed;

    // ----- Update projectiles -----
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.projectiles[i].update(dt);
      if (!this.projectiles[i].alive) {
        this.projectiles.splice(i, 1);
      }
    }

    // ----- Kamehameha firing state cleanup -----
    if (this.kameFiring) {
      let anyBeamAlive = false;
      for (const p of this.projectiles) {
        if (p instanceof KamehamehaBeam && p.alive) {
          anyBeamAlive = true;
          break;
        }
      }
      if (!anyBeamAlive) {
        this.kameFiring = false;
      }
    }

    // ----- Aura effect when Ki > 80 -----
    if (this.ki > 80) {
      this.auraTimer += dt;
      if (this.auraTimer >= 0.06) {
        this.auraTimer = 0;
        const ax = this.x + this.w / 2 + (Math.random() - 0.5) * this.w;
        const ay = this.y + this.h + (Math.random() - 0.5) * 10;
        spawnParticles(
          ax, ay,
          1,
          { r: 255, g: 220, b: 50 },
          2.5,
          1.5,
          0.4,
          false  // upward
        );
      }
    }

    // ----- Cloud trail particles when moving -----
    if (this.state === 'moving') {
      if (Math.random() < 0.3) {
        const cx = this.x + this.w / 2 - this.facing * 20;
        const cy = this.y + this.h + this.cloudH / 2 + Math.sin(this.bobTime) * this.bobAmplitude;
        spawnParticles(
          cx, cy,
          1,
          { r: 255, g: 230, b: 120 },
          3,
          0.5,
          0.5,
          true
        );
      }
    }
  }

  updateInvincibility(dt) {
    if (this.invincible) {
      this.invincibleTimer -= dt;
      this.flashTimer += dt;
      if (this.flashTimer >= 0.08) {
        this.flashTimer = 0;
        this.flashToggle = !this.flashToggle;
      }
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
        this.flashToggle = false;
      }
    }
  }

  fireKiBlast() {
    this.ki -= 5;
    this.kiBlastCooldown = this.kiBlastCooldownMax;
    const bx = this.x + this.w / 2 + this.facing * 20;
    const by = this.y + this.h / 2;
    this.projectiles.push(new KiBlast(bx, by, this.facing));
    this.state = 'kiBlast';
    this.attackAnimTimer = this.attackAnimDuration;
    playSound('kiBlast');
  }

  doMelee() {
    this.meleeCooldown = this.meleeCooldownMax;
    this.meleeActive = true;
    this.meleeTimer = this.meleeDuration;
    this.state = 'melee';
    this.attackAnimTimer = this.attackAnimDuration;
    playSound('melee');
  }

  fireKamehameha() {
    this.ki -= this.kameKiCost;
    const bx = this.x + this.w / 2 + this.facing * 22;
    const by = this.y + this.h / 2;
    this.projectiles.push(new KamehamehaBeam(bx, by));
    this.kameFiring = true;
    this.state = 'firing';
    shakeScreen(6, 0.3);
    playSound('kamehameha');
  }

  fireSpiritBomb() {
    this.ki -= this.spiritBombKiCost;
    const bx = this.x + this.w / 2;
    const by = this.y - 30;
    this.projectiles.push(new SpiritBomb(bx, by));
    this.state = 'spiritBomb';
    this.attackAnimTimer = 2.2;     // long pose while spirit bomb charges
    shakeScreen(4, 1.0);
    playSound('spiritBomb');
  }

  getMeleeHitbox() {
    if (!this.meleeActive) return null;
    const mx = this.facing === 1 ? this.x + this.w : this.x - 24;
    return {
      x: mx,
      y: this.y + 4,
      w: 24,
      h: this.h - 8
    };
  }

  takeDamage(amount) {
    if (this.invincible || this.dead) return;

    this.hp -= amount;
    this.invincible = true;
    this.invincibleTimer = this.invincibleDuration;
    this.flashTimer = 0;
    this.flashToggle = false;
    this.hitStunTimer = this.hitStunDuration;
    this.state = 'hit';

    // Cancel charging
    this.chargingKame = false;
    this.kameChargeTime = 0;

    shakeScreen(8, 0.25);
    playSound('playerHit');

    // Hit particles
    spawnParticles(
      this.x + this.w / 2, this.y + this.h / 2,
      8,
      { r: 255, g: 100, b: 100 },
      2,
      2,
      0.4,
      true
    );

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  die() {
    this.dead = true;
    this.deathTimer = 0;
    this.lives--;
    this.state = 'dead';

    // Big death explosion
    spawnParticles(
      this.x + this.w / 2, this.y + this.h / 2,
      30,
      { r: 255, g: 200, b: 50 },
      4,
      4,
      0.8,
      true
    );
    shakeScreen(12, 0.5);
    playSound('playerDeath');
  }

  respawn() {
    this.dead = false;
    this.hp = this.maxHP;
    this.ki = 0;
    this.x = camera.x + 120;
    this.y = CANVAS_H / 2;
    this.state = 'idle';
    this.invincible = true;
    this.invincibleTimer = 2.0;   // longer invincibility after respawn
    this.hitStunTimer = 0;
    this.chargingKame = false;
    this.kameFiring = false;
    this.kameChargeTime = 0;
    this.meleeActive = false;
    this.projectiles = [];
  }

  getHitbox() {
    return {
      x: this.x + 4,
      y: this.y + 4,
      w: this.w - 8,
      h: this.h + this.cloudH - 8
    };
  }

  draw(ctx) {
    if (this.dead) {
      // Draw fading Goku briefly
      if (this.deathTimer < 0.5) {
        ctx.save();
        ctx.globalAlpha = 1 - this.deathTimer / 0.5;
        this.drawFull(ctx);
        ctx.restore();
      }
      return;
    }

    // Invincibility flashing - skip drawing every other flash frame
    if (this.invincible && this.flashToggle) return;

    this.drawFull(ctx);
  }

  drawFull(ctx) {
    const sx = this.x - camera.x;
    const bobOffset = Math.sin(this.bobTime) * this.bobAmplitude;
    const cloudY = this.y + this.h + bobOffset;
    const gokuY = this.y + bobOffset;

    // ----- Aura glow when ki > 80 -----
    if (this.ki > 80 && !this.dead) {
      ctx.save();
      const auraIntensity = (this.ki - 80) / 20; // 0 to 1
      const aGrad = ctx.createRadialGradient(
        sx + this.w / 2, gokuY + this.h / 2, 5,
        sx + this.w / 2, gokuY + this.h / 2, 50
      );
      aGrad.addColorStop(0, `rgba(255, 220, 50, ${0.25 * auraIntensity})`);
      aGrad.addColorStop(0.5, `rgba(255, 200, 0, ${0.12 * auraIntensity})`);
      aGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.arc(sx + this.w / 2, gokuY + this.h / 2, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ----- Kamehameha charge glow -----
    if (this.chargingKame) {
      ctx.save();
      const intensity = Math.min(1, this.kameChargeTime / this.kameMinCharge);
      const glowR = 8 + intensity * 14;
      const handX = sx + this.w / 2 - this.facing * 8;
      const handY = gokuY + this.h / 2 + 2;
      const kGrad = ctx.createRadialGradient(handX, handY, 0, handX, handY, glowR);
      kGrad.addColorStop(0, `rgba(150, 200, 255, ${0.9 * intensity})`);
      kGrad.addColorStop(0.5, `rgba(80, 140, 255, ${0.5 * intensity})`);
      kGrad.addColorStop(1, 'rgba(40, 80, 255, 0)');
      ctx.fillStyle = kGrad;
      ctx.beginPath();
      ctx.arc(handX, handY, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw sprite based on state
    this.drawSprite(ctx, sx, gokuY, this.state);

    // Draw Nimbus Cloud
    this.drawCloud(ctx, sx + this.w / 2, cloudY);

    // Draw melee hitbox effect
    if (this.meleeActive) {
      const mhb = this.getMeleeHitbox();
      if (mhb) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ffffff';
        // Swoosh arc effect
        const arcX = mhb.x - camera.x + mhb.w / 2;
        const arcY = mhb.y + mhb.h / 2;
        ctx.beginPath();
        if (this.facing === 1) {
          ctx.arc(arcX - 12, arcY, 18, -Math.PI * 0.4, Math.PI * 0.4);
        } else {
          ctx.arc(arcX + 12, arcY, 18, Math.PI * 0.6, Math.PI * 1.4);
        }
        ctx.stroke();
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw projectiles
    for (const p of this.projectiles) {
      p.draw(ctx);
    }
  }

  drawCloud(ctx, cx, cy) {
    // Nimbus Cloud: golden-yellow fluffy cloud made of overlapping circles
    ctx.save();

    const stretch = this.state === 'moving' ? 1.15 : 1.0;
    const squash = this.state === 'moving' ? 0.85 : 1.0;

    // Shadow underneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 22 * stretch, 5 * squash, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cloud base color
    const cloudColor = '#FFD54F';       // golden yellow
    const cloudLight = '#FFECB3';       // lighter highlight
    const cloudDark = '#FFC107';        // darker shadow

    // Bottom cloud puffs (darker)
    ctx.fillStyle = cloudDark;
    ctx.beginPath();
    ctx.ellipse(cx - 10 * stretch, cy + 3, 12 * stretch, 7 * squash, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 10 * stretch, cy + 3, 12 * stretch, 7 * squash, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main cloud body (middle)
    ctx.fillStyle = cloudColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18 * stretch, 9 * squash, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left puff
    ctx.beginPath();
    ctx.ellipse(cx - 14 * stretch, cy - 1, 10 * stretch, 8 * squash, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right puff
    ctx.beginPath();
    ctx.ellipse(cx + 14 * stretch, cy - 1, 10 * stretch, 8 * squash, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top highlights (lighter)
    ctx.fillStyle = cloudLight;
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 4 * squash, 10 * stretch, 5 * squash, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx + 8 * stretch, cy - 3 * squash, 7 * stretch, 4 * squash, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tiny bright spot (specular)
    ctx.fillStyle = '#FFF9C4';
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy - 5 * squash, 4 * stretch, 2 * squash, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawSprite(ctx, x, y, state) {
    // Goku drawn programmatically with canvas primitives
    // x, y = top-left of Goku sprite (32x40)
    ctx.save();

    const centerX = x + this.w / 2;
    const f = this.facing;   // 1 = right, -1 = left

    // Color palette
    const SKIN = '#FFCC80';       // skin tone
    const SKIN_DARK = '#FFB74D';  // skin shadow
    const GI_ORANGE = '#FF6D00';  // gi top/bottom
    const GI_DARK = '#E65100';    // gi shadow
    const BELT_BLUE = '#1565C0';  // belt / wristbands
    const HAIR_BLACK = '#1A1A1A'; // hair
    const BOOT_BLUE = '#0D47A1';  // boots
    const WHITE = '#FFFFFF';       // eyes / highlights
    const EYE_BLACK = '#000000';

    // ----- Positions reference -----
    // Head center
    const headX = centerX;
    const headY = y + 10;
    const headR = 8;

    // Body
    const bodyTop = y + 18;
    const bodyW = 14;
    const bodyH = 12;

    // Legs
    const legTop = bodyTop + bodyH;
    const legW = 6;
    const legH = 10;

    // ----- DRAW LEGS (behind body) -----
    // Left leg
    ctx.fillStyle = GI_ORANGE;
    ctx.fillRect(centerX - 7, legTop, legW, legH);
    // Right leg
    ctx.fillRect(centerX + 1, legTop, legW, legH);

    // Boots
    ctx.fillStyle = BOOT_BLUE;
    ctx.fillRect(centerX - 8, legTop + legH - 4, legW + 1, 4);
    ctx.fillRect(centerX + 1, legTop + legH - 4, legW + 1, 4);

    // ----- DRAW BODY / TORSO -----
    ctx.fillStyle = GI_ORANGE;
    ctx.fillRect(centerX - bodyW / 2, bodyTop, bodyW, bodyH);

    // Gi shadow (left side fold)
    ctx.fillStyle = GI_DARK;
    ctx.fillRect(centerX - bodyW / 2, bodyTop, 3, bodyH);

    // Belt / sash
    ctx.fillStyle = BELT_BLUE;
    ctx.fillRect(centerX - bodyW / 2 - 1, bodyTop + bodyH - 3, bodyW + 2, 3);

    // Gi collar V-neck detail
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.moveTo(centerX - 3, bodyTop);
    ctx.lineTo(centerX, bodyTop + 5);
    ctx.lineTo(centerX + 3, bodyTop);
    ctx.closePath();
    ctx.fill();

    // ----- DRAW ARMS (depends on state) -----
    this.drawArms(ctx, centerX, bodyTop, f, state);

    // ----- DRAW HEAD -----
    // Skin
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Skin shadow (lower half accent)
    ctx.fillStyle = SKIN_DARK;
    ctx.beginPath();
    ctx.arc(headX, headY + 1, headR, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.fill();

    // Eyes
    const eyeOffX = f * 2;
    // Left eye
    ctx.fillStyle = WHITE;
    ctx.fillRect(headX + eyeOffX - 4, headY - 2, 3, 3);
    ctx.fillStyle = EYE_BLACK;
    ctx.fillRect(headX + eyeOffX - 3 + (f > 0 ? 1 : 0), headY - 1, 1.5, 2);

    // Right eye
    ctx.fillStyle = WHITE;
    ctx.fillRect(headX + eyeOffX + 1, headY - 2, 3, 3);
    ctx.fillStyle = EYE_BLACK;
    ctx.fillRect(headX + eyeOffX + 2 + (f > 0 ? 1 : 0), headY - 1, 1.5, 2);

    // Mouth (small line)
    if (state === 'charging' || state === 'firing' || state === 'spiritBomb') {
      // Open mouth (yelling)
      ctx.fillStyle = '#D84315';
      ctx.fillRect(headX + eyeOffX - 2, headY + 4, 4, 2);
    } else if (state === 'hit') {
      // Grimace
      ctx.strokeStyle = SKIN_DARK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX + eyeOffX - 2, headY + 5);
      ctx.lineTo(headX + eyeOffX + 2, headY + 4);
      ctx.stroke();
    } else {
      // Neutral / slight smile
      ctx.strokeStyle = SKIN_DARK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX + eyeOffX - 1, headY + 4);
      ctx.quadraticCurveTo(headX + eyeOffX + 1, headY + 6, headX + eyeOffX + 3, headY + 4);
      ctx.stroke();
    }

    // ----- DRAW HAIR (spiky black hair - essential Goku look!) -----
    ctx.fillStyle = HAIR_BLACK;

    // Hair base (covers top of head)
    ctx.beginPath();
    ctx.arc(headX, headY - 1, headR + 1, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Spiky hair - multiple triangular spikes pointing up and to the right
    // Main center spike (tallest)
    ctx.beginPath();
    ctx.moveTo(headX - 2, headY - headR + 1);
    ctx.lineTo(headX + 1, headY - headR - 12);
    ctx.lineTo(headX + 4, headY - headR + 2);
    ctx.closePath();
    ctx.fill();

    // Right spike (pointing up-right)
    ctx.beginPath();
    ctx.moveTo(headX + 3, headY - headR + 1);
    ctx.lineTo(headX + 8, headY - headR - 9);
    ctx.lineTo(headX + 7, headY - headR + 3);
    ctx.closePath();
    ctx.fill();

    // Far right spike (more to the right)
    ctx.beginPath();
    ctx.moveTo(headX + 6, headY - headR + 3);
    ctx.lineTo(headX + 13, headY - headR - 5);
    ctx.lineTo(headX + 9, headY - headR + 5);
    ctx.closePath();
    ctx.fill();

    // Left spike
    ctx.beginPath();
    ctx.moveTo(headX - 5, headY - headR + 2);
    ctx.lineTo(headX - 4, headY - headR - 8);
    ctx.lineTo(headX - 1, headY - headR + 1);
    ctx.closePath();
    ctx.fill();

    // Far left spike (smaller)
    ctx.beginPath();
    ctx.moveTo(headX - 8, headY - headR + 4);
    ctx.lineTo(headX - 9, headY - headR - 3);
    ctx.lineTo(headX - 4, headY - headR + 2);
    ctx.closePath();
    ctx.fill();

    // Side hair (covers ears area on the side Goku faces away from)
    ctx.beginPath();
    ctx.moveTo(headX - f * 7, headY - 3);
    ctx.lineTo(headX - f * 10, headY - 6);
    ctx.lineTo(headX - f * 9, headY + 1);
    ctx.closePath();
    ctx.fill();

    // Forehead bang spikes (small, pointing forward-down)
    ctx.beginPath();
    ctx.moveTo(headX + f * 3, headY - headR + 2);
    ctx.lineTo(headX + f * 6, headY - 4);
    ctx.lineTo(headX + f * 1, headY - 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(headX + f * 1, headY - headR + 1);
    ctx.lineTo(headX + f * 3, headY - 2);
    ctx.lineTo(headX - f * 1, headY - 3);
    ctx.closePath();
    ctx.fill();

    // ----- HEADBAND (optional red headband detail for Goku look) -----
    // Actually Goku doesn't wear a headband in base form - skip this

    // ----- WRISTBANDS -----
    // Drawn in drawArms based on state

    ctx.restore();
  }

  drawArms(ctx, centerX, bodyTop, f, state) {
    const SKIN = '#FFCC80';
    const GI_ORANGE = '#FF6D00';
    const BELT_BLUE = '#1565C0';
    const SKIN_DARK = '#FFB74D';
    const armW = 5;
    const armH = 10;

    switch (state) {
      case 'idle':
      default:
        // Arms at sides, slightly angled
        // Left arm
        ctx.fillStyle = GI_ORANGE;
        ctx.fillRect(centerX - 10, bodyTop + 2, armW, armH);
        ctx.fillStyle = SKIN;
        ctx.fillRect(centerX - 10, bodyTop + armH, armW, 4);
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(centerX - 10, bodyTop + armH - 1, armW, 2);

        // Right arm
        ctx.fillStyle = GI_ORANGE;
        ctx.fillRect(centerX + 5, bodyTop + 2, armW, armH);
        ctx.fillStyle = SKIN;
        ctx.fillRect(centerX + 5, bodyTop + armH, armW, 4);
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(centerX + 5, bodyTop + armH - 1, armW, 2);
        break;

      case 'moving':
        // Arms slightly back, showing motion
        // Back arm
        ctx.save();
        ctx.fillStyle = GI_ORANGE;
        ctx.fillRect(centerX - f * 9, bodyTop + 3, armW, armH - 1);
        ctx.fillStyle = SKIN;
        ctx.fillRect(centerX - f * 9, bodyTop + armH, armW, 3);
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(centerX - f * 9, bodyTop + armH - 1, armW, 2);

        // Front arm (forward)
        ctx.fillStyle = GI_ORANGE;
        ctx.fillRect(centerX + f * 6, bodyTop + 1, armW, armH - 1);
        ctx.fillStyle = SKIN;
        ctx.fillRect(centerX + f * 6, bodyTop + armH - 2, armW, 3);
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(centerX + f * 6, bodyTop + armH - 3, armW, 2);
        ctx.restore();
        break;

      case 'kiBlast':
        // One arm extended forward, other at side
        // Back arm (at side)
        ctx.fillStyle = GI_ORANGE;
        ctx.fillRect(centerX - f * 9, bodyTop + 2, armW, armH);
        ctx.fillStyle = SKIN;
        ctx.fillRect(centerX - f * 9, bodyTop + armH, armW, 4);
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(centerX - f * 9, bodyTop + armH - 1, armW, 2);

        // Extended arm (forward, horizontal)
        ctx.fillStyle = GI_ORANGE;
        const extStartX = centerX + f * 5;
        const extY = bodyTop + 4;
        ctx.fillRect(f > 0 ? extStartX : extStartX - 14, extY, 14, armW);
        // Hand / fist at end
        ctx.fillStyle = SKIN;
        ctx.fillRect(f > 0 ? extStartX + 12 : extStartX - 16, extY - 1, 5, armW + 2);
        // Wristband
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(f > 0 ? extStartX + 10 : extStartX - 12, extY, 3, armW);

        // Palm glow for ki
        ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(f > 0 ? extStartX + 17 : extStartX - 17, extY + armW / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'melee':
        // Punching forward with fist
        // Back arm tucked
        ctx.fillStyle = GI_ORANGE;
        ctx.fillRect(centerX - f * 8, bodyTop + 4, armW, armH - 3);
        ctx.fillStyle = SKIN;
        ctx.fillRect(centerX - f * 8, bodyTop + armH - 1, armW, 3);

        // Punching arm (extended far forward)
        ctx.fillStyle = GI_ORANGE;
        const punchStartX = centerX + f * 5;
        const punchY = bodyTop + 3;
        ctx.fillRect(f > 0 ? punchStartX : punchStartX - 18, punchY, 18, armW);
        // Fist (bigger square for emphasis)
        ctx.fillStyle = SKIN;
        ctx.fillRect(f > 0 ? punchStartX + 16 : punchStartX - 22, punchY - 1, 6, armW + 2);
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(f > 0 ? punchStartX + 14 : punchStartX - 17, punchY, 3, armW);

        // Impact lines (small white streaks)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        const fistTipX = f > 0 ? punchStartX + 22 : punchStartX - 22;
        const fistTipY = punchY + armW / 2;
        for (let i = 0; i < 3; i++) {
          const angle = (i - 1) * 0.3;
          ctx.beginPath();
          ctx.moveTo(fistTipX + f * 3, fistTipY + Math.sin(angle) * 4);
          ctx.lineTo(fistTipX + f * 10, fistTipY + Math.sin(angle) * 8);
          ctx.stroke();
        }
        break;

      case 'charging':
        // Kamehameha pose: both arms pulled back, hands together
        // Both arms pulled to the side (opposite of facing)
        ctx.fillStyle = GI_ORANGE;
        const chargeArmX = centerX - f * 10;
        const chargeArmY = bodyTop + 5;

        // Upper arm going back
        ctx.fillRect(chargeArmX - 3, chargeArmY, 8, armW);
        ctx.fillRect(chargeArmX - 3, chargeArmY + armW, 8, armW);

        // Forearms
        ctx.fillStyle = SKIN;
        ctx.fillRect(chargeArmX - f * 6, chargeArmY + 1, armW, armW);
        ctx.fillRect(chargeArmX - f * 6, chargeArmY + armW, armW, armW);

        // Wristbands
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(chargeArmX - f * 4, chargeArmY + 1, 2, armW);
        ctx.fillRect(chargeArmX - f * 4, chargeArmY + armW, 2, armW);

        // Cupped hands
        ctx.fillStyle = SKIN;
        const handCX = chargeArmX - f * 8;
        const handCY = chargeArmY + armW;
        ctx.beginPath();
        ctx.arc(handCX, handCY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Energy glow between hands (drawn elsewhere in drawFull)
        break;

      case 'firing':
        // Kamehameha firing: arms extended forward together
        ctx.fillStyle = GI_ORANGE;
        const fireStartX = centerX + f * 3;
        const fireY = bodyTop + 4;

        // Two arms side by side, extended forward
        ctx.fillRect(f > 0 ? fireStartX : fireStartX - 16, fireY, 16, armW);
        ctx.fillRect(f > 0 ? fireStartX : fireStartX - 16, fireY + armW + 1, 16, armW);

        // Hands together at end
        ctx.fillStyle = SKIN;
        const handFireX = f > 0 ? fireStartX + 14 : fireStartX - 20;
        ctx.fillRect(handFireX, fireY - 1, 6, armW * 2 + 3);

        // Wristbands
        ctx.fillStyle = BELT_BLUE;
        const wbX = f > 0 ? fireStartX + 12 : fireStartX - 15;
        ctx.fillRect(wbX, fireY, 3, armW);
        ctx.fillRect(wbX, fireY + armW + 1, 3, armW);

        // Bright glow at hands
        ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(handFireX + 3, fireY + armW, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(handFireX + 3, fireY + armW, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'spiritBomb':
        // Arms raised above head
        ctx.fillStyle = GI_ORANGE;
        const raiseX1 = centerX - 8;
        const raiseX2 = centerX + 3;
        const raiseY = bodyTop - 12;

        // Left arm raised up
        ctx.fillRect(raiseX1, raiseY, armW, 14);
        ctx.fillStyle = SKIN;
        ctx.fillRect(raiseX1, raiseY - 3, armW, 4);
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(raiseX1, raiseY - 1, armW, 2);

        // Right arm raised up
        ctx.fillStyle = GI_ORANGE;
        ctx.fillRect(raiseX2, raiseY, armW, 14);
        ctx.fillStyle = SKIN;
        ctx.fillRect(raiseX2, raiseY - 3, armW, 4);
        ctx.fillStyle = BELT_BLUE;
        ctx.fillRect(raiseX2, raiseY - 1, armW, 2);

        // Upward glow
        ctx.fillStyle = 'rgba(200, 220, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(centerX, raiseY - 6, 10, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'hit':
        // Flinching: arms pulled in, body leaning back
        ctx.fillStyle = GI_ORANGE;
        // Both arms close to body, slightly up (defensive flinch)
        ctx.fillRect(centerX - 9, bodyTop + 1, armW, armH - 2);
        ctx.fillStyle = SKIN;
        ctx.fillRect(centerX - 9, bodyTop - 1, armW, 3);

        ctx.fillStyle = GI_ORANGE;
        ctx.fillRect(centerX + 4, bodyTop + 1, armW, armH - 2);
        ctx.fillStyle = SKIN;
        ctx.fillRect(centerX + 4, bodyTop - 1, armW, 3);

        // Pain indicators (small stars or flashes)
        if (Math.random() > 0.5) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillRect(centerX + f * 12, bodyTop - 4, 3, 3);
        }
        break;
    }
  }
}

// ---------------------------------------------------------------------------
// Player instance (initialized when game starts)
// ---------------------------------------------------------------------------
let player = null;

// === END PLAYER CHARACTER ===