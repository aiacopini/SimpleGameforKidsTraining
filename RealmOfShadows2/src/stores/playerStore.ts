import { create } from 'zustand';
import { PLAYER_MAX_HP } from '../constants/physics';

interface PlayerState {
  hp: number;
  maxHp: number;
  inventory: string[];
  cluesFound: string[];
  setHp: (hp: number) => void;
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  addClue: (clue: string) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  hp: PLAYER_MAX_HP,
  maxHp: PLAYER_MAX_HP,
  inventory: [],
  cluesFound: [],
  setHp: (hp) => set({ hp }),
  addItem: (item) => set((state) => ({
    inventory: state.inventory.includes(item) ? state.inventory : [...state.inventory, item],
  })),
  removeItem: (item) => set((state) => ({
    inventory: state.inventory.filter(i => i !== item),
  })),
  addClue: (clue) => set((state) => ({
    cluesFound: state.cluesFound.includes(clue) ? state.cluesFound : [...state.cluesFound, clue],
  })),
  reset: () => set({ hp: PLAYER_MAX_HP, inventory: [], cluesFound: [] }),
}));
