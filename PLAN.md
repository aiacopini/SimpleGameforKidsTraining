# Goku's Cloud Rider - Arcade Game Plan

## Overview
A retro pixel-art side-scrolling arcade game where Goku rides his Nimbus cloud through 3 levels of increasing difficulty. Pure HTML/CSS/JS using Canvas API - single `index.html` file, zero dependencies.

---

## Game Structure

### Core Engine (inside `index.html`)
- **Game Loop**: `requestAnimationFrame`-based 60fps loop with delta-time
- **State Machine**: Menu -> Level Intro -> Playing -> Boss Fight -> Level Complete -> Game Over / Victory
- **Canvas Rendering**: 960x540 pixel canvas, scaled to fit browser window responsively
- **Input Handler**: Keyboard controls (arrow keys + action keys), with on-screen touch controls for mobile
- **Collision System**: AABB rectangle-based collision detection
- **Camera**: Horizontal scrolling camera that follows Goku

### Controls
| Key | Action |
|-----|--------|
| Arrow Keys | Move Goku (up/down/left/right on cloud) |
| Z | Ki Blast (projectile) |
| X | Melee Attack (punch/kick combo) |
| C (hold) | Charge Kamehameha (release to fire beam) |
| V | Spirit Bomb (ultimate - requires full energy bar) |

---

## Goku & Nimbus Cloud (Player Character)

### Pixel Art Sprites (drawn via Canvas)
- Idle on cloud (animated floating)
- Moving (cloud trail effect)
- Ki blast firing pose
- Melee punch / kick (2-frame combo)
- Kamehameha charge + fire pose
- Spirit Bomb raising hands pose
- Hit/damage animation
- Death animation

### Stats
- **HP**: 100 (shown as health bar)
- **Ki Energy**: 0-100 (charges over time + from pickups; Spirit Bomb costs 100)
- **Lives**: 3

### Power-ups (dropped by enemies)
- Senzu Bean (restore HP)
- Ki Orb (restore Ki energy)
- Dragon Ball (collect for extra life)
- Speed Boost (temporary speed increase)

---

## Level Design

### Level 1: "Earth - Red Ribbon Base"
- **Setting**: Green mountains, blue sky, scattered buildings
- **Scrolling Background**: Parallax layers (far mountains, near hills, ground)
- **Regular Enemies**:
  - Red Ribbon Soldiers (walk on platforms, shoot guns) - Low HP
  - Battle Robots (fly slowly, shoot projectiles) - Medium HP
  - Ninja Assassins (fast, melee attacks) - Low HP
