// ============================================================
// COMBAT.JS - Combat system with D&D mechanics
// Dungeons of Drakenmoor
// ============================================================

const Combat = {
    floatingTexts: [],

    addFloatingText(x, y, text, color, size = 16) {
        this.floatingTexts.push({
            x, y, text, color, size,
            life: 1.0,
            dy: -40,
        });
    },

    updateFloatingTexts(dt) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.dy * dt;
            ft.dy *= 0.95;
            ft.life -= dt;
            if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }
    },

    drawFloatingTexts(ctx) {
        for (const ft of this.floatingTexts) {
            const alpha = clamp(ft.life, 0, 1);
            ctx.save();
            ctx.font = `bold ${ft.size}px Cinzel, serif`;
            ctx.fillStyle = ft.color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
            if (ft.color.startsWith('#')) {
                const rgb = hexToRgb(ft.color);
                ctx.fillStyle = rgbToStr(rgb.r, rgb.g, rgb.b, alpha);
            }
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    },

    // Player attacks
    playerAttack(player, enemies, particles, projectiles, camera, input) {
        if (player.attackTimer > 0 || player.dodging || player.dead) return;

        const stats = player.stats;
        const cx = player.x + player.w / 2;
        const cy = player.y + player.h / 2;
        const mx = input.mouseWorldX(camera);
        const my = input.mouseWorldY(camera);
        const attackAngle = angle(cx, cy, mx, my);

        player.attackTimer = stats.attackSpeed;
        player.facing = mx > cx ? 1 : -1;

        if (stats.className === 'mage') {
            // Ranged magic bolt
            GameAudio.SFX.magicCast();
            projectiles.push({
                x: cx, y: cy,
                dx: Math.cos(attackAngle) * 280,
                dy: Math.sin(attackAngle) * 280,
                type: 'magic_bolt',
                damage: Dice.damageRoll(stats.damage.count, stats.damage.sides, stats.damage.bonus),
                fromEnemy: false,
                life: 2,
            });
            particles.magic(cx + Math.cos(attackAngle) * 15, cy + Math.sin(attackAngle) * 15, '#6688ff', 6);
        } else {
            // Melee attack (warrior/rogue)
            if (stats.className === 'warrior') GameAudio.SFX.swordSwing();
            else GameAudio.SFX.daggerStab();

            for (const enemy of enemies) {
                if (enemy.dead) continue;
                const ex = enemy.x + enemy.w / 2;
                const ey = enemy.y + enemy.h / 2;
                const d = dist(cx, cy, ex, ey);

                if (d <= stats.attackRange + enemy.w / 2) {
                    const angleToEnemy = angle(cx, cy, ex, ey);
                    const angleDiff = Math.abs(((angleToEnemy - attackAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
                    if (angleDiff < Math.PI / 2) {
                        this.hitEnemy(player, enemy, particles, camera);
                    }
                }
            }
        }
    },

    // Player special ability
    playerSpecial(player, enemies, particles, projectiles, camera, input) {
        if (player.specialTimer > 0 || player.dodging || player.dead) return;

        const stats = player.stats;
        if (stats.mp < stats.specialCost) return;

        stats.mp -= stats.specialCost;
        player.specialTimer = stats.specialCooldown;

        const cx = player.x + player.w / 2;
        const cy = player.y + player.h / 2;
        const mx = input.mouseWorldX(camera);
        const my = input.mouseWorldY(camera);
        const atkAngle = angle(cx, cy, mx, my);
        const ability = stats.abilities[0];

        switch (ability.type) {
            case 'melee_aoe': {
                // Warrior cleave
                GameAudio.SFX.swordSwing();
                GameAudio.SFX.swordHit();
                camera.shake(6, 0.3);
                particles.burst(cx, cy, 15, '#cc8833', 80, 0.4, 3);

                for (const enemy of enemies) {
                    if (enemy.dead) continue;
                    const d = dist(cx, cy, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
                    if (d <= ability.range) {
                        const dmg = Dice.damageRoll(ability.damage.count, ability.damage.sides, ability.damage.bonus);
                        this.applyDamageToEnemy(enemy, dmg.total, particles, camera);
                    }
                }
                break;
            }

            case 'projectile_aoe': {
                // Mage fireball
                GameAudio.SFX.fireball();
                projectiles.push({
                    x: cx, y: cy,
                    dx: Math.cos(atkAngle) * 220,
                    dy: Math.sin(atkAngle) * 220,
                    type: 'fireball',
                    damage: Dice.damageRoll(ability.damage.count, ability.damage.sides, ability.damage.bonus),
                    fromEnemy: false,
                    life: 2,
                    aoe: true,
                    aoeRadius: ability.radius,
                });
                break;
            }

            case 'teleport_attack': {
                // Rogue shadow strike
                GameAudio.SFX.teleport();
                let closest = null;
                let closestDist = ability.range;

                for (const enemy of enemies) {
                    if (enemy.dead) continue;
                    const d = dist(cx, cy, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
                    if (d < closestDist) {
                        closestDist = d;
                        closest = enemy;
                    }
                }

                if (closest) {
                    particles.shadowBurst(cx, cy);
                    // Teleport behind enemy
                    const behindAngle = angle(player.x, player.y, closest.x, closest.y);
                    player.x = closest.x - Math.cos(behindAngle) * 20;
                    player.y = closest.y - Math.sin(behindAngle) * 20;
                    particles.shadowBurst(player.x + player.w / 2, player.y + player.h / 2);

                    const dmg = Dice.damageRoll(ability.damage.count, ability.damage.sides, ability.damage.bonus);
                    this.applyDamageToEnemy(closest, dmg.total, particles, camera);
                    GameAudio.SFX.criticalHit();
                } else {
                    // No target - refund some MP
                    stats.mp += Math.floor(stats.specialCost / 2);
                }
                break;
            }
        }
    },

    hitEnemy(player, enemy, particles, camera) {
        const stats = player.stats;
        const attackStat = stats.className === 'rogue' ? stats.dex : stats.str;
        const roll = Dice.attackRoll(Dice.modifier(attackStat));

        const ex = enemy.x + enemy.w / 2;
        const ey = enemy.y + enemy.h / 2;

        if (roll.isFumble) {
            this.addFloatingText(ex, ey - 10, 'MISS', 'rgb(150,150,150)', 14);
            GameAudio.SFX.miss();
            return;
        }

        const ac = 10 + enemy.armor;
        if (!roll.isCrit && roll.total < ac) {
            this.addFloatingText(ex, ey - 10, 'MISS', 'rgb(150,150,150)', 14);
            GameAudio.SFX.miss();
            return;
        }

        let dmg = Dice.damageRoll(stats.damage.count, stats.damage.sides, stats.damage.bonus);
        let totalDmg = dmg.total;

        // Rogue sneak attack (backstab bonus)
        if (stats.className === 'rogue') {
            totalDmg += Dice.damageRoll(1, 6, 0).total;
        }

        if (roll.isCrit) {
            totalDmg = Math.floor(totalDmg * 2);
            this.addFloatingText(ex, ey - 20, 'CRITICAL!', 'rgb(255,200,50)', 20);
            GameAudio.SFX.criticalHit();
            camera.shake(4, 0.2);
        } else {
            GameAudio.SFX.swordHit();
        }

        // Apply buffs
        for (const buff of stats.buffs) {
            if (buff.type === 'buff_str') totalDmg += buff.value;
        }

        this.applyDamageToEnemy(enemy, totalDmg, particles, camera);
    },

    applyDamageToEnemy(enemy, totalDmg, particles, camera) {
        const effectiveDmg = Math.max(1, totalDmg - Math.floor(enemy.armor * 0.5));
        enemy.hp -= effectiveDmg;
        enemy.hitFlash = 0.15;
        enemy.state = 'chase';

        const ex = enemy.x + enemy.w / 2;
        const ey = enemy.y + enemy.h / 2;

        this.addFloatingText(ex + rand(-10, 10), ey - 15, `-${effectiveDmg}`, 'rgb(255,80,80)', 16);
        particles.blood(ex, ey, 5);
        GameAudio.SFX.enemyHurt();

        if (enemy.hp <= 0) {
            enemy.dead = true;
            enemy.deathTimer = 0.5;
            particles.deathBurst(ex, ey, '#aa3333');

            if (enemy.boss) {
                GameAudio.SFX.bossDeath();
                camera.shake(10, 0.8);
                particles.explosion(ex, ey, 60, 40);
            } else {
                GameAudio.SFX.enemyDie();
                camera.shake(2, 0.15);
            }
        }
    },

    // Handle projectile collisions
    updateProjectiles(projectiles, player, enemies, particles, camera, level, dt) {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.x += p.dx * dt;
            p.y += p.dy * dt;
            p.life -= dt;

            // Wall collision (skip for phasing projectiles)
            const tx = Math.floor(p.x / TILE);
            const ty = Math.floor(p.y / TILE);
            if (tx >= 0 && ty >= 0 && tx < level.width && ty < level.height) {
                const tile = level.tiles[ty * level.width + tx];
                if (tile === T.WALL || tile === T.WALL_TOP || tile === T.PILLAR) {
                    if (p.aoe) {
                        this.projectileAOE(p, enemies, particles, camera);
                    }
                    particles.burst(p.x, p.y, 5, '#888', 30, 0.2, 2);
                    projectiles.splice(i, 1);
                    continue;
                }
            }

            if (p.life <= 0) {
                if (p.aoe) {
                    this.projectileAOE(p, enemies, particles, camera);
                }
                projectiles.splice(i, 1);
                continue;
            }

            if (p.fromEnemy) {
                // Hit player
                if (!player.dodging && player.invulnTime <= 0 &&
                    p.x > player.x && p.x < player.x + player.w &&
                    p.y > player.y && p.y < player.y + player.h) {
                    let dmg = Math.max(1, p.damage.total - Math.floor(player.stats.armor * 0.5));
                    player.stats.hp -= dmg;
                    player.invulnTime = 0.5;
                    this.addFloatingText(player.x + player.w / 2, player.y - 10, `-${dmg}`, 'rgb(255,100,100)', 16);
                    particles.burst(p.x, p.y, 6, '#cc2222', 40, 0.3, 2);
                    GameAudio.SFX.playerHurt();
                    camera.shake(3, 0.15);
                    projectiles.splice(i, 1);
                    continue;
                }
            } else {
                // Hit enemy
                for (const enemy of enemies) {
                    if (enemy.dead) continue;
                    if (p.x > enemy.x && p.x < enemy.x + enemy.w &&
                        p.y > enemy.y && p.y < enemy.y + enemy.h) {
                        if (p.aoe) {
                            this.projectileAOE(p, enemies, particles, camera);
                        } else {
                            this.applyDamageToEnemy(enemy, p.damage.total, particles, camera);
                        }
                        projectiles.splice(i, 1);
                        break;
                    }
                }
            }

            // Particle trail
            if (p.type === 'fireball') particles.fire(p.x, p.y, 2);
            else if (p.type === 'magic_bolt') particles.trail(p.x, p.y, '#6688ff', 2);
            else if (p.type === 'shadow_bolt') particles.trail(p.x, p.y, '#6633aa', 2);
            else if (p.type === 'fire_bolt') particles.trail(p.x, p.y, '#ff6600', 2);
        }
    },

    projectileAOE(proj, enemies, particles, camera) {
        const radius = proj.aoeRadius || 50;
        particles.explosion(proj.x, proj.y, radius, 20);
        GameAudio.SFX.explosion();
        camera.shake(6, 0.3);

        for (const enemy of enemies) {
            if (enemy.dead) continue;
            const d = dist(proj.x, proj.y, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
            if (d < radius) {
                const falloff = 1 - (d / radius) * 0.5;
                this.applyDamageToEnemy(enemy, Math.floor(proj.damage.total * falloff), particles, camera);
            }
        }
    },

    // Player dodge
    playerDodge(player, input, particles) {
        if (player.dodgeTimer > 0 || player.dodging || player.dead) return;

        let dx = 0, dy = 0;
        if (input.isDown('KeyW') || input.isDown('ArrowUp')) dy = -1;
        if (input.isDown('KeyS') || input.isDown('ArrowDown')) dy = 1;
        if (input.isDown('KeyA') || input.isDown('ArrowLeft')) dx = -1;
        if (input.isDown('KeyD') || input.isDown('ArrowRight')) dx = 1;

        if (dx === 0 && dy === 0) dx = player.facing;

        const len = Math.hypot(dx, dy) || 1;
        player.dodging = true;
        player.dodgeDx = (dx / len) * 350;
        player.dodgeDy = (dy / len) * 350;
        player.dodgeTimer = player.stats.dodgeCooldown;
        player.invulnTime = 0.3;

        GameAudio.SFX.dodge();
        particles.burst(player.x + player.w / 2, player.y + player.h / 2, 8, '#aabbff', 50, 0.3, 2);

        setTimeout(() => { player.dodging = false; }, 200);
    },

    // Use inventory item
    useItem(player, slot, particles) {
        const inv = player.stats.inventory;
        const item = inv.find(i => i.slot === slot && i.count > 0);
        if (!item) return;

        const cx = player.x + player.w / 2;
        const cy = player.y + player.h / 2;

        switch (item.effect) {
            case 'heal':
                player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + item.value);
                particles.heal(cx, cy, 8);
                this.addFloatingText(cx, cy - 15, `+${item.value} HP`, 'rgb(80,255,80)', 14);
                GameAudio.SFX.usePotion();
                break;
            case 'mana':
                player.stats.mp = Math.min(player.stats.maxMp, player.stats.mp + item.value);
                particles.magic(cx, cy, '#3366ff', 8);
                this.addFloatingText(cx, cy - 15, `+${item.value} MP`, 'rgb(80,80,255)', 14);
                GameAudio.SFX.usePotion();
                break;
            case 'buff_str':
                player.stats.buffs.push({ type: 'buff_str', value: item.value, duration: item.duration, timer: item.duration });
                particles.burst(cx, cy, 10, '#ff8800', 50, 0.5, 3);
                this.addFloatingText(cx, cy - 15, `+${item.value} DMG`, 'rgb(255,150,50)', 14);
                GameAudio.SFX.usePotion();
                break;
        }

        item.count--;
        if (item.count <= 0) {
            const idx = inv.indexOf(item);
            if (idx >= 0) inv.splice(idx, 1);
        }
    },
};
