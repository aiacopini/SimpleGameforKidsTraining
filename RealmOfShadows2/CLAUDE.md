# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Realm of Shadows is a Prince-of-Persia-inspired 2D side-scrolling game built as a React web app with **Canvas 2D rendering** and procedural vector/comic art (Dead Cells / Guacamelee aesthetic). Fantasy setting with 5 campaign levels alternating between combat and mystery/investigation gameplay.

## Development Commands

```bash
export PATH="/c/laragon/bin/nodejs/node-v22:$PATH"  # Required on this Windows/Laragon setup
npm install          # Install dependencies
npm run dev          # Start dev server (Vite) — http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build
```

### Dependencies
- **Runtime**: react, react-dom, zustand, howler
- **Dev**: typescript, @types/howler, vite, @vitejs/plugin-react

## Tech Stack & Key Constraints

- **React 18 + TypeScript** (strict mode)
- **Canvas 2D rendering** — all graphics via `ctx.beginPath()`, `ctx.fill()`, `ctx.stroke()` — no external sprites/images
- **Zustand** for state management (game state, inventory, dialogue)
- **Vite** for build tooling
- **CSS Modules** + CSS custom properties for UI styling
- Must run at **60fps** on modern browsers
- Save progress to **localStorage**

## Architecture

### Engine-React Bridge (CRITICAL)

The game engine runs **decoupled from React's render cycle** — the game loop uses `useRef` + `requestAnimationFrame`. React only re-renders when UI-relevant state changes (HP, inventory, dialogue).

```
React (GameCanvas.tsx)
  └── useRef<HTMLCanvasElement>   → owns Canvas DOM element
  └── useRef<GameEngine>         → owns engine instance
  └── useEffect(mount)           → creates engine, starts loop
  └── renders: <canvas> + React UI overlay children
```

### Directory Structure

- `src/engine/` — GameLoop (semi-fixed timestep), Physics (AABB tile collision), InputManager (poll-based), Camera (lerp follow), AnimationSystem (state machine), Entity (base class), GameEngine (orchestrator), GameCanvas.tsx (React bridge)
- `src/entities/` — Player (full PoP movement), enemies/ (Orc, OrcShaman, SkeletonGuard)
- `src/systems/` — CombatSystem, TrapSystem (+ future: Dialogue, Inventory, Clues, Progression)
- `src/levels/` — LevelLoader + data/ (Level JSON files)
- `src/rendering/` — Renderer (15-step draw pipeline), characters/ (procedural Canvas drawing per entity), tiles/ (TileRenderer + DungeonTileset), effects/ (ParticleSystem, LightingEngine, ScreenEffects, DamageNumbers), backgrounds/ (ParallaxBackground)
- `src/ui/` — React overlay components (HUD, MainMenu, PauseMenu, GameOver, LevelTransition, DialogueBox)
- `src/stores/` — Zustand stores (gameStore, playerStore, dialogueStore)
- `src/constants/` — physics.ts (all physics constants), game.ts (canvas size, colors, camera)
- `src/types/` — Shared TypeScript interfaces

### Rendering Pipeline (every frame)

```
CANVAS (game engine):
 1. Clear canvas
 2-3. Parallax backgrounds (4 depth layers)
 4. ctx.save() + translate(-camera) [world space]
 5. Tile cache (OffscreenCanvas, rendered once)
 6-8. Entities sorted by Y
 9. Foreground tiles
 10. Particles (object-pooled, 500 max)
 11. ctx.restore() [screen space]
 12. Lighting overlay (OffscreenCanvas, destination-out compositing)
 13. Screen effects (vignette, damage flash)

REACT OVERLAY (z-index above canvas):
 14. HUD (hearts, level name)
 15. Menus (MainMenu, PauseMenu, GameOver, LevelTransition)
```

### Entity Pattern

Entities own their logic via `update(dt, ctx)` and are drawn by the Renderer via type-dispatched draw functions (e.g., `drawPlayer()`, `drawOrc()`). All character art is procedural Canvas path operations with bold 2-3px outlines and cel-shaded flat fills.

### Level Types

- **Combat levels** (1, 3, 5): reach exit / defeat boss, enemies, PoP-style traps, precision platforming
- **Mystery levels** (2, 4): collect clues, NPC dialogue, Clue Board deduction UI, lighter combat

## Code Conventions

- Functional React components, hooks only
- All magic numbers in constants files
- All graphics procedural Canvas — no raster images, no external assets
- All CSS animations for UI (no JS animation libraries)
- No inline styles — use CSS Modules
- Transitions: 300ms ease-out
- UI layer never manipulates game state directly — reads from Zustand stores
- Engine writes to Zustand stores sparingly (only on value change)

## Art Direction

Bold vector/comic style (Dead Cells / Guacamelee aesthetic):
- 2-3px outlines in near-black (#1a1a2e)
- Flat color fills with cel-shading (2-tone: light + shadow)
- Strong silhouettes readable at small size
- Squash & stretch on jumps, landings, attacks
- Dark fantasy palette in `src/constants/game.ts` COLORS and `src/theme.css` CSS variables
- Fonts: MedievalSharp (display) + Crimson Text (body) from Google Fonts

## Current Status

- **Phase 0-6 complete**: Engine, player, tiles, enemies, combat, traps, particles, lighting, UI — all implemented
- **Level 1 (Dungeon Escape)**: 120x20 tiles, 9 enemies (8 orcs + 1 shaman), traps, parallax, lighting
- **Next**: Phase 7 (Mystery systems), Phase 8 (Level 2), Phase 9 (Levels 3-5), Phase 10 (Polish)
