export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const MAX_DT = 1 / 30;       // clamp delta time to prevent spiral
export const FIXED_DT = 1 / 60;     // fixed timestep for physics
export const MAX_ENTITIES = 64;
export const MAX_PARTICLES = 500;

// Camera
export const CAMERA_LERP = 5.0;     // smoothing factor (higher = snappier)
export const CAMERA_LOOK_AHEAD = 60; // pixels ahead in facing direction
export const CAMERA_DEAD_ZONE_X = 20;
export const CAMERA_DEAD_ZONE_Y = 30;

// Colors — procedural art palette
export const COLORS = {
  // Environment
  OUTLINE: '#1a1a2e',
  STONE_DARK: '#2a2a3a',
  STONE_MID: '#3a3a4e',
  STONE_LIGHT: '#4a4a5e',
  MOSS: '#2a4a2a',
  TORCH_FLAME: '#e8a030',
  TORCH_GLOW: '#c98020',

  // Player (Elf Ranger)
  CLOAK_LIGHT: '#2a6b30',
  CLOAK_SHADOW: '#1a4a20',
  ARMOR_LIGHT: '#6a5040',
  ARMOR_SHADOW: '#4a3528',
  SKIN_LIGHT: '#e8c8a0',
  SKIN_SHADOW: '#c8a878',
  HAIR_LIGHT: '#c8a040',
  HAIR_SHADOW: '#a08030',
  EYE: '#4a8fa5',

  // Enemies
  ORC_SKIN_LIGHT: '#5a8040',
  ORC_SKIN_SHADOW: '#3a5828',
  ORC_ARMOR: '#6a4a30',
  SKELETON_BONE: '#d8d0c0',
  SKELETON_SHADOW: '#a89870',
  SHAMAN_MAGIC: '#6a40a0',

  // Effects
  HIT_SPARK: '#ffffff',
  BLOOD: '#8b1a1a',
  MAGIC_BLUE: '#4a6fa5',
  GOLD: '#c9a030',
  POISON_GREEN: '#3a6b35',
  FIRE_ORANGE: '#e87020',

  // UI
  HP_FULL: '#c43030',
  HP_EMPTY: '#2a1a1a',
  DAMAGE_TEXT: '#ff4444',
} as const;
