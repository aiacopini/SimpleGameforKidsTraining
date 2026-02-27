import { Entity } from '../../engine/Entity';
import { GameContext } from '../../types';
import { moveAndCollide } from '../../engine/Physics';
import { ORC_SHAMAN_ANIMATIONS } from '../../rendering/SpriteAnimations';

type AIState = 'idle' | 'retreat' | 'attack' | 'cooldown';

const RETREAT_SPEED = 80;
const PREFERRED_RANGE = 150;
const ATTACK_RANGE = 250;
const ATTACK_COOLDOWN = 1.5;
const TOO_CLOSE = 80;

export class OrcShaman extends Entity {
  attackDamage = 1;
  private aiState: AIState = 'idle';
  private attackCooldownTimer = 0;

  constructor(x: number, y: number) {
    super(x, y, 28, 48, 'orc-shaman', 2, 'enemy', ORC_SHAMAN_ANIMATIONS);

    this.animation.onAnimationEnd = (state) => {
      if (state === 'attack') {
        this.aiState = 'cooldown';
        this.attackCooldownTimer = ATTACK_COOLDOWN;
        this.animation.setState('idle', true);
      } else if (state === 'hurt') {
        this.aiState = 'retreat';
        this.animation.setState('idle', true);
      }
    };
  }

  update(dt: number, ctx: GameContext) {
    if (!this.alive) {
      this.animation.update(dt);
      return;
    }

    if (this.animation.locked) {
      this.applyPhysics(dt, ctx);
      this.animation.update(dt);
      return;
    }

    const player = ctx.entities.find(e => e.type === 'player');
    const distToPlayer = player
      ? Math.abs(this.centerX - (player.x + player.width / 2))
      : Infinity;
    const playerDir = player
      ? Math.sign((player.x + player.width / 2) - this.centerX)
      : 0;

    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - dt);

    switch (this.aiState) {
      case 'idle':
        this.vx = 0;
        if (player) {
          this.facing = playerDir > 0 ? 'right' : 'left';
        }
        this.animation.setState('idle');

        if (distToPlayer < TOO_CLOSE) {
          this.aiState = 'retreat';
        } else if (distToPlayer < ATTACK_RANGE && this.attackCooldownTimer <= 0) {
          this.aiState = 'attack';
        }
        break;

      case 'retreat':
        this.vx = -playerDir * RETREAT_SPEED;
        this.facing = playerDir > 0 ? 'right' : 'left';
        this.animation.setState('run');

        if (distToPlayer >= PREFERRED_RANGE) {
          this.aiState = 'idle';
        }
        break;

      case 'attack':
        this.vx = 0;
        this.facing = playerDir > 0 ? 'right' : 'left';
        this.animation.setState('attack');
        // Spawn magic bolt particle on attack start
        if (this.animation.progress < 0.1) {
          ctx.addParticle?.('magicBolt', this.centerX, this.centerY - 10);
        }
        break;

      case 'cooldown':
        this.vx = 0;
        this.animation.setState('idle');
        if (this.attackCooldownTimer <= 0) {
          this.aiState = distToPlayer < TOO_CLOSE ? 'retreat' : 'idle';
        }
        break;
    }

    this.applyPhysics(dt, ctx);
    this.animation.update(dt);
  }

  private applyPhysics(dt: number, ctx: GameContext) {
    const body = {
      x: this.x, y: this.y,
      vx: this.vx, vy: this.vy,
      width: this.width, height: this.height,
    };
    moveAndCollide(body, dt, ctx.collisionGrid, ctx.levelWidth, ctx.levelHeight);
    this.x = body.x;
    this.y = body.y;
    this.vx = body.vx;
    this.vy = body.vy;
  }
}
