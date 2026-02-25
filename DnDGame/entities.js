// ============================================================
// ENTITIES.JS - Player and Enemy entity logic
// Dungeons of Drakenmoor
// ============================================================

// Enemy definitions (stats, behavior)
const ENEMY_DEFS = {
    [ENT.GOBLIN]: { name:'Goblin', hp:25, armor:1, speed:70, damage:{count:1,sides:4,bonus:1}, attackRange:30, attackSpeed:1.0, xp:15, aggressive:true, detectRange:150, w:24, h:28 },
    [ENT.GOBLIN_ARCHER]: { name:'Goblin Archer', hp:18, armor:0, speed:60, damage:{count:1,sides:6,bonus:0}, attackRange:180, attackSpeed:1.5, xp:20, aggressive:true, detectRange:200, ranged:true, projectile:'arrow', w:24, h:28 },
    [ENT.GOBLIN_SHAMAN]: { name:'Goblin Shaman', hp:22, armor:0, speed:50, damage:{count:1,sides:6,bonus:2}, attackRange:150, attackSpeed:2.0, xp:25, aggressive:true, detectRange:180, ranged:true, projectile:'green_bolt', healer:true, w:24, h:28 },
    [ENT.GOBLIN_KING]: { name:'Goblin King', hp:200, armor:3, speed:80, damage:{count:2,sides:8,bonus:3}, attackRange:40, attackSpeed:1.2, xp:100, aggressive:true, detectRange:250, boss:true, w:40, h:48 },
    [ENT.WOLF]: { name:'Wolf', hp:30, armor:1, speed:130, damage:{count:1,sides:6,bonus:2}, attackRange:28, attackSpeed:0.8, xp:18, aggressive:true, detectRange:180, w:30, h:22 },
    [ENT.TREANT]: { name:'Treant', hp:60, armor:4, speed:30, damage:{count:2,sides:6,bonus:2}, attackRange:35, attackSpeed:2.0, xp:30, aggressive:false, detectRange:100, w:32, h:40 },
    [ENT.SPIDER]: { name:'Giant Spider', hp:20, armor:1, speed:100, damage:{count:1,sides:4,bonus:1}, attackRange:25, attackSpeed:0.7, xp:15, aggressive:true, detectRange:120, w:28, h:24 },
    [ENT.FAIRY]: { name:'Dark Fairy', hp:15, armor:0, speed:90, damage:{count:1,sides:4,bonus:2}, attackRange:120, attackSpeed:1.5, xp:12, aggressive:true, detectRange:160, ranged:true, projectile:'green_bolt', w:18, h:18 },
    [ENT.FOREST_GUARDIAN]: { name:'Forest Guardian', hp:300, armor:5, speed:40, damage:{count:2,sides:10,bonus:4}, attackRange:50, attackSpeed:2.5, xp:150, aggressive:true, detectRange:200, boss:true, w:48, h:56 },
    [ENT.SKELETON]: { name:'Skeleton', hp:20, armor:2, speed:60, damage:{count:1,sides:6,bonus:1}, attackRange:30, attackSpeed:1.0, xp:15, aggressive:true, detectRange:150, w:24, h:30 },
    [ENT.SKELETON_MAGE]: { name:'Skeleton Mage', hp:18, armor:0, speed:45, damage:{count:1,sides:8,bonus:2}, attackRange:170, attackSpeed:2.0, xp:25, aggressive:true, detectRange:200, ranged:true, projectile:'shadow_bolt', w:24, h:30 },
    [ENT.ZOMBIE]: { name:'Zombie', hp:40, armor:2, speed:35, damage:{count:1,sides:8,bonus:2}, attackRange:28, attackSpeed:1.5, xp:20, aggressive:true, detectRange:120, w:26, h:30 },
    [ENT.WRAITH]: { name:'Wraith', hp:35, armor:0, speed:80, damage:{count:2,sides:6,bonus:2}, attackRange:30, attackSpeed:1.2, xp:30, aggressive:true, detectRange:180, phasing:true, w:26, h:32 },
    [ENT.LICH]: { name:'Lich', hp:350, armor:3, speed:50, damage:{count:3,sides:8,bonus:5}, attackRange:200, attackSpeed:2.5, xp:200, aggressive:true, detectRange:250, ranged:true, projectile:'shadow_bolt', boss:true, w:36, h:44 },
    [ENT.FIRE_IMP]: { name:'Fire Imp', hp:22, armor:1, speed:100, damage:{count:1,sides:6,bonus:2}, attackRange:130, attackSpeed:1.2, xp:20, aggressive:true, detectRange:160, ranged:true, projectile:'fire_bolt', w:22, h:26 },
    [ENT.LAVA_GOLEM]: { name:'Lava Golem', hp:80, armor:6, speed:30, damage:{count:2,sides:8,bonus:3}, attackRange:35, attackSpeed:2.0, xp:40, aggressive:true, detectRange:120, w:34, h:38 },
    [ENT.FIRE_DRAKE]: { name:'Fire Drake', hp:50, armor:3, speed:80, damage:{count:1,sides:8,bonus:3}, attackRange:100, attackSpeed:1.5, xp:35, aggressive:true, detectRange:180, ranged:true, projectile:'fire_bolt', w:32, h:28 },
    [ENT.RED_DRAGON]: { name:'Red Dragon', hp:500, armor:6, speed:60, damage:{count:3,sides:10,bonus:6}, attackRange:60, attackSpeed:2.0, xp:300, aggressive:true, detectRange:300, boss:true, w:56, h:52 },
    [ENT.DARK_KNIGHT]: { name:'Dark Knight', hp:60, armor:5, speed:70, damage:{count:2,sides:6,bonus:3}, attackRange:35, attackSpeed:1.0, xp:35, aggressive:true, detectRange:180, w:28, h:32 },
    [ENT.SHADOW_ASSASSIN]: { name:'Shadow Assassin', hp:35, armor:2, speed:120, damage:{count:2,sides:6,bonus:4}, attackRange:28, attackSpeed:0.6, xp:30, aggressive:true, detectRange:200, w:24, h:30 },
    [ENT.DEMON]: { name:'Demon', hp:90, armor:4, speed:70, damage:{count:2,sides:8,bonus:4}, attackRange:40, attackSpeed:1.5, xp:50, aggressive:true, detectRange:200, w:34, h:38 },
    [ENT.DARK_LORD]: { name:'Dark Lord', hp:800, armor:8, speed:55, damage:{count:3,sides:12,bonus:8}, attackRange:200, attackSpeed:2.5, xp:500, aggressive:true, detectRange:400, ranged:true, projectile:'shadow_bolt', boss:true, w:48, h:56 },
};

