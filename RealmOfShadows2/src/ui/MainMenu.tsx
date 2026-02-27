import { useState } from 'react';
import styles from './MainMenu.module.css';

interface Props {
  onStartGame: () => void;
}

export function MainMenu({ onStartGame }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={styles.menu}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Realm of Shadows</h1>
        <div className={styles.subtitle}>A Dark Fantasy Adventure</div>
      </div>

      <div className={styles.buttons}>
        <button
          className={`${styles.btn} ${hovered === 'start' ? styles.btnHovered : ''}`}
          onMouseEnter={() => setHovered('start')}
          onMouseLeave={() => setHovered(null)}
          onClick={onStartGame}
        >
          New Game
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlsTitle}>Controls</div>
        <div className={styles.controlRow}><kbd>A/D</kbd> or <kbd>←/→</kbd> Move</div>
        <div className={styles.controlRow}><kbd>Space</kbd> Jump</div>
        <div className={styles.controlRow}><kbd>Z/J</kbd> Attack</div>
        <div className={styles.controlRow}><kbd>X/K</kbd> Roll</div>
        <div className={styles.controlRow}><kbd>Esc</kbd> Pause</div>
      </div>
    </div>
  );
}
