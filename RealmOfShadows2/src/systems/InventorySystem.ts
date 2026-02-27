import { InventoryItemDef, LevelData } from '../types';
import { usePlayerStore } from '../stores/playerStore';

export class InventorySystem {
  private itemDefs: Map<string, InventoryItemDef> = new Map();

  init(level: LevelData) {
    this.itemDefs.clear();
    if (level.items) {
      for (const item of level.items) {
        this.itemDefs.set(item.id, item);
      }
    }
  }

  getItemDef(id: string): InventoryItemDef | undefined {
    return this.itemDefs.get(id);
  }

  getAllDefs(): InventoryItemDef[] {
    return Array.from(this.itemDefs.values());
  }

  useItem(itemId: string): boolean {
    const def = this.itemDefs.get(itemId);
    if (!def || !def.usable) return false;

    const player = usePlayerStore.getState();
    if (!player.inventory.includes(itemId)) return false;

    switch (def.effect) {
      case 'heal': {
        const newHp = Math.min(player.hp + (def.effectValue ?? 1), player.maxHp);
        if (newHp === player.hp) return false; // already full
        player.setHp(newHp);
        player.removeItem(itemId);
        return true;
      }
      case 'key':
        // Keys are contextual — don't consume on generic use
        return false;
      case 'light':
        player.removeItem(itemId);
        return true;
      default:
        return false;
    }
  }

  update(_dt: number) {
    // No-op
  }
}
