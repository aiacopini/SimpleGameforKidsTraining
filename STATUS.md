# Project Status & Roadmap

> Last updated: 2026-02-28

Quick-reference document for picking up work on any project in this repo.

---

## At a Glance

| Project | Completion | Playable | Priority | Effort to Ship |
|---------|-----------|----------|----------|----------------|
| CandyCloudRider | 85% | Yes | Low | ~5 hrs (audio + particles) |
| DnDGame | 95% | Yes | Low | ~5 hrs (save/load) |
| SpaceFun | 90% | Yes | Low | ~3 hrs (audio) |
| RealmOfShadows (v1) | 40% | Limited | None | Superseded by v2 |
| RealmOfShadows2 | 72% | Level 1 | **High** | ~55-70 hrs (levels 2-5 + polish) |
| LLMExplorer | 90% | Needs setup | Medium | ~1 hr (Vite wrapper) |

---

## CandyCloudRider

**What it is:** DBZ-inspired kid-friendly platformer (Goku + Nimbus + candy theme)
**Tech:** Single HTML file, vanilla JS + Canvas 2D (~228 KB)
**Run:** Open `CandyCloudRider/index_CandyCloudRider.html` in a browser

### Done
- 3 levels (Candy Fields, Chocolate Kingdom, Sugar Crystal Realm)
- 3 difficulty modes, boss fights, tutorial, localStorage progress
- 16 enemy types, procedural sprite art

### To Do
- [ ] Add sound effects (playSound() structure exists, no audio files)
- [ ] Particle effects for impacts and candy sparkles
- [ ] Intermediate checkpoints within levels
- [ ] Touch controls for mobile

---

## DnDGame (Dungeons of Drakenmoor)

**What it is:** D&D top-down dungeon crawler with turn-based combat
**Tech:** 11 modular JS files, vanilla JS + Canvas 2D + Web Audio API (~220 KB)
**Run:** Open `DnDGame/index.html` in a browser