function createEnemy(type, x, y) {
    const def = ENEMY_DEFS[type];
    return {
        type,
        name: def.name,
        x, y,
        w: def.w, h: def.h,
        hp: def.hp, maxHp: def.hp,
        armor: def.armor,
        speed: def.speed,
        damage: { ...def.damage },
        attackRange: def.attackRange,
        attackSpeed: def.attackSpeed,
        attackTimer: 0,
        xp: def.xp,
        aggressive: def.aggressive,
        detectRange: def.detectRange,
        ranged: def.ranged || false,
        projectile: def.projectile || null,
        boss: def.boss || false,
        phasing: def.phasing || false,
        healer: def.healer || false,
        state: 'idle',
        facing: 1,
        stateTimer: 0,
        patrolX: x,
        patrolY: y,
        patrolDir: 1,
        hitFlash: 0,
        dead: false,
        deathTimer: 0,
    };
}

function createPlayer(className, x, y) {
    const stats = createPlayerStats(className);
    return {
        type: ENT.PLAYER,
        stats,
        x, y,
        w: 28, h: 32,
        dx: 0, dy: 0,
        facing: 1,
        attackTimer: 0,
        specialTimer: 0,
        dodgeTimer: 0,
        dodging: false,
        dodgeDx: 0,
        dodgeDy: 0,
        invulnTime: 0,
        interactCooldown: 0,
        dead: false,
    };
}

