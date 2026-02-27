import { ParallaxBackground } from './ParallaxBackground';

/**
 * 4-layer dungeon parallax background:
 *   Layer 0 (depth 0.05): Deep darkness with faint glow spots
 *   Layer 1 (depth 0.15): Distant architecture silhouettes
 *   Layer 2 (depth 0.30): Mid-ground arches and pillars
 *   Layer 3 (depth 0.50): Near pillars + fog
 */
export function createDungeonBackground(): ParallaxBackground {
  const bg = new ParallaxBackground();

  // Layer 0: Deep darkness with faint colored spots
  bg.addLayer({
    depth: 0.05,
    draw: (ctx, ox, oy, w, h) => {
      ctx.fillStyle = '#06060e';
      ctx.fillRect(0, 0, w, h);

      // Distant eerie glow spots
      const glows = [
        { x: 200, y: 300, r: 60, color: '#1a1a30' },
        { x: 500, y: 200, r: 80, color: '#0a1520' },
        { x: 800, y: 350, r: 50, color: '#1a0a15' },
      ];
      for (const g of glows) {
        const gx = ((g.x - ox) % w + w) % w;
        const gradient = ctx.createRadialGradient(gx, g.y - oy * 0.5, 0, gx, g.y - oy * 0.5, g.r);
        gradient.addColorStop(0, g.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(gx - g.r, g.y - oy * 0.5 - g.r, g.r * 2, g.r * 2);
      }
    },
  });

  // Layer 1: Distant architecture silhouettes
  bg.addLayer({
    depth: 0.15,
    draw: (ctx, ox, _oy, w, h) => {
      ctx.fillStyle = '#0e0e1a';
      // Repeating distant arches
      const period = 300;
      const startX = -((ox % period) + period) % period;
      for (let x = startX; x < w + period; x += period) {
        // Tall pillar silhouette
        ctx.fillRect(x + 20, h * 0.2, 15, h * 0.8);
        ctx.fillRect(x + period - 35, h * 0.3, 15, h * 0.7);
        // Arch
        ctx.beginPath();
        ctx.arc(x + period / 2, h * 0.3, period / 2 - 35, Math.PI, 0);
        ctx.fill();
      }
    },
  });

  // Layer 2: Mid-ground arches
  bg.addLayer({
    depth: 0.3,
    draw: (ctx, ox, _oy, w, h) => {
      ctx.fillStyle = '#141420';
      const period = 200;
      const startX = -((ox % period) + period) % period;
      for (let x = startX; x < w + period; x += period) {
        // Pillar
        ctx.fillRect(x + 10, h * 0.15, 20, h * 0.85);
        // Arch top
        ctx.beginPath();
        ctx.arc(x + period / 2, h * 0.25, period / 2 - 10, Math.PI, 0);
        ctx.fill();
        // Pillar cap
        ctx.fillRect(x + 6, h * 0.15, 28, 8);
      }
    },
  });

  // Layer 3: Near pillars + fog
  bg.addLayer({
    depth: 0.5,
    draw: (ctx, ox, _oy, w, h) => {
      // Near pillars
      ctx.fillStyle = '#1a1a28';
      const period = 400;
      const startX = -((ox % period) + period) % period;
      for (let x = startX; x < w + period; x += period) {
        ctx.fillRect(x + 20, 0, 30, h);
        // Pillar details
        ctx.fillStyle = '#222236';
        ctx.fillRect(x + 24, 0, 4, h);
        ctx.fillStyle = '#1a1a28';
      }

      // Ground fog
      ctx.fillStyle = 'rgba(20, 20, 35, 0.3)';
      ctx.fillRect(0, h - 60, w, 60);

      // Fog wisps
      const time = Date.now() / 3000;
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#2a2a40';
      for (let i = 0; i < 5; i++) {
        const fx = ((i * 200 + Math.sin(time + i) * 40 - ox * 0.5) % (w + 100)) - 50;
        ctx.beginPath();
        ctx.ellipse(fx, h - 20 + Math.sin(time * 0.7 + i * 2) * 8, 80, 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  });

  return bg;
}
