import { MAX_PARTICLES } from '../../constants/game';
import { COLORS } from '../../constants/game';

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  sizeEnd: number;
  color: string;
  shape: 'circle' | 'square' | 'spark' | 'ember' | 'smoke' | 'star' | 'shard';
  gravity: number;
  friction: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

interface EmitConfig {
  count: number;
  shape: Particle['shape'];
  color: string | string[];
  size: [number, number];       // [min, max]
  sizeEnd?: [number, number];
  speed: [number, number];
  angle: [number, number];      // degrees
  life: [number, number];
  gravity?: number;
  friction?: number;
}

const PRESETS: Record<string, EmitConfig> = {
  hitSparks: {
    count: 12,
    shape: 'spark',
    color: [COLORS.HIT_SPARK, '#ffe880', '#ffa040'],
    size: [2, 5],
    sizeEnd: [0, 1],
    speed: [100, 300],
    angle: [0, 360],
    life: [0.15, 0.4],
    gravity: 200,
    friction: 0.95,
  },
  bloodSplatter: {
    count: 8,
    shape: 'circle',
    color: [COLORS.BLOOD, '#6a1010', '#aa2020'],
    size: [2, 4],
    sizeEnd: [1, 2],
    speed: [50, 150],
    angle: [0, 360],
    life: [0.3, 0.6],
    gravity: 300,
  },
  dustPuff: {
    count: 6,
    shape: 'smoke',
    color: ['#8a7a6a', '#6a6050', '#9a8a7a'],
    size: [3, 6],
    sizeEnd: [6, 12],
    speed: [20, 60],
    angle: [200, 340],
    life: [0.3, 0.6],
    gravity: -20,
    friction: 0.92,
  },
  swordSlash: {
    count: 8,
    shape: 'spark',
    color: ['#e8e8ff', '#c0c8e8', '#ffffff'],
    size: [2, 4],
    sizeEnd: [0, 1],
    speed: [80, 200],
    angle: [-30, 30],
    life: [0.1, 0.25],
    friction: 0.9,
  },
  torchFire: {
    count: 3,
    shape: 'ember',
    color: [COLORS.TORCH_FLAME, '#e87020', '#ffa040'],
    size: [2, 4],
    sizeEnd: [0, 1],
    speed: [20, 60],
    angle: [240, 300],
    life: [0.3, 0.8],
    gravity: -80,
    friction: 0.97,
  },
  magicBolt: {
    count: 6,
    shape: 'star',
    color: ['#6a40a0', '#9060d0', '#c080ff'],
    size: [2, 4],
    sizeEnd: [0, 1],
    speed: [30, 80],
    angle: [0, 360],
    life: [0.2, 0.5],
    gravity: -30,
  },
  crumbleDebris: {
    count: 10,
    shape: 'shard',
    color: ['#4a4a5e', '#3a3a4e', '#5a5a6e'],
    size: [3, 6],
    speed: [50, 200],
    angle: [200, 340],
    life: [0.4, 0.8],
    gravity: 400,
  },
  deathBurst: {
    count: 20,
    shape: 'shard',
    color: [COLORS.BLOOD, '#6a1010', '#aa2020', '#4a0a0a'],
    size: [3, 8],
    sizeEnd: [0, 2],
    speed: [80, 250],
    angle: [0, 360],
    life: [0.4, 1.0],
    gravity: 200,
    friction: 0.96,
  },
  landDust: {
    count: 8,
    shape: 'smoke',
    color: ['#8a7a6a', '#6a6050'],
    size: [2, 5],
    sizeEnd: [4, 8],
    speed: [30, 80],
    angle: [150, 390],
    life: [0.2, 0.4],
    gravity: -10,
    friction: 0.9,
  },
};

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickColor(color: string | string[]): string {
  if (Array.isArray(color)) {
    return color[Math.floor(Math.random() * color.length)];
  }
  return color;
}

export class ParticleSystem {
  private pool: Particle[] = [];

  constructor() {
    // Pre-allocate pool
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool.push({
        active: false, x: 0, y: 0, vx: 0, vy: 0,
        life: 0, maxLife: 1, size: 1, sizeEnd: 0,
        color: '#fff', shape: 'circle', gravity: 0, friction: 1,
        alpha: 1, rotation: 0, rotationSpeed: 0,
      });
    }
  }

  emit(preset: string, x: number, y: number, opts?: Record<string, unknown>) {
    const config = PRESETS[preset];
    if (!config) return;

    const count = opts?.count as number ?? config.count;

    for (let i = 0; i < count; i++) {
      const p = this.getInactive();
      if (!p) break;

      const angle = randomRange(config.angle[0], config.angle[1]) * Math.PI / 180;
      const speed = randomRange(config.speed[0], config.speed[1]);
      const life = randomRange(config.life[0], config.life[1]);
      const size = randomRange(config.size[0], config.size[1]);
      const sizeEnd = config.sizeEnd
        ? randomRange(config.sizeEnd[0], config.sizeEnd[1])
        : size;

      p.active = true;
      p.x = x + randomRange(-4, 4);
      p.y = y + randomRange(-4, 4);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = life;
      p.maxLife = life;
      p.size = size;
      p.sizeEnd = sizeEnd;
      p.color = pickColor(config.color);
      p.shape = config.shape;
      p.gravity = config.gravity ?? 0;
      p.friction = config.friction ?? 1;
      p.alpha = 1;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotationSpeed = (Math.random() - 0.5) * 6;
    }
  }

  private getInactive(): Particle | null {
    for (const p of this.pool) {
      if (!p.active) return p;
    }
    return null;
  }

  update(dt: number) {
    for (const p of this.pool) {
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      p.vy += p.gravity * dt;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;

      const t = 1 - p.life / p.maxLife;
      p.alpha = 1 - t;
      // Current size interpolated from start to end
      p.size = p.size + (p.sizeEnd - p.size) * t * 0.1; // slow shrink
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    for (const p of this.pool) {
      if (!p.active) continue;

      const sx = p.x - cameraX;
      const sy = p.y - cameraY;
      const t = 1 - p.life / p.maxLife;
      const currentSize = p.size * (1 - t) + p.sizeEnd * t;
      const alpha = Math.max(0, p.alpha);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      switch (p.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(sx, sy, currentSize, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'square':
          ctx.fillRect(sx - currentSize / 2, sy - currentSize / 2, currentSize, currentSize);
          break;

        case 'spark': {
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.rotation);
          ctx.fillRect(-currentSize / 2, -1, currentSize, 2);
          ctx.fillRect(-1, -currentSize / 2, 2, currentSize);
          ctx.restore();
          break;
        }

        case 'ember': {
          ctx.beginPath();
          ctx.arc(sx, sy, currentSize, 0, Math.PI * 2);
          ctx.fill();
          // Glow
          ctx.globalAlpha = alpha * 0.3;
          ctx.beginPath();
          ctx.arc(sx, sy, currentSize * 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'smoke': {
          ctx.globalAlpha = alpha * 0.4;
          ctx.beginPath();
          ctx.arc(sx, sy, currentSize, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'star': {
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.rotation);
          drawStar(ctx, 0, 0, currentSize, 5);
          ctx.restore();
          break;
        }

        case 'shard': {
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.moveTo(0, -currentSize);
          ctx.lineTo(currentSize * 0.5, 0);
          ctx.lineTo(0, currentSize * 0.6);
          ctx.lineTo(-currentSize * 0.5, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    for (const p of this.pool) {
      p.active = false;
    }
  }

  get activeCount(): number {
    return this.pool.filter(p => p.active).length;
  }
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
