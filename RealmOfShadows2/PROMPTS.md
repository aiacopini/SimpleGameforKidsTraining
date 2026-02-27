# Claude Code CLI — Prompt Guide

## Phase 1: Engine Core
```
Read CLAUDE.md and @engine-agent. Build the game engine core:
GameLoop.ts, Physics.ts, InputManager.ts, Camera.ts, AnimationSystem.ts.
Implement the PoP-style momentum physics with coyote time and jump buffering.
Create Entity.ts base class. Wire the game loop into a React component using useRef + rAF.
```

## Phase 2: Player + SVG Rendering
```
Read @art-agent and @engine-agent. Create the Player entity with all movement states
(idle, run, jump, fall, wall-slide, ledge-grab, roll, attack).
Build PlayerSVG component with frame-based animation. Test in a flat test level.
Movement must feel fluid like Prince of Persia — momentum, weight, smooth transitions.
```

## Phase 3: Tileset + Level 1 Layout
```
Read @art-agent and @content-agent. Build the tileset system: SVG tile components for
dungeon environment (floor, wall, ceiling, platform, door, torch decorations).
Create LevelLoader.ts that reads level JSON → renders tile grid.
Design Level1_DungeonEscape.json layout (120x20 tiles). Add parallax background.
```

## Phase 4: Combat + Enemies
```
Read @engine-agent and @content-agent. Implement CombatSystem.ts (HP, damage, hitboxes, i-frames).
Create Orc enemy with patrol AI, aggro detection, chase, and melee attack.
Add TrapSystem.ts: spike timing, guillotine blades, crumbling floors.
Place enemies and traps in Level 1 per the level JSON.
```

## Phase 5: UI Layer
```
Read @ui-ux-agent. Build HUD.tsx (hearts, item slots), PauseMenu.tsx,
GameOver.tsx, and MainMenu.tsx. Dark fantasy styling with MedievalSharp font.
All CSS Modules, transitions 300ms ease-out. HUD overlays game SVG canvas via z-index.
```

## Phase 6: Level 1 Complete
```
Integrate all systems. Level 1 should be playable start to finish:
spawn → fight orcs → dodge traps → reach exit door.
Test: smooth 60fps, responsive controls, proper collision, death + retry.
```

## Phase 7: Mystery Systems
```
Read @content-agent and @ui-ux-agent. Build DialogueSystem.ts (branching conversations),
ClueSystem.ts (collect clues, track found/missing), and ClueBoard.tsx
(visual clue connection UI). InventoryScreen.tsx with clue category.
```

## Phase 8: Level 2 (Mystery)
```
Design and build Level2_ForgottenLibrary. Dark wood library environment tileset.
Place 5 clues + 2 red herrings. Create WizardNPC and ElvenSage with dialogue trees.
Player must find correct 3 clues and submit on ClueBoard to progress.
Wrong answer spawns skeleton guards.
```

## Phase 9: Remaining Levels (3-5)
```
Build levels 3-5 iteratively:
- Level 3: Bridge of Trials (combat, heavy traps, OrcShaman enemy)
- Level 4: Cursed Village (mystery, stone villagers, dragon curse investigation)
- Level 5: Dragon Spire (boss fight, 3 phases, Scroll of Binding mechanic)
Use @content-agent for design, @art-agent for new tilesets and enemies.
```

## Phase 10: Polish
```
Add: LevelTransition.tsx cinematic screens, Merchant NPC between levels,
ProgressionSystem (save to localStorage), particle effects (magic, fire, dust),
audio hook placeholders, touch controls overlay, responsive viewport scaling.
Final pass on all animations and visual polish.
```
