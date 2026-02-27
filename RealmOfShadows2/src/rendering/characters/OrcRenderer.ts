import { EntityState, Facing } from '../../types';
import { COLORS } from '../../constants/game';
import {
  outlinedRect, outlinedEllipse,
  celShadedRect, drawEyes, squashStretch, drawTriangle,
} from './CharacterBase';

/**
 * Procedurally draws the Orc enemy.
 * Bulky, brown-green skin, crude leather armor, tusks.
 * Character size: 28x44
 */
export function drawOrc(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  state: EntityState, frame: number, facing: Facing,
  progress: number, hp: number, maxHp: number,
) {
  ctx.save();
  const dir = facing === 'right' ? 1 : -1;
  const ss = squashStretch(state, frame, progress);
  const cx = x + 14;
  const bottom = y + 44;

  ctx.translate(cx, bottom);
  ctx.scale(dir, 1);
  ctx.scale(ss.sx, ss.sy);
  ctx.translate(0, -44);

  const runBob = state === 'run' ? Math.sin(progress * Math.PI * 2) * 2 : 0;
  const breathe = state === 'idle' ? Math.sin(Date.now() / 800) * 0.5 : 0;

  // === LEGS ===
  const legY = 30;
  if (state === 'run') {
    const legPhase = progress * Math.PI * 2;
    outlinedRect(ctx, -5 + Math.sin(legPhase + Math.PI) * 4, legY, 7, 12, COLORS.ORC_ARMOR);
    outlinedRect(ctx, 2 + Math.sin(legPhase) * 4, legY, 7, 12, COLORS.ORC_ARMOR);
  } else {
    outlinedRect(ctx, -5, legY, 7, 12 + breathe, COLORS.ORC_ARMOR);
    outlinedRect(ctx, 2, legY, 7, 12 + breathe, COLORS.ORC_ARMOR);
  }

  // === BOOTS ===
  if (state === 'run') {
    const legPhase = progress * Math.PI * 2;
    outlinedRect(ctx, -6 + Math.sin(legPhase + Math.PI) * 4, 40, 9, 4, '#3a2a1a');
    outlinedRect(ctx, 1 + Math.sin(legPhase) * 4, 40, 9, 4, '#3a2a1a');
  } else {
    outlinedRect(ctx, -6, 40 + breathe, 9, 4, '#3a2a1a');
    outlinedRect(ctx, 1, 40 + breathe, 9, 4, '#3a2a1a');
  }

  // === BODY ===
  celShadedRect(ctx, -9, 14 + runBob, 18, 16, COLORS.ORC_SKIN_LIGHT, COLORS.ORC_SKIN_SHADOW, 'right');
  // Crude leather vest
  outlinedRect(ctx, -7, 16 + runBob, 14, 12, COLORS.ORC_ARMOR);
  // Belt
  outlinedRect(ctx, -8, 28 + runBob, 16, 3, '#4a3a20');

  // === ARMS ===
  const armY = 16 + runBob;
  if (state === 'attack') {
    // Swing arm
    ctx.save();
    ctx.translate(8, armY + 4);
    const swing = Math.sin(progress * Math.PI) * 60 - 30;
    ctx.rotate((swing * Math.PI) / 180);
    outlinedRect(ctx, 0, -3, 14, 7, COLORS.ORC_SKIN_LIGHT);
    // Club/axe
    outlinedRect(ctx, 12, -6, 5, 16, '#5a4030');
    outlinedRect(ctx, 10, -8, 9, 5, '#7a7a8a'); // axe head
    ctx.restore();
    outlinedRect(ctx, -12, armY, 6, 12, COLORS.ORC_SKIN_SHADOW);
  } else {
    const armSwing = state === 'run' ? Math.sin(progress * Math.PI * 2) * 5 : 0;
    outlinedRect(ctx, -12, armY - armSwing, 6, 12, COLORS.ORC_SKIN_SHADOW);
    outlinedRect(ctx, 8, armY + armSwing, 6, 12, COLORS.ORC_SKIN_LIGHT);
  }

  // === HEAD ===
  const headY = 2 + runBob;
  // Head (larger, brutish)
  outlinedEllipse(ctx, 0, headY + 7, 9, 9, COLORS.ORC_SKIN_LIGHT);

  // Brow ridge
  ctx.fillStyle = COLORS.ORC_SKIN_SHADOW;
  ctx.fillRect(-7, headY + 3, 14, 4);

  // Eyes (angry)
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(2, headY + 5, 4, 3);
  ctx.fillRect(-4, headY + 5, 4, 3);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(3, headY + 6, 2, 2);
  ctx.fillRect(-3, headY + 6, 2, 2);

  // Tusks
  drawTriangle(ctx, -3, headY + 12, -5, headY + 8, -1, headY + 10,
    '#d8d0c0', COLORS.OUTLINE, 1.5);
  drawTriangle(ctx, 3, headY + 12, 1, headY + 10, 5, headY + 8,
    '#d8d0c0', COLORS.OUTLINE, 1.5);

  // Jaw
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, headY + 12);
  ctx.lineTo(0, headY + 13);
  ctx.lineTo(4, headY + 12);
  ctx.stroke();

  // HP bar (above head)
  if (hp < maxHp) {
    const barW = 24;
    const barH = 3;
    ctx.fillStyle = COLORS.HP_EMPTY;
    ctx.fillRect(-barW / 2, -4, barW, barH);
    ctx.fillStyle = COLORS.HP_FULL;
    ctx.fillRect(-barW / 2, -4, barW * (hp / maxHp), barH);
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW / 2, -4, barW, barH);
  }

  ctx.restore();
}
