export const TILE_SIZE = 48;

// Gravity & movement
export const GRAVITY = 980;
export const MAX_FALL_SPEED = 600;
export const RUN_SPEED = 200;
export const RUN_ACCEL = 1200;   // pixels/s² — acceleration curve
export const RUN_DECEL = 1800;   // pixels/s² — deceleration curve (snappier stop)
export const AIR_ACCEL = 800;    // reduced control in air
export const AIR_DECEL = 400;

// Jumping
export const JUMP_VELOCITY = -420;
export const JUMP_HOLD_GRAVITY = 400;   // reduced gravity while holding jump (variable height)
export const JUMP_RELEASE_GRAVITY = 1400; // increased gravity on release (snappy fall)
export const COYOTE_TIME = 0.15;         // seconds after leaving ground where jump still works
export const JUMP_BUFFER_TIME = 0.1;     // seconds before landing where jump input is remembered

// Wall interactions
export const WALL_SLIDE_SPEED = 80;      // max speed sliding down wall
export const WALL_JUMP_VELOCITY_X = 280; // horizontal kick off wall
export const WALL_JUMP_VELOCITY_Y = -380;
export const WALL_STICK_TIME = 0.1;      // brief stick to wall before sliding

// Ledge grab
export const LEDGE_GRAB_RANGE = 12;      // pixels above platform edge to trigger grab
export const LEDGE_CLIMB_DURATION = 0.3; // seconds to climb up

// Roll / dodge
export const ROLL_SPEED = 350;
export const ROLL_DURATION = 0.35;       // seconds
export const ROLL_COOLDOWN = 0.5;
export const ROLL_IFRAMES = 0.3;         // i-frame duration within roll

// Combat
export const ATTACK_DURATION = 0.35;
export const ATTACK_COOLDOWN = 0.15;
export const HURT_DURATION = 0.3;
export const HURT_KNOCKBACK = 200;
export const IFRAMES_AFTER_HURT = 1.0;
export const PLAYER_MAX_HP = 5;
export const PLAYER_ATTACK_DAMAGE = 1;
export const ATTACK_RANGE = 40;
export const ATTACK_WIDTH = 36;
export const ATTACK_HEIGHT = 40;
