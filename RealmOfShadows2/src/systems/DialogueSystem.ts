import { DialogueTree, DialogueChoice, LevelData } from '../types';
import { useDialogueStore } from '../stores/dialogueStore';
import { usePlayerStore } from '../stores/playerStore';

export class DialogueSystem {
  private trees: Record<string, DialogueTree> = {};

  init(level: LevelData) {
    this.trees = level.dialogueTrees ?? {};
  }

  startDialogue(treeId: string) {
    const tree = this.trees[treeId];
    if (!tree) return;

    const filterFn = this.createFilter();
    useDialogueStore.getState().startTree(tree, filterFn);

    // Award starting node clue/item
    const startNode = tree.nodes[tree.startNodeId];
    if (startNode) {
      if (startNode.giveClue) usePlayerStore.getState().addClue(startNode.giveClue);
      if (startNode.giveItem) usePlayerStore.getState().addItem(startNode.giveItem);
    }
  }

  handleChoice(choice: DialogueChoice) {
    // Award choice rewards
    if (choice.giveClue) usePlayerStore.getState().addClue(choice.giveClue);
    if (choice.giveItem) usePlayerStore.getState().addItem(choice.giveItem);

    // Navigate to next node
    const filterFn = this.createFilter();
    useDialogueStore.getState().goToNode(choice.nextNodeId, filterFn);

    // Award destination node rewards
    const store = useDialogueStore.getState();
    if (store.currentNode) {
      if (store.currentNode.giveClue) usePlayerStore.getState().addClue(store.currentNode.giveClue);
      if (store.currentNode.giveItem) usePlayerStore.getState().addItem(store.currentNode.giveItem);
    }
  }

  handleAdvance() {
    const store = useDialogueStore.getState();
    if (!store.currentNode) return;

    if (store.currentNode.nextNodeId) {
      const filterFn = this.createFilter();
      useDialogueStore.getState().goToNode(store.currentNode.nextNodeId, filterFn);

      // Award destination node rewards
      const updated = useDialogueStore.getState();
      if (updated.currentNode) {
        if (updated.currentNode.giveClue) usePlayerStore.getState().addClue(updated.currentNode.giveClue);
        if (updated.currentNode.giveItem) usePlayerStore.getState().addItem(updated.currentNode.giveItem);
      }
    } else if (!store.currentNode.choices || store.currentNode.choices.length === 0) {
      this.endDialogue();
    }
  }

  endDialogue() {
    useDialogueStore.getState().endDialogue();
  }

  get isActive(): boolean {
    return useDialogueStore.getState().active;
  }

  update(_dt: number) {
    // Event-driven system — no-op
  }

  private createFilter(): (choice: DialogueChoice) => boolean {
    const player = usePlayerStore.getState();
    return (choice: DialogueChoice) => {
      if (choice.requireItem && !player.inventory.includes(choice.requireItem)) return false;
      if (choice.requireClue && !player.cluesFound.includes(choice.requireClue)) return false;
      return true;
    };
  }
}
