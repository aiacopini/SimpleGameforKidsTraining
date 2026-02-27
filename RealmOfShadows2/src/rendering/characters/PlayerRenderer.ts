import { EntityState, Facing } from '../../types';
import { COLORS } from '../../constants/game';
import {
  outlinedRect, outlinedCircle, outlinedEllipse,
  celShadedRect, drawEyes, squashStretch, drawTriangle,
} from './CharacterBase';

/**
 * Procedurally draws the Elf Ranger player character.
 * Bold vector/comic style: 2-3px outlines, cel-shaded fills, strong silhouette.
 * Character size: 24x48 logical (fits in 24px wide, 48px tall)
 */
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  state: EntityState, frame: number, facing: Facing,
  progress: number, iframes: number,
) {
  // I-frames blink effect
  if (iframes > 0 && Math.floor(iframes * 15) % 2 === 0) return;

  ctx.save();

  const dir = facing === 'right' ? 1 : -1;

  // Squash & stretch
  const ss = squashStretch(state, frame, progress);

  // Character center-bottom as anchor
  const cx = x + 12;
  const bottom = y + 48;

  ctx.translate(cx, bottom);
  ctx.scale(dir, 1); // flip for facing
  ctx.scale(ss.sx, ss.sy);
  ctx.translate(0, -48); // move origin to top

  // Animation offsets
  const runBob = (state === 'run') ? Math.sin(progress * Math.PI * 2) * 2 : 0;
  const breathe = (state === 'idle') ? Math.sin(Date.now() / 600) * 0.5 : 0;
  const attackSwing = (state === 'attack' || state === 'attack-air')
    ? Math.sin(progress * Math.PI) * 40 - 20 : 0;

  // === CLOAK (back layer) ===
  if (state !== 'roll') {
    ctx.save();
    const cloakSway = (state === 'run') ? Math.sin(progress * Math.PI * 2 + 1) * 3 : breathe;
    ctx.beginPath();
    ctx.moveTo(-6, 16);
    ctx.lineTo(-8 + cloakSway, 44);
    ctx.lineTo(4 + cloakSway * 0.5, 46);
    ctx.lineTo(6, 16);
    ctx.closePath();
    ctx.fillStyle = COLORS.CLOAK_SHADOW;
    ctx.fill();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // === LEGS ===
  const legY = 34;
  if (state === 'run') {
    const legPhase = progress * Math.PI * 2;
    // Back leg
    outlinedRect(ctx, -3 + Math.sin(legPhase + Math.PI) * 4, legY, 5, 12,
      COLORS.ARMOR_SHADOW);
    // Front leg
    outlinedRect(ctx, 1 + Math.sin(legPhase) * 4, legY, 5, 12,
      COLORS.ARMOR_LIGHT);
  } else if (state === 'jump' || state === 'fall' || state === 'wall-slide') {
    // Legs tucked or spread
    outlinedRect(ctx, -4, legY - 2, 5, 13, COLORS.ARMOR_SHADOW);
    outlinedRect(ctx, 2, legY + 1, 5, 11, COLORS.ARMOR_LIGHT);
  } else if (state === 'roll') {
    // Tucked ball — legs hidden
  } else {
    // Standing
    outlinedRect(ctx, -3, legY, 5, 12 + breathe, COLORS.ARMOR_SHADOW);
    outlinedRect(ctx, 2, legY, 5, 12 + breathe, COLORS.ARMOR_LIGHT);
  }

  // === BOOTS ===
  if (state !== 'roll') {
    const bootY = 44;
    if (state === 'run') {
      const legPhase = progress * Math.PI * 2;
      outlinedRect(ctx, -4 + Math.sin(legPhase + Math.PI) * 4, bootY, 7, 4, '#3a2a1a');
      outlinedRect(ctx, 0 + Math.sin(legPhase) * 4, bootY, 7, 4, '#4a3a2a');
    } else {
      outlinedRect(ctx, -4, bootY + breathe, 7, 4, '#3a2a1a');
      outlinedRect(ctx, 1, bootY + breathe, 7, 4, '#4a3a2a');
    }
  }

  // === BODY / TORSO ===
  if (state === 'roll') {
    // Roll = tucked ball
    outlinedCircle(ctx, 0, 28, 12, COLORS.CLOAK_LIGHT);
    outlinedCircle(ctx, 0, 28, 10, COLORS.ARMOR_LIGHT);
  } else {
    // Leather armor torso
    celShadedRect(ctx, -7, 16 + runBob, 14, 18, COLORS.ARMOR_LIGHT, COLORS.ARMOR_SHADOW, 'right');

    // Belt
    outlinedRect(ctx, -7, 32 + runBob, 14, 3, COLORS.GOLD);

    // Chest detail (strap)
    ctx.strokeStyle = COLORS.ARMOR_SHADOW;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, 18 + runBob);
    ctx.lineTo(0, 28 + runBob);
    ctx.lineTo(3, 18 + runBob);
    ctx.stroke();
  }

  // === ARMS ===
  if (state !== 'roll') {
    const armY = 18 + runBob;

    if (state === 'attack' || state === 'attack-air') {
      // Attack arm forward
      ctx.save();
      ctx.translate(6, armY + 4);
      ctx.rotate((attackSwing * Math.PI) / 180);
      // Arm
      outlinedRect(ctx, 0, -2, 12, 5, COLORS.SKIN_LIGHT);
      // SWORD
      drawSword(ctx, 12, -4, progress);
      ctx.restore();

      // Back arm
      outlinedRect(ctx, -9, armY, 5, 10, COLORS.SKIN_SHADOW);
    } else {
      // Arms at sides with run swing
      const armSwing = state === 'run' ? Math.sin(progress * Math.PI * 2) * 6 : 0;
      // Back arm
      outlinedRect(ctx, -9, armY - armSwing, 5, 10, COLORS.SKIN_SHADOW);
      // Front arm
      outlinedRect(ctx, 6, armY + armSwing, 5, 10, COLORS.SKIN_LIGHT);
    }
  }

  // === HEAD ===
  if (state !== 'roll') {
    const headY = 4 + runBob;

    // Hair (back)
    outlinedEllipse(ctx, 0, headY + 5, 8, 9, COLORS.HAIR_SHADOW);

    // Head
    outlinedEllipse(ctx, 0, headY + 6, 7, 8, COLORS.SKIN_LIGHT);

    // Hair (top)
    ctx.beginPath();
    ctx.ellipse(0, headY + 2, 7, 5, 0, Math.PI, 0);
    ctx.fillStyle = COLORS.HAIR_LIGHT;
    ctx.fill();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointed elf ears
    drawTriangle(ctx, -7, headY + 4, -14, headY + 1, -7, headY + 8,
      COLORS.SKIN_LIGHT, COLORS.OUTLINE, 2);
    drawTriangle(ctx, 7, headY + 4, 14, headY + 1, 7, headY + 8,
      COLORS.SKIN_LIGHT, COLORS.OUTLINE, 2);

    // Eyes
    drawEyes(ctx, 0, headY + 6, 'right', '#ffffff', COLORS.EYE);

    // Mouth - subtle line
    if (state === 'hurt') {
      ctx.strokeStyle = COLORS.OUTLINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-2, headY + 10);
      ctx.lineTo(2, headY + 11);
      ctx.stroke();
    }
  }

  // === CLOAK (front layer — shoulder cape) ===
  if (state !== 'roll') {
    ctx.beginPath();
    ctx.moveTo(-8, 14 + runBob);
    ctx.lineTo(-10, 26 + runBob);
    ctx.lineTo(-5, 24 + runBob);
    ctx.lineTo(-6, 14 + runBob);
    ctx.closePath();
    ctx.fillStyle = COLORS.CLOAK_LIGHT;
    ctx.fill();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

function drawSword(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) {
  // Sword handle
  outlinedRect(ctx, x - 1, y + 6, 4, 8, '#6a5040');
  // Cross guard
  outlinedRect(ctx, x - 3, y + 4, 8, 3, COLORS.GOLD);
  // Blade
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x + 1, y - 16);
  ctx.lineTo(x + 2, y + 4);
  ctx.closePath();
  ctx.fillStyle = '#c0c8d8';
  ctx.fill();
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Blade shine
  ctx.strokeStyle = '#e8e8f8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 2);
  ctx.lineTo(x + 1, y - 12);
  ctx.stroke();
}
