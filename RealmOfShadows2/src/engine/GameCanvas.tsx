import { useRef, useEffect, useCallback, useState } from 'react';
import { GameEngine } from './GameEngine';
import { loadLevel } from '../levels/LevelLoader';
import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { useDialogueStore } from '../stores/dialogueStore';
import { HUD } from '../ui/HUD';
import { MainMenu } from '../ui/MainMenu';
import { PauseMenu } from '../ui/PauseMenu';
import { GameOver } from '../ui/GameOver';
import { LevelTransition } from '../ui/LevelTransition';
import { DialogueBox } from '../ui/DialogueBox';
import { ClueBoard } from '../ui/ClueBoard';
import { InventoryScreen } from '../ui/InventoryScreen';
import styles from './GameCanvas.module.css';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const screen = useGameStore(s => s.screen);
  const currentLevel = useGameStore(s => s.currentLevel);
  const dialogueActive = useDialogueStore(s => s.active);
  const playerInventory = usePlayerStore(s => s.inventory);
  const playerClues = usePlayerStore(s => s.cluesFound);

  const [showClueBoard, setShowClueBoard] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [clueFeedback, setClueFeedback] = useState<{ correct: boolean; message: string } | null>(null);

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
      setShowClueBoard(false);
      setShowInventory(false);
      setClueFeedback(null);
    }
  }, [screen, currentLevel]);

  // Keybinds for mystery UI (Tab/C for clue board, I for inventory)
  useEffect(() => {
    if (screen !== 'playing') return;

    const handler = (e: KeyboardEvent) => {
      // Don't open modals during dialogue
      if (dialogueActive) return;

      if (e.key === 'Tab' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setShowInventory(false);
        setShowClueBoard(prev => !prev);
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setShowClueBoard(false);
        setShowInventory(prev => !prev);
      } else if (e.key === 'Escape') {
        if (showClueBoard) setShowClueBoard(false);
        else if (showInventory) setShowInventory(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, dialogueActive, showClueBoard, showInventory]);

  // Pause engine when modals are open
  useEffect(() => {
    if (!engineRef.current) return;
    if (showClueBoard || showInventory) {
      engineRef.current.paused = true;
    } else if (screen === 'playing' && !dialogueActive) {
      engineRef.current.paused = false;
    }
  }, [showClueBoard, showInventory, screen, dialogueActive]);

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

  // Dialogue handlers
  const handleDialogueAdvance = useCallback(() => {
    engineRef.current?.dialogueSystem.handleAdvance();
  }, []);

  const handleDialogueChoice = useCallback((index: number) => {
    const choices = useDialogueStore.getState().visibleChoices;
    if (choices[index]) {
      engineRef.current?.dialogueSystem.handleChoice(choices[index]);
    }
  }, []);

  // Clue board handler
  const handleClueSubmit = useCallback((clueIds: string[]) => {
    const engine = engineRef.current;
    if (!engine) return;
    const result = engine.clueSystem.submitTheory(clueIds);
    if (result.correct) {
      const mystery = engine.clueSystem.getMystery();
      setClueFeedback({ correct: true, message: mystery?.solvedText ?? 'Mystery solved!' });
    } else {
      setClueFeedback({ correct: false, message: 'That theory doesn\'t hold up. Try again...' });
      if (result.spawns.length > 0) {
        engine.spawnPenaltyEntities(result.spawns);
      }
    }
  }, []);

  // Inventory handler
  const handleUseItem = useCallback((itemId: string) => {
    engineRef.current?.inventorySystem.useItem(itemId);
  }, []);

  // Get mystery data for ClueBoard
  const getMysteryClues = () => {
    return engineRef.current?.clueSystem.getMystery()?.clues ?? [];
  };

  // Get item defs for InventoryScreen
  const getItemDefs = () => {
    return engineRef.current?.inventorySystem.getAllDefs() ?? [];
  };

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
          <>
            <HUD />
            {dialogueActive && (
              <DialogueBox
                onAdvance={handleDialogueAdvance}
                onChoice={handleDialogueChoice}
              />
            )}
            {showClueBoard && (
              <ClueBoard
                clues={getMysteryClues()}
                collectedClueIds={playerClues}
                onSubmit={handleClueSubmit}
                onClose={() => setShowClueBoard(false)}
                feedback={clueFeedback}
              />
            )}
            {showInventory && (
              <InventoryScreen
                items={getItemDefs()}
                playerInventory={playerInventory}
                onUseItem={handleUseItem}
                onClose={() => setShowInventory(false)}
              />
            )}
          </>
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