- **Hazards**: Missiles from off-screen, explosive barrels
- **Duration**: ~90 seconds of scrolling before boss
- **Boss: Giant Mech Robot** (~3x Goku's size)
  - Attacks: Rocket barrage, laser beam sweep, ground pound
  - Weak point: Glowing chest core (flashes when vulnerable)
  - HP: 300

### Level 2: "Namek - Frieza's Domain"
- **Setting**: Green sky, blue-green terrain, Namekian villages, Dragon Balls scattered in background
- **Scrolling Background**: Parallax (alien sky, rock formations, ground with craters)
- **Regular Enemies**:
  - Frieza Soldiers (fly and shoot Ki blasts) - Medium HP
  - Dodoria-type brutes (charge at Goku) - High HP
  - Ginyu Pose Strikers (appear in groups, coordinated attacks) - Medium HP
- **Hazards**: Exploding Namekian terrain, energy storms
- **Duration**: ~120 seconds of scrolling before boss
- **Boss: Giant Alien Tyrant** (~5x Goku's size)
  - Attacks: Death beam barrage, tail whip (wide arc), supernova charge (big energy ball)
  - Phase 2: Transforms and gets faster at 50% HP
  - HP: 500

### Level 3: "Hyperbolic Time Chamber to Dark Realm"
- **Setting**: Starts white void, transitions to dark cosmic realm with stars and nebulas
- **Scrolling Background**: Parallax (void/stars, dark energy swirls, floating debris)
- **Regular Enemies**:
  - Cell Juniors (fast, Ki blasts + melee) - Medium HP
  - Dark Energy Clones (mirror Goku's attacks) - High HP
  - Buu Blobs (split into 2 smaller when hit) - Variable HP
- **Hazards**: Black holes (pull Goku in), dark energy walls
- **Duration**: ~150 seconds of scrolling before boss
- **Boss: Cosmic Demon King** (~8x Goku's size, fills right side of screen)
  - Attacks: Multi-arm slam, mouth beam, summon minions, dark energy rain
  - Phase 2 (60% HP): Grows extra arms, attacks faster
  - Phase 3 (30% HP): Goes berserk, screen shakes, rapid attacks
  - HP: 800

---

## Visual & Audio Design

### Pixel Art Style
- 16-bit inspired sprites drawn programmatically on Canvas
- Goku: Orange gi, black hair (spiky), yellow Nimbus cloud
- Enemies: Distinct color palettes per level
- Particle effects: Ki blast trails, explosions, charge-up auras
- Screen shake on big hits and boss attacks

### UI/HUD
- Top-left: HP bar (green to red gradient)
- Top-center: Ki Energy bar (blue glow)
- Top-right: Score counter + Lives (small Goku heads)
- Boss fights: Boss HP bar appears at top of screen
- Level intro: Large text with level name + "FIGHT!" flash

### Visual Effects
- Parallax scrolling backgrounds (3 layers per level)
- Star/particle field for space level
- Screen flash on Kamehameha and Spirit Bomb
- Explosion particles on enemy death
- Goku aura glow during charge attacks
- Cloud trail particles behind Nimbus

### Sound (Web Audio API)
- Procedurally generated retro sound effects (no audio files needed):
  - Ki blast: short energy burst
  - Kamehameha: rising charge + beam sound
  - Melee hit: impact thud
  - Spirit Bomb: epic rising tone
  - Enemy hit/death: explosion pop
  - Power-up collect: cheerful chime
  - Boss entrance: dramatic rumble
  - Level complete: victory fanfare

---

## Implementation Steps

### Step 1: Core Engine & Game Shell
- HTML/CSS layout with centered canvas
- Game loop with delta time
- State machine (menu, playing, paused, game over)
- Input handling (keyboard + touch)
- Basic rendering pipeline

### Step 2: Player Character (Goku + Nimbus)
- Pixel art sprite rendering for Goku on cloud
- Movement physics (8-directional, cloud bobbing)
- All attack animations and projectiles
- HP/Ki systems
- Hit detection and invincibility frames

### Step 3: Level System & Backgrounds
- Parallax scrolling background system
- Level data structure (enemy spawns, timing, hazards)
- Camera system
- Level transitions and intro screens
- All 3 level backgrounds

### Step 4: Enemies & AI
- Base enemy class with movement/attack patterns
- All enemy types for each level (9 types total)
- Enemy projectiles and collision
- Death animations and loot drops
- Power-up items

### Step 5: Boss Fights
- Boss state machines (idle, attack patterns, vulnerable, phase transitions)
- Level 1 Boss: Giant Mech Robot (3 attacks, 1 phase)
- Level 2 Boss: Alien Tyrant (3 attacks, 2 phases)
- Level 3 Boss: Cosmic Demon King (4 attacks, 3 phases)
- Boss HP bars and intro sequences

### Step 6: UI, Effects & Polish
- HUD (HP, Ki, Score, Lives)
- Menu screen with "Press Start"
- Particle system for all visual effects
- Screen shake and flash effects
- Sound effects (Web Audio API)
- Game over and victory screens
- High score tracking (localStorage)
- Mobile touch controls overlay

---

## File Structure
```
/index.html    - The entire game (single file, ~3000-4000 lines)
/README.md     - How to play instructions
```

Everything is self-contained. Open `index.html` in any modern browser to play.
