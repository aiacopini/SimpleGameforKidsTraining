import { Entity } from '../../engine/Entity';
import { GameContext } from '../../types';
import { moveAndCollide } from '../../engine/Physics';
import { SKELETON_GUARD_ANIMATIONS } from '../../rendering/SpriteAnimations';

type AIState = 'patrol' | 'chase' | 'attack' | 'block' | 'cooldown';

const PATROL_SPEED = 50;
const CHASE_SPEED = 100;
const AGGRO_RANGE = 180;
const ATTACK_RANGE = 35;
const ATTACK_COOLDOWN = 1.0;
const BLOCK_CHANCE = 0.4;

export class SkeletonGuard extends Entity {
  attackDamage = 1;
  blocking = false;
  private aiState: AIState = 'patrol';
  private patrolDir = 1;
  private patrolTimer = 0;
  private patrolDuration = 3 + Math.random() * 2;
  private attackCooldownTimer = 0;
  private blockTimer = 0;

  constructor(x: number, y: number) {
    super(x, y, 24, 48, 'skeleton-guard', 4, 'enemy', SKELETON_GUARD_ANIMATIONS);

    this.animation.onAnimationEnd = (state) => {
      if (state === 'attack') {
        this.aiState = 'cooldown';
        this.attackCooldownTimer = ATTACK_COOLDOWN;
        this.animation.setState('idle', true);
      } else if (state === 'hurt') {
        this.blocking = false;
        this.animation.setState('idle', true);
        this.aiState = 'chase';
      }
    };
  }

  takeDamage(amount: number, knockbackX: number, ctx: GameContext) {
    // Block frontal attacks
    if (this.blocking) {
      const attackFromRight = knockbackX < 0;
      const facingAttack = (this.facing === 'right' && !attackFromRight) ||
                           (this.facing === 'left' && attackFromRight);
      if (facingAttack) {
        // Blocked!
        ctx.addParticle?.('hitSparks', this.centerX, this.centerY);
        ctx.screenShake?.(2, 0.08);
        return;
      }
    }
    super.takeDamage(amount, knockbackX, ctx);
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
    this.blockTimer = Math.max(0, this.blockTimer - dt);

    switch (this.aiState) {
      case 'patrol':
        this.blocking = false;
        this.vx = PATROL_SPEED * this.patrolDir;
        this.facing = this.patrolDir > 0 ? 'right' : 'left';
        this.animation.setState('run');

        this.patrolTimer += dt;
        if (this.patrolTimer >= this.patrolDuration) {
          this.patrolDir *= -1;
          this.patrolTimer = 0;
          this.patrolDuration = 3 + Math.random() * 2;
        }

        if (distToPlayer < AGGRO_RANGE) {
          this.aiState = 'chase';
        }
        break;

      case 'chase':
        this.blocking = false;
        this.vx = CHASE_SPEED * playerDir;
        this.facing = playerDir > 0 ? 'right' : 'left';
        this.animation.setState('run');

        if (distToPlayer < ATTACK_RANGE && this.attackCooldownTimer <= 0) {
          // Randomly block or attack
          if (Math.random() < BLOCK_CHANCE) {
            this.aiState = 'block';
            this.blockTimer = 0.8 + Math.random() * 0.5;
          } else {
            this.aiState = 'attack';
          }
        } else if (distToPlayer > AGGRO_RANGE * 1.5) {
          this.aiState = 'patrol';
        }
        break;

      case 'attack':
        this.blocking = false;
        this.vx = 0;
        this.facing = playerDir > 0 ? 'right' : 'left';
        this.animation.setState('attack');
        break;

      case 'block':
        this.blocking = true;
        this.vx = 0;
        this.facing = playerDir > 0 ? 'right' : 'left';
        this.animation.setState('idle');

        if (this.blockTimer <= 0) {
          this.blocking = false;
          this.aiState = this.attackCooldownTimer <= 0 ? 'attack' : 'chase';
        }
        break;

      case 'cooldown':
        this.blocking = false;
        this.vx = 0;
        this.animation.setState('idle');
        if (this.attackCooldownTimer <= 0) {
          this.aiState = distToPlayer < AGGRO_RANGE ? 'chase' : 'patrol';
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
    const result = moveAndCollide(body, dt, ctx.collisionGrid, ctx.levelWidth, ctx.levelHeight);
    this.x = body.x;
    this.y = body.y;
    this.vx = body.vx;
    this.vy = body.vy;

    if (this.aiState === 'patrol' && (result.wallLeft || result.wallRight)) {
      this.patrolDir *= -1;
      this.patrolTimer = 0;
    }
  }
}
