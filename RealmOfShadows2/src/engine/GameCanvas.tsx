import { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from './GameEngine';
import { loadLevel } from '../levels/LevelLoader';
import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { HUD } from '../ui/HUD';
import { MainMenu } from '../ui/MainMenu';
import { PauseMenu } from '../ui/PauseMenu';
import { GameOver } from '../ui/GameOver';
import { LevelTransition } from '../ui/LevelTransition';
import styles from './GameCanvas.module.css';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const screen = useGameStore(s => s.screen);
  const currentLevel = useGameStore(s => s.currentLevel);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  // Load level when transitioning to 'playing'
  useEffect(() => {
    if (screen === 'playing' && engineRef.current) {
      const { level, player, entities } = loadLevel(currentLevel);
      usePlayerStore.getState().reset();
      engineRef.current.loadLevel(level, player, entities);
      engineRef.current.paused = false;
    }
  }, [screen, currentLevel]);

  const handleStartGame = useCallback(() => {
    useGameStore.getState().setScreen('transition');
  }, []);

  const handleTransitionEnd = useCallback(() => {
    useGameStore.getState().setScreen('playing');
  }, []);

  const handleResume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resume();
    }
  }, []);

  const handleRestart = useCallback(() => {
    useGameStore.getState().restartLevel();
  }, []);

  const handleMainMenu = useCallback(() => {
    useGameStore.getState().goToMenu();
  }, []);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.uiOverlay}>
        {screen === 'menu' && (
          <MainMenu onStartGame={handleStartGame} />
        )}
        {screen === 'transition' && (
          <LevelTransition
            levelNum={currentLevel}
            onComplete={handleTransitionEnd}
          />
        )}
        {screen === 'playing' && (
          <HUD />
        )}
        {screen === 'paused' && (
          <PauseMenu
            onResume={handleResume}
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
          />
        )}
        {screen === 'gameover' && (
          <GameOver
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
          />
        )}
      </div>
    </div>
  );
}
