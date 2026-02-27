import { useEffect, useState } from 'react';
import styles from './LevelTransition.module.css';

interface Props {
  levelNum: number;
  onComplete: () => void;
}

const LEVEL_INTROS: Record<number, { title: string; text: string }> = {
  1: {
    title: 'Chapter I',
    text: 'You awaken in darkness. The cold stone of a dungeon cell presses against your back. Your weapons are gone, but your magic still courses through your veins. You must escape...',
  },
  2: {
    title: 'Chapter II',
    text: 'The Forgotten Library holds secrets that could turn the tide. Among its dusty shelves, the truth awaits...',
  },
  3: {
    title: 'Chapter III',
    text: 'The Bridge of Trials stretches before you, high above the abyss. Only the worthy may cross...',
  },
};

export function LevelTransition({ levelNum, onComplete }: Props) {
  const [displayedText, setDisplayedText] = useState('');
  const [showContinue, setShowContinue] = useState(false);
  const intro = LEVEL_INTROS[levelNum] ?? { title: `Chapter ${levelNum}`, text: 'The adventure continues...' };

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < intro.text.length) {
        setDisplayedText(intro.text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowContinue(true), 300);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [intro.text]);

  // Skip on any key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showContinue) {
        onComplete();
      } else {
        setDisplayedText(intro.text);
        setShowContinue(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showContinue, onComplete, intro.text]);

  return (
    <div className={styles.overlay}>
      <h2 className={styles.chapter}>{intro.title}</h2>
      <p className={styles.text}>{displayedText}<span className={styles.cursor}>|</span></p>
      {showContinue && (
        <div className={styles.continue}>Press any key to continue...</div>
      )}
    </div>
  );
}
