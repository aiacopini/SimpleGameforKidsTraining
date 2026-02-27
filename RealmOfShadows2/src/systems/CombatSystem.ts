import { Entity } from '../engine/Entity';
import { GameContext } from '../types';
import { ATTACK_RANGE, ATTACK_WIDTH, ATTACK_HEIGHT, PLAYER_ATTACK_DAMAGE, HURT_KNOCKBACK } from '../constants/physics';
import { aabbOverlap } from '../engine/Physics';

export class CombatSystem {
  private attackHits = new Set<string>(); // "attackerId-targetId" to prevent multi-hit

  update(player: Entity, entities: Entity[], ctx: GameContext) {
    // Player attacking enemies
    if (player.animation.state === 'attack' || player.animation.state === 'attack-air') {
      const progress = player.animation.progress;
      // Active frames: 30-60% of attack animation
      if (progress >= 0.3 && progress <= 0.6) {
        const hitboxX = player.facing === 'right'
          ? player.x + player.width
          : player.x - ATTACK_RANGE;
        const hitboxY = player.y + 4;

        for (const entity of entities) {
          if (entity === player || entity.team !== 'enemy' || !entity.alive) continue;

          const key = `${player.id}-${entity.id}`;
          if (this.attackHits.has(key)) continue;

          if (aabbOverlap(
            hitboxX, hitboxY, ATTACK_RANGE, ATTACK_HEIGHT,
            entity.x, entity.y, entity.width, entity.height,
          )) {
            const knockDir = player.facing === 'right' ? HURT_KNOCKBACK : -HURT_KNOCKBACK;
            entity.takeDamage(PLAYER_ATTACK_DAMAGE, knockDir, ctx);
            this.attackHits.add(key);

            // Sword slash particles
            ctx.addParticle?.('swordSlash',
              entity.facing === 'right' ? entity.x : entity.x + entity.width,
              entity.centerY,
            );
          }
        }
      }
    } else {
      // Clear attack tracking when not attacking
      this.attackHits.clear();
    }

    // Enemies attacking player
    for (const entity of entities) {
      if (entity === player || entity.team !== 'enemy' || !entity.alive) continue;

      if (entity.animation.state === 'attack') {
        const progress = entity.animation.progress;
        if (progress >= 0.3 && progress <= 0.6) {
          const hitboxX = entity.facing === 'right'
            ? entity.x + entity.width
            : entity.x - ATTACK_RANGE;
          const hitboxY = entity.y + 4;

          const key = `${entity.id}-${player.id}`;
          if (this.attackHits.has(key)) continue;

          if (aabbOverlap(
            hitboxX, hitboxY, ATTACK_RANGE, ATTACK_HEIGHT,
            player.x, player.y, player.width, player.height,
          )) {
            const damage = (entity as unknown as { attackDamage?: number }).attackDamage ?? 1;
            const knockDir = entity.facing === 'right' ? HURT_KNOCKBACK : -HURT_KNOCKBACK;
            player.takeDamage(damage, knockDir, ctx);
            this.attackHits.add(key);
          }
        }
      }
    }
  }
}
