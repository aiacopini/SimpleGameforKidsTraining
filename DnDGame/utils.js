// ============================================================
// UTILS.JS - Utility functions and constants
// Dungeons of Drakenmoor
// ============================================================

const TILE = 32;
const CANVAS_W = 1024;
const CANVAS_H = 768;
const COLS = Math.floor(CANVAS_W / TILE);
const ROWS = Math.floor(CANVAS_H / TILE);

// Map tile types
const T = {
    VOID: 0,
    FLOOR: 1,
    WALL: 2,
    WALL_TOP: 3,
    DOOR: 4,
    CHEST: 5,
    STAIRS: 6,
    TRAP: 7,
    WATER: 8,
    LAVA: 9,
    PILLAR: 10,
    TORCH: 11,
    BOSS_DOOR: 12,
    ENTRANCE: 13,
    RUBBLE: 14,
    BONE_PILE: 15,
};

// Entity types
const ENT = {
    PLAYER: 'player',
    GOBLIN: 'goblin',
    GOBLIN_ARCHER: 'goblin_archer',
    GOBLIN_SHAMAN: 'goblin_shaman',
    GOBLIN_KING: 'goblin_king',
    WOLF: 'wolf',
    TREANT: 'treant',
    FAIRY: 'fairy',
    SPIDER: 'spider',
    FOREST_GUARDIAN: 'forest_guardian',
    SKELETON: 'skeleton',
    SKELETON_MAGE: 'skeleton_mage',
    ZOMBIE: 'zombie',
    WRAITH: 'wraith',
    LICH: 'lich',
    FIRE_IMP: 'fire_imp',
    LAVA_GOLEM: 'lava_golem',
    FIRE_DRAKE: 'fire_drake',
    RED_DRAGON: 'red_dragon',
    DARK_KNIGHT: 'dark_knight',
    SHADOW_ASSASSIN: 'shadow_assassin',
    DEMON: 'demon',
    DARK_LORD: 'dark_lord',
};

// Colors per level theme
const THEMES = {
    goblin_cave: {
        floor: '#3a3530', floorAlt: '#352f2a',
        wall: '#5a4a35', wallTop: '#4a3a25', wallHighlight: '#6a5a45',
        door: '#7a5a2a', doorFrame: '#5a4020',
        bg: '#1a1510', ambient: 'rgba(255,180,80,0.03)',
        torchColor: '#ff9933', torchGlow: 'rgba(255,150,50,0.15)',
        accent: '#8a6a3a', water: '#2a4a5a',
        fog: 'rgba(20,15,10,0.6)',
        particleColors: ['#ff9933', '#ff6600', '#ffcc66'],
    },
    enchanted_forest: {
        floor: '#2a3a25', floorAlt: '#253520',
        wall: '#3a5035', wallTop: '#2a4025', wallHighlight: '#4a6045',
        door: '#5a7a3a', doorFrame: '#3a5a2a',
        bg: '#0a150a', ambient: 'rgba(100,255,150,0.03)',
        torchColor: '#66ff99', torchGlow: 'rgba(100,255,150,0.12)',
        accent: '#4a8a5a', water: '#2a5a4a',
        fog: 'rgba(10,25,15,0.5)',
        particleColors: ['#66ff99', '#33cc66', '#99ffcc'],
    },
    undead_crypt: {
        floor: '#252530', floorAlt: '#20202a',
        wall: '#3a3a50', wallTop: '#2a2a40', wallHighlight: '#4a4a60',
        door: '#4a4a6a', doorFrame: '#3a3a5a',
        bg: '#0a0a15', ambient: 'rgba(100,100,255,0.02)',
        torchColor: '#6666ff', torchGlow: 'rgba(100,100,255,0.1)',
        accent: '#5a5a8a', water: '#1a1a3a',
        fog: 'rgba(10,10,25,0.7)',
        particleColors: ['#6666ff', '#9999ff', '#3333cc'],
    },
    dragon_volcano: {
        floor: '#3a2520', floorAlt: '#35201a',
        wall: '#5a3525', wallTop: '#4a2515', wallHighlight: '#6a4535',
        door: '#8a4a2a', doorFrame: '#6a3a1a',
        bg: '#1a0a05', ambient: 'rgba(255,80,20,0.04)',
        torchColor: '#ff4400', torchGlow: 'rgba(255,60,10,0.18)',
        accent: '#aa5a2a', water: '#aa3300',
        fog: 'rgba(25,10,5,0.5)',
        particleColors: ['#ff4400', '#ff8800', '#ffcc00'],
    },
    dark_castle: {
        floor: '#252025', floorAlt: '#201a20',
        wall: '#3a303a', wallTop: '#2a202a', wallHighlight: '#4a404a',
        door: '#5a3a5a', doorFrame: '#4a2a4a',
        bg: '#0f0a0f', ambient: 'rgba(180,50,255,0.03)',
        torchColor: '#aa33ff', torchGlow: 'rgba(150,50,255,0.12)',
        accent: '#7a4a8a', water: '#2a1a3a',
        fog: 'rgba(15,10,20,0.65)',
        particleColors: ['#aa33ff', '#cc66ff', '#7700cc'],
    },
};

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function choose(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function angle(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); }

