// ============================================================
// HUD.JS - Heads-Up Display rendering
// Dungeons of Drakenmoor
// ============================================================

const HUD = {
    minimapVisible: true,
    inventoryOpen: false,
    notifications: [],

    addNotification(text, color = '#d4a54a', duration = 3) {
        this.notifications.push({ text, color, timer: duration, maxTimer: duration });
    },

    update(dt) {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].timer -= dt;
            if (this.notifications[i].timer <= 0) {
                this.notifications.splice(i, 1);
            }
        }
    },

    draw(ctx, player, level, levelIndex, camera) {
        ctx.save();

        // === Health Bar ===
        const hpBarX = 16, hpBarY = 16, hpBarW = 200, hpBarH = 20;
        const hpRatio = clamp(player.stats.hp / player.stats.maxHp, 0, 1);

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(hpBarX - 2, hpBarY - 2, hpBarW + 4, hpBarH + 4);

        // HP bar
        const hpColor = hpRatio > 0.5 ? '#44aa44' : hpRatio > 0.25 ? '#ccaa22' : '#cc3333';
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
        ctx.fillStyle = hpColor;
        ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, hpBarH);

        // HP text
        ctx.font = 'bold 12px Cinzel, serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(player.stats.hp)} / ${player.stats.maxHp}`, hpBarX + hpBarW / 2, hpBarY + 15);

        // Label
        ctx.textAlign = 'left';
        ctx.fillStyle = '#cc4444';
        ctx.font = 'bold 10px Cinzel, serif';
        ctx.fillText('HP', hpBarX, hpBarY - 3);

        // === Mana Bar ===
        const mpBarY = hpBarY + hpBarH + 8;
        const mpBarW = 160, mpBarH = 14;
        const mpRatio = clamp(player.stats.mp / player.stats.maxMp, 0, 1);

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(hpBarX - 2, mpBarY - 2, mpBarW + 4, mpBarH + 4);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(hpBarX, mpBarY, mpBarW, mpBarH);
        ctx.fillStyle = '#3366bb';
        ctx.fillRect(hpBarX, mpBarY, mpBarW * mpRatio, mpBarH);

        ctx.font = 'bold 11px Cinzel, serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(player.stats.mp)} / ${player.stats.maxMp}`, hpBarX + mpBarW / 2, mpBarY + 11);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#4488cc';
        ctx.font = 'bold 10px Cinzel, serif';
        ctx.fillText('MP', hpBarX, mpBarY - 3);

        // === XP Bar ===
        const xpBarY = mpBarY + mpBarH + 8;
        const xpBarW = 140, xpBarH = 8;
        const xpRatio = player.stats.xp / player.stats.xpToLevel;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(hpBarX - 1, xpBarY - 1, xpBarW + 2, xpBarH + 2);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(hpBarX, xpBarY, xpBarW, xpBarH);
        ctx.fillStyle = '#d4a54a';
        ctx.fillRect(hpBarX, xpBarY, xpBarW * xpRatio, xpBarH);

        ctx.fillStyle = '#d4a54a';
        ctx.font = 'bold 10px Cinzel, serif';
        ctx.textAlign = 'left';
        ctx.fillText(`LVL ${player.stats.level}`, hpBarX, xpBarY - 2);

        // === Character info ===
        ctx.fillStyle = '#c8b87a';
        ctx.font = 'bold 14px Cinzel, serif';
        ctx.fillText(player.stats.name, hpBarX, xpBarY + xpBarH + 16);

        // === Gold & Keys ===
        ctx.fillStyle = '#ddaa33';
        ctx.font = '12px MedievalSharp, cursive';
        ctx.fillText(`Gold: ${player.stats.gold}`, hpBarX, xpBarY + xpBarH + 32);
        ctx.fillStyle = '#dddd33';
        ctx.fillText(`Keys: ${player.stats.keys}`, hpBarX + 90, xpBarY + xpBarH + 32);

        // === Inventory quick slots (bottom center) ===
        const slotSize = 40;
        const slotsY = CANVAS_H - slotSize - 16;
        const totalSlotsW = 3 * (slotSize + 8);
        const slotsStartX = (CANVAS_W - totalSlotsW) / 2;

        for (let i = 0; i < 3; i++) {
            const sx = slotsStartX + i * (slotSize + 8);
            const slot = String(i + 1);
            const item = player.stats.inventory.find(it => it.slot === slot);

            // Slot background
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(sx - 1, slotsY - 1, slotSize + 2, slotSize + 2);
            ctx.fillStyle = item ? 'rgba(30,25,15,0.8)' : 'rgba(15,15,15,0.5)';
            ctx.fillRect(sx, slotsY, slotSize, slotSize);

            // Border
            ctx.strokeStyle = item ? '#5a4a2a' : '#2a2a2a';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx, slotsY, slotSize, slotSize);

            // Key number
            ctx.fillStyle = '#8a7a5a';
            ctx.font = 'bold 10px Cinzel, serif';
            ctx.textAlign = 'left';
            ctx.fillText(slot, sx + 3, slotsY + 12);

            if (item) {
                // Item icon (colored square)
                ctx.fillStyle = item.color || '#888';
                ctx.fillRect(sx + 10, slotsY + 10, 20, 20);

                // Count
                if (item.count > 1) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 11px Cinzel, serif';
                    ctx.textAlign = 'right';
                    ctx.fillText(`${item.count}`, sx + slotSize - 3, slotsY + slotSize - 4);
                }
            }
        }

        // === Ability cooldowns (bottom right) ===
        const abX = CANVAS_W - 120;
        const abY = CANVAS_H - 60;

        // Special ability
        const specialReady = player.specialTimer <= 0 && player.stats.mp >= player.stats.specialCost;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(abX - 1, abY - 1, 102, 42);
        ctx.fillStyle = specialReady ? 'rgba(40,30,15,0.8)' : 'rgba(20,15,10,0.5)';
        ctx.fillRect(abX, abY, 100, 40);
        ctx.strokeStyle = specialReady ? '#d4a54a' : '#3a3a3a';
        ctx.lineWidth = 1;
        ctx.strokeRect(abX, abY, 100, 40);

        ctx.font = 'bold 11px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = specialReady ? '#d4a54a' : '#5a5a5a';
        ctx.fillText(player.stats.abilities[0].name, abX + 50, abY + 16);
        ctx.font = '10px MedievalSharp, cursive';
        ctx.fillStyle = '#8a7a5a';
        if (player.specialTimer > 0) {
            ctx.fillText(`${player.specialTimer.toFixed(1)}s`, abX + 50, abY + 32);
        } else {
            ctx.fillText('Right Click', abX + 50, abY + 32);
        }

        // Dodge cooldown
        const dodgeReady = player.dodgeTimer <= 0;
        ctx.fillStyle = dodgeReady ? '#8a8a6a' : '#4a4a4a';
        ctx.font = '10px MedievalSharp, cursive';
        ctx.textAlign = 'right';
        ctx.fillText(dodgeReady ? 'Dodge: Ready' : `Dodge: ${player.dodgeTimer.toFixed(1)}s`, CANVAS_W - 16, abY - 8);

        // === Buffs ===
        let buffX = hpBarX;
        const buffY = xpBarY + xpBarH + 44;
        ctx.font = '10px MedievalSharp, cursive';
        ctx.textAlign = 'left';
        for (const buff of player.stats.buffs) {
            ctx.fillStyle = '#ff8800';
            ctx.fillText(`+${buff.value} DMG (${buff.timer.toFixed(0)}s)`, buffX, buffY);
            buffX += 100;
        }

        // === Minimap (top right) ===
        if (this.minimapVisible && level) {
            this.drawMinimap(ctx, player, level);
        }

        // === Notifications ===
        let notifY = CANVAS_H / 2 - 60;
        ctx.textAlign = 'center';
        for (const n of this.notifications) {
            const alpha = clamp(n.timer / Math.min(n.maxTimer, 1), 0, 1);
            ctx.font = 'bold 16px Cinzel, serif';
            if (n.color.startsWith('#')) {
                const rgb = hexToRgb(n.color);
                ctx.fillStyle = rgbToStr(rgb.r, rgb.g, rgb.b, alpha);
            } else {
                ctx.fillStyle = n.color;
            }
            ctx.fillText(n.text, CANVAS_W / 2, notifY);
            notifY += 24;
        }

        // === Level name (top center) ===
        ctx.font = '12px Cinzel, serif';
        ctx.fillStyle = 'rgba(180,160,120,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(LEVEL_INFO[levelIndex]?.name || '', CANVAS_W / 2, 20);

        // === Boss health bar ===
        if (level) {
            const boss = level.enemies.find(e => e.boss && !e.dead);
            if (boss) {
                const bossBarW = 400, bossBarH = 16;
                const bossBarX = (CANVAS_W - bossBarW) / 2;
                const bossBarY = CANVAS_H - 100;
                const bossHpRatio = clamp(boss.hp / boss.maxHp, 0, 1);

                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(bossBarX - 2, bossBarY - 18, bossBarW + 4, bossBarH + 22);

                ctx.font = 'bold 12px Cinzel, serif';
                ctx.fillStyle = '#cc3333';
                ctx.textAlign = 'center';
                ctx.fillText(boss.name, CANVAS_W / 2, bossBarY - 4);

                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(bossBarX, bossBarY, bossBarW, bossBarH);
                ctx.fillStyle = '#aa2222';
                ctx.fillRect(bossBarX, bossBarY, bossBarW * bossHpRatio, bossBarH);
                ctx.strokeStyle = '#5a2a2a';
                ctx.lineWidth = 1;
                ctx.strokeRect(bossBarX, bossBarY, bossBarW, bossBarH);
            }
        }

        // === Custom cursor ===
        // (Draw a small crosshair at mouse position)

        ctx.restore();
    },

    drawMinimap(ctx, player, level) {
        const mmW = 150, mmH = 120;
        const mmX = CANVAS_W - mmW - 16, mmY = 16;
        const scale = Math.min(mmW / level.width, mmH / level.height);
        const oX = mmX + (mmW - level.width * scale) / 2;
        const oY = mmY + (mmH - level.height * scale) / 2;

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
        ctx.strokeStyle = '#3a3a2a';
        ctx.lineWidth = 1;
        ctx.strokeRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);

        // Tiles
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                const t = level.tiles[y * level.width + x];
                let color = null;
                switch (t) {
                    case T.FLOOR: color = '#3a3530'; break;
                    case T.WALL: case T.WALL_TOP: color = '#5a4a35'; break;
                    case T.DOOR: color = '#7a5a2a'; break;
                    case T.BOSS_DOOR: color = '#aa3333'; break;
                    case T.CHEST: color = '#ddaa33'; break;
                    case T.STAIRS: color = '#33dd33'; break;
                    case T.WATER: color = '#2a4a6a'; break;
                    case T.LAVA: color = '#aa3300'; break;
                    case T.TORCH: color = '#ff9933'; break;
                }
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(oX + x * scale, oY + y * scale, Math.ceil(scale), Math.ceil(scale));
                }
            }
        }

        // Enemies (red dots)
        for (const e of level.enemies) {
            if (e.dead) continue;
            ctx.fillStyle = e.boss ? '#ff3333' : '#cc5555';
            const ex = oX + (e.x / TILE) * scale;
            const ey = oY + (e.y / TILE) * scale;
            ctx.fillRect(ex, ey, e.boss ? 3 : 2, e.boss ? 3 : 2);
        }

        // Player (white dot)
        ctx.fillStyle = '#ffffff';
        const px = oX + (player.x / TILE) * scale;
        const py = oY + (player.y / TILE) * scale;
        ctx.fillRect(px - 1, py - 1, 3, 3);

        // Label
        ctx.font = '9px MedievalSharp, cursive';
        ctx.fillStyle = '#8a7a5a';
        ctx.textAlign = 'right';
        ctx.fillText('[M] Map', mmX + mmW, mmY + mmH + 12);
    },

    drawCursor(ctx, mouseX, mouseY) {
        ctx.save();
        ctx.strokeStyle = '#d4a54a';
        ctx.lineWidth = 1.5;
        const s = 8;
        ctx.beginPath();
        ctx.moveTo(mouseX - s, mouseY); ctx.lineTo(mouseX - s / 3, mouseY);
        ctx.moveTo(mouseX + s / 3, mouseY); ctx.lineTo(mouseX + s, mouseY);
        ctx.moveTo(mouseX, mouseY - s); ctx.lineTo(mouseX, mouseY - s / 3);
        ctx.moveTo(mouseX, mouseY + s / 3); ctx.lineTo(mouseX, mouseY + s);
        ctx.stroke();
        ctx.fillStyle = '#d4a54a';
        ctx.fillRect(mouseX - 1, mouseY - 1, 2, 2);
        ctx.restore();
    },
};
