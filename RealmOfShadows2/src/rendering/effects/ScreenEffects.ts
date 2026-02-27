import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/game';

export class ScreenEffects {
  // Vignette
  private vignetteIntensity = 0.4;

  // Damage flash
  private damageFlashTimer = 0;
  private damageFlashDuration = 0.2;
  private damageFlashColor = 'rgba(180, 30, 30, 0.3)';

  // Color grading (simple tint overlay)
  private tintColor = '';
  private tintAlpha = 0;

  reset() {
    this.damageFlashTimer = 0;
    this.tintColor = '';
    this.tintAlpha = 0;
  }

  triggerDamageFlash() {
    this.damageFlashTimer = this.damageFlashDuration;
  }

  setTint(color: string, alpha: number) {
    this.tintColor = color;
    this.tintAlpha = alpha;
  }

  update(dt: number) {
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= dt;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Vignette
    if (this.vignetteIntensity > 0) {
      const cx = CANVAS_WIDTH / 2;
      const cy = CANVAS_HEIGHT / 2;
      const r = Math.max(cx, cy) * 1.2;
      const gradient = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, `rgba(0, 0, 0, ${this.vignetteIntensity})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Damage flash
    if (this.damageFlashTimer > 0) {
      const alpha = (this.damageFlashTimer / this.damageFlashDuration) * 0.3;
      ctx.fillStyle = `rgba(180, 30, 30, ${alpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Color tint
    if (this.tintColor && this.tintAlpha > 0) {
      ctx.globalAlpha = this.tintAlpha;
      ctx.fillStyle = this.tintColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1;
    }
  }
}
