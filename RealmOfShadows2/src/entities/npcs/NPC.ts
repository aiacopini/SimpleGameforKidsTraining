import { Entity } from '../../engine/Entity';
import { GameContext } from '../../types';
import { NPC_ANIMATIONS } from '../../rendering/SpriteAnimations';
import { NPC_INTERACT_RADIUS } from '../../constants/game';

export class NPC extends Entity {
  dialogueTreeId: string;
  npcType: string;
  interactRadius: number;
  playerInRange = false;

  constructor(x: number, y: number, npcType: string, dialogueTreeId: string, interactRadius?: number) {
    super(x, y, 28, 48, 'npc', 999, 'neutral', NPC_ANIMATIONS);
    this.npcType = npcType;
    this.dialogueTreeId = dialogueTreeId;
    this.interactRadius = interactRadius ?? NPC_INTERACT_RADIUS;
  }

  update(dt: number, ctx: GameContext) {
    // Find player
    const player = ctx.entities.find(e => e.type === 'player');
    if (!player) {
      this.playerInRange = false;
      this.animation.setState('idle');
      this.animation.update(dt);
      return;
    }

    const dx = (player.x + player.width / 2) - this.centerX;
    const dy = (player.y + player.height / 2) - this.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.playerInRange = dist < this.interactRadius;

    // Face player when in range
    if (this.playerInRange) {
      this.facing = dx > 0 ? 'right' : 'left';
    }

    // Handle interaction
    if (this.playerInRange && ctx.input.interactJustPressed && !ctx.isDialogueActive?.()) {
      ctx.startDialogue?.(this.dialogueTreeId);
      this.animation.setState('talk', true);
    }

    // Switch back to idle when dialogue ends
    if (this.animation.state === 'talk' && !ctx.isDialogueActive?.()) {
      this.animation.setState('idle', true);
    }

    this.animation.update(dt);
  }
}