// Enemy AI
function updateEnemyAI(enemy, player, dt, level, projectiles, particles, enemies) {
    if (enemy.dead) {
        enemy.deathTimer -= dt;
        return;
    }

    enemy.attackTimer = Math.max(0, enemy.attackTimer - dt);
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.stateTimer -= dt;

    const distToPlayer = dist(
        enemy.x + enemy.w / 2, enemy.y + enemy.h / 2,
        player.x + player.w / 2, player.y + player.h / 2
    );

    // Facing
    if (player.x + player.w / 2 > enemy.x + enemy.w / 2) enemy.facing = 1;
    else enemy.facing = -1;

    const cx = enemy.x + enemy.w / 2;
    const cy = enemy.y + enemy.h / 2;
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;

    switch (enemy.state) {
        case 'idle':
            // Patrol a bit
            if (enemy.stateTimer <= 0) {
                enemy.patrolDir *= -1;
                enemy.stateTimer = rand(1, 3);
            }
            // Move along patrol
            const patDx = enemy.patrolDir * enemy.speed * 0.3 * dt;
            const newPatX = enemy.x + patDx;
            if (!isWall(newPatX, enemy.y, enemy.w, enemy.h, level)) {
                enemy.x = newPatX;
            }

            // Detect player
            if (distToPlayer < enemy.detectRange) {
                enemy.state = 'chase';
            }
            break;

        case 'chase':
            if (distToPlayer > enemy.detectRange * 1.5) {
                enemy.state = 'idle';
                enemy.stateTimer = 2;
                break;
            }

            if (distToPlayer > enemy.attackRange) {
                // Move toward player
                const ang = angle(cx, cy, px, py);
                let mvx = Math.cos(ang) * enemy.speed * dt;
                let mvy = Math.sin(ang) * enemy.speed * dt;

                if (!enemy.phasing) {
                    if (isWall(enemy.x + mvx, enemy.y, enemy.w, enemy.h, level)) mvx = 0;
                    if (isWall(enemy.x, enemy.y + mvy, enemy.w, enemy.h, level)) mvy = 0;
                }

                enemy.x += mvx;
                enemy.y += mvy;
            } else {
                enemy.state = 'attack';
            }
            break;

        case 'attack':
            if (distToPlayer > enemy.attackRange * 1.3) {
                enemy.state = 'chase';
                break;
            }

            if (enemy.attackTimer <= 0) {
                enemy.attackTimer = enemy.attackSpeed;

                if (enemy.ranged) {
                    // Fire projectile
                    const ang = angle(cx, cy, px, py);
                    projectiles.push({
                        x: cx, y: cy,
                        dx: Math.cos(ang) * 200,
                        dy: Math.sin(ang) * 200,
                        type: enemy.projectile || 'arrow',
                        damage: Dice.damageRoll(enemy.damage.count, enemy.damage.sides, enemy.damage.bonus),
                        fromEnemy: true,
                        life: 3,
                    });
                } else {
                    // Melee attack on player
                    if (distToPlayer < enemy.attackRange + 10) {
                        const attackRoll = Dice.attackRoll(Dice.modifier(12));
                        if (attackRoll.isFumble) {
                            // Miss
                        } else if (attackRoll.total >= 10 - player.stats.armor * 0.3) {
                            let dmg = Dice.damageRoll(enemy.damage.count, enemy.damage.sides, enemy.damage.bonus);
                            let totalDmg = Math.max(1, dmg.total - Math.floor(player.stats.armor * 0.5));
                            if (attackRoll.isCrit) {
                                totalDmg = Math.floor(totalDmg * 1.5);
                            }
                            if (!player.dodging && player.invulnTime <= 0) {
                                player.stats.hp -= totalDmg;
                                player.invulnTime = 0.5;
                                particles.burst(px, py, 6, '#cc2222', 40, 0.3, 2);
                                GameAudio.SFX.playerHurt();
                            }
                        }
                    }
                }

                // Boss special behavior
                if (enemy.boss && Math.random() < 0.3) {
                    performBossSpecial(enemy, player, projectiles, particles);
                }

                // Healer behavior
                if (enemy.healer && Math.random() < 0.25) {
                    healNearbyAlly(enemy, enemies, particles);
                }
            }
            break;
    }
}

