import { EntityState, Facing } from '../../types';
import { COLORS } from '../../constants/game';
import {
  outlinedRect, outlinedEllipse, outlinedCircle,
  squashStretch,
} from './CharacterBase';

/**
 * Procedurally draws the Skeleton Guard.
 * Bony, tattered armor, shield, sword.
 * Character size: 24x48
 */
export function drawSkeletonGuard(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  state: EntityState, frame: number, facing: Facing,
  progress: number, hp: number, maxHp: number,
) {
  ctx.save();
  const dir = facing === 'right' ? 1 : -1;
  const ss = squashStretch(state, frame, progress);
  const cx = x + 12;
  const bottom = y + 48;

  ctx.translate(cx, bottom);
  ctx.scale(dir, 1);
  ctx.scale(ss.sx, ss.sy);
  ctx.translate(0, -48);

  const runBob = state === 'run' ? Math.sin(progress * Math.PI * 2) * 2 : 0;
  const breathe = state === 'idle' ? Math.sin(Date.now() / 700) * 0.3 : 0;
  const rattle = state === 'idle' ? Math.sin(Date.now() / 200) * 0.5 : 0;

  // === LEGS (bone) ===
  const legY = 32;
  if (state === 'run') {
    const legPhase = progress * Math.PI * 2;
    // Thigh bones
    outlinedRect(ctx, -3 + Math.sin(legPhase + Math.PI) * 3, legY, 3, 10, COLORS.SKELETON_BONE);
    outlinedRect(ctx, 2 + Math.sin(legPhase) * 3, legY, 3, 10, COLORS.SKELETON_BONE);
  } else {
    outlinedRect(ctx, -3, legY, 3, 10 + breathe, COLORS.SKELETON_BONE);
    outlinedRect(ctx, 2, legY, 3, 10 + breathe, COLORS.SKELETON_BONE);
  }

  // Feet
  outlinedRect(ctx, -4, 42, 5, 4, COLORS.SKELETON_SHADOW);
  outlinedRect(ctx, 1, 42, 5, 4, COLORS.SKELETON_SHADOW);

  // === RIBCAGE / TORSO ===
  // Spine
  outlinedRect(ctx, -1, 14 + runBob, 3, 18, COLORS.SKELETON_SHADOW);
  // Ribs
  for (let i = 0; i < 4; i++) {
    const ribY = 16 + i * 4 + runBob + rattle;
    ctx.strokeStyle = COLORS.SKELETON_BONE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, ribY);
    ctx.quadraticCurveTo(-6, ribY + 1, -7, ribY + 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1, ribY);
    ctx.quadraticCurveTo(7, ribY + 1, 8, ribY + 3);
    ctx.stroke();
  }

  // Tattered armor remnants
  ctx.fillStyle = '#3a3a4a';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(-6, 18 + runBob, 4, 10);
  ctx.fillRect(4, 20 + runBob, 3, 8);
  ctx.globalAlpha = 1;

  // Pelvis
  outlinedEllipse(ctx, 0, 32 + runBob, 6, 3, COLORS.SKELETON_SHADOW);

  // === SHIELD ARM (left side in character-local space) ===
  // Arm bone
  outlinedRect(ctx, -10, 16 + runBob, 3, 14, COLORS.SKELETON_BONE);
  // Shield
  ctx.fillStyle = '#4a4a5a';
  ctx.beginPath();
  ctx.moveTo(-14, 14 + runBob);
  ctx.lineTo(-8, 12 + runBob);
  ctx.lineTo(-6, 28 + runBob);
  ctx.lineTo(-14, 30 + runBob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Shield emblem
  ctx.fillStyle = '#6a6a7a';
  outlinedCircle(ctx, -10, 21 + runBob, 3, '#6a6a7a');

  // === SWORD ARM (right side) ===
  const armY = 16 + runBob;
  if (state === 'attack') {
    ctx.save();
    ctx.translate(6, armY + 4);
    const swing = Math.sin(progress * Math.PI) * 50 - 25;
    ctx.rotate((swing * Math.PI) / 180);
    outlinedRect(ctx, 0, -2, 12, 3, COLORS.SKELETON_BONE);
    // Sword
    outlinedRect(ctx, 10, -1, 3, 6, '#6a5a3a'); // handle
    ctx.beginPath();
    ctx.moveTo(11, -1);
    ctx.lineTo(11.5, -18);
    ctx.lineTo(12, -1);
    ctx.closePath();
    ctx.fillStyle = '#9a9ab0';
    ctx.fill();
    ctx.strokeStyle = COLORS.OUTLINE;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  } else {
    outlinedRect(ctx, 7, armY, 3, 12, COLORS.SKELETON_BONE);
    // Sword at side
    outlinedRect(ctx, 9, armY + 8, 2, 14, '#9a9ab0');
  }

  // === SKULL ===
  const headY = 2 + runBob + rattle;
  // Skull
  outlinedEllipse(ctx, 0, headY + 6, 7, 8, COLORS.SKELETON_BONE);

  // Eye sockets (dark)
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(-3, headY + 5, 3, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(3, headY + 5, 3, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eerie eye glow
  ctx.fillStyle = '#40ff60';
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#40ff60';
  ctx.fillRect(-3, headY + 5, 2, 2);
  ctx.fillRect(2, headY + 5, 2, 2);
  ctx.shadowBlur = 0;

  // Nose hole
  ctx.fillStyle = '#1a1a2e';
  drawTriangleSmall(ctx, 0, headY + 9, 3);

  // Jaw
  ctx.strokeStyle = COLORS.SKELETON_SHADOW;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-5, headY + 12);
  ctx.lineTo(-4, headY + 14);
  ctx.lineTo(4, headY + 14);
  ctx.lineTo(5, headY + 12);
  ctx.stroke();
  // Teeth
  ctx.fillStyle = COLORS.SKELETON_BONE;
  for (let i = -3; i <= 3; i += 2) {
    ctx.fillRect(i, headY + 12, 1.5, 2);
  }

  // Helmet remnant
  ctx.strokeStyle = '#4a4a5a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, headY + 4, 8, Math.PI + 0.3, -0.3);
  ctx.stroke();

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

function drawTriangleSmall(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx - size * 0.7, cy + size * 0.5);
  ctx.lineTo(cx + size * 0.7, cy + size * 0.5);
  ctx.closePath();
  ctx.fill();
}
