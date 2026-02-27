# Realm of Shadows 2

A Prince of Persia-inspired 2D side-scrolling action game with procedural vector art in the style of Dead Cells / Guacamelee. Built with React 18, TypeScript, and Canvas 2D rendering.

## Getting Started

```bash
npm install
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
```

Requires Node.js v22+.

## Features

- Side-scrolling platformer with precision combat
- Procedural Canvas art — bold outlines, cel-shaded fills, no sprite sheets
- 15-step per-frame rendering pipeline with parallax backgrounds, dynamic lighting, and particle effects
- Enemy AI (Orcs, Orc Shamans, Skeleton Guards)
- Trap system (spikes, swinging blades, arrow traps)
- React overlay UI (HUD, menus, dialogue) layered above the Canvas

## Architecture

The game engine runs **decoupled from React** via `requestAnimationFrame`. React handles UI overlays; the engine owns all gameplay, physics, and rendering.

```
src/
  engine/      Game loop, physics, input, camera, animation
  entities/    Player, enemy types
  systems/     Combat, traps
  levels/      Level loader + JSON level data
  rendering/   Renderer, procedural character art, tiles, particles, lighting
  ui/          React overlay components (HUD, menus)
  stores/      Zustand state stores
  constants/   Physics and game configuration
  types/       TypeScript interfaces
```

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Zustand** for state management
- **Vite** for build tooling
- **Howler.js** for audio
- **Canvas 2D** for all game rendering

## Status

Phases 0–6 complete: engine, player, tiles, enemies, combat, traps, particles, lighting, UI, and Level 1 (Dungeon Escape — 120x20 tiles, 9 enemies). Next up: mystery systems, levels 2–5, and polish.
