import { EntityState, AnimationDef } from '../types';

export type AnimationMap = Partial<Record<EntityState, AnimationDef>>;

export class AnimationController {
  state: EntityState = 'idle';
  frame = 0;
  timer = 0;
  locked = false;
  private animations: AnimationMap;
  onAnimationEnd?: (state: EntityState) => void;

  constructor(animations: AnimationMap) {
    this.animations = animations;
  }

  /** Transition to a new state. Returns false if current animation is locked. */
  setState(newState: EntityState, force = false): boolean {
    if (newState === this.state) return true;
    if (this.locked && !force) return false;

    const anim = this.animations[newState];
    if (!anim) return false;

    this.state = newState;
    this.frame = 0;
    this.timer = 0;
    this.locked = anim.locked ?? false;
    return true;
  }

  update(dt: number) {
    const anim = this.animations[this.state];
    if (!anim) return;

    this.timer += dt;
    const frameDuration = anim.duration / anim.frames;

    if (this.timer >= frameDuration) {
      this.timer -= frameDuration;
      this.frame++;

      if (this.frame >= anim.frames) {
        if (anim.loop) {
          this.frame = 0;
        } else {
          this.frame = anim.frames - 1;
          this.locked = false;
          this.onAnimationEnd?.(this.state);
        }
      }
    }
  }

  /** Get normalized progress through current animation (0-1) */
  get progress(): number {
    const anim = this.animations[this.state];
    if (!anim) return 0;
    return (this.frame + this.timer / (anim.duration / anim.frames)) / anim.frames;
  }

  getCurrentDef(): AnimationDef | undefined {
    return this.animations[this.state];
  }
}
