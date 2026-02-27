import { CANVAS_WIDTH, CANVAS_HEIGHT, CAMERA_LERP, CAMERA_LOOK_AHEAD } from '../constants/game';
import { Facing } from '../types';

export class Camera {
  x = 0;
  y = 0;
  targetX = 0;
  targetY = 0;
  levelPixelWidth = 0;
  levelPixelHeight = 0;
  shakeX = 0;
  shakeY = 0;
  private shakeIntensity = 0;
  private shakeTimer = 0;

  setLevelBounds(pixelWidth: number, pixelHeight: number) {
    this.levelPixelWidth = pixelWidth;
    this.levelPixelHeight = pixelHeight;
  }

  follow(entityX: number, entityY: number, entityWidth: number, entityHeight: number, facing: Facing, dt: number) {
    // Center on entity with look-ahead in facing direction
    const lookAhead = facing === 'right' ? CAMERA_LOOK_AHEAD : -CAMERA_LOOK_AHEAD;
    this.targetX = entityX + entityWidth / 2 - CANVAS_WIDTH / 2 + lookAhead;
    this.targetY = entityY + entityHeight / 2 - CANVAS_HEIGHT / 2 + 20; // slight offset down

    // Smooth lerp
    const t = 1 - Math.exp(-CAMERA_LERP * dt);
    this.x += (this.targetX - this.x) * t;
    this.y += (this.targetY - this.y) * t;

    // Clamp to level bounds
    const maxX = Math.max(0, this.levelPixelWidth - CANVAS_WIDTH);
    const maxY = Math.max(0, this.levelPixelHeight - CANVAS_HEIGHT);
    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }

  /** Trigger screen shake */
  shake(intensity: number, duration: number) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeTimer = Math.max(this.shakeTimer, duration);
  }

  updateShake(dt: number) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const t = this.shakeTimer > 0 ? this.shakeIntensity * (this.shakeTimer / 0.3) : 0;
      this.shakeX = (Math.random() - 0.5) * 2 * t;
      this.shakeY = (Math.random() - 0.5) * 2 * t;
      if (this.shakeTimer <= 0) {
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }
  }

  /** Get parallax-adjusted camera position for a given depth (0=far, 1=foreground) */
  parallaxOffset(depth: number): { x: number; y: number } {
    return {
      x: this.x * depth,
      y: this.y * depth * 0.5, // less vertical parallax
    };
  }

  /** Snap camera instantly (e.g., on level load) */
  snapTo(entityX: number, entityY: number, entityWidth: number, entityHeight: number) {
    this.x = entityX + entityWidth / 2 - CANVAS_WIDTH / 2;
    this.y = entityY + entityHeight / 2 - CANVAS_HEIGHT / 2;
    const maxX = Math.max(0, this.levelPixelWidth - CANVAS_WIDTH);
    const maxY = Math.max(0, this.levelPixelHeight - CANVAS_HEIGHT);
    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
    this.targetX = this.x;
    this.targetY = this.y;
  }
}
