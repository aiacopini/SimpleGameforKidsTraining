import { useEffect, useState } from 'react';
import styles from './GameOver.module.css';

interface Props {
  onRestart: () => void;
  onMainMenu: () => void;
}

export function GameOver({ onRestart, onMainMenu }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : ''}`}>
      <h1 className={styles.title}>You Died</h1>
      <div className={styles.buttons}>
        <button className={styles.btn} onClick={onRestart}>Try Again</button>
        <button className={styles.btn} onClick={onMainMenu}>Main Menu</button>
      </div>
    </div>
  );
}