function rectIntersect(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

function circleIntersect(x1, y1, r1, x2, y2, r2) {
    return dist(x1, y1, x2, y2) < r1 + r2;
}

function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToStr(r, g, b, a = 1) {
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}

// Simple camera
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeTime = 0;
        this.shakeIntensity = 0;
    }

    follow(entity, mapW, mapH) {
        this.targetX = entity.x + entity.w / 2 - CANVAS_W / 2;
        this.targetY = entity.y + entity.h / 2 - CANVAS_H / 2;
        this.targetX = clamp(this.targetX, 0, Math.max(0, mapW - CANVAS_W));
        this.targetY = clamp(this.targetY, 0, Math.max(0, mapH - CANVAS_H));
    }

    update(dt) {
        this.x = lerp(this.x, this.targetX, 6 * dt);
        this.y = lerp(this.y, this.targetY, 6 * dt);
        if (this.shakeTime > 0) {
            this.shakeTime -= dt;
            const factor = this.shakeTime > 0 ? this.shakeIntensity * (this.shakeTime / 0.5) : 0;
            this.shakeX = rand(-factor, factor);
            this.shakeY = rand(-factor, factor);
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }

    shake(intensity = 5, duration = 0.3) {
        this.shakeIntensity = intensity;
        this.shakeTime = duration;
    }

    get offsetX() { return -Math.round(this.x + this.shakeX); }
    get offsetY() { return -Math.round(this.y + this.shakeY); }
}

// Input handler
class InputManager {
    constructor(canvas) {
        this.keys = {};
        this.keysJustPressed = {};
        this.mouse = { x: 0, y: 0, left: false, right: false, leftJust: false, rightJust: false };
        this.canvas = canvas;

        window.addEventListener('keydown', e => {
            if (!this.keys[e.code]) this.keysJustPressed[e.code] = true;
            this.keys[e.code] = true;
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => { this.keys[e.code] = false; });

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mousedown', e => {
            e.preventDefault();
            if (e.button === 0) { this.mouse.left = true; this.mouse.leftJust = true; }
            if (e.button === 2) { this.mouse.right = true; this.mouse.rightJust = true; }
        });
        canvas.addEventListener('mouseup', e => {
            if (e.button === 0) this.mouse.left = false;
            if (e.button === 2) this.mouse.right = false;
        });
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    isDown(code) { return !!this.keys[code]; }
    justPressed(code) { return !!this.keysJustPressed[code]; }
    mouseWorldX(cam) { return this.mouse.x - cam.offsetX; }
    mouseWorldY(cam) { return this.mouse.y - cam.offsetY; }

    endFrame() {
        this.keysJustPressed = {};
        this.mouse.leftJust = false;
        this.mouse.rightJust = false;
    }
}
