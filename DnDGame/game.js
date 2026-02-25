// ============================================================
// GAME.JS - Main game loop and state management
// Dungeons of Drakenmoor
// ============================================================

const Game = (() => {
    // Core systems
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('uiOverlay');
    const camera = new Camera();
    const input = new InputManager(canvas);
    const particles = new ParticleSystem();

    // State
    let state = 'menu'; // menu, playing, paused, dead, victory, levelIntro
    let selectedClass = null;
    let player = null;
    let currentLevel = null;
    let levelIndex = 0;
    let projectiles = [];
    let lastTime = 0;
    let gameTime = 0;
    let openedChests = new Set();
    let unlockedDoors = new Set();
    let bossTriggered = false;

    // Tile rendering cache
    let tileCanvas = null;
    let tileCtx = null;
    let tilesRendered = false;

    // ---- MENU FUNCTIONS ----
    function showScreen(id) {
        document.querySelectorAll('.menu-screen').forEach(s => s.classList.add('hidden'));
        if (id) document.getElementById(id).classList.remove('hidden');
        overlay.className = id ? 'active' : '';
        if (!id) overlay.style.pointerEvents = 'none';
    }

    function showMainMenu() {
        state = 'menu';
        showScreen('mainMenu');
        GameAudio.stopMusic();
    }

    function showClassSelect() {
        GameAudio.init();
        showScreen('classSelect');
        selectedClass = null;
        document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
        document.getElementById('startGameBtn').style.opacity = '0.4';
        document.getElementById('startGameBtn').style.pointerEvents = 'none';
    }

    function showControls() {
        showScreen('controlsScreen');
    }

    function selectClass(cls) {
        selectedClass = cls;
        document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
        document.getElementById(`card-${cls}`).classList.add('selected');
        document.getElementById('startGameBtn').style.opacity = '1';
        document.getElementById('startGameBtn').style.pointerEvents = 'auto';
    }

    function startGame() {
        if (!selectedClass) return;
        levelIndex = 0;
        showLevelIntro();
    }

    function showLevelIntro() {
        const info = LEVEL_INFO[levelIndex];
        document.getElementById('levelTitle').textContent = info.name;
        document.getElementById('levelDesc').textContent = info.desc;
        document.getElementById('levelFloor').textContent = info.floor;
        showScreen('levelIntro');
    }

    function beginLevel() {
        loadLevel(levelIndex);
        state = 'playing';
        showScreen(null);
        overlay.style.pointerEvents = 'none';

        const info = LEVEL_INFO[levelIndex];
        GameAudio.startMusic(info.music);
        HUD.addNotification(`Entering ${info.name}...`, '#d4a54a', 3);
    }

    function loadLevel(idx) {
        currentLevel = generateLevel(idx);
        projectiles = [];
        particles.clear();
        Combat.floatingTexts = [];
        openedChests = new Set();
        unlockedDoors = new Set();
        bossTriggered = false;
        tilesRendered = false;

        if (!player) {
            player = createPlayer(selectedClass, currentLevel.playerStart.x, currentLevel.playerStart.y);
        } else {
            player.x = currentLevel.playerStart.x;
            player.y = currentLevel.playerStart.y;
            player.dead = false;
            // Restore some health between levels
            player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + Math.floor(player.stats.maxHp * 0.3));
            player.stats.mp = Math.min(player.stats.maxMp, player.stats.mp + Math.floor(player.stats.maxMp * 0.3));
        }

        camera.x = player.x - CANVAS_W / 2;
        camera.y = player.y - CANVAS_H / 2;
        camera.targetX = camera.x;
        camera.targetY = camera.y;

        // Pre-render tiles
        renderTileCache();
    }

    function renderTileCache() {
        const level = currentLevel;
        const theme = THEMES[LEVEL_INFO[levelIndex].theme];

        tileCanvas = document.createElement('canvas');
        tileCanvas.width = level.width * TILE;
        tileCanvas.height = level.height * TILE;
        tileCtx = tileCanvas.getContext('2d');

        // Background
        tileCtx.fillStyle = theme.bg;
        tileCtx.fillRect(0, 0, tileCanvas.width, tileCanvas.height);

        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                const t = level.tiles[y * level.width + x];
                const px = x * TILE;
                const py = y * TILE;

                switch (t) {
                    case T.VOID:
                        break;

                    case T.FLOOR:
                        tileCtx.fillStyle = ((x + y) % 2 === 0) ? theme.floor : theme.floorAlt;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        // Subtle floor detail
                        if (Math.random() < 0.15) {
                            tileCtx.fillStyle = 'rgba(0,0,0,0.1)';
                            tileCtx.fillRect(px + randInt(4, 24), py + randInt(4, 24), randInt(2, 6), randInt(2, 6));
                        }
                        break;

                    case T.WALL:
                        tileCtx.fillStyle = theme.wall;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        // Brick lines
                        tileCtx.fillStyle = 'rgba(0,0,0,0.15)';
                        tileCtx.fillRect(px, py + TILE / 2, TILE, 1);
                        tileCtx.fillRect(px + TILE / 2, py, 1, TILE / 2);
                        tileCtx.fillRect(px, py + TILE / 2, 1, TILE / 2);
                        // Highlight
                        tileCtx.fillStyle = theme.wallHighlight;
                        tileCtx.fillRect(px, py, TILE, 2);
                        break;

                    case T.WALL_TOP:
                        tileCtx.fillStyle = theme.wallTop;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        tileCtx.fillStyle = theme.wallHighlight;
                        tileCtx.fillRect(px, py + TILE - 3, TILE, 3);
                        break;

                    case T.ENTRANCE:
                        tileCtx.fillStyle = theme.floor;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        tileCtx.fillStyle = '#555';
                        tileCtx.fillRect(px + 8, py + 4, TILE - 16, TILE - 8);
                        tileCtx.fillStyle = '#777';
                        tileCtx.fillRect(px + 10, py + 6, TILE - 20, TILE - 12);
                        break;

                    case T.PILLAR:
                        tileCtx.fillStyle = theme.floor;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        tileCtx.fillStyle = theme.wall;
                        tileCtx.fillRect(px + 8, py + 4, TILE - 16, TILE - 4);
                        tileCtx.fillStyle = theme.wallHighlight;
                        tileCtx.fillRect(px + 6, py + 2, TILE - 12, 4);
                        tileCtx.fillRect(px + 6, py + TILE - 4, TILE - 12, 4);
                        break;

                    case T.TORCH:
                        tileCtx.fillStyle = theme.floor;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        // Torch base
                        tileCtx.fillStyle = '#5a3a1a';
                        tileCtx.fillRect(px + 13, py + 8, 6, 20);
                        tileCtx.fillStyle = theme.torchColor;
                        tileCtx.fillRect(px + 12, py + 4, 8, 8);
                        break;

                    case T.WATER:
                        tileCtx.fillStyle = theme.water;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        tileCtx.fillStyle = 'rgba(255,255,255,0.05)';
                        tileCtx.fillRect(px + 4, py + 8, 12, 2);
                        tileCtx.fillRect(px + 16, py + 18, 10, 2);
                        break;

                    case T.LAVA:
                        tileCtx.fillStyle = '#993300';
                        tileCtx.fillRect(px, py, TILE, TILE);
                        tileCtx.fillStyle = '#cc4400';
                        tileCtx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
                        tileCtx.fillStyle = '#ff6600';
                        tileCtx.fillRect(px + 8, py + 8, TILE - 16, TILE - 16);
                        break;

                    case T.TRAP:
                        tileCtx.fillStyle = theme.floor;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        tileCtx.fillStyle = 'rgba(100,60,30,0.3)';
                        tileCtx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
                        // Subtle pressure plate lines
                        tileCtx.strokeStyle = 'rgba(80,60,30,0.3)';
                        tileCtx.lineWidth = 1;
                        tileCtx.strokeRect(px + 6, py + 6, TILE - 12, TILE - 12);
                        break;

                    case T.RUBBLE:
                        tileCtx.fillStyle = theme.floor;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        tileCtx.fillStyle = theme.wall;
                        tileCtx.fillRect(px + 4, py + 12, 10, 8);
                        tileCtx.fillRect(px + 18, py + 16, 8, 6);
                        tileCtx.fillRect(px + 10, py + 20, 6, 5);
                        break;

                    case T.BONE_PILE:
                        tileCtx.fillStyle = theme.floor;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        tileCtx.fillStyle = '#c8c0a8';
                        tileCtx.fillRect(px + 6, py + 14, 12, 3);
                        tileCtx.fillRect(px + 10, py + 10, 3, 14);
                        tileCtx.fillRect(px + 16, py + 16, 8, 2);
                        tileCtx.fillStyle = '#b8b098';
                        tileCtx.beginPath();
                        tileCtx.arc(px + 14, py + 10, 5, 0, Math.PI * 2);
                        tileCtx.fill();
                        break;

                    case T.CHEST:
                    case T.DOOR:
                    case T.BOSS_DOOR:
                    case T.STAIRS:
                        // These are drawn dynamically
                        tileCtx.fillStyle = theme.floor;
                        tileCtx.fillRect(px, py, TILE, TILE);
                        break;
                }
            }
        }

        tilesRendered = true;
    }

    // ---- GAME LOOP ----
    function gameLoop(timestamp) {
        requestAnimationFrame(gameLoop);

        const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;

        if (state !== 'playing') return;

        gameTime += dt;
        update(dt);
        render();
        input.endFrame();
    }

    function update(dt) {
        const level = currentLevel;
        if (!level || !player) return;

        Sprites.update(dt);
        HUD.update(dt);
        Combat.updateFloatingTexts(dt);
        particles.update(dt);

        // Pause check
        if (input.justPressed('Escape')) {
            state = 'paused';
            showScreen('pauseScreen');
            return;
        }

        // Minimap toggle
        if (input.justPressed('KeyM')) {
            HUD.minimapVisible = !HUD.minimapVisible;
        }

        // Update buffs
        for (let i = player.stats.buffs.length - 1; i >= 0; i--) {
            player.stats.buffs[i].timer -= dt;
            if (player.stats.buffs[i].timer <= 0) {
                player.stats.buffs.splice(i, 1);
            }
        }

        // Player movement
        updatePlayer(dt);

        // Camera
        camera.follow(player, level.width * TILE, level.height * TILE);
        camera.update(dt);

        // Enemies
        for (const enemy of level.enemies) {
            updateEnemyAI(enemy, player, dt, level, projectiles, particles, level.enemies);
        }

        // Projectiles
        Combat.updateProjectiles(projectiles, player, level.enemies, particles, camera, level, dt);

        // Remove dead enemies (after death animation)
        for (const enemy of level.enemies) {
            if (enemy.dead && enemy.deathTimer <= 0) {
                // Award XP and gold
                if (enemy.xp > 0) {
                    const leveled = gainXP(player.stats, enemy.xp);
                    player.stats.gold += randInt(5, 15);
                    player.stats.kills++;
                    Combat.addFloatingText(
                        enemy.x + enemy.w / 2, enemy.y - 5,
                        `+${enemy.xp} XP`, 'rgb(212,165,74)', 12
                    );

                    if (leveled) {
                        HUD.addNotification(`Level Up! You are now level ${player.stats.level}!`, '#ffcc33', 4);
                        GameAudio.SFX.levelUp();
                        particles.levelUp(player.x + player.w / 2, player.y + player.h / 2);
                    }

                    enemy.xp = 0; // Don't award twice
                }
            }
        }

        // Lava damage
        const pcx = player.x + player.w / 2;
        const pcy = player.y + player.h / 2;
        if (isTileAt(pcx, pcy, T.LAVA, level) && player.invulnTime <= 0) {
            player.stats.hp -= 5;
            player.invulnTime = 0.5;
            particles.fire(pcx, pcy, 3);
            Combat.addFloatingText(pcx, player.y - 10, '-5', 'rgb(255,100,0)', 14);
        }

        // Trap damage
        if (isTileAt(pcx, pcy, T.TRAP, level) && player.invulnTime <= 0) {
            const save = Dice.savingThrow(player.stats.dex, 12);
            if (!save.success) {
                const trapDmg = Dice.damageRoll(1, 8, 0).total;
                player.stats.hp -= trapDmg;
                player.invulnTime = 1.0;
                particles.burst(pcx, pcy, 8, '#8a6a3a', 50, 0.4, 3);
                Combat.addFloatingText(pcx, player.y - 10, `-${trapDmg}`, 'rgb(200,150,80)', 14);
                HUD.addNotification('Trap triggered!', '#cc6633', 2);
                camera.shake(3, 0.2);
                // Disarm trap after triggering
                setTileAt(pcx, pcy, T.FLOOR, level);
                tilesRendered = false;
                renderTileCache();
            } else {
                HUD.addNotification('Trap avoided! (DEX save)', '#44aa44', 2);
                setTileAt(pcx, pcy, T.FLOOR, level);
                tilesRendered = false;
                renderTileCache();
            }
        }

        // MP regeneration
        player.stats.mp = Math.min(player.stats.maxMp, player.stats.mp + 2 * dt);

        // Torch particle effects
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                if (level.tiles[y * level.width + x] === T.TORCH) {
                    const tx = x * TILE + TILE / 2;
                    const ty = y * TILE + 6;
                    const theme = THEMES[LEVEL_INFO[levelIndex].theme];
                    particles.torchFlicker(tx, ty, theme.torchColor);
                }
            }
        }

        // Check death
        if (player.stats.hp <= 0 && !player.dead) {
            player.dead = true;
            state = 'dead';
            showScreen('deathScreen');
            GameAudio.stopMusic();
            particles.deathBurst(player.x + player.w / 2, player.y + player.h / 2, '#cc2222');
        }

        // Check if player is near stairs after all enemies are defeated (or boss dead)
        const boss = level.enemies.find(e => e.boss);
        if (boss && boss.dead) {
            const stairDist = dist(pcx, pcy, level.stairs.x * TILE + TILE / 2, level.stairs.y * TILE + TILE / 2);
            if (stairDist < TILE) {
                if (input.justPressed('KeyE')) {
                    completeLevel();
                } else if (stairDist < TILE * 1.5) {
                    Combat.addFloatingText(
                        level.stairs.x * TILE + TILE / 2,
                        level.stairs.y * TILE - 8,
                        'Press E', 'rgb(80,255,80)', 12
                    );
                }
            }
        }

        // Unlock boss door when player has key or near boss area
        // For simplicity, boss doors open when player approaches
        const bossRoom = level.bossRoom;
        if (bossRoom && !bossTriggered) {
            const inBossArea = player.x / TILE >= bossRoom.x - 2 && player.x / TILE <= bossRoom.x + bossRoom.w + 2 &&
                               player.y / TILE >= bossRoom.y - 2 && player.y / TILE <= bossRoom.y + bossRoom.h + 2;
            if (inBossArea) {
                bossTriggered = true;
                // Remove boss doors
                for (let y = 0; y < level.height; y++) {
                    for (let x = 0; x < level.width; x++) {
                        if (level.tiles[y * level.width + x] === T.BOSS_DOOR) {
                            level.tiles[y * level.width + x] = T.FLOOR;
                        }
                    }
                }
                tilesRendered = false;
                renderTileCache();
                GameAudio.startMusic(LEVEL_INFO[levelIndex].bossMusic);
                GameAudio.SFX.doorOpen();
                HUD.addNotification('Boss encounter!', '#cc3333', 3);
                camera.shake(5, 0.4);
            }
        }

        // Interact (E key) - chests and doors
        if (input.justPressed('KeyE') && player.interactCooldown <= 0) {
            player.interactCooldown = 0.3;
            interact();
        }
        player.interactCooldown = Math.max(0, player.interactCooldown - dt);

        // Use items (1, 2, 3)
        if (input.justPressed('Digit1')) Combat.useItem(player, '1', particles);
        if (input.justPressed('Digit2')) Combat.useItem(player, '2', particles);
        if (input.justPressed('Digit3')) Combat.useItem(player, '3', particles);
    }

    function updatePlayer(dt) {
        if (player.dead) return;

        const stats = player.stats;
        player.attackTimer = Math.max(0, player.attackTimer - dt);
        player.specialTimer = Math.max(0, player.specialTimer - dt);
        player.dodgeTimer = Math.max(0, player.dodgeTimer - dt);
        player.invulnTime = Math.max(0, player.invulnTime - dt);

        // Movement
        let mx = 0, my = 0;
        if (input.isDown('KeyW') || input.isDown('ArrowUp')) my = -1;
        if (input.isDown('KeyS') || input.isDown('ArrowDown')) my = 1;
        if (input.isDown('KeyA') || input.isDown('ArrowLeft')) mx = -1;
        if (input.isDown('KeyD') || input.isDown('ArrowRight')) mx = 1;

        if (player.dodging) {
            // Dodge movement
            const ddx = player.dodgeDx * dt;
            const ddy = player.dodgeDy * dt;
            if (!isWall(player.x + ddx, player.y, player.w, player.h, currentLevel)) player.x += ddx;
            if (!isWall(player.x, player.y + ddy, player.w, player.h, currentLevel)) player.y += ddy;
            player.dodgeDx *= 0.9;
            player.dodgeDy *= 0.9;
        } else if (mx !== 0 || my !== 0) {
            const len = Math.hypot(mx, my);
            const speed = stats.speed * dt;
            const dx = (mx / len) * speed;
            const dy = (my / len) * speed;

            if (!isWall(player.x + dx, player.y, player.w, player.h, currentLevel)) {
                player.x += dx;
            }
            if (!isWall(player.x, player.y + dy, player.w, player.h, currentLevel)) {
                player.y += dy;
            }

            if (mx !== 0) player.facing = mx > 0 ? 1 : -1;
            player.dx = dx;
            player.dy = dy;
        }

        // Clamp to level bounds
        player.x = clamp(player.x, 0, currentLevel.width * TILE - player.w);
        player.y = clamp(player.y, 0, currentLevel.height * TILE - player.h);

        // Attack
        if (input.mouse.leftJust) {
            Combat.playerAttack(player, currentLevel.enemies, particles, projectiles, camera, input);
        }

        // Special
        if (input.mouse.rightJust) {
            Combat.playerSpecial(player, currentLevel.enemies, particles, projectiles, camera, input);
        }

        // Dodge
        if (input.justPressed('Space')) {
            Combat.playerDodge(player, input, particles);
        }
    }

    function interact() {
        const level = currentLevel;
        const pcx = player.x + player.w / 2;
        const pcy = player.y + player.h / 2;
        const interactRange = TILE * 1.5;

        // Check chests
        for (const chest of level.chests) {
            if (chest.opened) continue;
            const cx = chest.x * TILE + TILE / 2;
            const cy = chest.y * TILE + TILE / 2;
            if (dist(pcx, pcy, cx, cy) < interactRange) {
                chest.opened = true;
                GameAudio.SFX.chestOpen();
                particles.gold(cx, cy, 12);

                // Give loot
                for (const loot of chest.loot) {
                    if (loot.type === 'gold') {
                        player.stats.gold += loot.value * loot.count;
                        HUD.addNotification(`Found ${loot.value * loot.count} gold!`, '#ddaa33', 2);
                    } else if (loot.type === 'key') {
                        player.stats.keys++;
                        HUD.addNotification('Found a key!', '#dddd33', 2);
                    } else {
                        // Add to inventory or increase count
                        const existing = player.stats.inventory.find(i => i.name === loot.name);
                        if (existing) {
                            existing.count += loot.count;
                        } else {
                            player.stats.inventory.push({ ...loot });
                        }
                        HUD.addNotification(`Found ${loot.name} x${loot.count}!`, loot.color || '#ffffff', 2);
                    }
                }
                GameAudio.SFX.pickup();
                return;
            }
        }

        // Check doors
        const tx = Math.floor(pcx / TILE);
        const ty = Math.floor(pcy / TILE);
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const cx = tx + dx;
                const cy = ty + dy;
                if (cx < 0 || cy < 0 || cx >= level.width || cy >= level.height) continue;
                const tile = level.tiles[cy * level.width + cx];
                if (tile === T.DOOR) {
                    level.tiles[cy * level.width + cx] = T.FLOOR;
                    tilesRendered = false;
                    renderTileCache();
                    GameAudio.SFX.doorOpen();
                    return;
                }
            }
        }
    }

    function completeLevel() {
        if (levelIndex >= 4) {
            // Game complete!
            state = 'victory';
            document.getElementById('victoryText').textContent =
                'You have vanquished the Dark Lord and saved Drakenmoor! The realm is at peace.';
            document.getElementById('nextLevelBtn').classList.add('hidden');
            showScreen('victoryScreen');
            GameAudio.stopMusic();
            GameAudio.SFX.bossDeath();
        } else {
            state = 'victory';
            document.getElementById('victoryText').textContent =
                `${LEVEL_INFO[levelIndex].name} cleared! Onward to ${LEVEL_INFO[levelIndex + 1].name}...`;
            document.getElementById('nextLevelBtn').classList.remove('hidden');
            showScreen('victoryScreen');
            GameAudio.stopMusic();
        }
    }

    function nextLevel() {
        levelIndex++;
        showLevelIntro();
    }

    function respawn() {
        if (!currentLevel) return;
        player.stats.hp = player.stats.maxHp;
        player.stats.mp = player.stats.maxMp;
        player.dead = false;
        player.invulnTime = 2;
        player.x = currentLevel.playerStart.x;
        player.y = currentLevel.playerStart.y;

        // Reset enemies
        currentLevel = generateLevel(levelIndex);
        projectiles = [];
        particles.clear();
        bossTriggered = false;
        tilesRendered = false;
        renderTileCache();

        state = 'playing';
        showScreen(null);
        overlay.style.pointerEvents = 'none';
        GameAudio.startMusic(LEVEL_INFO[levelIndex].music);
    }

    function resume() {
        state = 'playing';
        showScreen(null);
        overlay.style.pointerEvents = 'none';
    }

    // ---- RENDERING ----
    function render() {
        const level = currentLevel;
        if (!level || !player) return;
        const theme = THEMES[LEVEL_INFO[levelIndex].theme];

        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // Background
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.save();
        ctx.translate(camera.offsetX, camera.offsetY);

        // Draw tile cache
        if (tilesRendered && tileCanvas) {
            ctx.drawImage(tileCanvas, 0, 0);
        }

        // Dynamic tiles (doors, chests, stairs)
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                const t = level.tiles[y * level.width + x];
                const px = x * TILE;
                const py = y * TILE;

                if (t === T.DOOR) {
                    Sprites.drawDoor(ctx, px, py, false, theme);
                } else if (t === T.BOSS_DOOR) {
                    Sprites.drawDoor(ctx, px, py, true, theme);
                } else if (t === T.STAIRS) {
                    // Stairs indicator
                    const boss = level.enemies.find(e => e.boss);
                    if (boss && boss.dead) {
                        const glow = 0.3 + Math.sin(gameTime * 3) * 0.2;
                        ctx.fillStyle = `rgba(80,255,80,${glow})`;
                        ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
                        ctx.fillStyle = '#33cc33';
                        ctx.fillRect(px + 8, py + 8, TILE - 16, TILE - 16);
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 10px Cinzel, serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('EXIT', px + TILE / 2, py + TILE / 2 + 4);
                    }
                }
            }
        }

        // Draw chests
        for (const chest of level.chests) {
            Sprites.drawChest(ctx, chest.x * TILE, chest.y * TILE, chest.opened);
        }

        // Torch light glow (dynamic)
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                if (level.tiles[y * level.width + x] === T.TORCH) {
                    const tx = x * TILE + TILE / 2;
                    const ty = y * TILE + TILE / 2;
                    const flicker = 0.8 + Math.sin(gameTime * 5 + x * 3 + y * 7) * 0.2;
                    const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, TILE * 3 * flicker);
                    grad.addColorStop(0, theme.torchGlow);
                    grad.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(tx - TILE * 3, ty - TILE * 3, TILE * 6, TILE * 6);
                }
            }
        }

        // Lava glow
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                if (level.tiles[y * level.width + x] === T.LAVA) {
                    const lx = x * TILE + TILE / 2;
                    const ly = y * TILE + TILE / 2;
                    const pulse = 0.7 + Math.sin(gameTime * 2 + x + y) * 0.3;
                    ctx.fillStyle = `rgba(255,80,0,${0.04 * pulse})`;
                    ctx.beginPath();
                    ctx.arc(lx, ly, TILE * 2, 0, Math.PI * 2);
                    ctx.fill();
                    // Random lava bubbles
                    if (Math.random() < 0.01) {
                        particles.fire(lx + rand(-8, 8), ly + rand(-8, 8), 1);
                    }
                }
            }
        }

        // Draw enemies (sorted by Y for proper overlap)
        const aliveEnemies = level.enemies.filter(e => !e.dead || e.deathTimer > 0);
        aliveEnemies.sort((a, b) => a.y - b.y);

        for (const enemy of aliveEnemies) {
            if (enemy.dead) {
                // Death fade
                ctx.globalAlpha = clamp(enemy.deathTimer / 0.5, 0, 1);
            }
            if (enemy.hitFlash > 0) {
                ctx.globalAlpha = 0.5 + Math.sin(gameTime * 30) * 0.3;
            }
            Sprites.drawEntity(ctx, enemy);
            ctx.globalAlpha = 1;
        }

        // Draw player
        if (!player.dead) {
            Sprites.drawPlayer(ctx, player);
        }

        // Draw projectiles
        for (const p of projectiles) {
            Sprites.drawProjectile(ctx, p);
        }

        // Particles
        particles.draw(ctx);

        // Floating combat text
        Combat.drawFloatingTexts(ctx);

        // Fog of war / ambient overlay
        ctx.fillStyle = theme.ambient;
        ctx.fillRect(camera.x - 10, camera.y - 10, CANVAS_W + 20, CANVAS_H + 20);

        // Vignette darkness at edges
        const vigGrad = ctx.createRadialGradient(
            player.x + player.w / 2, player.y + player.h / 2, CANVAS_W * 0.3,
            player.x + player.w / 2, player.y + player.h / 2, CANVAS_W * 0.7
        );
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, theme.fog);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(camera.x - 10, camera.y - 10, CANVAS_W + 20, CANVAS_H + 20);

        ctx.restore();

        // HUD (screen space)
        HUD.draw(ctx, player, level, levelIndex, camera);
        HUD.drawCursor(ctx, input.mouse.x, input.mouse.y);
    }

    // Start the loop
    requestAnimationFrame(gameLoop);

    // Public API
    return {
        showMainMenu,
        showClassSelect,
        showControls,
        selectClass,
        startGame,
        beginLevel,
        nextLevel,
        respawn,
        resume,
    };
})();
