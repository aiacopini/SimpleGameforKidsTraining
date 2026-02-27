import { Entity } from '../engine/Entity';
import { GameContext, EntityState } from '../types';
import { moveAndCollide, checkLedge } from '../engine/Physics';
import { PLAYER_ANIMATIONS } from '../rendering/SpriteAnimations';
import {
  GRAVITY, RUN_SPEED, RUN_ACCEL, RUN_DECEL, AIR_ACCEL, AIR_DECEL,
  JUMP_VELOCITY, JUMP_HOLD_GRAVITY, JUMP_RELEASE_GRAVITY,
  COYOTE_TIME, JUMP_BUFFER_TIME,
  WALL_SLIDE_SPEED, WALL_JUMP_VELOCITY_X, WALL_JUMP_VELOCITY_Y, WALL_STICK_TIME,
  ROLL_SPEED, ROLL_DURATION, ROLL_COOLDOWN, ROLL_IFRAMES,
  ATTACK_DURATION, ATTACK_COOLDOWN,
  HURT_DURATION, IFRAMES_AFTER_HURT, PLAYER_MAX_HP,
  LEDGE_CLIMB_DURATION,
} from '../constants/physics';

export class Player extends Entity {
  // Timers
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private rollTimer = 0;
  private rollCooldownTimer = 0;
  private attackCooldownTimer = 0;
  private hurtTimer = 0;
  private wallStickTimer = 0;
  private ledgeClimbTimer = 0;
  private wasGrounded = false;

  // Movement state
  private holdingJump = false;
  private onWallSide: 'left' | 'right' | null = null;

  constructor(x: number, y: number) {
    super(x, y, 24, 48, 'player', PLAYER_MAX_HP, 'player', PLAYER_ANIMATIONS);

    this.animation.onAnimationEnd = (state: EntityState) => {
      switch (state) {
        case 'attack':
        case 'attack-air':
          this.attackCooldownTimer = ATTACK_COOLDOWN;
          this.animation.setState('idle', true);
          break;
        case 'roll':
          this.rollCooldownTimer = ROLL_COOLDOWN;
          this.animation.setState('idle', true);
          break;
        case 'hurt':
          this.iframes = IFRAMES_AFTER_HURT;
          this.animation.setState('idle', true);
          break;
        case 'land':
          this.animation.setState('idle', true);
          break;
        case 'ledge-climb':
          this.animation.setState('idle', true);
          break;
        case 'die':
          // Stay dead
          break;
      }
    };
  }

  update(dt: number, ctx: GameContext) {
    if (!this.alive) {
      this.animation.update(dt);
      return;
    }

    const input = ctx.input;
    const state = this.animation.state;

    // Decrease timers
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    this.rollCooldownTimer = Math.max(0, this.rollCooldownTimer - dt);
    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - dt);
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.wallStickTimer = Math.max(0, this.wallStickTimer - dt);

    // Skip movement during locked animations
    if (state === 'hurt' || state === 'die') {
      this.applyPhysics(dt, ctx, 1.0, false);
      this.animation.update(dt);
      return;
    }

    // Ledge grab/climb — frozen in place
    if (state === 'ledge-grab' || state === 'ledge-climb') {
      if (state === 'ledge-grab') {
        this.vx = 0;
        this.vy = 0;
        if (input.jumpJustPressed) {
          this.animation.setState('ledge-climb', true);
          this.ledgeClimbTimer = LEDGE_CLIMB_DURATION;
        } else if (input.down) {
          // Drop from ledge
          this.animation.setState('fall', true);
        }
      }
      if (state === 'ledge-climb') {
        this.ledgeClimbTimer -= dt;
        if (this.ledgeClimbTimer <= 0) {
          // Teleport up
          this.y -= this.height;
          this.x += this.facing === 'right' ? 8 : -8;
        }
      }
      this.animation.update(dt);
      return;
    }

    // Roll
    if (state === 'roll') {
      this.rollTimer -= dt;
      this.vx = this.facing === 'right' ? ROLL_SPEED : -ROLL_SPEED;
      if (this.rollTimer <= ROLL_DURATION - ROLL_IFRAMES) {
        // i-frames ended but roll continues
      }
      this.applyPhysics(dt, ctx, 1.0, false);
      this.animation.update(dt);
      return;
    }

    // === HORIZONTAL MOVEMENT ===
    let targetVx = 0;
    if (input.left) {
      targetVx = -RUN_SPEED;
      this.facing = 'left';
    } else if (input.right) {
      targetVx = RUN_SPEED;
      this.facing = 'right';
    }

    const grounded = this.wasGrounded;
    const accel = grounded ? (targetVx !== 0 ? RUN_ACCEL : RUN_DECEL) :
                             (targetVx !== 0 ? AIR_ACCEL : AIR_DECEL);

