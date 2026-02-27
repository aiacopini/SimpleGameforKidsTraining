import { Entity } from '../../engine/Entity';
import { GameContext } from '../../types';
import { moveAndCollide } from '../../engine/Physics';
import { ORC_ANIMATIONS } from '../../rendering/SpriteAnimations';

type AIState = 'patrol' | 'aggro' | 'chase' | 'attack' | 'cooldown';

const PATROL_SPEED = 60;
const CHASE_SPEED = 130;
const AGGRO_RANGE = 200;
const ATTACK_RANGE = 40;
const ATTACK_COOLDOWN = 0.8;
const LOSE_AGGRO_RANGE = 350;

export class Orc extends Entity {
  attackDamage = 1;
  private aiState: AIState = 'patrol';
  private patrolDir = 1;
  private patrolTimer = 0;
  private patrolDuration = 2 + Math.random() * 2;
  private attackCooldownTimer = 0;
  private spawnX: number;

  constructor(x: number, y: number) {
    super(x, y, 28, 44, 'orc', 3, 'enemy', ORC_ANIMATIONS);
    this.spawnX = x;

    this.animation.onAnimationEnd = (state) => {
      if (state === 'attack') {
        this.aiState = 'cooldown';
        this.attackCooldownTimer = ATTACK_COOLDOWN;
        this.animation.setState('idle', true);
      } else if (state === 'hurt') {
        this.aiState = 'aggro';
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

    // Find player
    const player = ctx.entities.find(e => e.type === 'player');
    const distToPlayer = player
      ? Math.abs(this.centerX - (player.x + player.width / 2))
      : Infinity;
    const playerDir = player
      ? Math.sign((player.x + player.width / 2) - this.centerX)
      : 0;

    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - dt);

    switch (this.aiState) {
      case 'patrol':
        this.vx = PATROL_SPEED * this.patrolDir;
        this.facing = this.patrolDir > 0 ? 'right' : 'left';
        this.animation.setState('run');

        this.patrolTimer += dt;
        if (this.patrolTimer >= this.patrolDuration) {
          this.patrolDir *= -1;
          this.patrolTimer = 0;
          this.patrolDuration = 2 + Math.random() * 2;
        }

        // Check aggro
        if (distToPlayer < AGGRO_RANGE) {
          this.aiState = 'aggro';
        }
        break;

      case 'aggro':
        // Brief pause before chasing
        this.vx = 0;
        this.facing = playerDir > 0 ? 'right' : 'left';
        this.animation.setState('idle');
        this.aiState = 'chase';
        break;

      case 'chase':
        if (distToPlayer > LOSE_AGGRO_RANGE) {
          this.aiState = 'patrol';
          break;
        }
        if (distToPlayer < ATTACK_RANGE && this.attackCooldownTimer <= 0) {
          this.aiState = 'attack';
          break;
        }
        this.vx = CHASE_SPEED * playerDir;
        this.facing = playerDir > 0 ? 'right' : 'left';
        this.animation.setState('run');
        break;

      case 'attack':
        this.vx = 0;
        this.facing = playerDir > 0 ? 'right' : 'left';
        this.animation.setState('attack');
        break;

      case 'cooldown':
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

    // Turn around if hitting a wall while patrolling
    if (this.aiState === 'patrol' && (result.wallLeft || result.wallRight)) {
      this.patrolDir *= -1;
      this.patrolTimer = 0;
    }
  }
}
