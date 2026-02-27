import { EntityState, Facing, GameContext, BaseEntityData } from '../types';
import { AnimationController, AnimationMap } from './AnimationSystem';

let nextEntityId = 1;

export abstract class Entity {
  id: number;
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  width: number;
  height: number;
  facing: Facing = 'right';
  type: string;
  hp: number;
  maxHp: number;
  team: 'player' | 'enemy' | 'neutral';
  alive = true;
  animation: AnimationController;
  iframes = 0; // invincibility timer

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    type: string,
    hp: number,
    team: 'player' | 'enemy' | 'neutral',
    animations: AnimationMap,
  ) {
    this.id = nextEntityId++;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.hp = hp;
    this.maxHp = hp;
    this.team = team;
    this.animation = new AnimationController(animations);
  }

  get state(): EntityState {
    return this.animation.state;
  }

  get centerX(): number {
    return this.x + this.width / 2;
  }

  get centerY(): number {
    return this.y + this.height / 2;
  }

  abstract update(dt: number, ctx: GameContext): void;

  takeDamage(amount: number, knockbackX: number, ctx: GameContext) {
    if (this.iframes > 0 || !this.alive) return;

    this.hp -= amount;
    this.iframes = 0.5;
    this.vx = knockbackX;
    this.vy = -100;

    ctx.addParticle?.('hitSparks', this.centerX, this.centerY);
    ctx.addDamageNumber?.(this.centerX, this.y, amount);
    ctx.screenShake?.(4, 0.15);
    ctx.hitFreeze?.(0.05);

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.animation.setState('die', true);
      ctx.addParticle?.('deathBurst', this.centerX, this.centerY);
    } else {
      this.animation.setState('hurt', true);
    }
  }

  getData(): BaseEntityData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      type: this.type,
      facing: this.facing,
      state: this.animation.state,
      hp: this.hp,
      maxHp: this.maxHp,
      team: this.team,
    };
  }
}
