export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AABB {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type EntityState =
  | 'idle' | 'run' | 'jump' | 'fall' | 'land'
  | 'wall-slide' | 'wall-jump' | 'ledge-grab' | 'ledge-climb'
  | 'attack' | 'attack-air' | 'roll'
  | 'hurt' | 'die';

export type Facing = 'left' | 'right';

export interface AnimationDef {
  frames: number;
  duration: number; // total seconds for one cycle
  loop: boolean;
  locked?: boolean; // cannot be interrupted until complete
}

export interface TileData {
  id: number;
  solid: boolean;
  platform?: boolean; // one-way pass-through
  damage?: number;
  type: string;
}

export interface EntitySpawn {
  type: string;
  x: number;
  y: number;
  properties?: Record<string, unknown>;
}

export interface LevelData {
  name: string;
  width: number;  // in tiles
  height: number; // in tiles
  tileSize: number;
  tileset: string;
  layers: {
    background: number[];
    collision: number[];
    foreground: number[];
    decoration: number[];
  };
  entities: EntitySpawn[];
  playerStart: Vec2;
  exitZone: Rect;
  lights: LightDef[];
  backgroundType: string;
  music?: string;
}

export interface LightDef {
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  flicker?: boolean;
  flickerSpeed?: number;
  flickerAmount?: number;
}

export interface CollisionResult {
  collided: boolean;
  normal: Vec2;
  penetration: number;
  tileX?: number;
  tileY?: number;
}

export interface GameContext {
  dt: number;
  input: InputState;
  collisionGrid: number[];
  levelWidth: number;
  levelHeight: number;
  tileSize: number;
  entities: BaseEntityData[];
  camera: Vec2;
  addParticle?: (preset: string, x: number, y: number, opts?: Record<string, unknown>) => void;
  addDamageNumber?: (x: number, y: number, amount: number, color?: string) => void;
  screenShake?: (intensity: number, duration: number) => void;
  hitFreeze?: (duration: number) => void;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  attack: boolean;
  attackJustPressed: boolean;
  roll: boolean;
  rollJustPressed: boolean;
  interact: boolean;
  interactJustPressed: boolean;
  pause: boolean;
  pauseJustPressed: boolean;
}

export interface BaseEntityData {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  facing: Facing;
  state: EntityState;
  hp?: number;
  maxHp?: number;
  team?: 'player' | 'enemy' | 'neutral';
}
