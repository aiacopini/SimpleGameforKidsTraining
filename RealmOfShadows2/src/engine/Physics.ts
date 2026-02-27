import { GRAVITY, MAX_FALL_SPEED, TILE_SIZE } from '../constants/physics';

export interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
}

export interface PhysicsResult {
  grounded: boolean;
  wallLeft: boolean;
  wallRight: boolean;
  hitCeiling: boolean;
  onPlatform: boolean;
}

/** Check if tile at grid position is solid */
function isSolid(grid: number[], gx: number, gy: number, levelWidth: number, levelHeight: number): boolean {
  if (gx < 0 || gx >= levelWidth || gy < 0 || gy >= levelHeight) {
    // Out of bounds: sides and bottom are solid, top is not
    return gy >= 0;
  }
  const tile = grid[gy * levelWidth + gx];
  return tile > 0 && tile < 100; // tiles 1-99 are solid, 100+ are platforms
}

/** Check if tile is a one-way platform */
function isPlatform(grid: number[], gx: number, gy: number, levelWidth: number, levelHeight: number): boolean {
  if (gx < 0 || gx >= levelWidth || gy < 0 || gy >= levelHeight) return false;
  const tile = grid[gy * levelWidth + gx];
  return tile >= 100 && tile < 200;
}

/**
 * Apply gravity and resolve collisions with tilemap.
 * Uses X-then-Y axis separation for clean corner handling.
 */
export function moveAndCollide(
  body: PhysicsBody,
  dt: number,
  grid: number[],
  levelWidth: number,
  levelHeight: number,
  gravityScale: number = 1.0,
  dropThrough: boolean = false,
): PhysicsResult {
  const result: PhysicsResult = {
    grounded: false,
    wallLeft: false,
    wallRight: false,
    hitCeiling: false,
    onPlatform: false,
  };

  // Apply gravity
  body.vy += GRAVITY * gravityScale * dt;
  if (body.vy > MAX_FALL_SPEED) body.vy = MAX_FALL_SPEED;

  // --- Move X axis ---
  body.x += body.vx * dt;

  // Resolve X collisions
  const xLeft = Math.floor(body.x / TILE_SIZE);
  const xRight = Math.floor((body.x + body.width - 1) / TILE_SIZE);
  const yTop = Math.floor(body.y / TILE_SIZE);
  const yBot = Math.floor((body.y + body.height - 1) / TILE_SIZE);

  for (let gy = yTop; gy <= yBot; gy++) {
    for (let gx = xLeft; gx <= xRight; gx++) {
      if (!isSolid(grid, gx, gy, levelWidth, levelHeight)) continue;

      const tileLeft = gx * TILE_SIZE;
      const tileRight = tileLeft + TILE_SIZE;

      // Check overlap
      if (body.x + body.width > tileLeft && body.x < tileRight &&
          body.y + body.height > gy * TILE_SIZE && body.y < (gy + 1) * TILE_SIZE) {
        if (body.vx > 0) {
          body.x = tileLeft - body.width;
          body.vx = 0;
          result.wallRight = true;
        } else if (body.vx < 0) {
          body.x = tileRight;
          body.vx = 0;
          result.wallLeft = true;
        }
      }
    }
  }

  // --- Move Y axis ---
  const prevY = body.y;
  body.y += body.vy * dt;

  // Resolve Y collisions
  const yLeft2 = Math.floor(body.x / TILE_SIZE);
  const yRight2 = Math.floor((body.x + body.width - 1) / TILE_SIZE);
  const yTop2 = Math.floor(body.y / TILE_SIZE);
  const yBot2 = Math.floor((body.y + body.height - 1) / TILE_SIZE);

  for (let gy = yTop2; gy <= yBot2; gy++) {
    for (let gx = yLeft2; gx <= yRight2; gx++) {
      const solid = isSolid(grid, gx, gy, levelWidth, levelHeight);
      const platform = isPlatform(grid, gx, gy, levelWidth, levelHeight);

      if (!solid && !platform) continue;

      const tileTop = gy * TILE_SIZE;
      const tileBottom = tileTop + TILE_SIZE;

      // Check overlap
      if (body.x + body.width > gx * TILE_SIZE && body.x < (gx + 1) * TILE_SIZE &&
          body.y + body.height > tileTop && body.y < tileBottom) {

        if (platform) {
          // One-way platform: only collide when falling and feet were above platform
          if (dropThrough) continue;
          const prevBottom = prevY + body.height;
          if (body.vy > 0 && prevBottom <= tileTop + 2) {
            body.y = tileTop - body.height;
            body.vy = 0;
            result.grounded = true;
            result.onPlatform = true;
          }
        } else if (solid) {
          if (body.vy > 0) {
            body.y = tileTop - body.height;
            body.vy = 0;
            result.grounded = true;
          } else if (body.vy < 0) {
            body.y = tileBottom;
            body.vy = 0;
            result.hitCeiling = true;
          }
        }
      }
    }
  }

  return result;
}

/** Simple AABB overlap test */
export function aabbOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** Check for ledge above a wall contact point */
export function checkLedge(
  body: PhysicsBody,
  wallSide: 'left' | 'right',
  grid: number[],
  levelWidth: number,
  levelHeight: number,
): { found: boolean; ledgeY: number } {
  const checkX = wallSide === 'right'
    ? Math.floor((body.x + body.width + 2) / TILE_SIZE)
    : Math.floor((body.x - 2) / TILE_SIZE);

  const bodyTopTile = Math.floor(body.y / TILE_SIZE);

  // Check if the tile at body-top level is empty (space to grab)
  // and the tile below it is solid (the ledge)
  if (!isSolid(grid, checkX, bodyTopTile, levelWidth, levelHeight) &&
      isSolid(grid, checkX, bodyTopTile + 1, levelWidth, levelHeight)) {
    return {
      found: true,
      ledgeY: (bodyTopTile + 1) * TILE_SIZE - body.height,
    };
  }

  return { found: false, ledgeY: 0 };
}
