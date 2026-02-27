import { LevelData } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game';
import { Camera } from '../engine/Camera';
import { Entity } from '../engine/Entity';
import { ParticleSystem } from './effects/ParticleSystem';
import { LightingEngine } from './effects/LightingEngine';
import { ScreenEffects } from './effects/ScreenEffects';
import { DamageNumbers } from './effects/DamageNumbers';
import { buildTileCache, buildForegroundCache } from './tiles/TileRenderer';
import { registerDungeonTiles } from './tiles/DungeonTileset';
import { ParallaxBackground } from './backgrounds/ParallaxBackground';
import { createDungeonBackground } from './backgrounds/DungeonBackground';
import { drawPlayer } from './characters/PlayerRenderer';
import { drawOrc } from './characters/OrcRenderer';
import { drawOrcShaman } from './characters/OrcShamanRenderer';
import { drawSkeletonGuard } from './characters/SkeletonGuardRenderer';
import { drawNPC } from './characters/NPCRenderer';
import { NPC } from '../entities/npcs/NPC';

// Register all tilesets on module load
registerDungeonTiles();

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private tileCache: OffscreenCanvas | null = null;
  private foregroundCache: OffscreenCanvas | null = null;
  private background: ParallaxBackground | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  buildTileCache(level: LevelData) {
    this.tileCache = buildTileCache(level);
    this.foregroundCache = buildForegroundCache(level);

    // Create background based on level type
    if (level.backgroundType === 'dungeon') {
      this.background = createDungeonBackground();
    }
  }

  render(
    level: LevelData,
    camera: Camera,
    player: Entity,
    entities: Entity[],
    particles: ParticleSystem,
    lighting: LightingEngine,
    screenEffects: ScreenEffects,
    damageNumbers: DamageNumbers,
  ) {
    const ctx = this.ctx;
    const camX = Math.round(camera.x + camera.shakeX);
    const camY = Math.round(camera.y + camera.shakeY);

    // 1. Clear
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2-3. Parallax backgrounds
    if (this.background) {
      this.background.draw(ctx, camera.x, camera.y);
    }

    // 4. Enter world space
    ctx.save();
    ctx.translate(-camX, -camY);

    // 5. Draw tile cache (background + collision + decoration)
    if (this.tileCache) {
      ctx.drawImage(this.tileCache, 0, 0);
    }

    // 7-8. Draw entities sorted by Y position
    const sortedEntities = [...entities].sort((a, b) => (a.y + a.height) - (b.y + b.height));
    for (const entity of sortedEntities) {
      this.drawEntity(ctx, entity);
    }

    // 9. Foreground tiles
    if (this.foregroundCache) {
      ctx.drawImage(this.foregroundCache, 0, 0);
    }

    // 10. Particles
    particles.draw(ctx, 0, 0); // already in world space via ctx.translate

    // Damage numbers
    damageNumbers.draw(ctx, 0, 0);

    // 11. Exit world space
    ctx.restore();

    // Draw particles and damage numbers that might need screen-space
    // (already drawn in world space above)

    // 12. Lighting overlay
    lighting.draw(ctx, camX, camY, player.centerX, player.centerY);

    // 13. Screen effects
    screenEffects.draw(ctx);
  }

  private drawEntity(ctx: CanvasRenderingContext2D, entity: Entity) {
    const state = entity.animation.state;
    const frame = entity.animation.frame;
    const progress = entity.animation.progress;

    switch (entity.type) {
      case 'player':
        drawPlayer(ctx, entity.x, entity.y, state, frame, entity.facing, progress, entity.iframes);
        break;
      case 'orc':
        drawOrc(ctx, entity.x, entity.y, state, frame, entity.facing, progress, entity.hp, entity.maxHp);
        break;
      case 'orc-shaman':
        drawOrcShaman(ctx, entity.x, entity.y, state, frame, entity.facing, progress, entity.hp, entity.maxHp);
        break;
      case 'skeleton-guard':
        drawSkeletonGuard(ctx, entity.x, entity.y, state, frame, entity.facing, progress, entity.hp, entity.maxHp);
        break;
      case 'npc': {
        const npc = entity as NPC;
        drawNPC(ctx, entity.x, entity.y, state, frame, entity.facing, progress, npc.npcType, npc.playerInRange);
        break;
      }
      default:
        // Fallback: draw colored rectangle
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    }
  }
}
