import { useEffect, useRef } from 'react';
import { useDialogueStore } from '../stores/dialogueStore';
import { TYPEWRITER_MS } from '../constants/game';
import styles from './DialogueBox.module.css';

interface Props {
  onAdvance: () => void;
  onChoice: (index: number) => void;
}

export function DialogueBox({ onAdvance, onChoice }: Props) {
  const currentNode = useDialogueStore(s => s.currentNode);
  const visibleChoices = useDialogueStore(s => s.visibleChoices);
  const displayedText = useDialogueStore(s => s.displayedText);
  const typewriterDone = useDialogueStore(s => s.typewriterDone);
  const setDisplayedText = useDialogueStore(s => s.setDisplayedText);
  const setTypewriterDone = useDialogueStore(s => s.setTypewriterDone);
  const intervalRef = useRef<number | null>(null);

  const fullText = currentNode?.text ?? '';
  const hasChoices = visibleChoices.length > 0;

  // Typewriter effect
  useEffect(() => {
    if (!fullText) return;

    setDisplayedText('');
    setTypewriterDone(false);

    let i = 0;
    intervalRef.current = window.setInterval(() => {
      if (i < fullText.length) {
        i++;
        setDisplayedText(fullText.slice(0, i));
      } else {
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setTypewriterDone(true);
      }
    }, TYPEWRITER_MS);

    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [fullText, setDisplayedText, setTypewriterDone]);

  // Keyboard handler: E/Enter/Space to skip typewriter or advance
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!typewriterDone) {
          // Skip to full text
          if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          setDisplayedText(fullText);
          setTypewriterDone(true);
        } else if (!hasChoices) {
          onAdvance();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [typewriterDone, hasChoices, fullText, onAdvance, setDisplayedText, setTypewriterDone]);

  if (!currentNode) return null;

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h3 className={styles.speaker}>{currentNode.speaker}</h3>
        <p className={styles.text}>
          {displayedText}
          {!typewriterDone && <span className={styles.cursor}>|</span>}
        </p>
        {typewriterDone && hasChoices && (
          <div className={styles.choices}>
            {visibleChoices.map((choice, i) => (
              <button
                key={i}
                className={styles.choiceBtn}
                onClick={() => onChoice(i)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}
        {typewriterDone && !hasChoices && (
          <div className={styles.hint}>Press E to continue...</div>
        )}
      </div>
    </div>
  );
}
