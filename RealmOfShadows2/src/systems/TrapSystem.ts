import { Entity } from '../engine/Entity';
import { LevelData, GameContext } from '../types';
import { TILE_SIZE } from '../constants/physics';
import { aabbOverlap } from '../engine/Physics';

interface CrumbleTile {
  x: number;
  y: number;
  timer: number;
  state: 'stable' | 'shaking' | 'crumbled';
}

export class TrapSystem {
  private crumbleTiles: CrumbleTile[] = [];
  private spikeHitCooldown = 0;
  private initialized = false;

  init(level: LevelData) {
    this.crumbleTiles = [];
    this.initialized = true;

    // Find crumbling floor tiles (ID 21)
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const tile = level.layers.collision[y * level.width + x];
        if (tile === 21) {
          this.crumbleTiles.push({
            x: x * TILE_SIZE,
            y: y * TILE_SIZE,
            timer: 0,
            state: 'stable',
          });
        }
      }
    }
  }

  update(player: Entity, level: LevelData, dt: number, ctx: GameContext) {
    if (!this.initialized) this.init(level);

    this.spikeHitCooldown = Math.max(0, this.spikeHitCooldown - dt);

    // Check spike tiles (ID 20)
    if (this.spikeHitCooldown <= 0) {
      const pLeft = Math.floor(player.x / TILE_SIZE);
      const pRight = Math.floor((player.x + player.width - 1) / TILE_SIZE);
      const pBot = Math.floor((player.y + player.height - 1) / TILE_SIZE);

      for (let gx = pLeft; gx <= pRight; gx++) {
        if (gx < 0 || gx >= level.width || pBot < 0 || pBot >= level.height) continue;
        const tile = level.layers.collision[pBot * level.width + gx];
        if (tile === 20) {
          player.takeDamage(1, 0, ctx);
          player.vy = -200; // Bounce off spikes
          this.spikeHitCooldown = 0.5;
          ctx.addParticle?.('bloodSplatter', player.centerX, player.y + player.height);
          break;
        }
      }
    }

    // Update crumbling tiles
    for (const crumble of this.crumbleTiles) {
      if (crumble.state === 'crumbled') continue;

      if (crumble.state === 'stable') {
        // Check if player is standing on it
        if (aabbOverlap(
          player.x, player.y + player.height - 2, player.width, 4,
          crumble.x, crumble.y, TILE_SIZE, 4,
        )) {
          crumble.state = 'shaking';
          crumble.timer = 0.6; // seconds before crumble
        }
      }

      if (crumble.state === 'shaking') {
        crumble.timer -= dt;
        if (crumble.timer <= 0) {
          crumble.state = 'crumbled';
          // Remove from collision grid
          const gx = Math.floor(crumble.x / TILE_SIZE);
          const gy = Math.floor(crumble.y / TILE_SIZE);
          if (level.layers.collision[gy * level.width + gx] === 21) {
            level.layers.collision[gy * level.width + gx] = 0;
          }
          ctx.addParticle?.('crumbleDebris', crumble.x + TILE_SIZE / 2, crumble.y + TILE_SIZE / 2);
          ctx.screenShake?.(2, 0.1);
        }
      }
    }
  }
}
