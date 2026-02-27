import { LightDef } from '../../types';

interface ActiveLight extends LightDef {
  currentRadius: number;
  currentIntensity: number;
  flickerPhase: number;
}

export class LightingEngine {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;
  private lights: ActiveLight[] = [];
  private ambientDarkness = 0.7; // 0=bright, 1=pitch black
  private playerLightRadius = 80;
  private playerLightIntensity = 0.6;

  constructor(width: number, height: number) {
    this.canvas = new OffscreenCanvas(width, height);
    this.ctx = this.canvas.getContext('2d')!;
  }

  setLights(lights: LightDef[]) {
    this.lights = lights.map(l => ({
      ...l,
      currentRadius: l.radius,
      currentIntensity: l.intensity,
      flickerPhase: Math.random() * Math.PI * 2,
    }));
  }

  setAmbientDarkness(level: number) {
    this.ambientDarkness = Math.max(0, Math.min(1, level));
  }

  update(dt: number) {
    for (const light of this.lights) {
      if (light.flicker) {
        light.flickerPhase += (light.flickerSpeed ?? 8) * dt;
        const flicker = Math.sin(light.flickerPhase) * 0.3 +
                        Math.sin(light.flickerPhase * 2.3) * 0.2 +
                        Math.sin(light.flickerPhase * 0.7) * 0.1;
        const flickerAmt = light.flickerAmount ?? 0.2;
        light.currentRadius = light.radius * (1 + flicker * flickerAmt);
        light.currentIntensity = light.intensity * (1 + flicker * flickerAmt * 0.5);
      }
    }
  }

  draw(mainCtx: CanvasRenderingContext2D, cameraX: number, cameraY: number,
       playerX: number, playerY: number) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Fill with ambient darkness
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = `rgba(5, 5, 15, ${this.ambientDarkness})`;
    this.ctx.fillRect(0, 0, w, h);

    // Punch light holes using destination-out
    this.ctx.globalCompositeOperation = 'destination-out';

    // Player personal light
    this.drawLightHole(
      playerX - cameraX, playerY - cameraY,
      this.playerLightRadius, this.playerLightIntensity,
    );

    // Level lights
    for (const light of this.lights) {
      this.drawLightHole(
        light.x - cameraX, light.y - cameraY,
        light.currentRadius, light.currentIntensity,
      );
    }

    // Add colored light tints
    this.ctx.globalCompositeOperation = 'source-atop';
    for (const light of this.lights) {
      if (light.color && light.color !== '#ffffff') {
        const lx = light.x - cameraX;
        const ly = light.y - cameraY;
        const gradient = this.ctx.createRadialGradient(lx, ly, 0, lx, ly, light.currentRadius);
        gradient.addColorStop(0, light.color + '40');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(lx - light.currentRadius, ly - light.currentRadius,
                          light.currentRadius * 2, light.currentRadius * 2);
      }
    }

    this.ctx.globalCompositeOperation = 'source-over';

    // Composite lighting overlay onto main canvas
    mainCtx.drawImage(this.canvas, 0, 0);
  }

  private drawLightHole(x: number, y: number, radius: number, intensity: number) {
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
    gradient.addColorStop(0.5, `rgba(0, 0, 0, ${intensity * 0.5})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
