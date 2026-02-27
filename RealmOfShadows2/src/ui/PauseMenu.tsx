import styles from './PauseMenu.module.css';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function PauseMenu({ onResume, onRestart, onMainMenu }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h2 className={styles.title}>Paused</h2>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={onResume}>Resume</button>
          <button className={styles.btn} onClick={onRestart}>Restart Level</button>
          <button className={styles.btn} onClick={onMainMenu}>Main Menu</button>
        </div>
      </div>
    </div>
  );
}
