import { registerTile } from './TileRenderer';
import { COLORS } from '../../constants/game';

/**
 * Dungeon tileset — stone floors, walls, ceilings, platforms, doors, torches.
 * All tiles drawn procedurally with bold outlines for comic/vector aesthetic.
 *
 * Tile IDs:
 *   1  = stone floor
 *   2  = stone wall (full block)
 *   3  = stone ceiling
 *   4  = stone wall left edge
 *   5  = stone wall right edge
 *   6  = stone corner top-left
 *   7  = stone corner top-right
 *   8  = stone floor with moss
 *   9  = cracked stone
 *   10 = stone brick wall variant
 *   11 = iron bars
 *   12 = wooden door
 *   13 = exit door (golden)
 *   20 = spike trap (up)
 *   21 = crumbling floor
 *   30 = torch holder (decoration)
 *   31 = chains (decoration)
 *   32 = skull decoration
 *   33 = moss decoration
 *   100 = platform (one-way)
 *   101 = wooden platform
 */

export function registerDungeonTiles() {
  // 1: Stone floor
  registerTile(1, (ctx, x, y, s) => {
    ctx.fillStyle = COLORS.STONE_MID;
    ctx.fillRect(x, y, s, s);
    // Brick lines
    ctx.strokeStyle = COLORS.STONE_DARK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + s / 2);
    ctx.lineTo(x + s, y + s / 2);
    ctx.moveTo(x + s / 3, y);
    ctx.lineTo(x + s / 3, y + s / 2);
    ctx.moveTo(x + s * 2 / 3, y + s / 2);
    ctx.lineTo(x + s * 2 / 3, y + s);
    ctx.stroke();
    // Top edge highlight
    ctx.strokeStyle = COLORS.STONE_LIGHT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 1);
    ctx.lineTo(x + s, y + 1);
    ctx.stroke();
    // Outline
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, s);
  });

  // 2: Stone wall (full block)
  registerTile(2, (ctx, x, y, s) => {
    ctx.fillStyle = COLORS.STONE_DARK;
    ctx.fillRect(x, y, s, s);
    // Brick pattern
    ctx.strokeStyle = '#1a1a28';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.33);
    ctx.lineTo(x + s, y + s * 0.33);
    ctx.moveTo(x, y + s * 0.66);
    ctx.lineTo(x + s, y + s * 0.66);
    ctx.moveTo(x + s / 2, y);
    ctx.lineTo(x + s / 2, y + s * 0.33);
    ctx.moveTo(x + s / 4, y + s * 0.33);
    ctx.lineTo(x + s / 4, y + s * 0.66);
    ctx.moveTo(x + s * 3 / 4, y + s * 0.66);
    ctx.lineTo(x + s * 3 / 4, y + s);
    ctx.stroke();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, s);
  });

  // 3: Stone ceiling
  registerTile(3, (ctx, x, y, s) => {
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = COLORS.STONE_DARK;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + s / 2);
    ctx.lineTo(x + s, y + s / 2);
    ctx.stroke();
    // Bottom edge shadow
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + s);
    ctx.lineTo(x + s, y + s);
    ctx.stroke();
  });

  // 4: Stone wall left edge
  registerTile(4, (ctx, x, y, s) => {
    ctx.fillStyle = COLORS.STONE_DARK;
    ctx.fillRect(x, y, s, s);
    // Left edge highlight
    ctx.fillStyle = COLORS.STONE_LIGHT;
    ctx.fillRect(x, y, 4, s);
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, s);
  });

  // 5: Stone wall right edge
  registerTile(5, (ctx, x, y, s) => {
    ctx.fillStyle = COLORS.STONE_DARK;
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = COLORS.STONE_LIGHT;
    ctx.fillRect(x + s - 4, y, 4, s);
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, s);
  });

  // 8: Stone floor with moss
  registerTile(8, (ctx, x, y, s) => {
    // Base stone
    ctx.fillStyle = COLORS.STONE_MID;
    ctx.fillRect(x, y, s, s);
    // Moss patches
    ctx.fillStyle = COLORS.MOSS;
    ctx.fillRect(x + 4, y, 12, 6);
    ctx.fillRect(x + 28, y + 2, 16, 4);
    ctx.fillRect(x + 8, y + s - 6, 20, 6);
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, s);
  });

  // 9: Cracked stone
  registerTile(9, (ctx, x, y, s) => {
    ctx.fillStyle = COLORS.STONE_MID;
    ctx.fillRect(x, y, s, s);
    // Cracks
    ctx.strokeStyle = '#1a1a28';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.3, y);
    ctx.lineTo(x + s * 0.4, y + s * 0.4);
    ctx.lineTo(x + s * 0.6, y + s * 0.5);
    ctx.lineTo(x + s * 0.5, y + s);
    ctx.stroke();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, s);
  });

  // 10: Stone brick wall variant
  registerTile(10, (ctx, x, y, s) => {
    ctx.fillStyle = '#252535';
    ctx.fillRect(x, y, s, s);
    // Larger bricks
    ctx.strokeStyle = '#1a1a28';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + s / 2);
    ctx.lineTo(x + s, y + s / 2);
    ctx.moveTo(x + s * 0.4, y);
    ctx.lineTo(x + s * 0.4, y + s / 2);
    ctx.moveTo(x + s * 0.6, y + s / 2);
    ctx.lineTo(x + s * 0.6, y + s);
    ctx.stroke();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, s);
  });

  // 13: Exit door (golden)
  registerTile(13, (ctx, x, y, s) => {
    ctx.fillStyle = COLORS.STONE_DARK;
    ctx.fillRect(x, y, s, s);
    // Door frame
    ctx.fillStyle = '#6a5030';
    ctx.fillRect(x + 4, y + 2, s - 8, s - 2);
    // Door
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(x + 8, y + 4, s - 16, s - 4);
    // Golden decorations
    ctx.fillStyle = COLORS.GOLD;
    ctx.fillRect(x + s / 2 - 3, y + s / 2, 6, 6); // handle
    // Arch
    ctx.strokeStyle = COLORS.GOLD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + s / 2, y + 8, s / 2 - 8, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, y + 2, s - 8, s - 2);
  });

  // 20: Spike trap
  registerTile(20, (ctx, x, y, s) => {
    ctx.fillStyle = COLORS.STONE_MID;
    ctx.fillRect(x, y, s, s);
    // Spikes
    ctx.fillStyle = '#8a8a9a';
    const spikeCount = 4;
    const spikeW = s / spikeCount;
    for (let i = 0; i < spikeCount; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * spikeW, y + s);
      ctx.lineTo(x + i * spikeW + spikeW / 2, y + s * 0.4);
      ctx.lineTo(x + (i + 1) * spikeW, y + s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = COLORS.OUTLINE;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // Blood stains
    ctx.fillStyle = '#4a0a0a';
    ctx.fillRect(x + 8, y + s - 4, 6, 4);
    ctx.fillRect(x + 28, y + s - 6, 4, 6);
  });

  // 21: Crumbling floor
  registerTile(21, (ctx, x, y, s) => {
    ctx.fillStyle = '#3a3040';
    ctx.fillRect(x, y, s, s);
    // Crack pattern
    ctx.strokeStyle = '#1a1020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 6, y);
    ctx.lineTo(x + s / 2, y + s / 2);
    ctx.lineTo(x + s - 6, y);
    ctx.moveTo(x + s / 2, y + s / 2);
    ctx.lineTo(x + s / 3, y + s);
    ctx.stroke();
    // Warning dots
    ctx.fillStyle = '#6a4a30';
    ctx.beginPath();
    ctx.arc(x + s / 4, y + s * 0.3, 3, 0, Math.PI * 2);
    ctx.arc(x + s * 3 / 4, y + s * 0.7, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, s);
  });

  // 30: Torch holder (decoration)
  registerTile(30, (ctx, x, y, s) => {
    // Wall behind
    ctx.fillStyle = COLORS.STONE_DARK;
    ctx.fillRect(x, y, s, s);
    // Bracket
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(x + s / 2 - 3, y + s / 2 - 2, 6, 20);
    // Torch
    ctx.fillStyle = '#6a4a20';
    ctx.fillRect(x + s / 2 - 2, y + s / 2 - 10, 4, 12);
    // Flame
    ctx.fillStyle = COLORS.TORCH_FLAME;
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s / 2 - 14, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe080';
    ctx.beginPath();
    ctx.ellipse(x + s / 2, y + s / 2 - 14, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // 31: Chains decoration
  registerTile(31, (ctx, x, y, s) => {
    ctx.fillStyle = COLORS.STONE_DARK;
    ctx.fillRect(x, y, s, s);
    // Chain links
    ctx.strokeStyle = '#6a6a7a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const ly = y + 4 + i * 12;
      ctx.beginPath();
      ctx.ellipse(x + s / 2, ly + 4, 4, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  // 100: One-way platform
  registerTile(100, (ctx, x, y, s) => {
    ctx.fillStyle = COLORS.STONE_MID;
    ctx.fillRect(x, y, s, 8);
    // Rivets
    ctx.fillStyle = COLORS.STONE_LIGHT;
    ctx.beginPath();
    ctx.arc(x + 8, y + 4, 2, 0, Math.PI * 2);
    ctx.arc(x + s / 2, y + 4, 2, 0, Math.PI * 2);
    ctx.arc(x + s - 8, y + 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, 8);
  });

  // 101: Wooden platform
  registerTile(101, (ctx, x, y, s) => {
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(x, y, s, 10);
    // Wood grain
    ctx.strokeStyle = '#4a3020';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 3);
    ctx.lineTo(x + s - 4, y + 3);
    ctx.moveTo(x + 8, y + 7);
    ctx.lineTo(x + s - 8, y + 7);
    ctx.stroke();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, 10);
  });
}
