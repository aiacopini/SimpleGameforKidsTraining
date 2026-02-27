import { EntityState, Facing } from '../../types';
import { COLORS } from '../../constants/game';
import {
  outlinedRect, outlinedEllipse, celShadedRect, drawEyes,
} from './CharacterBase';

/** NPC color schemes by npcType */
const NPC_PALETTES: Record<string, {
  robeLight: string; robeShadow: string;
  hoodLight: string; hoodShadow: string;
  accent: string;
}> = {
  librarian: {
    robeLight: '#3a5a8a', robeShadow: '#2a3a5a',
    hoodLight: '#4a6a9a', hoodShadow: '#2a4a6a',
    accent: '#c9a030',
  },
  merchant: {
    robeLight: '#8a6a30', robeShadow: '#5a4a20',
    hoodLight: '#a08040', hoodShadow: '#6a5030',
    accent: '#c9a030',
  },
  guard: {
    robeLight: '#5a3030', robeShadow: '#3a1a1a',
    hoodLight: '#6a4040', hoodShadow: '#4a2020',
    accent: '#a0a0a0',
  },
  mystic: {
    robeLight: '#5a3a7a', robeShadow: '#3a2050',
    hoodLight: '#6a4a8a', hoodShadow: '#4a2a60',
    accent: '#9a6aff',
  },
};

const DEFAULT_PALETTE = NPC_PALETTES.librarian;

/**
 * Procedurally draws an NPC character.
 * Robed figure with hood — different color schemes per npcType.
 */
export function drawNPC(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  state: EntityState, frame: number, facing: Facing,
  progress: number, npcType: string, showInteractHint: boolean,
) {
  const palette = NPC_PALETTES[npcType] ?? DEFAULT_PALETTE;
  const dir = facing === 'right' ? 1 : -1;

  ctx.save();

  // Character center-bottom anchor (28x48 hitbox)
  const cx = x + 14;
  const bottom = y + 48;

  ctx.translate(cx, bottom);
  ctx.scale(dir, 1);
  ctx.translate(0, -48);

  const breathe = (state === 'idle') ? Math.sin(Date.now() / 700) * 0.5 : 0;
  const talkBob = (state === 'talk') ? Math.sin(progress * Math.PI * 2) * 1.5 : 0;

  // === ROBE (body) ===
  // Robe flows wider at bottom
  ctx.beginPath();
  ctx.moveTo(-8, 18);
  ctx.lineTo(-11, 46 + breathe);
  ctx.lineTo(11, 46 + breathe);
  ctx.lineTo(8, 18);
  ctx.closePath();
  ctx.fillStyle = palette.robeLight;
  ctx.fill();
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Robe shadow side
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(0, 46 + breathe);
  ctx.lineTo(-11, 46 + breathe);
  ctx.lineTo(-8, 18);
  ctx.closePath();
  ctx.fillStyle = palette.robeShadow;
  ctx.fill();

  // Belt / sash
  outlinedRect(ctx, -8, 28, 16, 3, palette.accent);

  // === ARMS / SLEEVES ===
  const armY = 20 + talkBob;
  // Back sleeve
  ctx.beginPath();
  ctx.moveTo(-8, armY);
  ctx.lineTo(-12, armY + 12);
  ctx.lineTo(-6, armY + 14);
  ctx.lineTo(-5, armY + 4);
  ctx.closePath();
  ctx.fillStyle = palette.robeShadow;
  ctx.fill();
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Front sleeve (gesture when talking)
  const gestureAngle = (state === 'talk') ? Math.sin(progress * Math.PI * 2) * 0.3 : 0;
  ctx.save();
  ctx.translate(8, armY);
  ctx.rotate(gestureAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(4, 12);
  ctx.lineTo(-2, 14);
  ctx.lineTo(-3, 4);
  ctx.closePath();
  ctx.fillStyle = palette.robeLight;
  ctx.fill();
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Hand
  outlinedRect(ctx, 1, 12, 4, 4, COLORS.SKIN_LIGHT);
  ctx.restore();

  // === HEAD ===
  const headY = 6 + talkBob;

  // Hood (back)
  outlinedEllipse(ctx, 0, headY + 6, 9, 10, palette.hoodShadow);

  // Face
  outlinedEllipse(ctx, 0, headY + 7, 7, 8, COLORS.SKIN_LIGHT);

  // Hood (top)
  ctx.beginPath();
  ctx.ellipse(0, headY + 3, 9, 7, 0, Math.PI, 0);
  ctx.fillStyle = palette.hoodLight;
  ctx.fill();
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hood point
  ctx.beginPath();
  ctx.moveTo(-2, headY - 3);
  ctx.lineTo(0, headY - 6);
  ctx.lineTo(2, headY - 3);
  ctx.closePath();
  ctx.fillStyle = palette.hoodLight;
  ctx.fill();
  ctx.strokeStyle = COLORS.OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Eyes
  drawEyes(ctx, 0, headY + 7, 'right', '#ffffff', '#2a2a4a');

  // Mouth — open when talking
  if (state === 'talk') {
    const mouthOpen = Math.abs(Math.sin(progress * Math.PI * 4)) * 2;
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(-1, headY + 11, 3, mouthOpen + 1);
  }

  // === BOOK (librarian) or ITEM (merchant) ===
  if (npcType === 'librarian') {
    // Small book in hand area
    outlinedRect(ctx, -14, armY + 8, 6, 8, '#6a4030');
    outlinedRect(ctx, -14, armY + 8, 6, 1, palette.accent);
  } else if (npcType === 'merchant') {
    // Small pouch
    outlinedRect(ctx, -14, armY + 10, 5, 5, '#8a6a30');
  }

  ctx.restore();

  // === INTERACT HINT (drawn in world space, not flipped) ===
  if (showInteractHint) {
    const hintY = y - 12 + Math.sin(Date.now() / 400) * 3;
    const hintX = x + 14;

    // Background circle
    ctx.beginPath();
    ctx.arc(hintX, hintY, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
    ctx.fill();
    ctx.strokeStyle = COLORS.GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();

    // "E" letter
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', hintX, hintY);
  }
}
