import { COLORS } from '../../constants/game';

/**
 * Shared procedural drawing utilities for characters.
 * All characters use bold 2-3px outlines, cel-shaded flat fills.
 */

/** Draw a rectangle with bold outline */
export function outlinedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill: string, outline = COLORS.OUTLINE, lineWidth = 2,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = outline;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, w, h);
}

/** Draw a circle with bold outline */
export function outlinedCircle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  fill: string, outline: string = COLORS.OUTLINE, lineWidth = 2,
) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/** Draw an ellipse with bold outline */
export function outlinedEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number,
  fill: string, outline = COLORS.OUTLINE, lineWidth = 2,
) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/** Draw a rounded rectangle with bold outline */
export function outlinedRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  fill: string, outline = COLORS.OUTLINE, lineWidth = 2,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/** Apply cel-shading split: left/right or top/bottom halves in different tones */
export function celShadedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  lightColor: string, shadowColor: string,
  facing: 'left' | 'right',
  outline = COLORS.OUTLINE, lineWidth = 2,
) {
  const halfW = w / 2;
  // Light side faces the facing direction, shadow on opposite
  if (facing === 'right') {
    ctx.fillStyle = lightColor;
    ctx.fillRect(x, y, halfW, h);
    ctx.fillStyle = shadowColor;
    ctx.fillRect(x + halfW, y, halfW, h);
  } else {
    ctx.fillStyle = shadowColor;
    ctx.fillRect(x, y, halfW, h);
    ctx.fillStyle = lightColor;
    ctx.fillRect(x + halfW, y, halfW, h);
  }
  ctx.strokeStyle = outline;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, w, h);
}

/** Draw simple dot eyes */
export function drawEyes(
  ctx: CanvasRenderingContext2D,
  headCx: number, headCy: number,
  facing: 'left' | 'right',
  eyeColor = '#ffffff',
  pupilColor = '#1a1a2e',
) {
  const dir = facing === 'right' ? 1 : -1;
  const eyeOffsetX = 3 * dir;
  const eyeSpacing = 4;

  // White of eye
  ctx.fillStyle = eyeColor;
  ctx.fillRect(headCx + eyeOffsetX - 2, headCy - 2, 4, 3);
  ctx.fillRect(headCx + eyeOffsetX - 2 + eyeSpacing * dir, headCy - 2, 4, 3);

  // Pupils
  ctx.fillStyle = pupilColor;
  ctx.fillRect(headCx + eyeOffsetX - 1 + dir, headCy - 1, 2, 2);
  ctx.fillRect(headCx + eyeOffsetX - 1 + dir + eyeSpacing * dir, headCy - 1, 2, 2);
}

/** Squash & stretch helper: returns scale factors based on animation state */
export function squashStretch(state: string, frame: number, progress: number): { sx: number; sy: number } {
  switch (state) {
    case 'jump':
      if (progress < 0.2) return { sx: 0.85, sy: 1.2 }; // anticipation stretch
      return { sx: 0.95, sy: 1.05 };
    case 'land':
      if (progress < 0.3) return { sx: 1.2, sy: 0.8 }; // landing squash
      return { sx: 1.0 + (1 - progress) * 0.1, sy: 1.0 - (1 - progress) * 0.1 };
    case 'attack':
      if (progress < 0.3) return { sx: 0.9, sy: 1.1 }; // wind-up
      if (progress < 0.5) return { sx: 1.15, sy: 0.9 }; // strike
      return { sx: 1.0, sy: 1.0 };
    case 'hurt':
      return { sx: 1.1, sy: 0.9 };
    default:
      return { sx: 1.0, sy: 1.0 };
  }
}

/** Draw a simple triangle (for ears, weapon tips, etc.) */
export function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  fill: string, outline = COLORS.OUTLINE, lineWidth = 2,
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}
