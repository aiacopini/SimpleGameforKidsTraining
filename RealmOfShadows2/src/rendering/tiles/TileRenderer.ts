import { LevelData } from '../../types';
import { TILE_SIZE } from '../../constants/physics';
import { COLORS } from '../../constants/game';

type TileDrawFn = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;

const tileDrawers = new Map<number, TileDrawFn>();

/** Register a tile draw function by tile ID */
export function registerTile(id: number, drawFn: TileDrawFn) {
  tileDrawers.set(id, drawFn);
}

/** Build an offscreen canvas cache of all static tiles for a level */
export function buildTileCache(level: LevelData): OffscreenCanvas {
  const pixelW = level.width * level.tileSize;
  const pixelH = level.height * level.tileSize;
  const canvas = new OffscreenCanvas(pixelW, pixelH);
  const ctx = canvas.getContext('2d')!;

  // Draw background layer
  drawLayer(ctx, level.layers.background, level.width, level.height, level.tileSize);

  // Draw collision layer (main tiles)
  drawLayer(ctx, level.layers.collision, level.width, level.height, level.tileSize);

  // Draw decoration layer
  drawLayer(ctx, level.layers.decoration, level.width, level.height, level.tileSize);

  return canvas;
}

/** Build foreground tile cache (drawn on top of entities) */
export function buildForegroundCache(level: LevelData): OffscreenCanvas | null {
  const hasForeground = level.layers.foreground.some(t => t > 0);
  if (!hasForeground) return null;

  const pixelW = level.width * level.tileSize;
  const pixelH = level.height * level.tileSize;
  const canvas = new OffscreenCanvas(pixelW, pixelH);
  const ctx = canvas.getContext('2d')!;
  drawLayer(ctx, level.layers.foreground, level.width, level.height, level.tileSize);
  return canvas;
}

function drawLayer(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  tiles: number[],
  width: number,
  height: number,
  tileSize: number,
) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const id = tiles[y * width + x];
      if (id === 0) continue;

      const drawer = tileDrawers.get(id);
      if (drawer) {
        drawer(ctx as CanvasRenderingContext2D, x * tileSize, y * tileSize, tileSize);
      } else {
        // Fallback: draw colored rectangle
        ctx.fillStyle = id < 100 ? COLORS.STONE_DARK : '#4a3a2a';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }
}
