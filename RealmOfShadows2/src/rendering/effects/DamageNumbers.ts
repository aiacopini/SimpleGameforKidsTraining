import { COLORS } from '../../constants/game';

interface DamageNumber {
  active: boolean;
  x: number;
  y: number;
  amount: number;
  color: string;
  life: number;
  vy: number;
  scale: number;
}

const MAX_NUMBERS = 20;
const LIFETIME = 0.8;

export class DamageNumbers {
  private pool: DamageNumber[] = [];

  constructor() {
    for (let i = 0; i < MAX_NUMBERS; i++) {
      this.pool.push({
        active: false, x: 0, y: 0, amount: 0,
        color: COLORS.DAMAGE_TEXT, life: 0, vy: 0, scale: 1,
      });
    }
  }

  add(x: number, y: number, amount: number, color?: string) {
    for (const n of this.pool) {
      if (!n.active) {
        n.active = true;
        n.x = x + (Math.random() - 0.5) * 10;
        n.y = y;
        n.amount = amount;
        n.color = color ?? COLORS.DAMAGE_TEXT;
        n.life = LIFETIME;
        n.vy = -80;
        n.scale = 1.5; // start big, shrink
        return;
      }
    }
  }

  update(dt: number) {
    for (const n of this.pool) {
      if (!n.active) continue;
      n.life -= dt;
      if (n.life <= 0) {
        n.active = false;
        continue;
      }
      n.y += n.vy * dt;
      n.vy *= 0.95;
      n.scale = 1 + (n.life / LIFETIME) * 0.5;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    for (const n of this.pool) {
      if (!n.active) continue;

      const sx = n.x - cameraX;
      const sy = n.y - cameraY;
      const alpha = Math.min(1, n.life / (LIFETIME * 0.3));

      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(n.scale, n.scale);
      ctx.globalAlpha = alpha;

      // Shadow
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(String(n.amount), 1, 1);

      // Text
      ctx.fillStyle = n.color;
      ctx.fillText(String(n.amount), 0, 0);

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    for (const n of this.pool) {
      n.active = false;
    }
  }
}
