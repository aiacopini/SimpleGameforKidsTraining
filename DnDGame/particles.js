// ============================================================
// PARTICLES.JS - Particle effects system
// Dungeons of Drakenmoor
// ============================================================

class Particle {
    constructor(x, y, dx, dy, life, color, size, gravity = 0, fadeOut = true) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.gravity = gravity;
        this.fadeOut = fadeOut;
    }

    update(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        this.dy += this.gravity * dt;
        this.life -= dt;
    }

    draw(ctx) {
        const alpha = this.fadeOut ? clamp(this.life / this.maxLife, 0, 1) : 1;
        const s = this.size * (0.5 + alpha * 0.5);
        ctx.fillStyle = typeof this.color === 'string' ? this.color.replace(')', `,${alpha})`).replace('rgb', 'rgba') : this.color;
        if (typeof this.color === 'string' && this.color.startsWith('#')) {
            const rgb = hexToRgb(this.color);
            ctx.fillStyle = rgbToStr(rgb.r, rgb.g, rgb.b, alpha);
        }
        ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
    }

    get alive() { return this.life > 0; }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }

    add(p) {
        if (this.particles.length < this.maxParticles) {
            this.particles.push(p);
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (!this.particles[i].alive) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    clear() {
        this.particles = [];
    }

    // Effect presets
    burst(x, y, count, color, speed = 80, life = 0.5, size = 3) {
        for (let i = 0; i < count; i++) {
            const a = rand(0, Math.PI * 2);
            const s = rand(speed * 0.3, speed);
            this.add(new Particle(
                x + rand(-3, 3), y + rand(-3, 3),
                Math.cos(a) * s, Math.sin(a) * s,
                rand(life * 0.5, life),
                typeof color === 'object' ? choose(color) : color,
                rand(size * 0.5, size),
                30
            ));
        }
    }

    blood(x, y, count = 8) {
        this.burst(x, y, count, ['#cc2222', '#aa1111', '#881111'], 60, 0.5, 3);
    }

    gold(x, y, count = 10) {
        this.burst(x, y, count, ['#ffcc33', '#ddaa22', '#ffee66'], 50, 0.8, 3);
    }

    magic(x, y, color = '#6688ff', count = 12) {
        this.burst(x, y, count, [color, '#aabbff', '#ffffff'], 40, 0.6, 2);
    }

    fire(x, y, count = 6) {
        for (let i = 0; i < count; i++) {
            this.add(new Particle(
                x + rand(-5, 5), y + rand(-3, 3),
                rand(-15, 15), rand(-60, -20),
                rand(0.3, 0.7),
                choose(['#ff6600', '#ff9933', '#ffcc00', '#ff3300']),
                rand(2, 5),
                -20
            ));
        }
    }

    smoke(x, y, count = 4) {
        for (let i = 0; i < count; i++) {
            this.add(new Particle(
                x + rand(-5, 5), y + rand(-5, 5),
                rand(-10, 10), rand(-30, -10),
                rand(0.5, 1.2),
                choose(['#555555', '#444444', '#666666']),
                rand(3, 6),
                -5
            ));
        }
    }

    heal(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            this.add(new Particle(
                x + rand(-10, 10), y + rand(-5, 5),
                rand(-5, 5), rand(-40, -20),
                rand(0.4, 0.8),
                choose(['#33ff33', '#66ff66', '#ffffff']),
                rand(2, 4),
                -10
            ));
        }
    }

    levelUp(x, y) {
        for (let i = 0; i < 30; i++) {
            const a = (i / 30) * Math.PI * 2;
            const s = rand(40, 80);
            this.add(new Particle(
                x, y,
                Math.cos(a) * s, Math.sin(a) * s,
                rand(0.6, 1.2),
                choose(['#ffcc33', '#ffffff', '#ffee66']),
                rand(2, 5),
                0
            ));
        }
    }

    torchFlicker(x, y, color) {
        if (Math.random() > 0.3) return;
        this.add(new Particle(
            x + rand(-3, 3), y + rand(-3, 3),
            rand(-5, 5), rand(-25, -10),
            rand(0.2, 0.5),
            color || choose(['#ff9933', '#ff6600', '#ffcc66']),
            rand(1, 3),
            -10
        ));
    }

    trail(x, y, color, size = 2) {
        this.add(new Particle(
            x + rand(-2, 2), y + rand(-2, 2),
            rand(-5, 5), rand(-5, 5),
            rand(0.15, 0.3),
            color,
            size,
            0
        ));
    }

    explosion(x, y, radius = 40, count = 25) {
        for (let i = 0; i < count; i++) {
            const a = rand(0, Math.PI * 2);
            const s = rand(30, radius * 2);
            this.add(new Particle(
                x, y,
                Math.cos(a) * s, Math.sin(a) * s,
                rand(0.3, 0.8),
                choose(['#ff6600', '#ff3300', '#ffcc00', '#ff9900']),
                rand(3, 7),
                20
            ));
        }
        this.smoke(x, y, 8);
    }

    deathBurst(x, y, color = '#cc2222') {
        for (let i = 0; i < 20; i++) {
            const a = rand(0, Math.PI * 2);
            const s = rand(30, 80);
            this.add(new Particle(
                x, y,
                Math.cos(a) * s, Math.sin(a) * s,
                rand(0.5, 1.0),
                choose([color, '#ffffff', '#aaaaaa']),
                rand(2, 5),
                40
            ));
        }
    }

    shadowBurst(x, y) {
        for (let i = 0; i < 15; i++) {
            const a = rand(0, Math.PI * 2);
            const s = rand(20, 60);
            this.add(new Particle(
                x, y,
                Math.cos(a) * s, Math.sin(a) * s,
                rand(0.3, 0.7),
                choose(['#4a2a6a', '#3a1a5a', '#2a0a4a']),
                rand(3, 6),
                0
            ));
        }
    }
}
