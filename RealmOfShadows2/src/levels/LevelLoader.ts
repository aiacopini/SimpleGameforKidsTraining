import { LevelData } from '../types';
import { Entity } from '../engine/Entity';
import { Player } from '../entities/Player';
import { Orc } from '../entities/enemies/Orc';
import { OrcShaman } from '../entities/enemies/OrcShaman';
import { SkeletonGuard } from '../entities/enemies/SkeletonGuard';
import { NPC } from '../entities/npcs/NPC';

// Import level data
import level1Data from './data/level1_dungeon_escape.json';

const LEVELS: Record<number, LevelData> = {
  1: level1Data as LevelData,
};

export function loadLevel(levelNum: number): { level: LevelData; player: Player; entities: Entity[] } {
  const data = LEVELS[levelNum];
  if (!data) throw new Error(`Level ${levelNum} not found`);

  // Deep clone to avoid mutating the original
  const level: LevelData = JSON.parse(JSON.stringify(data));

  // Create player
  const player = new Player(level.playerStart.x, level.playerStart.y);

  // Create entities (including player)
  const entities: Entity[] = [player];

  for (const spawn of level.entities) {
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
      entities.push(entity);
    }
  }

  // Spawn NPCs
  if (level.npcs) {
    for (const npcSpawn of level.npcs) {
      const npc = new NPC(
        npcSpawn.x,
        npcSpawn.y,
        npcSpawn.npcType,
        npcSpawn.dialogueTreeId,
        npcSpawn.interactRadius,
      );
      entities.push(npc);
    }
  }

  return { level, player, entities };
}
