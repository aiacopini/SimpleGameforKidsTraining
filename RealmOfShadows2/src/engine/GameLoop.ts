import { FIXED_DT, MAX_DT } from '../constants/game';

export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private running = false;
  private updateFn: (dt: number) => void;
  private renderFn: (alpha: number) => void;

  /** Hit freeze: pauses updates but not rendering */
  freezeTimer = 0;

  constructor(updateFn: (dt: number) => void, renderFn: (alpha: number) => void) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.tick(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private tick = (now: number) => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    try {
      let dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      // Clamp large deltas (tab-away, debugger pause)
      if (dt > MAX_DT) dt = MAX_DT;

      // Hit freeze handling
      if (this.freezeTimer > 0) {
        this.freezeTimer -= dt;
        this.renderFn(1);
        return;
      }

      // Semi-fixed timestep: accumulate time, consume in fixed steps
      this.accumulator += dt;

      while (this.accumulator >= FIXED_DT) {
        this.updateFn(FIXED_DT);
        this.accumulator -= FIXED_DT;
      }

      // Render with interpolation alpha
      const alpha = this.accumulator / FIXED_DT;
      this.renderFn(alpha);
    } catch (e) {
      console.error('[GameLoop] tick error:', e);
      this.running = false; // stop loop on error to prevent spam
    }
  };

  /** Freeze the game loop updates for a duration (hit freeze effect) */
  freeze(duration: number) {
    this.freezeTimer = Math.max(this.freezeTimer, duration);
  }
}
