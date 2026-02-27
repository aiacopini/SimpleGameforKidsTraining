import { usePlayerStore } from '../stores/playerStore';
import styles from './HUD.module.css';

export function HUD() {
  const hp = usePlayerStore(s => s.hp);
  const maxHp = usePlayerStore(s => s.maxHp);

  return (
    <div className={styles.hud}>
      <div className={styles.hearts}>
        {Array.from({ length: maxHp }, (_, i) => (
          <span
            key={i}
            className={`${styles.heart} ${i < hp ? styles.full : styles.empty}`}
          >
            ♥
          </span>
        ))}
      </div>
      <div className={styles.levelName}>Dungeon Escape</div>
    </div>
  );
}
