import { create } from 'zustand';
import { DialogueTree, DialogueNode, DialogueChoice } from '../types';

type ChoiceFilter = (choice: DialogueChoice) => boolean;

interface DialogueState {
  active: boolean;
  tree: DialogueTree | null;
  currentNode: DialogueNode | null;
  visibleChoices: DialogueChoice[];
  displayedText: string;
  typewriterDone: boolean;
  startTree: (tree: DialogueTree, filterFn?: ChoiceFilter) => void;
  goToNode: (nodeId: string, filterFn?: ChoiceFilter) => void;
  setDisplayedText: (text: string) => void;
  setTypewriterDone: (done: boolean) => void;
  endDialogue: () => void;
}

export const useDialogueStore = create<DialogueState>((set) => ({
  active: false,
  tree: null,
  currentNode: null,
  visibleChoices: [],
  displayedText: '',
  typewriterDone: false,

  startTree: (tree, filterFn) => {
    const startNode = tree.nodes[tree.startNodeId];
    if (!startNode) return;
    const choices = startNode.choices
      ? (filterFn ? startNode.choices.filter(filterFn) : startNode.choices)
      : [];
    set({
      active: true,
      tree,
      currentNode: startNode,
      visibleChoices: choices,
      displayedText: '',
      typewriterDone: false,
    });
  },

  goToNode: (nodeId, filterFn) => set((state) => {
    if (!state.tree) return {};
    const node = state.tree.nodes[nodeId];
    if (!node) {
      return { active: false, tree: null, currentNode: null, visibleChoices: [], displayedText: '' };
    }
    const choices = node.choices
      ? (filterFn ? node.choices.filter(filterFn) : node.choices)
      : [];
    return {
      currentNode: node,
      visibleChoices: choices,
      displayedText: '',
      typewriterDone: false,
    };
  }),

  setDisplayedText: (text) => set({ displayedText: text }),
  setTypewriterDone: (done) => set({ typewriterDone: done }),

  endDialogue: () => set({
    active: false,
    tree: null,
    currentNode: null,
    visibleChoices: [],
    displayedText: '',
    typewriterDone: false,
  }),
}));
