import { AnimationMap } from '../engine/AnimationSystem';

/** Player animation definitions */
export const PLAYER_ANIMATIONS: AnimationMap = {
  idle:        { frames: 4, duration: 0.8, loop: true },
  run:         { frames: 6, duration: 0.5, loop: true },
  jump:        { frames: 2, duration: 0.3, loop: false },
  fall:        { frames: 2, duration: 0.4, loop: true },
  land:        { frames: 2, duration: 0.15, loop: false },
  'wall-slide':{ frames: 2, duration: 0.4, loop: true },
  'wall-jump': { frames: 2, duration: 0.2, loop: false },
  'ledge-grab':{ frames: 1, duration: 0.1, loop: false },
  'ledge-climb':{ frames: 3, duration: 0.3, loop: false, locked: true },
  attack:      { frames: 4, duration: 0.35, loop: false, locked: true },
  'attack-air':{ frames: 3, duration: 0.3, loop: false, locked: true },
  roll:        { frames: 4, duration: 0.35, loop: false, locked: true },
  hurt:        { frames: 2, duration: 0.3, loop: false, locked: true },
  die:         { frames: 4, duration: 0.6, loop: false, locked: true },
};

/** Orc animation definitions */
export const ORC_ANIMATIONS: AnimationMap = {
  idle:    { frames: 4, duration: 1.0, loop: true },
  run:     { frames: 4, duration: 0.5, loop: true },
  attack:  { frames: 4, duration: 0.5, loop: false, locked: true },
  hurt:    { frames: 2, duration: 0.3, loop: false, locked: true },
  die:     { frames: 4, duration: 0.6, loop: false, locked: true },
};

/** Orc Shaman animation definitions */
export const ORC_SHAMAN_ANIMATIONS: AnimationMap = {
  idle:    { frames: 4, duration: 1.2, loop: true },
  run:     { frames: 4, duration: 0.6, loop: true },
  attack:  { frames: 4, duration: 0.7, loop: false, locked: true },
  hurt:    { frames: 2, duration: 0.3, loop: false, locked: true },
  die:     { frames: 4, duration: 0.6, loop: false, locked: true },
};

/** Skeleton Guard animation definitions */
export const SKELETON_GUARD_ANIMATIONS: AnimationMap = {
  idle:    { frames: 4, duration: 1.0, loop: true },
  run:     { frames: 4, duration: 0.5, loop: true },
  attack:  { frames: 4, duration: 0.55, loop: false, locked: true },
  hurt:    { frames: 2, duration: 0.3, loop: false, locked: true },
  die:     { frames: 5, duration: 0.8, loop: false, locked: true },
};
