import { create } from 'zustand';

export type GameScreen = 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete' | 'transition';

interface GameState {
  screen: GameScreen;
  currentLevel: number;
  paused: boolean;
  loading: boolean;
  setScreen: (screen: GameScreen) => void;
  setPaused: (paused: boolean) => void;
  setLoading: (loading: boolean) => void;
  startGame: () => void;
  completeLevel: () => void;
  restartLevel: () => void;
  goToMenu: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'menu',
  currentLevel: 1,
  paused: false,
  loading: false,
  setScreen: (screen) => set({ screen }),
  setPaused: (paused) => set({ paused, screen: paused ? 'paused' : 'playing' }),
  setLoading: (loading) => set({ loading }),
  startGame: () => set({ screen: 'transition', currentLevel: 1, paused: false }),
  completeLevel: () => set((state) => ({
    screen: 'levelcomplete',
    currentLevel: state.currentLevel,
  })),
  restartLevel: () => set({ screen: 'playing', paused: false }),
  goToMenu: () => set({ screen: 'menu', currentLevel: 1, paused: false }),
}));
