// ============================================================
// AUDIO.JS - Procedural audio engine
// Dungeons of Drakenmoor
// ============================================================

const GameAudio = (() => {
    let ctx = null;
    let masterGain = null;
    let musicGain = null;
    let sfxGain = null;
    let enabled = true;
    let currentMusic = null;
    let musicInterval = null;

    function init() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(ctx.destination);
        musicGain = ctx.createGain();
        musicGain.gain.value = 0.25;
        musicGain.connect(masterGain);
        sfxGain = ctx.createGain();
        sfxGain.gain.value = 0.6;
        sfxGain.connect(masterGain);
    }

    function playNote(freq, duration, type = 'square', gainNode = sfxGain, volume = 0.3) {
        if (!ctx || !enabled) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(volume, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(g);
        g.connect(gainNode);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }

    function playNoise(duration, volume = 0.1) {
        if (!ctx || !enabled) return;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const g = ctx.createGain();
        g.gain.setValueAtTime(volume, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800;
        src.connect(filter);
        filter.connect(g);
        g.connect(sfxGain);
        src.start();
    }

    const SFX = {
        swordSwing() {
            playNoise(0.15, 0.2);
            playNote(200, 0.08, 'sawtooth', sfxGain, 0.15);
            playNote(150, 0.1, 'sawtooth', sfxGain, 0.1);
        },
        swordHit() {
            playNoise(0.1, 0.3);
            playNote(120, 0.12, 'square', sfxGain, 0.2);
            playNote(80, 0.15, 'square', sfxGain, 0.15);
        },
        magicCast() {
            playNote(400, 0.3, 'sine', sfxGain, 0.2);
            playNote(600, 0.25, 'sine', sfxGain, 0.15);
            playNote(800, 0.2, 'sine', sfxGain, 0.1);
        },
        fireball() {
            playNoise(0.4, 0.3);
            playNote(100, 0.5, 'sawtooth', sfxGain, 0.2);
            playNote(80, 0.6, 'sawtooth', sfxGain, 0.15);
        },
        explosion() {
            playNoise(0.6, 0.4);
            playNote(60, 0.5, 'square', sfxGain, 0.3);
            playNote(40, 0.7, 'square', sfxGain, 0.2);
        },
        daggerStab() {
            playNote(300, 0.06, 'sawtooth', sfxGain, 0.2);
            playNoise(0.05, 0.15);
        },
        dodge() {
            playNote(250, 0.1, 'sine', sfxGain, 0.12);
            playNote(400, 0.08, 'sine', sfxGain, 0.08);
        },
        playerHurt() {
            playNote(200, 0.2, 'square', sfxGain, 0.25);
            playNote(100, 0.3, 'square', sfxGain, 0.2);
        },
        enemyHurt() {
            playNote(250, 0.1, 'square', sfxGain, 0.15);
            playNote(180, 0.12, 'square', sfxGain, 0.1);
        },
        enemyDie() {
            playNote(300, 0.1, 'square', sfxGain, 0.2);
            playNote(200, 0.15, 'square', sfxGain, 0.15);
            playNote(100, 0.3, 'square', sfxGain, 0.12);
        },
        pickup() {
            playNote(523, 0.08, 'square', sfxGain, 0.15);
            playNote(659, 0.08, 'square', sfxGain, 0.15);
            playNote(784, 0.12, 'square', sfxGain, 0.15);
        },
        chestOpen() {
            playNote(440, 0.1, 'square', sfxGain, 0.15);
            playNote(554, 0.1, 'square', sfxGain, 0.15);
            playNote(659, 0.15, 'square', sfxGain, 0.18);
        },
        doorOpen() {
            playNoise(0.3, 0.15);
            playNote(100, 0.3, 'sawtooth', sfxGain, 0.1);
        },
        levelUp() {
            const notes = [523, 659, 784, 1047];
            notes.forEach((n, i) => {
                setTimeout(() => playNote(n, 0.3, 'square', sfxGain, 0.2), i * 100);
            });
        },
        bossDeath() {
            const notes = [200, 250, 300, 400, 500, 600, 800];
            notes.forEach((n, i) => {
                setTimeout(() => {
                    playNote(n, 0.4, 'square', sfxGain, 0.25);
                    playNoise(0.2, 0.15);
                }, i * 120);
            });
        },
        usePotion() {
            playNote(400, 0.15, 'sine', sfxGain, 0.15);
            playNote(500, 0.15, 'sine', sfxGain, 0.12);
            playNote(600, 0.2, 'sine', sfxGain, 0.1);
        },
        criticalHit() {
            playNoise(0.15, 0.3);
            playNote(150, 0.2, 'sawtooth', sfxGain, 0.25);
            playNote(300, 0.15, 'square', sfxGain, 0.2);
        },
        miss() {
            playNote(200, 0.15, 'sine', sfxGain, 0.08);
        },
        teleport() {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => playNote(200 + i * 150, 0.1, 'sine', sfxGain, 0.12), i * 40);
            }
        },
    };

    // Dark fantasy music patterns
    const MUSIC_PATTERNS = {
        goblin_cave: {
            notes: [130, 155, 130, 110, 130, 165, 155, 130],
            tempo: 350, type: 'square', volume: 0.06,
            bass: [65, 65, 55, 55, 65, 65, 82, 65],
        },
        enchanted_forest: {
            notes: [330, 392, 440, 392, 330, 294, 330, 262],
            tempo: 500, type: 'sine', volume: 0.05,
            bass: [130, 130, 165, 165, 130, 130, 110, 110],
        },
        undead_crypt: {
            notes: [110, 117, 110, 98, 104, 110, 98, 87],
            tempo: 600, type: 'triangle', volume: 0.05,
            bass: [55, 55, 49, 49, 52, 52, 49, 44],
        },
        dragon_volcano: {
            notes: [165, 196, 220, 262, 220, 196, 165, 147],
            tempo: 300, type: 'sawtooth', volume: 0.04,
            bass: [82, 82, 110, 110, 82, 82, 73, 73],
        },
        dark_castle: {
            notes: [147, 165, 175, 196, 175, 165, 147, 131],
            tempo: 450, type: 'triangle', volume: 0.05,
            bass: [73, 73, 87, 87, 73, 73, 65, 65],
        },
        boss: {
            notes: [110, 131, 147, 165, 147, 131, 110, 98],
            tempo: 250, type: 'square', volume: 0.06,
            bass: [55, 65, 73, 82, 73, 65, 55, 49],
        },
    };

    function startMusic(theme) {
        if (!ctx) init();
        stopMusic();
        const pattern = MUSIC_PATTERNS[theme];
        if (!pattern) return;
        let noteIndex = 0;
        currentMusic = theme;
        const playNextNote = () => {
            if (!enabled || currentMusic !== theme) return;
            const note = pattern.notes[noteIndex % pattern.notes.length];
            const bass = pattern.bass[noteIndex % pattern.bass.length];
            playNote(note, pattern.tempo / 1000 * 0.8, pattern.type, musicGain, pattern.volume);
            playNote(bass, pattern.tempo / 1000 * 0.9, 'triangle', musicGain, pattern.volume * 0.7);
            noteIndex++;
        };
        playNextNote();
        musicInterval = setInterval(playNextNote, pattern.tempo);
    }

    function stopMusic() {
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
        currentMusic = null;
    }

    function toggle() {
        enabled = !enabled;
        if (!enabled) stopMusic();
        return enabled;
    }

    return { init, SFX, startMusic, stopMusic, toggle, get enabled() { return enabled; } };
})();
