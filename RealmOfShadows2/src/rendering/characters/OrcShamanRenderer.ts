import { EntityState, Facing } from '../../types';
import { COLORS } from '../../constants/game';
import {
  outlinedRect, outlinedEllipse, outlinedCircle,
  celShadedRect, squashStretch, drawTriangle,
} from './CharacterBase';

/**
 * Procedurally draws the Orc Shaman.
 * Robed, staff-wielding, purple magic aura.
 * Character size: 28x48
 */
export function drawOrcShaman(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  state: EntityState, frame: number, facing: Facing,
  progress: number, hp: number, maxHp: number,
) {
  ctx.save();
  const dir = facing === 'right' ? 1 : -1;
  const ss = squashStretch(state, frame, progress);
  const cx = x + 14;
  const bottom = y + 48;

  ctx.translate(cx, bottom);
  ctx.scale(dir, 1);
  ctx.scale(ss.sx, ss.sy);
  ctx.translate(0, -48);

  const runBob = state === 'run' ? Math.sin(progress * Math.PI * 2) * 1.5 : 0;
  const breathe = state === 'idle' ? Math.sin(Date.now() / 1000) * 0.5 : 0;

  // === ROBE (body) ===
  ctx.beginPath();
  ctx.moveTo(-10, 16 + runBob);
  ctx.lineTo(-12, 44);
  ctx.lineTo(12, 44);
  ctx.lineTo(10, 16 + runBob);
  ctx.closePath();
  ctx.fillStyle = '#2a1a3a';
  ctx.fill();
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Robe trim
  ctx.strokeStyle = '#6a40a0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-11, 42);
  ctx.lineTo(11, 42);
  ctx.stroke();

  // Belt with skull
  outlinedRect(ctx, -9, 28 + runBob, 18, 3, '#4a3a20');
  outlinedCircle(ctx, 0, 29 + runBob, 3, '#d8d0c0');

  // === STAFF (behind or in front based on attack) ===
  if (state === 'attack') {
    // Staff raised
    ctx.save();
    ctx.translate(6, 10 + runBob);
    ctx.rotate(-0.3 + Math.sin(progress * Math.PI) * 0.6);
    outlinedRect(ctx, -2, -20, 4, 50, '#5a4030');
    // Orb
    outlinedCircle(ctx, 0, -22, 6, COLORS.SHAMAN_MAGIC);
    // Magic glow
    ctx.globalAlpha = 0.3 + Math.sin(progress * Math.PI * 4) * 0.2;
    outlinedCircle(ctx, 0, -22, 10, COLORS.SHAMAN_MAGIC + '40', 'transparent', 0);
    ctx.globalAlpha = 1;
    ctx.restore();
  } else {
    // Staff held beside
    outlinedRect(ctx, 8, 4 + runBob, 4, 42, '#5a4030');
    outlinedCircle(ctx, 10, 2 + runBob, 5, COLORS.SHAMAN_MAGIC);
    // Subtle glow
    ctx.globalAlpha = 0.2;
    outlinedCircle(ctx, 10, 2 + runBob, 8, COLORS.SHAMAN_MAGIC + '30', 'transparent', 0);
    ctx.globalAlpha = 1;
  }

  // === ARMS ===
  const armY = 18 + runBob;
  outlinedRect(ctx, -11, armY, 5, 10, COLORS.ORC_SKIN_SHADOW);
  outlinedRect(ctx, 6, armY, 5, 10, COLORS.ORC_SKIN_LIGHT);

  // === HEAD ===
  const headY = 2 + runBob;
  // Hood
  ctx.beginPath();
  ctx.moveTo(-10, headY + 14);
  ctx.lineTo(-12, headY + 4);
  ctx.quadraticCurveTo(0, headY - 6, 12, headY + 4);
  ctx.lineTo(10, headY + 14);
  ctx.closePath();
  ctx.fillStyle = '#2a1a3a';
  ctx.fill();
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Face (visible under hood)
  outlinedEllipse(ctx, 0, headY + 9, 7, 7, COLORS.ORC_SKIN_SHADOW);

  // Glowing eyes
  ctx.fillStyle = '#8a60d0';
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#8a60d0';
  ctx.fillRect(2, headY + 7, 3, 3);
  ctx.fillRect(-4, headY + 7, 3, 3);
  ctx.shadowBlur = 0;

  // Small tusks
  drawTriangle(ctx, -2, headY + 14, -3, headY + 11, -1, headY + 12,
    '#d8d0c0', COLORS.OUTLINE, 1);
  drawTriangle(ctx, 2, headY + 14, 1, headY + 12, 3, headY + 11,
    '#d8d0c0', COLORS.OUTLINE, 1);

  // HP bar
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
