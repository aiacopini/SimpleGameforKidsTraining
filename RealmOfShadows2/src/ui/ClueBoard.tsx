import { useState, useEffect } from 'react';
import { ClueDef } from '../types';
import { THEORY_REQUIRED_CLUES } from '../constants/game';
import styles from './ClueBoard.module.css';

interface Props {
  clues: ClueDef[];
  collectedClueIds: string[];
  onSubmit: (clueIds: string[]) => void;
  onClose: () => void;
  feedback: { correct: boolean; message: string } | null;
}

export function ClueBoard({ clues, collectedClueIds, onSubmit, onClose, feedback }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const collectedClues = clues.filter(c => collectedClueIds.includes(c.id));

  const toggleClue = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= THEORY_REQUIRED_CLUES) return prev;
      return [...prev, id];
    });
  };

  const handleSubmit = () => {
    if (selectedIds.length === THEORY_REQUIRED_CLUES) {
      onSubmit(selectedIds);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Clue Board</h2>
          <button className={styles.closeBtn} onClick={onClose}>X</button>
        </div>
        <p className={styles.subtitle}>
          Select {THEORY_REQUIRED_CLUES} clues to form your theory.
        </p>
        {collectedClues.length === 0 ? (
          <div className={styles.emptyState}>
            No clues collected yet. Talk to NPCs to gather evidence.
          </div>
        ) : (
          <>
            <div className={styles.clues}>
              {collectedClues.map(clue => (
                <div
                  key={clue.id}
                  className={`${styles.clueCard} ${selectedIds.includes(clue.id) ? styles.clueCardSelected : ''}`}
                  onClick={() => toggleClue(clue.id)}
                >
                  <div className={styles.clueName}>{clue.name}</div>
                  <p className={styles.clueDesc}>{clue.description}</p>
                </div>
              ))}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.submitBtn}
                disabled={selectedIds.length !== THEORY_REQUIRED_CLUES}
                onClick={handleSubmit}
              >
                Submit Theory ({selectedIds.length}/{THEORY_REQUIRED_CLUES})
              </button>
              {feedback && (
                <p className={`${styles.feedback} ${feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                  {feedback.message}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
