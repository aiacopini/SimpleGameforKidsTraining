import { MysteryDef, EntitySpawn, LevelData } from '../types';
import { usePlayerStore } from '../stores/playerStore';
import { THEORY_REQUIRED_CLUES } from '../constants/game';

export interface TheoryResult {
  correct: boolean;
  spawns: EntitySpawn[];
}

export class ClueSystem {
  private mystery: MysteryDef | null = null;

  init(level: LevelData) {
    this.mystery = level.mystery ?? null;
  }

  getMystery(): MysteryDef | null {
    return this.mystery;
  }

  submitTheory(clueIds: string[]): TheoryResult {
    if (!this.mystery || clueIds.length !== THEORY_REQUIRED_CLUES) {
      return { correct: false, spawns: [] };
    }

    const solution = this.mystery.solutionClueIds;
    const correct = solution.length === clueIds.length &&
      solution.every(id => clueIds.includes(id));

    if (correct) {
      usePlayerStore.getState().setMysterySolved(true);
      return { correct: true, spawns: [] };
    }

    const player = usePlayerStore.getState();
    player.setTheoriesAttempted(player.theoriesAttempted + 1);
    return { correct: false, spawns: this.mystery.wrongPenaltySpawns };
  }

  isSolved(): boolean {
    return usePlayerStore.getState().mysterySolved;
  }

  update(_dt: number) {
    // Stateless check — no-op
  }
}