function performBossSpecial(boss, player, projectiles, particles) {
    const cx = boss.x + boss.w / 2;
    const cy = boss.y + boss.h / 2;

    switch (boss.type) {
        case ENT.GOBLIN_KING:
            // Charge attack
            const ang = angle(cx, cy, player.x + player.w / 2, player.y + player.h / 2);
            boss.x += Math.cos(ang) * 60;
            boss.y += Math.sin(ang) * 60;
            particles.burst(cx, cy, 10, '#8a6a3a', 60, 0.4, 3);
            break;

        case ENT.FOREST_GUARDIAN:
            // Root burst
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                projectiles.push({
                    x: cx, y: cy,
                    dx: Math.cos(a) * 120, dy: Math.sin(a) * 120,
                    type: 'green_bolt', damage: Dice.damageRoll(1, 8, 2),
                    fromEnemy: true, life: 2,
                });
            }
            break;

        case ENT.LICH:
            // Summon skeletons (represented as projectile barrage)
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                projectiles.push({
                    x: cx, y: cy,
                    dx: Math.cos(a) * 100, dy: Math.sin(a) * 100,
                    type: 'shadow_bolt', damage: Dice.damageRoll(2, 6, 3),
                    fromEnemy: true, life: 2.5,
                });
            }
            particles.shadowBurst(cx, cy);
            break;

        case ENT.RED_DRAGON:
            // Fire breath cone
            const breathAng = angle(cx, cy, player.x + player.w / 2, player.y + player.h / 2);
            for (let i = -3; i <= 3; i++) {
                const a = breathAng + i * 0.15;
                projectiles.push({
                    x: cx, y: cy,
                    dx: Math.cos(a) * 180, dy: Math.sin(a) * 180,
                    type: 'fire_bolt', damage: Dice.damageRoll(2, 8, 4),
                    fromEnemy: true, life: 1.5,
                });
            }
            particles.fire(cx, cy, 15);
            GameAudio.SFX.fireball();
            break;

        case ENT.DARK_LORD:
            // Shadow barrage + teleport
            if (Math.random() < 0.5) {
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2;
                    projectiles.push({
                        x: cx, y: cy,
                        dx: Math.cos(a) * 140, dy: Math.sin(a) * 140,
                        type: 'shadow_bolt', damage: Dice.damageRoll(2, 10, 5),
                        fromEnemy: true, life: 3,
                    });
                }
                particles.shadowBurst(cx, cy);
            } else {
                // Teleport near player
                particles.shadowBurst(cx, cy);
                boss.x = player.x + rand(-80, 80);
                boss.y = player.y + rand(-80, 80);
                particles.shadowBurst(boss.x + boss.w / 2, boss.y + boss.h / 2);
            }
            break;
    }
}

function healNearbyAlly(healer, enemies, particles) {
    for (const e of enemies) {
        if (e === healer || e.dead) continue;
        const d = dist(healer.x, healer.y, e.x, e.y);
        if (d < 120 && e.hp < e.maxHp) {
            e.hp = Math.min(e.maxHp, e.hp + 10);
            particles.heal(e.x + e.w / 2, e.y + e.h / 2, 5);
            break;
        }
    }
}

function isWall(x, y, w, h, level) {
    const tiles = level.tiles;
    const mapW = level.width;
    const mapH = level.height;
    // Check four corners
    const checks = [
        { cx: x + 2, cy: y + 2 },
        { cx: x + w - 2, cy: y + 2 },
        { cx: x + 2, cy: y + h - 2 },
        { cx: x + w - 2, cy: y + h - 2 },
    ];
    for (const c of checks) {
        const tx = Math.floor(c.cx / TILE);
        const ty = Math.floor(c.cy / TILE);
        if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) return true;
        const tile = tiles[ty * mapW + tx];
        if (tile === T.WALL || tile === T.WALL_TOP || tile === T.PILLAR ||
            tile === T.BOSS_DOOR || tile === T.VOID) {
            return true;
        }
    }
    return false;
}

function isTileAt(x, y, tileType, level) {
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) return false;
    return level.tiles[ty * level.width + tx] === tileType;
}

function getTileAt(px, py, level) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) return T.VOID;
    return level.tiles[ty * level.width + tx];
}

function setTileAt(px, py, tileType, level) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) return;
    level.tiles[ty * level.width + tx] = tileType;
}
