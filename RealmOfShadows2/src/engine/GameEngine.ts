import { GameLoop } from './GameLoop';
import { InputManager } from './InputManager';
import { Camera } from './Camera';
import { Entity } from './Entity';
import { GameContext, InputState, LevelData, EntitySpawn } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game';
import { TILE_SIZE } from '../constants/physics';
import { Renderer } from '../rendering/Renderer';
import { ParticleSystem } from '../rendering/effects/ParticleSystem';
import { LightingEngine } from '../rendering/effects/LightingEngine';
import { ScreenEffects } from '../rendering/effects/ScreenEffects';
import { DamageNumbers } from '../rendering/effects/DamageNumbers';
import { CombatSystem } from '../systems/CombatSystem';
import { TrapSystem } from '../systems/TrapSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { ClueSystem } from '../systems/ClueSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { Orc } from '../entities/enemies/Orc';
import { OrcShaman } from '../entities/enemies/OrcShaman';
import { SkeletonGuard } from '../entities/enemies/SkeletonGuard';
import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  loop: GameLoop;
  input: InputManager;
  camera: Camera;
  renderer: Renderer;
  particles: ParticleSystem;
  lighting: LightingEngine;
  screenEffects: ScreenEffects;
  damageNumbers: DamageNumbers;
  combatSystem: CombatSystem;
  trapSystem: TrapSystem;
  dialogueSystem: DialogueSystem;
  clueSystem: ClueSystem;
  inventorySystem: InventorySystem;

  player: Entity | null = null;
  entities: Entity[] = [];
  level: LevelData | null = null;

  private currentInput: InputState | null = null;
  paused = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.input = new InputManager();
    this.camera = new Camera();
    this.renderer = new Renderer(this.ctx);
    this.particles = new ParticleSystem();
    this.lighting = new LightingEngine(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.screenEffects = new ScreenEffects();
    this.damageNumbers = new DamageNumbers();
    this.combatSystem = new CombatSystem();
    this.trapSystem = new TrapSystem();
    this.dialogueSystem = new DialogueSystem();
    this.clueSystem = new ClueSystem();
    this.inventorySystem = new InventorySystem();

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      (_alpha) => this.render(),
    );
  }

  start() {
    this.input.attach();
    this.loop.start();
  }

  stop() {
    this.loop.stop();
    this.input.detach();
  }

  loadLevel(level: LevelData, player: Entity, entities: Entity[]) {
    this.level = level;
    this.player = player;
    this.entities = entities;
    this.camera.setLevelBounds(level.width * level.tileSize, level.height * level.tileSize);
    this.camera.snapTo(player.x, player.y, player.width, player.height);
    this.renderer.buildTileCache(level);
    this.lighting.setLights(level.lights);
    this.particles.clear();
    this.damageNumbers.clear();
    this.screenEffects.reset();
    this.dialogueSystem.init(level);
    this.clueSystem.init(level);
    this.inventorySystem.init(level);
  }

  private createContext(dt: number): GameContext {
    return {
      dt,
      input: this.currentInput!,
      collisionGrid: this.level?.layers.collision ?? [],
      levelWidth: this.level?.width ?? 0,
      levelHeight: this.level?.height ?? 0,
      tileSize: this.level?.tileSize ?? TILE_SIZE,
      entities: this.entities.map(e => e.getData()),
      camera: { x: this.camera.x, y: this.camera.y },
      addParticle: (preset, x, y, opts) => this.particles.emit(preset, x, y, opts),
      addDamageNumber: (x, y, amount, color) => this.damageNumbers.add(x, y, amount, color),
      screenShake: (intensity, duration) => this.camera.shake(intensity, duration),
      hitFreeze: (duration) => this.loop.freeze(duration),
      startDialogue: (treeId) => this.dialogueSystem.startDialogue(treeId),
      awardClue: (clueId) => usePlayerStore.getState().addClue(clueId),
      awardItem: (itemId) => usePlayerStore.getState().addItem(itemId),
      spawnEntities: (spawns) => this.spawnPenaltyEntities(spawns),
      isDialogueActive: () => this.dialogueSystem.isActive,
    };
  }

  private update(dt: number) {
    if (this.paused || !this.level || !this.player) return;

    this.currentInput = this.input.poll();

    // Check pause
    if (this.currentInput.pauseJustPressed) {
      this.paused = true;
      useGameStore.getState().setPaused(true);
      return;
    }

    const ctx = this.createContext(dt);

    // When dialogue is active, only update animations/effects — block gameplay
    if (this.dialogueSystem.isActive) {
      for (const entity of this.entities) {
        entity.animation.update(dt);
      }
      this.camera.follow(this.player.x, this.player.y, this.player.width, this.player.height, this.player.facing, dt);
      this.camera.updateShake(dt);
      this.particles.update(dt);
      this.damageNumbers.update(dt);
      this.screenEffects.update(dt);
      this.lighting.update(dt);
      return;
    }

    // Update player
    this.player.update(dt, ctx);

    // Update entities
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (entity === this.player) continue;
      entity.update(dt, ctx);

      // Remove dead entities after death animation
      if (!entity.alive && entity.animation.state === 'die' && !entity.animation.locked) {
        this.entities.splice(i, 1);
      }
    }

    // Combat resolution
    this.combatSystem.update(this.player, this.entities, ctx);

    // Trap checks
    if (this.level) {
      this.trapSystem.update(this.player, this.level, dt, ctx);
    }

    // Mystery systems
    this.dialogueSystem.update(dt);
    this.clueSystem.update(dt);
    this.inventorySystem.update(dt);

    // Update i-frames
    for (const entity of this.entities) {
      if (entity.iframes > 0) entity.iframes -= dt;
    }

    // Camera
    this.camera.follow(this.player.x, this.player.y, this.player.width, this.player.height, this.player.facing, dt);
    this.camera.updateShake(dt);

    // Effects
    this.particles.update(dt);
    this.damageNumbers.update(dt);
    this.screenEffects.update(dt);
    this.lighting.update(dt);

    // Sync player state to Zustand store (sparingly — only on change)
    const playerStore = usePlayerStore.getState();
    if (playerStore.hp !== this.player.hp) {
      playerStore.setHp(this.player.hp);
    }

    // Check exit zone
    if (this.level.exitZone) {
      const ez = this.level.exitZone;
      if (this.player.x + this.player.width > ez.x && this.player.x < ez.x + ez.width &&
          this.player.y + this.player.height > ez.y && this.player.y < ez.y + ez.height) {
        useGameStore.getState().completeLevel();
      }
    }

    // Check death
    if (!this.player.alive) {
      useGameStore.getState().setScreen('gameover');
    }
  }

  private render() {
    if (!this.level) {
      this.ctx.fillStyle = '#0a0a12';
      this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

    this.renderer.render(
      this.level,
      this.camera,
      this.player!,
      this.entities,
      this.particles,
      this.lighting,
      this.screenEffects,
      this.damageNumbers,
    );
  }

  resume() {
    this.paused = false;
    useGameStore.getState().setPaused(false);
  }

  spawnPenaltyEntities(spawns: EntitySpawn[]) {
    for (const spawn of spawns) {
      let entity: Entity | null = null;
      switch (spawn.type) {
        case 'orc':
          entity = new Orc(spawn.x, spawn.y);
          break;
        case 'orc-shaman':
          entity = new OrcShaman(spawn.x, spawn.y);
          break;
        case 'skeleton-guard':
          entity = new SkeletonGuard(spawn.x, spawn.y);
          break;
      }
      if (entity) {
        this.entities.push(entity);
      }
    }
  }
}
