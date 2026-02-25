// ============================================================
// SPRITES.JS - Procedural sprite drawing for all game entities
// Dungeons of Drakenmoor
// ============================================================

const Sprites = {
    // Animation timer
    time: 0,
    update(dt) { this.time += dt; },

    // ---- PLAYER CHARACTERS ----
    drawWarrior(ctx, x, y, w, h, facing, attacking, frame) {
        const f = Math.sin(this.time * 6) * 2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Body - heavy armor
        ctx.fillStyle = '#6a5040';
        ctx.fillRect(-w * 0.35, -h * 0.15, w * 0.7, h * 0.45);

        // Armor plate chest
        ctx.fillStyle = '#8a7a6a';
        ctx.fillRect(-w * 0.3, -h * 0.12, w * 0.6, h * 0.35);
        ctx.fillStyle = '#9a8a7a';
        ctx.fillRect(-w * 0.15, -h * 0.1, w * 0.3, h * 0.15);

        // Belt
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(-w * 0.3, h * 0.15, w * 0.6, h * 0.06);
        ctx.fillStyle = '#d4a54a';
        ctx.fillRect(-w * 0.06, h * 0.15, w * 0.12, h * 0.06);

        // Legs
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(-w * 0.25, h * 0.22, w * 0.2, h * 0.28 + f * 0.5);
        ctx.fillRect(w * 0.05, h * 0.22, w * 0.2, h * 0.28 - f * 0.5);

        // Boots
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(-w * 0.28, h * 0.42 + f * 0.5, w * 0.26, h * 0.1);
        ctx.fillRect(w * 0.02, h * 0.42 - f * 0.5, w * 0.26, h * 0.1);

        // Head
        ctx.fillStyle = '#c8a882';
        ctx.fillRect(-w * 0.2, -h * 0.38, w * 0.4, h * 0.28);

        // Helmet
        ctx.fillStyle = '#7a7a8a';
        ctx.fillRect(-w * 0.25, -h * 0.45, w * 0.5, h * 0.15);
        ctx.fillStyle = '#8a8a9a';
        ctx.fillRect(-w * 0.22, -h * 0.48, w * 0.44, h * 0.08);
        // Helmet visor
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(-w * 0.15, -h * 0.35, w * 0.3, h * 0.06);

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(-w * 0.12, -h * 0.3, w * 0.08, h * 0.05);
        ctx.fillRect(w * 0.04, -h * 0.3, w * 0.08, h * 0.05);
        ctx.fillStyle = '#331a0a';
        ctx.fillRect(-w * 0.08, -h * 0.3, w * 0.04, h * 0.05);
        ctx.fillRect(w * 0.06, -h * 0.3, w * 0.04, h * 0.05);

        // Sword arm
        const swingAngle = attacking ? Math.sin(this.time * 20) * 1.2 : 0;
        ctx.save();
        ctx.translate(w * 0.35 * facing, -h * 0.05);
        ctx.rotate(swingAngle * facing);
        // Arm
        ctx.fillStyle = '#8a7a6a';
        ctx.fillRect(-3, -2, 8 * facing, 12);
        // Sword
        ctx.fillStyle = '#aaa';
        ctx.fillRect(2 * facing, -18, 3, 20);
        ctx.fillStyle = '#d4a54a';
        ctx.fillRect(-1 * facing, 0, 8, 4);
        ctx.fillStyle = '#ccc';
        ctx.fillRect(2 * facing, -28, 3, 12);
        ctx.restore();

        // Shield arm
        ctx.save();
        ctx.translate(-w * 0.35 * facing, -h * 0.02);
        ctx.fillStyle = '#6a5a4a';
        ctx.fillRect(-6, -8, 12, 16);
        ctx.fillStyle = '#8a7a6a';
        ctx.fillRect(-5, -7, 10, 14);
        ctx.fillStyle = '#d4a54a';
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();

        ctx.restore();
    },

    drawMage(ctx, x, y, w, h, facing, attacking, frame) {
        const f = Math.sin(this.time * 5) * 2;
        const glow = 0.3 + Math.sin(this.time * 3) * 0.15;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Robe
        ctx.fillStyle = '#2a2a5a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, -h * 0.15);
        ctx.lineTo(-w * 0.4, h * 0.5);
        ctx.lineTo(w * 0.4, h * 0.5);
        ctx.lineTo(w * 0.3, -h * 0.15);
        ctx.fill();

        // Robe details
        ctx.fillStyle = '#3a3a7a';
        ctx.fillRect(-w * 0.05, -h * 0.1, w * 0.1, h * 0.55);
        ctx.fillStyle = '#d4a54a';
        ctx.fillRect(-w * 0.08, h * 0.0, w * 0.16, h * 0.03);

        // Shoulders
        ctx.fillStyle = '#3a3a6a';
        ctx.fillRect(-w * 0.4, -h * 0.18, w * 0.2, h * 0.12);
        ctx.fillRect(w * 0.2, -h * 0.18, w * 0.2, h * 0.12);

        // Head
        ctx.fillStyle = '#c8a882';
        ctx.fillRect(-w * 0.18, -h * 0.35, w * 0.36, h * 0.22);

        // Hood
        ctx.fillStyle = '#1a1a4a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.28, -h * 0.2);
        ctx.lineTo(0, -h * 0.52);
        ctx.lineTo(w * 0.28, -h * 0.2);
        ctx.fill();
        ctx.fillRect(-w * 0.28, -h * 0.3, w * 0.56, h * 0.12);

        // Eyes (glowing)
        ctx.fillStyle = `rgba(100,150,255,${glow + 0.4})`;
        ctx.fillRect(-w * 0.1, -h * 0.28, w * 0.07, h * 0.04);
        ctx.fillRect(w * 0.03, -h * 0.28, w * 0.07, h * 0.04);

        // Staff
        ctx.save();
        const staffSway = attacking ? Math.sin(this.time * 15) * 0.3 : Math.sin(this.time * 2) * 0.05;
        ctx.translate(w * 0.35 * facing, -h * 0.1);
        ctx.rotate(staffSway);
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(-2, -h * 0.4, 4, h * 0.85);
        // Crystal on top
        ctx.fillStyle = `rgba(100,150,255,${glow + 0.3})`;
        ctx.beginPath();
        ctx.arc(0, -h * 0.42, 5, 0, Math.PI * 2);
        ctx.fill();
        // Crystal glow
        ctx.fillStyle = `rgba(100,150,255,${glow * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, -h * 0.42, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Magic hand particles when attacking
        if (attacking) {
            ctx.fillStyle = `rgba(100,180,255,${glow})`;
            for (let i = 0; i < 3; i++) {
                const px = rand(-8, 8) + w * 0.2 * facing;
                const py = rand(-8, 8) - h * 0.1;
                ctx.beginPath();
                ctx.arc(px, py, rand(2, 4), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    },

    drawRogue(ctx, x, y, w, h, facing, attacking, frame) {
        const f = Math.sin(this.time * 8) * 2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Cape (flowing)
        const capeSway = Math.sin(this.time * 3) * 3;
        ctx.fillStyle = '#1a2a1a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.25, -h * 0.15);
        ctx.lineTo(-w * 0.3 - capeSway, h * 0.35);
        ctx.lineTo(w * 0.15, h * 0.35);
        ctx.lineTo(w * 0.2, -h * 0.15);
        ctx.fill();

        // Body - leather
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(-w * 0.25, -h * 0.15, w * 0.5, h * 0.35);

        // Leather straps
        ctx.fillStyle = '#4a4035';
        ctx.fillRect(-w * 0.2, -h * 0.1, w * 0.08, h * 0.3);
        ctx.fillRect(w * 0.12, -h * 0.1, w * 0.08, h * 0.3);

        // Belt with pouches
        ctx.fillStyle = '#4a3a1a';
        ctx.fillRect(-w * 0.28, h * 0.12, w * 0.56, h * 0.06);
        ctx.fillStyle = '#3a2a15';
        ctx.fillRect(-w * 0.22, h * 0.1, w * 0.1, h * 0.1);
        ctx.fillRect(w * 0.12, h * 0.1, w * 0.1, h * 0.1);

        // Legs
        ctx.fillStyle = '#2a2520';
        ctx.fillRect(-w * 0.2, h * 0.18, w * 0.16, h * 0.28 + f * 0.5);
        ctx.fillRect(w * 0.04, h * 0.18, w * 0.16, h * 0.28 - f * 0.5);

        // Boots
        ctx.fillStyle = '#1a1a15';
        ctx.fillRect(-w * 0.22, h * 0.38 + f * 0.5, w * 0.2, h * 0.1);
        ctx.fillRect(w * 0.02, h * 0.38 - f * 0.5, w * 0.2, h * 0.1);

        // Head
        ctx.fillStyle = '#c8a882';
        ctx.fillRect(-w * 0.17, -h * 0.35, w * 0.34, h * 0.22);

        // Hood/mask
        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(-w * 0.22, -h * 0.42, w * 0.44, h * 0.15);
        ctx.fillRect(-w * 0.2, -h * 0.25, w * 0.4, h * 0.06);

        // Eyes (sharp)
        ctx.fillStyle = '#aaffaa';
        ctx.fillRect(-w * 0.1, -h * 0.32, w * 0.08, h * 0.03);
        ctx.fillRect(w * 0.04, -h * 0.32, w * 0.08, h * 0.03);

        // Daggers
        const stabAngle = attacking ? Math.sin(this.time * 25) * 0.8 : 0;
        ctx.save();
        ctx.translate(w * 0.3 * facing, h * 0.0);
        ctx.rotate(stabAngle * facing);
        ctx.fillStyle = '#888';
        ctx.fillRect(2 * facing, -12, 2, 14);
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(0, 0, 6 * facing, 3);
        ctx.restore();

        // Second dagger
        ctx.save();
        ctx.translate(-w * 0.3 * facing, h * 0.05);
        ctx.rotate(-stabAngle * facing * 0.7);
        ctx.fillStyle = '#888';
        ctx.fillRect(-2 * facing, -10, 2, 12);
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(-6 * facing, 0, 6 * facing, 3);
        ctx.restore();

        ctx.restore();
    },

    drawPlayer(ctx, player) {
        const facing = player.facing || 1;
        const attacking = player.attackTimer > 0;
        switch (player.stats.className) {
            case 'warrior': this.drawWarrior(ctx, player.x, player.y, player.w, player.h, facing, attacking, 0); break;
            case 'mage': this.drawMage(ctx, player.x, player.y, player.w, player.h, facing, attacking, 0); break;
            case 'rogue': this.drawRogue(ctx, player.x, player.y, player.w, player.h, facing, attacking, 0); break;
        }

        // Invulnerability flash
        if (player.invulnTime > 0 && Math.sin(this.time * 30) > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(player.x, player.y, player.w, player.h);
        }

        // Dodge trail
        if (player.dodging) {
            ctx.fillStyle = `rgba(200,200,255,0.2)`;
            ctx.fillRect(player.x - player.dx * 3, player.y - player.dy * 3, player.w, player.h);
        }
    },

    // ---- ENEMIES ----
    drawGoblin(ctx, x, y, w, h, variant = 'normal') {
        const f = Math.sin(this.time * 5 + x) * 1.5;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Body
        const bodyColor = variant === 'shaman' ? '#3a5a3a' : variant === 'archer' ? '#4a5a3a' : '#4a6a3a';
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-w * 0.3, -h * 0.1, w * 0.6, h * 0.35);

        // Skin
        ctx.fillStyle = '#6a8a4a';
        ctx.fillRect(-w * 0.2, -h * 0.35, w * 0.4, h * 0.28);

        // Ears (pointy)
        ctx.fillStyle = '#5a7a3a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.2, -h * 0.25);
        ctx.lineTo(-w * 0.4, -h * 0.35);
        ctx.lineTo(-w * 0.15, -h * 0.15);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.2, -h * 0.25);
        ctx.lineTo(w * 0.4, -h * 0.35);
        ctx.lineTo(w * 0.15, -h * 0.15);
        ctx.fill();

        // Eyes (mean)
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(-w * 0.12, -h * 0.22, w * 0.08, h * 0.06);
        ctx.fillRect(w * 0.04, -h * 0.22, w * 0.08, h * 0.06);

        // Mouth
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(-w * 0.08, -h * 0.1, w * 0.16, h * 0.04);

        // Legs
        ctx.fillStyle = '#5a4a30';
        ctx.fillRect(-w * 0.2, h * 0.2, w * 0.15, h * 0.2 + f);
        ctx.fillRect(w * 0.05, h * 0.2, w * 0.15, h * 0.2 - f);

        // Weapon
        if (variant === 'archer') {
            // Bow
            ctx.strokeStyle = '#5a3a1a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w * 0.3, -h * 0.05, 12, -1, 1);
            ctx.stroke();
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w * 0.3, -h * 0.05 - 11);
            ctx.lineTo(w * 0.3, -h * 0.05 + 11);
            ctx.stroke();
        } else if (variant === 'shaman') {
            // Magic staff with glow
            ctx.fillStyle = '#4a2a1a';
            ctx.fillRect(w * 0.25, -h * 0.3, 3, h * 0.5);
            const glow = 0.4 + Math.sin(this.time * 4) * 0.3;
            ctx.fillStyle = `rgba(0,255,100,${glow})`;
            ctx.beginPath();
            ctx.arc(w * 0.27, -h * 0.32, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Crude sword
            ctx.fillStyle = '#888';
            ctx.fillRect(w * 0.25, -h * 0.15, 2, 16);
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(w * 0.22, h * 0.0, 8, 3);
        }

        ctx.restore();
    },

    drawGoblinKing(ctx, x, y, w, h) {
        const f = Math.sin(this.time * 3) * 2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Bigger, meaner goblin
        ctx.fillStyle = '#5a7a3a';
        ctx.fillRect(-w * 0.35, -h * 0.1, w * 0.7, h * 0.4);

        // Armor
        ctx.fillStyle = '#6a5a3a';
        ctx.fillRect(-w * 0.3, -h * 0.08, w * 0.6, h * 0.3);

        // Crown
        ctx.fillStyle = '#ddaa33';
        ctx.fillRect(-w * 0.2, -h * 0.48, w * 0.4, h * 0.06);
        for (let i = -2; i <= 2; i++) {
            ctx.fillRect(i * w * 0.08 - 2, -h * 0.55, 4, h * 0.1);
        }

        // Head
        ctx.fillStyle = '#6a9a4a';
        ctx.fillRect(-w * 0.25, -h * 0.38, w * 0.5, h * 0.32);

        // Ears
        ctx.fillStyle = '#5a8a3a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.25, -h * 0.25);
        ctx.lineTo(-w * 0.45, -h * 0.38);
        ctx.lineTo(-w * 0.2, -h * 0.1);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.25, -h * 0.25);
        ctx.lineTo(w * 0.45, -h * 0.38);
        ctx.lineTo(w * 0.2, -h * 0.1);
        ctx.fill();

        // Evil eyes
        ctx.fillStyle = '#ff2222';
        ctx.fillRect(-w * 0.15, -h * 0.25, w * 0.1, h * 0.07);
        ctx.fillRect(w * 0.05, -h * 0.25, w * 0.1, h * 0.07);

        // Legs
        ctx.fillStyle = '#4a5a2a';
        ctx.fillRect(-w * 0.25, h * 0.25, w * 0.2, h * 0.22 + f);
        ctx.fillRect(w * 0.05, h * 0.25, w * 0.2, h * 0.22 - f);

        // Big sword
        ctx.fillStyle = '#999';
        ctx.fillRect(w * 0.3, -h * 0.35, 4, 40);
        ctx.fillStyle = '#d4a54a';
        ctx.fillRect(w * 0.25, h * 0.0, 14, 5);

        ctx.restore();
    },

    drawSkeleton(ctx, x, y, w, h, variant = 'normal') {
        const f = Math.sin(this.time * 4 + x) * 1;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        const boneColor = '#d0c8b8';
        const darkBone = '#a09888';

        // Ribcage
        ctx.fillStyle = darkBone;
        ctx.fillRect(-w * 0.2, -h * 0.1, w * 0.4, h * 0.25);
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = boneColor;
            ctx.fillRect(-w * 0.18, -h * 0.08 + i * 5, w * 0.36, 2);
        }

        // Spine
        ctx.fillStyle = boneColor;
        ctx.fillRect(-2, -h * 0.1, 4, h * 0.35);

        // Skull
        ctx.fillStyle = boneColor;
        ctx.fillRect(-w * 0.2, -h * 0.4, w * 0.4, h * 0.3);
        ctx.fillStyle = darkBone;
        ctx.fillRect(-w * 0.15, -h * 0.35, w * 0.3, h * 0.2);

        // Eye sockets
        ctx.fillStyle = variant === 'mage' ? '#5555ff' : '#1a0a0a';
        ctx.fillRect(-w * 0.1, -h * 0.3, w * 0.08, h * 0.07);
        ctx.fillRect(w * 0.02, -h * 0.3, w * 0.08, h * 0.07);

        // Jaw
        ctx.fillStyle = darkBone;
        ctx.fillRect(-w * 0.12, -h * 0.14, w * 0.24, h * 0.06);

        // Legs (bones)
        ctx.fillStyle = boneColor;
        ctx.fillRect(-w * 0.12, h * 0.2, 3, h * 0.25 + f);
        ctx.fillRect(w * 0.1, h * 0.2, 3, h * 0.25 - f);

        // Arms
        ctx.fillStyle = boneColor;
        ctx.fillRect(-w * 0.3, -h * 0.08, h * 0.15, 3);
        ctx.fillRect(w * 0.15, -h * 0.08, h * 0.15, 3);

        if (variant === 'mage') {
            // Magic orb
            const glow = 0.4 + Math.sin(this.time * 5) * 0.3;
            ctx.fillStyle = `rgba(80,80,255,${glow})`;
            ctx.beginPath();
            ctx.arc(w * 0.35, -h * 0.1, 6, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Sword
            ctx.fillStyle = '#888';
            ctx.fillRect(w * 0.28, -h * 0.2, 2, 20);
        }

        ctx.restore();
    },

    drawZombie(ctx, x, y, w, h) {
        const f = Math.sin(this.time * 2 + x) * 2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Body (ragged)
        ctx.fillStyle = '#3a4a3a';
        ctx.fillRect(-w * 0.3, -h * 0.12, w * 0.6, h * 0.4);

        // Skin (sickly)
        ctx.fillStyle = '#6a8a6a';
        ctx.fillRect(-w * 0.22, -h * 0.38, w * 0.44, h * 0.28);

        // Dead eyes
        ctx.fillStyle = '#aaffaa';
        ctx.fillRect(-w * 0.1, -h * 0.28, w * 0.07, h * 0.05);
        ctx.fillRect(w * 0.04, -h * 0.28, w * 0.07, h * 0.05);

        // Mouth (open)
        ctx.fillStyle = '#2a1a1a';
        ctx.fillRect(-w * 0.08, -h * 0.12, w * 0.16, h * 0.06);

        // Shambling legs
        ctx.fillStyle = '#4a5a4a';
        ctx.fillRect(-w * 0.22, h * 0.22, w * 0.17, h * 0.25 + f);
        ctx.fillRect(w * 0.05, h * 0.22, w * 0.17, h * 0.25 - f);

        // Arms reaching out
        ctx.fillStyle = '#6a8a6a';
        ctx.save();
        ctx.rotate(Math.sin(this.time * 2) * 0.2 - 0.3);
        ctx.fillRect(w * 0.2, -h * 0.1, w * 0.3, 5);
        ctx.restore();

        ctx.restore();
    },

    drawWraith(ctx, x, y, w, h) {
        const f = Math.sin(this.time * 3 + x) * 3;
        const alpha = 0.5 + Math.sin(this.time * 2) * 0.2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2 + f);
        ctx.globalAlpha = alpha;

        // Ghostly form
        ctx.fillStyle = '#4a4a8a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, -h * 0.2);
        ctx.quadraticCurveTo(-w * 0.35, h * 0.3, -w * 0.2, h * 0.5);
        ctx.lineTo(w * 0.2, h * 0.5);
        ctx.quadraticCurveTo(w * 0.35, h * 0.3, w * 0.3, -h * 0.2);
        ctx.fill();

        // Hood
        ctx.fillStyle = '#2a2a5a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, -h * 0.15);
        ctx.lineTo(0, -h * 0.5);
        ctx.lineTo(w * 0.3, -h * 0.15);
        ctx.fill();

        // Glowing eyes
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#aaaaff';
        ctx.fillRect(-w * 0.1, -h * 0.25, w * 0.07, h * 0.04);
        ctx.fillRect(w * 0.04, -h * 0.25, w * 0.07, h * 0.04);

        // Wispy tail
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = '#3a3a6a';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const tx = Math.sin(this.time * 2 + i) * 5;
            ctx.arc(tx + (i - 1) * 6, h * 0.45 + i * 4, 4 - i, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    drawWolf(ctx, x, y, w, h) {
        const f = Math.sin(this.time * 6 + x) * 2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Body
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(-w * 0.4, -h * 0.1, w * 0.75, h * 0.3);

        // Head
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(w * 0.1, -h * 0.3, w * 0.3, h * 0.25);

        // Snout
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(w * 0.3, -h * 0.2, w * 0.15, h * 0.12);

        // Eyes
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(w * 0.25, -h * 0.25, w * 0.05, h * 0.04);

        // Ears
        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.moveTo(w * 0.15, -h * 0.3);
        ctx.lineTo(w * 0.1, -h * 0.45);
        ctx.lineTo(w * 0.22, -h * 0.3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.28, -h * 0.3);
        ctx.lineTo(w * 0.28, -h * 0.45);
        ctx.lineTo(w * 0.35, -h * 0.3);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(-w * 0.35, h * 0.15, 4, h * 0.25 + f);
        ctx.fillRect(-w * 0.15, h * 0.15, 4, h * 0.25 - f);
        ctx.fillRect(w * 0.1, h * 0.15, 4, h * 0.25 + f * 0.5);
        ctx.fillRect(w * 0.25, h * 0.15, 4, h * 0.25 - f * 0.5);

        // Tail
        ctx.fillStyle = '#5a5a5a';
        const tailWag = Math.sin(this.time * 4) * 5;
        ctx.beginPath();
        ctx.moveTo(-w * 0.4, -h * 0.05);
        ctx.quadraticCurveTo(-w * 0.55, -h * 0.2 + tailWag, -w * 0.45, -h * 0.35 + tailWag);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#5a5a5a';
        ctx.stroke();

        ctx.restore();
    },

    drawSpider(ctx, x, y, w, h) {
        const f = this.time;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Body
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.25, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Abdomen
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(-w * 0.2, h * 0.05, w * 0.2, h * 0.25, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (multiple)
        ctx.fillStyle = '#ff3333';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(w * 0.08 + (i % 2) * 5, -h * 0.12 + Math.floor(i / 2) * 4, 3, 3);
        }

        // Legs
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const legAngle = (i * 0.4 - 0.6) + Math.sin(f * 5 + i * 0.8) * 0.15;
            ctx.save();
            ctx.rotate(legAngle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(w * 0.45, -h * 0.2);
            ctx.lineTo(w * 0.5, h * 0.1);
            ctx.stroke();
            ctx.restore();
            ctx.save();
            ctx.rotate(-legAngle - 0.3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-w * 0.45, -h * 0.2);
            ctx.lineTo(-w * 0.5, h * 0.1);
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    },

    drawTreant(ctx, x, y, w, h) {
        const sway = Math.sin(this.time * 1.5) * 2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Trunk
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(-w * 0.2, -h * 0.15, w * 0.4, h * 0.55);

        // Bark texture
        ctx.fillStyle = '#3a2a18';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(-w * 0.15 + rand(-2, 2), -h * 0.1 + i * 8, w * 0.15, 2);
        }

        // Canopy
        ctx.fillStyle = '#1a4a1a';
        ctx.beginPath();
        ctx.arc(sway, -h * 0.3, w * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a5a2a';
        ctx.beginPath();
        ctx.arc(w * 0.1 + sway, -h * 0.35, w * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Face in trunk
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(-w * 0.1, -h * 0.08, w * 0.07, h * 0.06);
        ctx.fillRect(w * 0.04, -h * 0.08, w * 0.07, h * 0.06);
        ctx.fillRect(-w * 0.08, h * 0.05, w * 0.16, h * 0.04);

        // Eyes glow
        ctx.fillStyle = '#aaff33';
        ctx.fillRect(-w * 0.08, -h * 0.06, w * 0.04, h * 0.03);
        ctx.fillRect(w * 0.05, -h * 0.06, w * 0.04, h * 0.03);

        // Root feet
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(-w * 0.35, h * 0.35, w * 0.25, h * 0.1);
        ctx.fillRect(w * 0.1, h * 0.35, w * 0.25, h * 0.1);

        // Branch arms
        ctx.strokeStyle = '#4a3520';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-w * 0.2, -h * 0.1);
        ctx.lineTo(-w * 0.5 + sway, -h * 0.25);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.2, -h * 0.1);
        ctx.lineTo(w * 0.5 - sway, -h * 0.2);
        ctx.stroke();

        ctx.restore();
    },

    drawFireImp(ctx, x, y, w, h) {
        const f = Math.sin(this.time * 8 + x) * 2;
        const glow = 0.5 + Math.sin(this.time * 4) * 0.2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2 + f);

        // Fire glow
        ctx.fillStyle = `rgba(255,100,0,${glow * 0.15})`;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#cc3300';
        ctx.fillRect(-w * 0.2, -h * 0.1, w * 0.4, h * 0.3);

        // Head
        ctx.fillStyle = '#dd4411';
        ctx.fillRect(-w * 0.18, -h * 0.3, w * 0.36, h * 0.22);

        // Horns
        ctx.fillStyle = '#2a1a0a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.15, -h * 0.3);
        ctx.lineTo(-w * 0.25, -h * 0.5);
        ctx.lineTo(-w * 0.05, -h * 0.3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.15, -h * 0.3);
        ctx.lineTo(w * 0.25, -h * 0.5);
        ctx.lineTo(w * 0.05, -h * 0.3);
        ctx.fill();

        // Fire eyes
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-w * 0.1, -h * 0.22, w * 0.07, h * 0.05);
        ctx.fillRect(w * 0.04, -h * 0.22, w * 0.07, h * 0.05);

        // Flame on head
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `rgba(255,${100 + i * 50},0,${0.6 - i * 0.15})`;
            const fx = Math.sin(this.time * 8 + i * 2) * 3;
            ctx.beginPath();
            ctx.moveTo(-4 + fx + i * 3, -h * 0.3);
            ctx.lineTo(fx + i * 3, -h * 0.45 - i * 4);
            ctx.lineTo(4 + fx + i * 3, -h * 0.3);
            ctx.fill();
        }

        ctx.restore();
    },

    drawLavaGolem(ctx, x, y, w, h) {
        const pulse = Math.sin(this.time * 2) * 0.1;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Glow
        ctx.fillStyle = `rgba(255,80,0,${0.08 + pulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Body (rocky)
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(-w * 0.35, -h * 0.15, w * 0.7, h * 0.45);

        // Lava cracks
        ctx.fillStyle = `rgba(255,100,0,${0.6 + pulse})`;
        ctx.fillRect(-w * 0.1, -h * 0.1, 3, h * 0.3);
        ctx.fillRect(w * 0.05, 0, 3, h * 0.2);
        ctx.fillRect(-w * 0.25, h * 0.05, w * 0.2, 2);

        // Head
        ctx.fillStyle = '#3a2518';
        ctx.fillRect(-w * 0.25, -h * 0.4, w * 0.5, h * 0.28);

        // Lava eyes
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-w * 0.15, -h * 0.3, w * 0.1, h * 0.07);
        ctx.fillRect(w * 0.05, -h * 0.3, w * 0.1, h * 0.07);

        // Arms
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(-w * 0.5, -h * 0.1, w * 0.18, h * 0.3);
        ctx.fillRect(w * 0.32, -h * 0.1, w * 0.18, h * 0.3);

        // Legs
        ctx.fillRect(-w * 0.3, h * 0.25, w * 0.22, h * 0.2);
        ctx.fillRect(w * 0.08, h * 0.25, w * 0.22, h * 0.2);

        ctx.restore();
    },

    drawDragon(ctx, x, y, w, h) {
        const wingFlap = Math.sin(this.time * 3) * 15;
        const breathGlow = Math.sin(this.time * 2) * 0.2 + 0.3;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Wings
        ctx.fillStyle = '#8a2020';
        ctx.beginPath();
        ctx.moveTo(-w * 0.1, -h * 0.1);
        ctx.lineTo(-w * 0.6, -h * 0.4 - wingFlap);
        ctx.lineTo(-w * 0.45, h * 0.05);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.1, -h * 0.1);
        ctx.lineTo(w * 0.6, -h * 0.4 - wingFlap);
        ctx.lineTo(w * 0.45, h * 0.05);
        ctx.fill();

        // Body
        ctx.fillStyle = '#aa3030';
        ctx.fillRect(-w * 0.25, -h * 0.15, w * 0.5, h * 0.4);

        // Belly scales
        ctx.fillStyle = '#cc8844';
        ctx.fillRect(-w * 0.15, -h * 0.05, w * 0.3, h * 0.25);

        // Head
        ctx.fillStyle = '#aa3030';
        ctx.fillRect(-w * 0.2, -h * 0.4, w * 0.4, h * 0.28);

        // Horns
        ctx.fillStyle = '#3a2a1a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.15, -h * 0.4);
        ctx.lineTo(-w * 0.25, -h * 0.6);
        ctx.lineTo(-w * 0.05, -h * 0.4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.15, -h * 0.4);
        ctx.lineTo(w * 0.25, -h * 0.6);
        ctx.lineTo(w * 0.05, -h * 0.4);
        ctx.fill();

        // Eyes
        ctx.fillStyle = `rgba(255,200,0,${breathGlow + 0.5})`;
        ctx.fillRect(-w * 0.12, -h * 0.32, w * 0.08, h * 0.06);
        ctx.fillRect(w * 0.04, -h * 0.32, w * 0.08, h * 0.06);

        // Nostrils with fire
        ctx.fillStyle = `rgba(255,100,0,${breathGlow})`;
        ctx.beginPath();
        ctx.arc(-w * 0.05, -h * 0.18, 3, 0, Math.PI * 2);
        ctx.arc(w * 0.05, -h * 0.18, 3, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.fillStyle = '#993030';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.2);
        ctx.quadraticCurveTo(-w * 0.3, h * 0.4, -w * 0.15, h * 0.5);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#993030';
        ctx.stroke();

        // Legs
        ctx.fillStyle = '#993030';
        ctx.fillRect(-w * 0.2, h * 0.2, w * 0.15, h * 0.2);
        ctx.fillRect(w * 0.05, h * 0.2, w * 0.15, h * 0.2);

        ctx.restore();
    },

    drawDarkKnight(ctx, x, y, w, h) {
        const f = Math.sin(this.time * 4 + x) * 1.5;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Dark armor body
        ctx.fillStyle = '#2a2030';
        ctx.fillRect(-w * 0.3, -h * 0.15, w * 0.6, h * 0.4);

        // Armor highlights
        ctx.fillStyle = '#3a3040';
        ctx.fillRect(-w * 0.25, -h * 0.1, w * 0.5, h * 0.12);

        // Purple glow trim
        ctx.fillStyle = 'rgba(150,50,200,0.3)';
        ctx.fillRect(-w * 0.3, -h * 0.15, w * 0.6, 2);
        ctx.fillRect(-w * 0.3, h * 0.23, w * 0.6, 2);

        // Head/Helm
        ctx.fillStyle = '#1a1520';
        ctx.fillRect(-w * 0.22, -h * 0.42, w * 0.44, h * 0.3);

        // Visor (glowing eyes)
        ctx.fillStyle = '#aa33ff';
        ctx.fillRect(-w * 0.12, -h * 0.3, w * 0.08, h * 0.04);
        ctx.fillRect(w * 0.04, -h * 0.3, w * 0.08, h * 0.04);

        // Legs
        ctx.fillStyle = '#2a2030';
        ctx.fillRect(-w * 0.2, h * 0.2, w * 0.16, h * 0.25 + f);
        ctx.fillRect(w * 0.04, h * 0.2, w * 0.16, h * 0.25 - f);

        // Dark sword
        ctx.fillStyle = '#4a4a5a';
        ctx.fillRect(w * 0.3, -h * 0.35, 3, 35);
        ctx.fillStyle = '#aa33ff';
        ctx.fillRect(w * 0.3, -h * 0.35, 3, 2);

        ctx.restore();
    },

    drawDemon(ctx, x, y, w, h) {
        const pulse = Math.sin(this.time * 3) * 0.15;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Aura
        ctx.fillStyle = `rgba(200,0,50,${0.06 + pulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#5a1a1a';
        ctx.fillRect(-w * 0.3, -h * 0.12, w * 0.6, h * 0.4);

        // Head
        ctx.fillStyle = '#6a2020';
        ctx.fillRect(-w * 0.22, -h * 0.38, w * 0.44, h * 0.28);

        // Horns (large)
        ctx.fillStyle = '#1a0a0a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.2, -h * 0.35);
        ctx.lineTo(-w * 0.35, -h * 0.58);
        ctx.lineTo(-w * 0.08, -h * 0.3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.2, -h * 0.35);
        ctx.lineTo(w * 0.35, -h * 0.58);
        ctx.lineTo(w * 0.08, -h * 0.3);
        ctx.fill();

        // Fire eyes
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(-w * 0.12, -h * 0.28, w * 0.09, h * 0.06);
        ctx.fillRect(w * 0.04, -h * 0.28, w * 0.09, h * 0.06);

        // Wings
        ctx.fillStyle = '#3a0a0a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.25, -h * 0.1);
        ctx.lineTo(-w * 0.55, -h * 0.35);
        ctx.lineTo(-w * 0.4, h * 0.1);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.25, -h * 0.1);
        ctx.lineTo(w * 0.55, -h * 0.35);
        ctx.lineTo(w * 0.4, h * 0.1);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#4a1515';
        ctx.fillRect(-w * 0.2, h * 0.22, w * 0.16, h * 0.25);
        ctx.fillRect(w * 0.04, h * 0.22, w * 0.16, h * 0.25);

        ctx.restore();
    },

    drawDarkLord(ctx, x, y, w, h) {
        const time = this.time;
        const pulse = Math.sin(time * 2) * 0.2;
        const hover = Math.sin(time * 1.5) * 4;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2 + hover);

        // Dark aura
        for (let i = 3; i > 0; i--) {
            ctx.fillStyle = `rgba(100,0,180,${0.03 * i + pulse * 0.02})`;
            ctx.beginPath();
            ctx.arc(0, 0, w * 0.3 * i, 0, Math.PI * 2);
            ctx.fill();
        }

        // Flowing robes
        ctx.fillStyle = '#1a0a2a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.35, -h * 0.15);
        ctx.quadraticCurveTo(-w * 0.4, h * 0.3, -w * 0.25, h * 0.5);
        ctx.lineTo(w * 0.25, h * 0.5);
        ctx.quadraticCurveTo(w * 0.4, h * 0.3, w * 0.35, -h * 0.15);
        ctx.fill();

        // Armor
        ctx.fillStyle = '#2a1a3a';
        ctx.fillRect(-w * 0.3, -h * 0.15, w * 0.6, h * 0.35);

        // Shoulder plates
        ctx.fillStyle = '#3a2a4a';
        ctx.fillRect(-w * 0.4, -h * 0.2, w * 0.2, h * 0.12);
        ctx.fillRect(w * 0.2, -h * 0.2, w * 0.2, h * 0.12);

        // Crown of shadow
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(-w * 0.25, -h * 0.5, w * 0.5, h * 0.08);
        for (let i = -2; i <= 2; i++) {
            ctx.fillRect(i * w * 0.1 - 2, -h * 0.58, 4, h * 0.12);
            // Gem on each spike
            ctx.fillStyle = `rgba(180,0,255,${0.6 + pulse})`;
            ctx.fillRect(i * w * 0.1 - 1, -h * 0.57, 2, 2);
            ctx.fillStyle = '#0a0a1a';
        }

        // Face (shadowed)
        ctx.fillStyle = '#1a0a1a';
        ctx.fillRect(-w * 0.2, -h * 0.4, w * 0.4, h * 0.25);

        // Burning eyes
        const eyeGlow = 0.7 + pulse;
        ctx.fillStyle = `rgba(200,0,255,${eyeGlow})`;
        ctx.fillRect(-w * 0.12, -h * 0.32, w * 0.09, h * 0.05);
        ctx.fillRect(w * 0.04, -h * 0.32, w * 0.09, h * 0.05);

        // Staff of darkness
        ctx.fillStyle = '#1a0a2a';
        ctx.fillRect(w * 0.32, -h * 0.45, 4, h * 0.8);
        // Orb
        ctx.fillStyle = `rgba(180,0,255,${0.5 + pulse})`;
        ctx.beginPath();
        ctx.arc(w * 0.34, -h * 0.47, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(220,100,255,${0.3 + pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(w * 0.34, -h * 0.47, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawForestGuardian(ctx, x, y, w, h) {
        const sway = Math.sin(this.time * 1.5) * 3;
        const glow = 0.3 + Math.sin(this.time * 2) * 0.15;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Trunk body (massive)
        ctx.fillStyle = '#3a2a15';
        ctx.fillRect(-w * 0.3, -h * 0.2, w * 0.6, h * 0.55);

        // Bark
        ctx.fillStyle = '#2a1a0a';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(-w * 0.25, -h * 0.15 + i * 10, w * 0.2, 2);
            ctx.fillRect(w * 0.05, -h * 0.1 + i * 9, w * 0.2, 2);
        }

        // Crown/canopy
        ctx.fillStyle = '#0a3a0a';
        ctx.beginPath();
        ctx.arc(sway, -h * 0.35, w * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a5a1a';
        ctx.beginPath();
        ctx.arc(w * 0.12 + sway, -h * 0.4, w * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = `rgba(0,255,100,${glow})`;
        ctx.fillRect(-w * 0.12, -h * 0.12, w * 0.08, h * 0.07);
        ctx.fillRect(w * 0.05, -h * 0.12, w * 0.08, h * 0.07);
        ctx.fillStyle = '#1a0a05';
        ctx.fillRect(-w * 0.1, h * 0.02, w * 0.2, h * 0.06);

        // Root legs
        ctx.fillStyle = '#3a2a15';
        ctx.fillRect(-w * 0.4, h * 0.3, w * 0.3, h * 0.15);
        ctx.fillRect(w * 0.1, h * 0.3, w * 0.3, h * 0.15);

        // Branch arms
        ctx.strokeStyle = '#3a2a15';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, -h * 0.1);
        ctx.lineTo(-w * 0.6 + sway, -h * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.3, -h * 0.1);
        ctx.lineTo(w * 0.6 - sway, -h * 0.25);
        ctx.stroke();

        ctx.restore();
    },

    drawLich(ctx, x, y, w, h) {
        const hover = Math.sin(this.time * 2) * 3;
        const glow = 0.4 + Math.sin(this.time * 3) * 0.2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2 + hover);

        // Dark robes
        ctx.fillStyle = '#1a1a2a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, -h * 0.15);
        ctx.lineTo(-w * 0.35, h * 0.5);
        ctx.lineTo(w * 0.35, h * 0.5);
        ctx.lineTo(w * 0.3, -h * 0.15);
        ctx.fill();

        // Skull
        ctx.fillStyle = '#c8c0b0';
        ctx.fillRect(-w * 0.2, -h * 0.4, w * 0.4, h * 0.28);

        // Crown
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(-w * 0.22, -h * 0.48, w * 0.44, h * 0.1);

        // Phylactery glow
        ctx.fillStyle = `rgba(0,200,100,${glow})`;
        ctx.beginPath();
        ctx.arc(0, h * 0.1, 5, 0, Math.PI * 2);
        ctx.fill();

        // Soul fire eyes
        ctx.fillStyle = `rgba(0,255,150,${glow + 0.2})`;
        ctx.fillRect(-w * 0.12, -h * 0.3, w * 0.08, h * 0.06);
        ctx.fillRect(w * 0.04, -h * 0.3, w * 0.08, h * 0.06);

        // Skeletal hands
        ctx.fillStyle = '#a09880';
        ctx.fillRect(-w * 0.4, -h * 0.05, 8, 4);
        ctx.fillRect(w * 0.32, -h * 0.05, 8, 4);

        // Magic aura
        ctx.strokeStyle = `rgba(0,200,150,${glow * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    },

    drawShadowAssassin(ctx, x, y, w, h) {
        const alpha = 0.6 + Math.sin(this.time * 4) * 0.15;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.globalAlpha = alpha;

        // Shadow body
        ctx.fillStyle = '#15101a';
        ctx.fillRect(-w * 0.25, -h * 0.15, w * 0.5, h * 0.4);

        // Hood
        ctx.fillStyle = '#0a0510';
        ctx.beginPath();
        ctx.moveTo(-w * 0.25, -h * 0.15);
        ctx.lineTo(0, -h * 0.48);
        ctx.lineTo(w * 0.25, -h * 0.15);
        ctx.fill();

        // Eyes
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#ff0066';
        ctx.fillRect(-w * 0.08, -h * 0.28, w * 0.06, h * 0.03);
        ctx.fillRect(w * 0.04, -h * 0.28, w * 0.06, h * 0.03);

        // Shadow blades
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#2a1a3a';
        ctx.fillRect(-w * 0.4, -h * 0.05, 14, 2);
        ctx.fillRect(w * 0.28, -h * 0.05, 14, 2);

        // Legs
        ctx.fillStyle = '#100a15';
        ctx.fillRect(-w * 0.18, h * 0.2, w * 0.14, h * 0.25);
        ctx.fillRect(w * 0.04, h * 0.2, w * 0.14, h * 0.25);

        ctx.restore();
    },

    drawFireDrake(ctx, x, y, w, h) {
        const f = Math.sin(this.time * 4) * 2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        // Body
        ctx.fillStyle = '#aa4422';
        ctx.fillRect(-w * 0.3, -h * 0.1, w * 0.6, h * 0.3);

        // Head
        ctx.fillStyle = '#bb5533';
        ctx.fillRect(-w * 0.15, -h * 0.3, w * 0.35, h * 0.22);

        // Small horns
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(-w * 0.1, -h * 0.38, 3, 8);
        ctx.fillRect(w * 0.08, -h * 0.38, 3, 8);

        // Eyes
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-w * 0.05, -h * 0.22, w * 0.05, h * 0.04);
        ctx.fillRect(w * 0.05, -h * 0.22, w * 0.05, h * 0.04);

        // Small wings
        ctx.fillStyle = '#993322';
        ctx.beginPath();
        ctx.moveTo(-w * 0.25, -h * 0.05);
        ctx.lineTo(-w * 0.45, -h * 0.25 + f);
        ctx.lineTo(-w * 0.3, h * 0.05);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w * 0.25, -h * 0.05);
        ctx.lineTo(w * 0.45, -h * 0.25 + f);
        ctx.lineTo(w * 0.3, h * 0.05);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#884422';
        ctx.fillRect(-w * 0.25, h * 0.15, w * 0.13, h * 0.2);
        ctx.fillRect(w * 0.12, h * 0.15, w * 0.13, h * 0.2);

        ctx.restore();
    },

    drawFairy(ctx, x, y, w, h) {
        const hover = Math.sin(this.time * 5 + x) * 4;
        const glow = 0.4 + Math.sin(this.time * 3) * 0.2;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2 + hover);

        // Glow
        ctx.fillStyle = `rgba(100,255,200,${glow * 0.2})`;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = `rgba(150,255,200,${glow * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(-w * 0.2, -h * 0.05, 8, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.2, -h * 0.05, 8, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Tiny body
        ctx.fillStyle = '#33cc88';
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#aaffcc';
        ctx.beginPath();
        ctx.arc(0, -8, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    // Projectile drawing
    drawProjectile(ctx, proj) {
        ctx.save();
        ctx.translate(proj.x, proj.y);

        switch (proj.type) {
            case 'magic_bolt':
                ctx.fillStyle = 'rgba(100,150,255,0.8)';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(100,150,255,0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'fireball':
                const fbGlow = 0.5 + Math.sin(this.time * 10) * 0.2;
                ctx.fillStyle = `rgba(255,100,0,${fbGlow})`;
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `rgba(255,200,50,${fbGlow * 0.8})`;
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `rgba(255,50,0,${fbGlow * 0.3})`;
                ctx.beginPath();
                ctx.arc(0, 0, 14, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'arrow':
                ctx.strokeStyle = '#8a6a3a';
                ctx.lineWidth = 2;
                const a = Math.atan2(proj.dy, proj.dx);
                ctx.rotate(a);
                ctx.beginPath();
                ctx.moveTo(-8, 0);
                ctx.lineTo(8, 0);
                ctx.stroke();
                ctx.fillStyle = '#aaa';
                ctx.beginPath();
                ctx.moveTo(8, 0);
                ctx.lineTo(5, -2);
                ctx.lineTo(5, 2);
                ctx.fill();
                break;
            case 'shadow_bolt':
                ctx.fillStyle = 'rgba(150,0,200,0.7)';
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(100,0,150,0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'green_bolt':
                ctx.fillStyle = 'rgba(0,200,100,0.7)';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'fire_bolt':
                ctx.fillStyle = 'rgba(255,80,0,0.8)';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                break;
            default:
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();
        }

        ctx.restore();
    },

    // Draw entity by type
    drawEntity(ctx, entity) {
        switch (entity.type) {
            case ENT.GOBLIN: this.drawGoblin(ctx, entity.x, entity.y, entity.w, entity.h, 'normal'); break;
            case ENT.GOBLIN_ARCHER: this.drawGoblin(ctx, entity.x, entity.y, entity.w, entity.h, 'archer'); break;
            case ENT.GOBLIN_SHAMAN: this.drawGoblin(ctx, entity.x, entity.y, entity.w, entity.h, 'shaman'); break;
            case ENT.GOBLIN_KING: this.drawGoblinKing(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.WOLF: this.drawWolf(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.SKELETON: this.drawSkeleton(ctx, entity.x, entity.y, entity.w, entity.h, 'normal'); break;
            case ENT.SKELETON_MAGE: this.drawSkeleton(ctx, entity.x, entity.y, entity.w, entity.h, 'mage'); break;
            case ENT.ZOMBIE: this.drawZombie(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.WRAITH: this.drawWraith(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.LICH: this.drawLich(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.SPIDER: this.drawSpider(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.TREANT: this.drawTreant(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.FAIRY: this.drawFairy(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.FOREST_GUARDIAN: this.drawForestGuardian(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.FIRE_IMP: this.drawFireImp(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.LAVA_GOLEM: this.drawLavaGolem(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.FIRE_DRAKE: this.drawFireDrake(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.RED_DRAGON: this.drawDragon(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.DARK_KNIGHT: this.drawDarkKnight(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.SHADOW_ASSASSIN: this.drawShadowAssassin(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.DEMON: this.drawDemon(ctx, entity.x, entity.y, entity.w, entity.h); break;
            case ENT.DARK_LORD: this.drawDarkLord(ctx, entity.x, entity.y, entity.w, entity.h); break;
        }

        // Health bar above enemy
        if (entity.hp < entity.maxHp && entity.hp > 0) {
            const barW = entity.w * 0.8;
            const barH = 4;
            const barX = entity.x + (entity.w - barW) / 2;
            const barY = entity.y - 8;
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
            ctx.fillStyle = '#cc2222';
            ctx.fillRect(barX, barY, barW * (entity.hp / entity.maxHp), barH);
        }
    },

    // Draw chest
    drawChest(ctx, x, y, opened) {
        ctx.save();
        ctx.translate(x, y);
        if (opened) {
            // Open chest
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(2, 8, TILE - 4, TILE - 12);
            ctx.fillStyle = '#7a5a2a';
            ctx.fillRect(4, 4, TILE - 8, 8);
            ctx.fillStyle = '#d4a54a';
            ctx.fillRect(TILE / 2 - 2, 10, 4, 4);
            // Glow from inside
            ctx.fillStyle = 'rgba(255,200,50,0.3)';
            ctx.fillRect(6, 12, TILE - 12, TILE - 18);
        } else {
            // Closed chest
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(2, 6, TILE - 4, TILE - 8);
            ctx.fillStyle = '#7a5a2a';
            ctx.fillRect(2, 6, TILE - 4, TILE / 3);
            ctx.fillStyle = '#d4a54a';
            ctx.fillRect(TILE / 2 - 3, TILE / 2 - 2, 6, 6);
            // Metal bands
            ctx.fillStyle = '#888';
            ctx.fillRect(4, 8, TILE - 8, 2);
            ctx.fillRect(4, TILE - 6, TILE - 8, 2);
        }
        ctx.restore();
    },

    // Draw door
    drawDoor(ctx, x, y, locked, theme) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = theme.door;
        ctx.fillRect(4, 2, TILE - 8, TILE - 2);
        ctx.fillStyle = theme.doorFrame;
        ctx.fillRect(2, 0, TILE - 4, 4);
        ctx.fillRect(2, 0, 4, TILE);
        ctx.fillRect(TILE - 6, 0, 4, TILE);
        if (locked) {
            ctx.fillStyle = '#dd3333';
            ctx.fillRect(TILE / 2 - 3, TILE / 2 - 3, 6, 6);
        } else {
            ctx.fillStyle = '#d4a54a';
            ctx.fillRect(TILE / 2 - 2, TILE / 2 - 2, 4, 4);
        }
        ctx.restore();
    },
};