### Done
- 5 complete levels (Goblin Caves, Enchanted Forest, Undead Crypt, Dragon Volcano, Dark Lord's Castle)
- Character creation, turn-based dice combat, inventory, boss encounters
- Audio system, particle effects, procedural sprites

### To Do
- [ ] Persistent save/load to localStorage (progress lost on refresh)
- [ ] NPC dialogue system
- [ ] Procedural level variations
- [ ] Item progression / rare loot

---

## SpaceFun (NOVA STRIKE)

**What it is:** Classic vertical arcade space shooter
**Tech:** Single HTML file, vanilla JS + Canvas 2D (~53 KB)
**Run:** Open `SpaceFun/index_SpaceFun.html` in a browser

### Done
- Wave-based enemy spawning, score/lives system
- Sci-fi neon aesthetic, responsive canvas, procedural ship art

### To Do
- [ ] Sound effects and music
- [ ] Power-ups (weapon upgrades, shields, spread-shot)
- [ ] Persistent high score leaderboard
- [ ] Boss fights
- [ ] Level progression (currently endless waves)

---

## RealmOfShadows (v1)

**What it is:** Original prototype — grid-based top-down action RPG
**Tech:** 2 vanilla JS files (~136 KB)
**Run:** Open `RealmOfShadows/index_RealmOfShadows.html` in a browser
**Status:** Superseded by RealmOfShadows2. Keep as reference only.

---

## RealmOfShadows2

**What it is:** Prince of Persia-inspired 2D side-scroller (Dead Cells / Guacamelee art style)
**Tech:** React 18 + TypeScript + Vite + Zustand + Howler.js + Canvas 2D
**Run:**
```bash
cd RealmOfShadows2
npm install
npm run dev    # http://localhost:5173
```

### Completed Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Project scaffolding (Vite + React + TS) | Done |
| 1 | Engine core (loop, physics, input, camera, animation) | Done |
| 2 | Player entity (8 movement states, sword combat) | Done |
| 3 | Tile system + Level 1 layout (120x20 tiles) | Done |
| 4 | Combat (HP, hitboxes, i-frames), 3 enemy types, traps | Done |
| 5 | UI overlay (HUD, menus, game over, level transition) | Done |
| 6 | Level 1 complete (9 enemies, traps, parallax, lighting) | Done |
| 7 | Mystery systems (dialogue, clues, inventory, NPCs) | Done |

### Phase 7 — What Was Built

**3 new engine systems:**
- `DialogueSystem` — tree-based branching conversations with choice filtering (locked choices require items/clues)
- `ClueSystem` — mystery definition, clue tracking, theory submission (select 3 clues), penalty spawns on wrong guess
- `InventorySystem` — item definitions, use effects (heal/key/light)

**NPC entity** (`entities/npcs/NPC.ts`) — neutral entity, no physics, faces player when in range, triggers dialogue on E key

**Procedural NPC renderer** — robed-figure drawing with 4 color palettes (librarian, merchant, guard, mystic), floating "E" interact hint

**3 React UI overlays:**
- `DialogueBox` — bottom-center panel, typewriter effect (35ms/char), speaker name in gold, choice buttons
- `ClueBoard` — modal (Tab/C key), select 3 clues to submit theory, correct/wrong feedback
- `InventoryScreen` — modal (I key), item grid with Use button

**Engine integration:**
- Dialogue-active guard blocks player/entity/combat/trap updates during conversations
- `spawnPenaltyEntities()` spawns enemies on wrong theory submission
- GameContext extended with `startDialogue`, `awardClue`, `awardItem`, `spawnEntities`, `isDialogueActive`

**Test data in Level 1** (temporary, for integration testing):
- Librarian NPC at x:384 with 5-node branching dialogue tree
- 5 clues (3 real + 2 red herrings), 2 items (Healing Salve + Rusty Key)

**New types:** `DialogueChoice`, `DialogueNode`, `DialogueTree`, `ClueDef`, `MysteryDef`, `InventoryItemDef`, `NPCSpawn`. LevelData extended with optional mystery fields. `'talk'` added to EntityState.

### Remaining Phases

**Phase 8 — Level 2: Forgotten Library** (not started)
- [ ] level2_forgotten_library.json (140x20, library tileset)
- [ ] LibraryTileset.ts (bookshelves, ancient stone, torches)
- [ ] Wizard + Elven Sage NPCs with dialogue trees
- [ ] 5 clues + 2 red herrings, deduction puzzle

**Phase 9 — Levels 3-5** (not started)
- [ ] Level 3: Bridge of Trials — combat-heavy, traps, OrcShaman boss
- [ ] Level 4: Cursed Village — mystery, stone villagers, dragon curse
- [ ] Level 5: Dragon Spire — 3-phase boss fight, Scroll of Binding

**Phase 10 — Polish** (not started)
- [ ] Audio files (background music + SFX for all actions)
- [ ] Save/load to localStorage
- [ ] Difficulty settings (Easy / Normal / Hard)
- [ ] Screen shake, combo feedback, cinematic transitions
- [ ] Touch controls + responsive viewport
- [ ] Gamepad support

### Key Documentation
- `CLAUDE.md` — full architecture, conventions, art direction
- `PROMPTS.md` — phase-by-phase development guide
- `plan-raw.txt` — detailed implementation specs (~61 KB)

---

## LLMExplorer

**What it is:** Interactive educational tool visualizing how LLMs work (7 inference stages)
**Tech:** React 18 + Recharts (single JSX component, 1007 lines)
**Target audience:** Ages 14-16

### Done
- 7-stage inference pipeline (tokenization through generation)
- Interactive quizzes per stage
- Dual-prompt comparison mode
- Multi-language (EN, IT, FR, ES)

### To Do (before it's runnable)
- [ ] Create Vite project wrapper (`npm create vite@latest -- --template react`)
- [ ] Add package.json with react, react-dom, recharts
- [ ] Rename `llm-explorer (1).jsx` to `LLMExplorer.jsx`
- [ ] Create index.html + main entry point
- [ ] Optional: convert to TypeScript

---

## Quick Wins (pick up anytime)

1. **Add audio to any game** — all 4 playable games are silent; even basic SFX dramatically improves feel
2. **Wrap LLMExplorer in Vite** — 30 min to make it deployable
3. **Add localStorage save to DnDGame** — most complete game, just needs persistence
4. **RealmOfShadows2 Phase 8** — Level 2 (Forgotten Library) is the first mystery level; all systems are ready