    if (targetVx !== 0) {
      // Accelerate towards target
      if (Math.abs(this.vx) < Math.abs(targetVx)) {
        this.vx += Math.sign(targetVx) * accel * dt;
        if (Math.abs(this.vx) > Math.abs(targetVx)) this.vx = targetVx;
      } else {
        // Over speed — decelerate
        this.vx += Math.sign(targetVx) * accel * dt * 0.5;
      }
    } else {
      // Decelerate to stop
      if (Math.abs(this.vx) > 0) {
        const decel = accel * dt;
        if (Math.abs(this.vx) <= decel) {
          this.vx = 0;
        } else {
          this.vx -= Math.sign(this.vx) * decel;
        }
      }
    }

    // === JUMP BUFFER ===
    if (input.jumpJustPressed) {
      this.jumpBufferTimer = JUMP_BUFFER_TIME;
      this.holdingJump = true;
    }
    if (!input.jump) {
      this.holdingJump = false;
    }

    // === GRAVITY SCALE ===
    let gravityScale = 1.0;
    if (this.vy < 0 && this.holdingJump) {
      gravityScale = JUMP_HOLD_GRAVITY / GRAVITY; // reduced — hold for higher jump
    } else if (this.vy < 0 && !this.holdingJump) {
      gravityScale = JUMP_RELEASE_GRAVITY / GRAVITY; // increased — snap down
    }

    // === WALL SLIDE ===
    if (this.onWallSide && !grounded && this.vy > 0) {
      // Wall slide: cap fall speed
      if (this.vy > WALL_SLIDE_SPEED) {
        this.vy = WALL_SLIDE_SPEED;
      }
      gravityScale = 0.4;

      if (!this.animation.locked) {
        this.animation.setState('wall-slide');
      }

      // Wall jump
      if (this.jumpBufferTimer > 0) {
        this.jumpBufferTimer = 0;
        this.vx = this.onWallSide === 'left' ? WALL_JUMP_VELOCITY_X : -WALL_JUMP_VELOCITY_X;
        this.vy = WALL_JUMP_VELOCITY_Y;
        this.facing = this.onWallSide === 'left' ? 'right' : 'left';
        this.animation.setState('wall-jump', true);
        this.onWallSide = null;
        this.holdingJump = true;
      }
    }

    // === ATTACK ===
    if (input.attackJustPressed && this.attackCooldownTimer <= 0) {
      if (grounded || state === 'run' || state === 'idle') {
        this.animation.setState('attack');
        ctx.addParticle?.('swordSlash',
          this.facing === 'right' ? this.x + this.width + 10 : this.x - 10,
          this.centerY,
        );
      } else {
        this.animation.setState('attack-air');
      }
    }

    // === ROLL ===
    if (input.rollJustPressed && this.rollCooldownTimer <= 0 && grounded && !this.animation.locked) {
      this.animation.setState('roll');
      this.rollTimer = ROLL_DURATION;
      this.iframes = ROLL_IFRAMES;
    }

    // === PHYSICS ===
    const dropThrough = input.down && grounded;
    const result = this.applyPhysics(dt, ctx, gravityScale, dropThrough);

    // Track wall contact
    this.onWallSide = result.wallLeft ? 'left' : result.wallRight ? 'right' : null;

    // === COYOTE TIME ===
    if (result.grounded) {
      this.coyoteTimer = COYOTE_TIME;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // === JUMP (after physics, using coyote time) ===
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && state !== 'wall-slide') {
      this.vy = JUMP_VELOCITY;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.holdingJump = true;
      if (!this.animation.locked) {
        this.animation.setState('jump');
      }
      ctx.addParticle?.('dustPuff', this.centerX, this.y + this.height);
    }

    // === LEDGE DETECTION ===
    if (this.onWallSide && !result.grounded && this.vy >= 0) {
      const ledge = checkLedge(
        { x: this.x, y: this.y, vx: this.vx, vy: this.vy, width: this.width, height: this.height },
        this.onWallSide,
        ctx.collisionGrid, ctx.levelWidth, ctx.levelHeight,
      );
      if (ledge.found) {
        this.y = ledge.ledgeY;
        this.vy = 0;
        this.vx = 0;
        this.animation.setState('ledge-grab', true);
      }
    }

    // === ANIMATION STATE (non-locked) ===
    if (!this.animation.locked) {
      if (result.grounded) {
        // Landing
        if (!this.wasGrounded && this.vy >= 0) {
          this.animation.setState('land');
          ctx.addParticle?.('landDust', this.centerX, this.y + this.height);
        } else if (Math.abs(this.vx) > 10) {
          this.animation.setState('run');
        } else {
          this.animation.setState('idle');
        }
      } else if (state !== 'wall-slide') {
        if (this.vy < 0) {
          this.animation.setState('jump');
        } else {
          this.animation.setState('fall');
        }
      }
    }

    this.wasGrounded = result.grounded;
    this.animation.update(dt);
  }

  private applyPhysics(dt: number, ctx: GameContext, gravityScale: number, dropThrough: boolean) {
    const body = {
      x: this.x, y: this.y,
      vx: this.vx, vy: this.vy,
      width: this.width, height: this.height,
    };

    const result = moveAndCollide(
      body, dt,
      ctx.collisionGrid, ctx.levelWidth, ctx.levelHeight,
      gravityScale, dropThrough,
    );

    this.x = body.x;
    this.y = body.y;
    this.vx = body.vx;
    this.vy = body.vy;

    return result;
  }
}
