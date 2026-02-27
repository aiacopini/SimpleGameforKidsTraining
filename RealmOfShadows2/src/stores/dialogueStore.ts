import { create } from 'zustand';

interface DialogueLine {
  speaker: string;
  text: string;
  portrait?: string;
}

interface DialogueChoice {
  text: string;
  next: number; // index of next line, or -1 to end
}

interface DialogueState {
  active: boolean;
  lines: DialogueLine[];
  currentLine: number;
  choices: DialogueChoice[];
  displayedText: string;
  typewriterDone: boolean;
  startDialogue: (lines: DialogueLine[], choices?: DialogueChoice[]) => void;
  advanceLine: () => void;
  selectChoice: (index: number) => void;
  setDisplayedText: (text: string) => void;
  setTypewriterDone: (done: boolean) => void;
  endDialogue: () => void;
}

export const useDialogueStore = create<DialogueState>((set) => ({
  active: false,
  lines: [],
  currentLine: 0,
  choices: [],
  displayedText: '',
  typewriterDone: false,
  startDialogue: (lines, choices = []) => set({
    active: true,
    lines,
    currentLine: 0,
    choices,
    displayedText: '',
    typewriterDone: false,
  }),
  advanceLine: () => set((state) => {
    const next = state.currentLine + 1;
    if (next >= state.lines.length) {
      return { active: false, lines: [], currentLine: 0, displayedText: '' };
    }
    return { currentLine: next, displayedText: '', typewriterDone: false };
  }),
  selectChoice: (index) => set((state) => {
    const choice = state.choices[index];
    if (!choice || choice.next === -1) {
      return { active: false, lines: [], currentLine: 0, choices: [], displayedText: '' };
    }
    return { currentLine: choice.next, choices: [], displayedText: '', typewriterDone: false };
  }),
  setDisplayedText: (text) => set({ displayedText: text }),
  setTypewriterDone: (done) => set({ typewriterDone: done }),
  endDialogue: () => set({ active: false, lines: [], currentLine: 0, choices: [], displayedText: '' }),
}));
