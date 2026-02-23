// ============================================================
// REALM OF SHADOWS - Audio System
// Procedural Audio Engine, SFX Generator, and Music Generator
// All sounds generated using Web Audio API - NO external files
// ============================================================

// ============================================================
// SECTION 1: AUDIO ENGINE CORE
// ============================================================

const Audio = {
    /** @type {AudioContext|null} */
    ctx: null,

    /** @type {GainNode|null} Master gain node */
    masterGain: null,

    /** @type {GainNode|null} SFX channel gain */
    sfxGain: null,

    /** @type {GainNode|null} Music channel gain */
    musicGain: null,

    /** Whether SFX are enabled */
    sfxEnabled: true,

    /** Whether music is enabled */
    musicEnabled: true,

    /** Reference to whatever music is currently playing */
    currentMusic: null,

    /** Whether the audio system has been initialized */
    _initialized: false,

    /**
     * Initialize the audio engine.
     * Creates AudioContext and gain node routing:
     *   sfxGain   ─┐
     *               ├─ masterGain ─── destination
     *   musicGain ─┘
     */
    init() {
        if (this._initialized) return;

        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();

            // Create master gain
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.ctx.destination);

            // Create SFX gain
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.6;
            this.sfxGain.connect(this.masterGain);

            // Create music gain
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.35;
            this.musicGain.connect(this.masterGain);

            this._initialized = true;
            console.log('[Audio] Audio engine initialized.');
        } catch (e) {
            console.warn('[Audio] Web Audio API not supported:', e);
        }
    },

    /**
     * Resume the AudioContext after a user gesture.
     * Browsers require user interaction before audio can play.
     */
    resume() {
        if (!this._initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(function() {
                console.log('[Audio] AudioContext resumed.');
            });
        }
    },

    /**
     * Toggle SFX on/off.
     * @returns {boolean} New SFX enabled state.
     */
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxEnabled ? 0.6 : 0;
        }
        return this.sfxEnabled;
    },

    /**
     * Toggle music on/off.
     * @returns {boolean} New music enabled state.
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicEnabled ? 0.35 : 0;
        }
        if (!this.musicEnabled) {
            Music.stopMusic();
        }
        return this.musicEnabled;
    },

    /**
     * Set volume for a specific channel.
     * @param {string} type - 'sfx', 'music', or 'master'
     * @param {number} value - Volume between 0 and 1
     */
    setVolume(type, value) {
        var v = Math.max(0, Math.min(1, value));
        switch (type) {
            case 'sfx':
                if (this.sfxGain) this.sfxGain.gain.value = v;
                break;
            case 'music':
                if (this.musicGain) this.musicGain.gain.value = v;
                break;
            case 'master':
                if (this.masterGain) this.masterGain.gain.value = v;
                break;
        }
    },

    /**
     * Get the current AudioContext time for precise scheduling.
     * @returns {number} Current time in seconds.
     */
    now() {
        return this.ctx ? this.ctx.currentTime : 0;
    }
};


// ============================================================
// SECTION 2: SFX GENERATOR
// ============================================================

const SFX = {

    // --------------------------------------------------------
    // UTILITY FUNCTIONS
    // --------------------------------------------------------

    /**
     * Create a white noise AudioBuffer.
     * @param {number} duration - Duration in seconds.
     * @returns {AudioBuffer}
     */
    createNoise(duration) {
        if (!Audio.ctx) return null;
        var sampleRate = Audio.ctx.sampleRate;
        var length = Math.floor(sampleRate * duration);
        var buffer = Audio.ctx.createBuffer(1, length, sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    },

    /**
     * Play a basic tone with envelope.
     * @param {number} freq - Frequency in Hz.
     * @param {string} type - Oscillator type: 'sine', 'square', 'sawtooth', 'triangle'.
     * @param {number} duration - Total duration in seconds.
     * @param {number} volume - Volume 0-1.
     * @param {number} attack - Attack time in seconds.
     * @param {number} decay - Decay time in seconds.
     * @param {number} [startTime] - Optional start time (AudioContext time).
     * @returns {OscillatorNode|null}
     */
    playTone(freq, type, duration, volume, attack, decay, startTime) {
        if (!Audio.ctx || !Audio.sfxGain) return null;

        var t = startTime !== undefined ? startTime : Audio.now();
        var osc = Audio.ctx.createOscillator();
        var gain = Audio.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        // Envelope: attack → sustain → decay
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + attack);
        gain.gain.setValueAtTime(volume, t + duration - decay);
        gain.gain.linearRampToValueAtTime(0, t + duration);

        osc.connect(gain);
        gain.connect(Audio.sfxGain);

        osc.start(t);
        osc.stop(t + duration + 0.01);

        // Clean up on end
        osc.onended = function() {
            osc.disconnect();
            gain.disconnect();
        };

        return osc;
    },

    /**
     * Play a noise burst with optional filter.
     * @param {number} duration - Duration in seconds.
     * @param {number} volume - Volume 0-1.
     * @param {string} [filterType] - Filter type: 'lowpass', 'highpass', 'bandpass'.
     * @param {number} [filterFreq] - Filter frequency.
     * @param {number} [filterQ] - Filter Q value.
     * @param {number} [startTime] - Optional start time.
     * @returns {AudioBufferSourceNode|null}
     */
    playNoise(duration, volume, filterType, filterFreq, filterQ, startTime) {
        if (!Audio.ctx || !Audio.sfxGain) return null;

        var t = startTime !== undefined ? startTime : Audio.now();
        var buffer = this.createNoise(duration);
        if (!buffer) return null;

        var source = Audio.ctx.createBufferSource();
        source.buffer = buffer;

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(volume, t);
        gain.gain.linearRampToValueAtTime(0, t + duration);

        source.connect(gain);

        if (filterType && filterFreq) {
            var filter = Audio.ctx.createBiquadFilter();
            filter.type = filterType;
            filter.frequency.value = filterFreq;
            filter.Q.value = filterQ || 1;
            gain.connect(filter);
            filter.connect(Audio.sfxGain);

            source.onended = function() {
                source.disconnect();
                gain.disconnect();
                filter.disconnect();
            };
        } else {
            gain.connect(Audio.sfxGain);

            source.onended = function() {
                source.disconnect();
                gain.disconnect();
            };
        }

        source.start(t);
        source.stop(t + duration + 0.01);

        return source;
    },

    // --------------------------------------------------------
    // ATTACK SOUNDS
    // --------------------------------------------------------

    /**
     * Arrow shoot: quick whoosh with filtered noise burst,
     * bandpass filter sweeping from high to low.
     */
    arrowShoot() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        var duration = 0.1;

        var buffer = this.createNoise(duration);
        if (!buffer) return;
        var source = Audio.ctx.createBufferSource();
        source.buffer = buffer;

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0, t + duration);

        var filter = Audio.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 2;
        filter.frequency.setValueAtTime(4000, t);
        filter.frequency.exponentialRampToValueAtTime(800, t + duration);

        source.connect(gain);
        gain.connect(filter);
        filter.connect(Audio.sfxGain);

        source.start(t);
        source.stop(t + duration + 0.01);

        source.onended = function() {
            source.disconnect(); gain.disconnect(); filter.disconnect();
        };
    },

    /**
     * Magic bolt: electric zap with sine wave sweep from 800Hz to 200Hz,
     * subtle vibrato via LFO modulation.
     */
    magicBolt() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        var duration = 0.15;

        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + duration);

        // LFO for vibrato
        var lfo = Audio.ctx.createOscillator();
        var lfoGain = Audio.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 30;
        lfoGain.gain.value = 40;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.linearRampToValueAtTime(0, t + duration);

        osc.connect(gain);
        gain.connect(Audio.sfxGain);

        osc.start(t);
        lfo.start(t);
        osc.stop(t + duration + 0.01);
        lfo.stop(t + duration + 0.01);

        osc.onended = function() {
            osc.disconnect(); gain.disconnect(); lfo.disconnect(); lfoGain.disconnect();
        };
    },

    /**
     * Sword swing: sharp noise burst with high-pass filter, 0.08s.
     */
    swordSwing() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        var duration = 0.08;

        var buffer = this.createNoise(duration);
        if (!buffer) return;
        var source = Audio.ctx.createBufferSource();
        source.buffer = buffer;

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        var filter = Audio.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, t);
        filter.frequency.linearRampToValueAtTime(4000, t + duration);
        filter.Q.value = 1;

        source.connect(gain);
        gain.connect(filter);
        filter.connect(Audio.sfxGain);

        source.start(t);
        source.stop(t + duration + 0.01);

        source.onended = function() {
            source.disconnect(); gain.disconnect(); filter.disconnect();
        };
    },

    // --------------------------------------------------------
    // IMPACT SOUNDS
    // --------------------------------------------------------

    /**
     * Hit flesh: low thud with short noise burst + low sine at 80Hz.
     */
    hitFlesh() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // Low sine thud
        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

        var oscGain = Audio.ctx.createGain();
        oscGain.gain.setValueAtTime(0.4, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(oscGain);
        oscGain.connect(Audio.sfxGain);

        // Noise burst
        this.playNoise(0.06, 0.2, 'lowpass', 600, 1, t);

        osc.start(t);
        osc.stop(t + 0.11);

        osc.onended = function() {
            osc.disconnect(); oscGain.disconnect();
        };
    },

    /**
     * Hit armor: metallic clank with noise + square wave at 400Hz.
     */
    hitArmor() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // Square wave metallic tone
        var osc = Audio.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.06);

        var oscGain = Audio.ctx.createGain();
        oscGain.gain.setValueAtTime(0.2, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(oscGain);
        oscGain.connect(Audio.sfxGain);

        // Short noise burst
        this.playNoise(0.04, 0.25, 'highpass', 3000, 2, t);

        osc.start(t);
        osc.stop(t + 0.07);

        osc.onended = function() {
            osc.disconnect(); oscGain.disconnect();
        };
    },

    /**
     * Hit magic: pop with sine sweep 600Hz to 200Hz + sparkle high noise burst.
     */
    hitMagic() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // Sine pop sweep
        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);

        var oscGain = Audio.ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(oscGain);
        oscGain.connect(Audio.sfxGain);

        // Sparkle: high-frequency noise burst
        this.playNoise(0.08, 0.15, 'highpass', 6000, 3, t);

        osc.start(t);
        osc.stop(t + 0.11);

        osc.onended = function() {
            osc.disconnect(); oscGain.disconnect();
        };
    },

    /**
     * Critical hit: higher pitched impact + brief ascending tone.
     */
    criticalHit() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // Impact
        var osc = Audio.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);

        var oscGain = Audio.ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(oscGain);
        oscGain.connect(Audio.sfxGain);

        // Ascending tone indicator
        var osc2 = Audio.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(400, t + 0.05);
        osc2.frequency.linearRampToValueAtTime(1200, t + 0.15);

        var gain2 = Audio.ctx.createGain();
        gain2.gain.setValueAtTime(0, t);
        gain2.gain.linearRampToValueAtTime(0.2, t + 0.07);
        gain2.gain.linearRampToValueAtTime(0, t + 0.15);

        osc2.connect(gain2);
        gain2.connect(Audio.sfxGain);

        // Noise burst
        this.playNoise(0.05, 0.25, 'bandpass', 2000, 2, t);

        osc.start(t);
        osc.stop(t + 0.09);
        osc2.start(t + 0.03);
        osc2.stop(t + 0.16);

        osc.onended = function() { osc.disconnect(); oscGain.disconnect(); };
        osc2.onended = function() { osc2.disconnect(); gain2.disconnect(); };
    },

    // --------------------------------------------------------
    // EXPLOSION SOUNDS
    // --------------------------------------------------------

    /**
     * Small explosion: low noise burst + sine sweep down from 200Hz, 0.3s.
     */
    smallExplosion() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // Low sine sweep
        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);

        var oscGain = Audio.ctx.createGain();
        oscGain.gain.setValueAtTime(0.4, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(oscGain);
        oscGain.connect(Audio.sfxGain);

        // Noise burst
        this.playNoise(0.2, 0.35, 'lowpass', 800, 1, t);

        osc.start(t);
        osc.stop(t + 0.31);

        osc.onended = function() { osc.disconnect(); oscGain.disconnect(); };
    },

    /**
     * Large explosion: multiple layered noise bursts + low rumble at 40Hz, 0.5s.
     * Includes slight delay/echo effect.
     */
    largeExplosion() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // Low rumble
        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(40, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);

        var oscGain = Audio.ctx.createGain();
        oscGain.gain.setValueAtTime(0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.connect(oscGain);
        oscGain.connect(Audio.sfxGain);

        // Mid sine sweep
        var osc2 = Audio.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(150, t);
        osc2.frequency.exponentialRampToValueAtTime(25, t + 0.4);

        var gain2 = Audio.ctx.createGain();
        gain2.gain.setValueAtTime(0.35, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc2.connect(gain2);
        gain2.connect(Audio.sfxGain);

        // Layered noise bursts
        this.playNoise(0.3, 0.4, 'lowpass', 1000, 1, t);
        this.playNoise(0.2, 0.25, 'lowpass', 600, 1, t + 0.05);
        this.playNoise(0.15, 0.2, 'bandpass', 400, 2, t + 0.1);

        // Echo/delay simulation
        this.playNoise(0.15, 0.12, 'lowpass', 500, 1, t + 0.2);

        osc.start(t);
        osc.stop(t + 0.51);
        osc2.start(t);
        osc2.stop(t + 0.41);

        osc.onended = function() { osc.disconnect(); oscGain.disconnect(); };
        osc2.onended = function() { osc2.disconnect(); gain2.disconnect(); };
    },

    /**
     * Boss explosion: cascading explosions with staggered timing over 2s.
     * Each slightly different pitch, building then fading.
     */
    bossExplosion() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var self = this;
        var t = Audio.now();

        // Cascading explosions at different intervals
        var timings = [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1.0, 1.2, 1.5, 1.8];
        var volumes = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.35, 0.2];
        var freqs =   [120, 100, 150, 80, 180, 60, 200, 40, 100, 30];

        for (var i = 0; i < timings.length; i++) {
            (function(idx) {
                var offset = t + timings[idx];
                var vol = volumes[idx];
                var freq = freqs[idx];

                // Each sub-explosion: sine + noise
                var osc = Audio.ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, offset);
                osc.frequency.exponentialRampToValueAtTime(20, offset + 0.2);

                var gain = Audio.ctx.createGain();
                gain.gain.setValueAtTime(0, offset);
                gain.gain.linearRampToValueAtTime(vol, offset + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, offset + 0.2);

                osc.connect(gain);
                gain.connect(Audio.sfxGain);

                osc.start(offset);
                osc.stop(offset + 0.21);

                osc.onended = function() { osc.disconnect(); gain.disconnect(); };

                self.playNoise(0.15, vol * 0.7, 'lowpass', 400 + freq * 2, 1, offset);
            })(i);
        }

        // Final deep rumble
        var rumble = Audio.ctx.createOscillator();
        rumble.type = 'sine';
        rumble.frequency.setValueAtTime(30, t + 1.5);
        rumble.frequency.exponentialRampToValueAtTime(15, t + 2.0);

        var rumbleGain = Audio.ctx.createGain();
        rumbleGain.gain.setValueAtTime(0, t + 1.5);
        rumbleGain.gain.linearRampToValueAtTime(0.4, t + 1.6);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

        rumble.connect(rumbleGain);
        rumbleGain.connect(Audio.sfxGain);

        rumble.start(t + 1.5);
        rumble.stop(t + 2.01);

        rumble.onended = function() { rumble.disconnect(); rumbleGain.disconnect(); };
    },

    // --------------------------------------------------------
    // PICKUP SOUNDS
    // --------------------------------------------------------

    /**
     * Health pickup: ascending arpeggio C5-E5-G5, sine tones, pleasant.
     */
    healthPickup() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        // C5=523.25, E5=659.25, G5=783.99
        this.playTone(523.25, 'sine', 0.12, 0.25, 0.01, 0.04, t);
        this.playTone(659.25, 'sine', 0.12, 0.25, 0.01, 0.04, t + 0.08);
        this.playTone(783.99, 'sine', 0.15, 0.3, 0.01, 0.06, t + 0.16);
    },

    /**
     * Super weapon pickup: power chord C4+E4+G4 sawtooth, 0.3s, epic sound.
     */
    superWeaponPickup() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        // C4=261.63, E4=329.63, G4=392.00
        this.playTone(261.63, 'sawtooth', 0.35, 0.15, 0.02, 0.1, t);
        this.playTone(329.63, 'sawtooth', 0.35, 0.15, 0.02, 0.1, t);
        this.playTone(392.00, 'sawtooth', 0.35, 0.15, 0.02, 0.1, t);

        // Octave above for brightness
        this.playTone(523.25, 'triangle', 0.3, 0.1, 0.05, 0.1, t + 0.05);
    },

    /**
     * Gem pickup: quick high chime, triangle wave 1200Hz, very short.
     */
    gemPickup() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        this.playTone(1200, 'triangle', 0.06, 0.2, 0.005, 0.03, t);
        this.playTone(1600, 'triangle', 0.05, 0.1, 0.005, 0.02, t + 0.02);
    },

    /**
     * Shield pickup: metallic shimmer with high sine sweep + noise.
     */
    shieldPickup() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // High sine sweep
        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(2000, t + 0.1);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.2);

        var oscGain = Audio.ctx.createGain();
        oscGain.gain.setValueAtTime(0, t);
        oscGain.gain.linearRampToValueAtTime(0.25, t + 0.03);
        oscGain.gain.linearRampToValueAtTime(0.15, t + 0.12);
        oscGain.gain.linearRampToValueAtTime(0, t + 0.2);

        osc.connect(oscGain);
        oscGain.connect(Audio.sfxGain);

        // Shimmer noise
        this.playNoise(0.15, 0.1, 'highpass', 5000, 3, t);

        osc.start(t);
        osc.stop(t + 0.21);

        osc.onended = function() { osc.disconnect(); oscGain.disconnect(); };
    },

    // --------------------------------------------------------
    // PLAYER SOUNDS
    // --------------------------------------------------------

    /**
     * Player hurt: quick low thud + slight noise.
     */
    playerHurt() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(Audio.sfxGain);

        this.playNoise(0.06, 0.15, 'lowpass', 400, 1, t);

        osc.start(t);
        osc.stop(t + 0.13);

        osc.onended = function() { osc.disconnect(); gain.disconnect(); };
    },

    /**
     * Player dodge: quick whoosh with bandpass noise sweep, 0.15s.
     */
    playerDodge() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        var duration = 0.15;

        var buffer = this.createNoise(duration);
        if (!buffer) return;
        var source = Audio.ctx.createBufferSource();
        source.buffer = buffer;

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
        gain.gain.linearRampToValueAtTime(0, t + duration);

        var filter = Audio.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 3;
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.exponentialRampToValueAtTime(5000, t + 0.05);
        filter.frequency.exponentialRampToValueAtTime(800, t + duration);

        source.connect(gain);
        gain.connect(filter);
        filter.connect(Audio.sfxGain);

        source.start(t);
        source.stop(t + duration + 0.01);

        source.onended = function() {
            source.disconnect(); gain.disconnect(); filter.disconnect();
        };
    },

    /**
     * Player death: descending minor chord Dm (D4+F4+A4) fading over 1s, sawtooth.
     */
    playerDeath() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        // D4=293.66, F4=349.23, A4=440.00
        // Start with chord then descend
        var notes = [
            { freq: 293.66, endFreq: 146.83 },
            { freq: 349.23, endFreq: 174.61 },
            { freq: 440.00, endFreq: 220.00 }
        ];

        for (var i = 0; i < notes.length; i++) {
            var osc = Audio.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(notes[i].freq, t);
            osc.frequency.exponentialRampToValueAtTime(notes[i].endFreq, t + 1.0);

            var gain = Audio.ctx.createGain();
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.setValueAtTime(0.12, t + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

            osc.connect(gain);
            gain.connect(Audio.sfxGain);

            osc.start(t);
            osc.stop(t + 1.01);

            (function(o, g) {
                o.onended = function() { o.disconnect(); g.disconnect(); };
            })(osc, gain);
        }

        // Add a somber noise tail
        this.playNoise(0.5, 0.08, 'lowpass', 300, 1, t + 0.3);
    },

    // --------------------------------------------------------
    // ENEMY SOUNDS
    // --------------------------------------------------------

    /**
     * Enemy death: short noise burst + low tone, 0.15s.
     */
    enemyDeath() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        var osc = Audio.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(Audio.sfxGain);

        this.playNoise(0.08, 0.2, 'lowpass', 800, 1, t);

        osc.start(t);
        osc.stop(t + 0.16);

        osc.onended = function() { osc.disconnect(); gain.disconnect(); };
    },

    /**
     * Skeleton death: bone rattle with multiple short noise clicks in sequence.
     */
    skeletonDeath() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // Multiple short clicks simulating bone rattle
        for (var i = 0; i < 6; i++) {
            var offset = t + i * 0.035;
            this.playNoise(0.02, 0.2 + Math.random() * 0.1, 'highpass', 2000 + Math.random() * 2000, 5, offset);

            // Small tonal click
            this.playTone(800 + Math.random() * 400, 'square', 0.015, 0.1, 0.002, 0.008, offset);
        }

        // Final low thud
        this.playTone(100, 'sine', 0.1, 0.2, 0.005, 0.05, t + 0.2);
    },

    /**
     * Goblin death: quick squeak with sine sweep 800Hz to 400Hz.
     */
    goblinDeath() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(Audio.sfxGain);

        osc.start(t);
        osc.stop(t + 0.11);

        osc.onended = function() { osc.disconnect(); gain.disconnect(); };
    },

    /**
     * Dragon roar: low sawtooth growl 60-80Hz with noise overlay, 0.5s.
     */
    dragonRoar() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // Low sawtooth growl
        var osc = Audio.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.1);
        osc.frequency.linearRampToValueAtTime(55, t + 0.3);
        osc.frequency.linearRampToValueAtTime(70, t + 0.4);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);

        var oscGain = Audio.ctx.createGain();
        oscGain.gain.setValueAtTime(0, t);
        oscGain.gain.linearRampToValueAtTime(0.35, t + 0.05);
        oscGain.gain.setValueAtTime(0.35, t + 0.2);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        // Distortion via waveshaper for menacing quality
        var waveshaper = Audio.ctx.createWaveShaper();
        var curve = new Float32Array(256);
        for (var i = 0; i < 256; i++) {
            var x = (i / 128) - 1;
            curve[i] = (Math.PI + 3) * x / (Math.PI + 3 * Math.abs(x));
        }
        waveshaper.curve = curve;
        waveshaper.oversample = 'none';

        osc.connect(waveshaper);
        waveshaper.connect(oscGain);
        oscGain.connect(Audio.sfxGain);

        // Noise overlay for breath texture
        this.playNoise(0.4, 0.2, 'lowpass', 500, 2, t + 0.03);

        osc.start(t);
        osc.stop(t + 0.51);

        osc.onended = function() {
            osc.disconnect(); waveshaper.disconnect(); oscGain.disconnect();
        };
    },

    // --------------------------------------------------------
    // BOSS SOUNDS
    // --------------------------------------------------------

    /**
     * Boss intro: dramatic horn with sawtooth chord C3+G3 building over 1s.
     * Includes reverb-like delay effect.
     */
    bossIntro() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        var self = this;
        // C3=130.81, G3=196.00

        var chordNotes = [130.81, 196.00];
        var oscNodes = [];
        var gainNodes = [];

        for (var i = 0; i < chordNotes.length; i++) {
            var osc = Audio.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = chordNotes[i];

            var gain = Audio.ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.6);
            gain.gain.setValueAtTime(0.2, t + 0.8);
            gain.gain.linearRampToValueAtTime(0, t + 1.2);

            osc.connect(gain);
            gain.connect(Audio.sfxGain);

            osc.start(t);
            osc.stop(t + 1.21);

            oscNodes.push(osc);
            gainNodes.push(gain);

            (function(o, g) {
                o.onended = function() { o.disconnect(); g.disconnect(); };
            })(osc, gain);
        }

        // Delay/echo simulation for reverb effect
        for (var d = 1; d <= 3; d++) {
            var delayTime = d * 0.12;
            var delayVol = 0.12 / d;
            for (var j = 0; j < chordNotes.length; j++) {
                self.playTone(chordNotes[j], 'sawtooth', 0.8, delayVol, 0.3, 0.3, t + delayTime);
            }
        }

        // Sub bass
        this.playTone(65.41, 'sine', 1.0, 0.2, 0.3, 0.4, t);
    },

    /**
     * Boss roar: deep growl + noise, 0.8s, intimidating.
     */
    bossRoar() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // Deep growl oscillator
        var osc = Audio.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, t);
        osc.frequency.linearRampToValueAtTime(70, t + 0.2);
        osc.frequency.linearRampToValueAtTime(40, t + 0.5);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.8);

        var oscGain = Audio.ctx.createGain();
        oscGain.gain.setValueAtTime(0, t);
        oscGain.gain.linearRampToValueAtTime(0.4, t + 0.08);
        oscGain.gain.setValueAtTime(0.4, t + 0.3);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

        // Waveshaper for aggressive distortion
        var waveshaper = Audio.ctx.createWaveShaper();
        var curve = new Float32Array(256);
        for (var i = 0; i < 256; i++) {
            var x = (i / 128) - 1;
            curve[i] = Math.tanh(x * 3);
        }
        waveshaper.curve = curve;

        osc.connect(waveshaper);
        waveshaper.connect(oscGain);
        oscGain.connect(Audio.sfxGain);

        // Heavy noise
        this.playNoise(0.6, 0.3, 'lowpass', 400, 2, t);

        // Second harmonic
        var osc2 = Audio.ctx.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(100, t);
        osc2.frequency.exponentialRampToValueAtTime(50, t + 0.8);

        var gain2 = Audio.ctx.createGain();
        gain2.gain.setValueAtTime(0, t);
        gain2.gain.linearRampToValueAtTime(0.15, t + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

        osc2.connect(gain2);
        gain2.connect(Audio.sfxGain);

        osc.start(t);
        osc.stop(t + 0.81);
        osc2.start(t);
        osc2.stop(t + 0.81);

        osc.onended = function() { osc.disconnect(); waveshaper.disconnect(); oscGain.disconnect(); };
        osc2.onended = function() { osc2.disconnect(); gain2.disconnect(); };
    },

    /**
     * Boss attack: heavy low frequency burst + noise, 0.2s.
     */
    bossAttack() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(Audio.sfxGain);

        // Noise component
        this.playNoise(0.1, 0.3, 'lowpass', 600, 1, t);
        this.playNoise(0.05, 0.15, 'bandpass', 200, 3, t);

        osc.start(t);
        osc.stop(t + 0.21);

        osc.onended = function() { osc.disconnect(); gain.disconnect(); };
    },

    // --------------------------------------------------------
    // UI SOUNDS
    // --------------------------------------------------------

    /**
     * Menu select: quick blip, sine 500Hz, 0.05s.
     */
    menuSelect() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        this.playTone(500, 'sine', 0.05, 0.2, 0.005, 0.02);
    },

    /**
     * Menu confirm: two-tone blip, sine 400Hz then 600Hz.
     */
    menuConfirm() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        this.playTone(400, 'sine', 0.08, 0.2, 0.005, 0.03, t);
        this.playTone(600, 'sine', 0.08, 0.25, 0.005, 0.03, t + 0.08);
    },

    /**
     * Level complete: triumphant ascending C4 -> E4 -> G4 -> C5, triangle wave.
     */
    levelComplete() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        // C4=261.63, E4=329.63, G4=392.00, C5=523.25
        this.playTone(261.63, 'triangle', 0.2, 0.2, 0.01, 0.05, t);
        this.playTone(329.63, 'triangle', 0.2, 0.22, 0.01, 0.05, t + 0.18);
        this.playTone(392.00, 'triangle', 0.2, 0.25, 0.01, 0.05, t + 0.36);
        this.playTone(523.25, 'triangle', 0.35, 0.3, 0.01, 0.12, t + 0.54);

        // Octave harmony on final note
        this.playTone(1046.5, 'sine', 0.3, 0.1, 0.05, 0.12, t + 0.56);
    },

    /**
     * Game over: somber descending G4 -> E4 -> C4 -> G3, sine, fading.
     */
    gameOver() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();
        // G4=392.00, E4=329.63, C4=261.63, G3=196.00
        this.playTone(392.00, 'sine', 0.3, 0.25, 0.01, 0.1, t);
        this.playTone(329.63, 'sine', 0.3, 0.22, 0.01, 0.1, t + 0.28);
        this.playTone(261.63, 'sine', 0.3, 0.18, 0.01, 0.1, t + 0.56);
        this.playTone(196.00, 'sine', 0.5, 0.15, 0.01, 0.2, t + 0.84);
    },

    /**
     * Victory fanfare: epic chord progression C-F-G-C with sawtooth + triangle harmonics.
     * Builds to a triumphant climax.
     */
    victoryFanfare() {
        if (!Audio.ctx || !Audio.sfxGain) return;
        var t = Audio.now();

        // C major chord: C4+E4+G4
        // F major chord: F4+A4+C5
        // G major chord: G4+B4+D5
        // C major high: C5+E5+G5

        var chords = [
            { notes: [261.63, 329.63, 392.00], time: 0, dur: 0.5 },       // C
            { notes: [349.23, 440.00, 523.25], time: 0.5, dur: 0.5 },     // F
            { notes: [392.00, 493.88, 587.33], time: 1.0, dur: 0.5 },     // G
            { notes: [523.25, 659.25, 783.99], time: 1.5, dur: 0.8 }      // C (high, longer)
        ];

        for (var c = 0; c < chords.length; c++) {
            var chord = chords[c];
            var vol = 0.1 + c * 0.03; // Build volume

            for (var n = 0; n < chord.notes.length; n++) {
                // Sawtooth layer
                this.playTone(chord.notes[n], 'sawtooth', chord.dur, vol, 0.02, chord.dur * 0.3, t + chord.time);
                // Triangle layer for warmth
                this.playTone(chord.notes[n], 'triangle', chord.dur, vol * 0.7, 0.02, chord.dur * 0.3, t + chord.time);
            }

            // Bass note (root, octave below)
            this.playTone(chord.notes[0] / 2, 'sine', chord.dur, vol * 0.8, 0.02, chord.dur * 0.3, t + chord.time);
        }

        // Final shimmer
        this.playNoise(0.3, 0.05, 'highpass', 8000, 5, t + 2.0);
        this.playTone(1046.5, 'sine', 0.5, 0.12, 0.05, 0.2, t + 2.0);
    }
};


// ============================================================
// SECTION 3: BACKGROUND MUSIC GENERATOR
// ============================================================

/**
 * Note frequency lookup table (standard tuning A4=440Hz).
 * Maps note names to frequencies for easy music authoring.
 */
var NOTE_FREQ = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'Fs3': 185.00, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'Fs4': 369.99, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'Fs5': 739.99, 'G5': 783.99, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'Fs6': 1479.98, 'G6': 1567.98, 'A6': 1760.00
};

var REST = 0;

const Music = {
    /** Whether any music is currently playing */
    isPlaying: false,

    /** Index of the current level music (-1 = none) */
    currentLevel: -1,

    /** Active oscillator and gain references for cleanup */
    _activeNodes: [],

    /** Interval ID for the music sequencer loop */
    _intervalId: null,

    /** Timeout IDs for scheduled note playbacks */
    _timeoutIds: [],

    /** Current beat position in the sequence */
    _beat: 0,

    /** BPM for the current music */
    _bpm: 120,

    /** Duration of one beat in seconds */
    _beatDuration: 0.5,

    /** Length of the current pattern in beats */
    _patternLength: 16,

    /** Current melody pattern (array of frequency values or REST) */
    _melodyPattern: [],

    /** Current bass pattern (array of frequency values or REST) */
    _bassPattern: [],

    /** Current rhythm on/off pattern */
    _rhythmPattern: [],

    /** Oscillator type for melody */
    _melodyType: 'triangle',

    /** Oscillator type for bass */
    _bassType: 'sine',

    /** Melody volume */
    _melodyVol: 0.12,

    /** Bass volume */
    _bassVol: 0.15,

    /** Rhythm (percussion) volume */
    _rhythmVol: 0.1,

    /** Whether to play ambient drone */
    _droneEnabled: false,

    /** Drone frequency */
    _droneFreq: 0,

    /** Active drone oscillator */
    _droneOsc: null,

    /** Active drone gain */
    _droneGain: null,

    /**
     * Start level-appropriate background music.
     * @param {number} levelIndex - Index of the current level (0-based).
     */
    startLevelMusic(levelIndex) {
        this.stopMusic();

        if (!Audio.ctx || !Audio.musicEnabled) return;

        this.currentLevel = levelIndex;
        this.isPlaying = true;

        switch (levelIndex) {
            case 0: this.playCryptMusic(); break;
            case 1: this.playStrongholdMusic(); break;
            case 2: this.playForestMusic(); break;
            case 3: this.playIceMusic(); break;
            case 4: this.playVolcanoMusic(); break;
            default: this.playCryptMusic(); break;
        }
    },

    /**
     * Stop all currently playing music and clean up nodes.
     */
    stopMusic() {
        this.isPlaying = false;
        this.currentLevel = -1;

        // Clear the sequencer interval
        if (this._intervalId !== null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }

        // Clear all scheduled timeouts
        for (var i = 0; i < this._timeoutIds.length; i++) {
            clearTimeout(this._timeoutIds[i]);
        }
        this._timeoutIds = [];

        // Stop and disconnect all active nodes
        for (var j = 0; j < this._activeNodes.length; j++) {
            try {
                var node = this._activeNodes[j];
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {
                // Node may have already stopped
            }
        }
        this._activeNodes = [];

        // Stop drone
        this._stopDrone();

        this._beat = 0;
    },

    /**
     * Start the internal sequencer that plays notes on beat.
     */
    _startSequencer() {
        var self = this;
        this._beat = 0;
        this._beatDuration = 60 / this._bpm;

        // Use setInterval for the beat clock
        this._intervalId = setInterval(function() {
            if (!self.isPlaying || !Audio.ctx || !Audio.musicEnabled) return;

            self._playBeat(self._beat);
            self._beat = (self._beat + 1) % self._patternLength;
        }, this._beatDuration * 1000);

        // Play the first beat immediately
        this._playBeat(0);
    },

    /**
     * Play all musical elements for a given beat position.
     * @param {number} beat - Current beat index.
     */
    _playBeat(beat) {
        if (!Audio.ctx || !Audio.musicGain) return;

        var t = Audio.now();
        var dur = this._beatDuration * 0.9; // Slightly shorter than beat for spacing

        // Play melody note
        if (this._melodyPattern.length > 0) {
            var melNote = this._melodyPattern[beat % this._melodyPattern.length];
            if (melNote !== REST && melNote > 0) {
                this._playMusicNote(melNote, this._melodyType, dur, this._melodyVol, t);
            }
        }

        // Play bass note
        if (this._bassPattern.length > 0) {
            var bassNote = this._bassPattern[beat % this._bassPattern.length];
            if (bassNote !== REST && bassNote > 0) {
                this._playMusicNote(bassNote, this._bassType, dur * 1.1, this._bassVol, t);
            }
        }

        // Play rhythm
        if (this._rhythmPattern.length > 0) {
            var rhythmHit = this._rhythmPattern[beat % this._rhythmPattern.length];
            if (rhythmHit > 0) {
                this._playPercussion(rhythmHit, t);
            }
        }
    },

    /**
     * Play a single musical note on the music channel.
     * @param {number} freq - Frequency in Hz.
     * @param {string} type - Oscillator type.
     * @param {number} duration - Duration in seconds.
     * @param {number} volume - Volume 0-1.
     * @param {number} startTime - AudioContext time.
     */
    _playMusicNote(freq, type, duration, volume, startTime) {
        if (!Audio.ctx || !Audio.musicGain) return;

        var t = startTime;
        var osc = Audio.ctx.createOscillator();
        var gain = Audio.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        // Soft envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.02);
        gain.gain.setValueAtTime(volume, t + duration * 0.6);
        gain.gain.linearRampToValueAtTime(0, t + duration);

        osc.connect(gain);
        gain.connect(Audio.musicGain);

        osc.start(t);
        osc.stop(t + duration + 0.01);

        this._activeNodes.push(osc);
        this._activeNodes.push(gain);

        var self = this;
        osc.onended = function() {
            osc.disconnect();
            gain.disconnect();
            // Remove from active nodes
            var idx1 = self._activeNodes.indexOf(osc);
            if (idx1 !== -1) self._activeNodes.splice(idx1, 1);
            var idx2 = self._activeNodes.indexOf(gain);
            if (idx2 !== -1) self._activeNodes.splice(idx2, 1);
        };
    },

    /**
     * Play a percussion hit on the music channel.
     * @param {number} type - 1 = kick, 2 = snare/hat, 3 = both
     * @param {number} startTime - AudioContext time.
     */
    _playPercussion(type, startTime) {
        if (!Audio.ctx || !Audio.musicGain) return;
        var t = startTime;

        if (type === 1 || type === 3) {
            // Kick: short sine sweep from 150Hz to 40Hz
            var kick = Audio.ctx.createOscillator();
            kick.type = 'sine';
            kick.frequency.setValueAtTime(150, t);
            kick.frequency.exponentialRampToValueAtTime(40, t + 0.1);

            var kickGain = Audio.ctx.createGain();
            kickGain.gain.setValueAtTime(this._rhythmVol, t);
            kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

            kick.connect(kickGain);
            kickGain.connect(Audio.musicGain);

            kick.start(t);
            kick.stop(t + 0.11);

            this._activeNodes.push(kick);
            this._activeNodes.push(kickGain);

            var self = this;
            kick.onended = function() {
                kick.disconnect(); kickGain.disconnect();
                var i1 = self._activeNodes.indexOf(kick);
                if (i1 !== -1) self._activeNodes.splice(i1, 1);
                var i2 = self._activeNodes.indexOf(kickGain);
                if (i2 !== -1) self._activeNodes.splice(i2, 1);
            };
        }

        if (type === 2 || type === 3) {
            // Hi-hat / snare: short filtered noise burst
            var noiseBuffer = SFX.createNoise(0.05);
            if (!noiseBuffer) return;
            var noise = Audio.ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            var noiseGain = Audio.ctx.createGain();
            noiseGain.gain.setValueAtTime(this._rhythmVol * 0.7, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

            var filter = Audio.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 6000;
            filter.Q.value = 1;

            noise.connect(noiseGain);
            noiseGain.connect(filter);
            filter.connect(Audio.musicGain);

            noise.start(t);
            noise.stop(t + 0.06);

            this._activeNodes.push(noise);
            this._activeNodes.push(noiseGain);
            this._activeNodes.push(filter);

            var self2 = this;
            noise.onended = function() {
                noise.disconnect(); noiseGain.disconnect(); filter.disconnect();
                var i1 = self2._activeNodes.indexOf(noise);
                if (i1 !== -1) self2._activeNodes.splice(i1, 1);
                var i2 = self2._activeNodes.indexOf(noiseGain);
                if (i2 !== -1) self2._activeNodes.splice(i2, 1);
                var i3 = self2._activeNodes.indexOf(filter);
                if (i3 !== -1) self2._activeNodes.splice(i3, 1);
            };
        }
    },

    /**
     * Start a continuous drone note.
     * @param {number} freq - Drone frequency in Hz.
     * @param {number} volume - Drone volume.
     */
    _startDrone(freq, volume) {
        if (!Audio.ctx || !Audio.musicGain) return;

        this._stopDrone();

        var osc = Audio.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        var gain = Audio.ctx.createGain();
        gain.gain.setValueAtTime(0, Audio.now());
        gain.gain.linearRampToValueAtTime(volume, Audio.now() + 2.0);

        osc.connect(gain);
        gain.connect(Audio.musicGain);

        osc.start();

        this._droneOsc = osc;
        this._droneGain = gain;
        this._droneFreq = freq;
        this._droneEnabled = true;
    },

    /**
     * Stop the continuous drone.
     */
    _stopDrone() {
        if (this._droneOsc) {
            try {
                this._droneOsc.stop();
                this._droneOsc.disconnect();
            } catch (e) {}
            this._droneOsc = null;
        }
        if (this._droneGain) {
            try {
                this._droneGain.disconnect();
            } catch (e) {}
            this._droneGain = null;
        }
        this._droneEnabled = false;
    },

    // --------------------------------------------------------
    // LEVEL-SPECIFIC MUSIC PATTERNS
    // --------------------------------------------------------

    /**
     * Crypt Music: Ominous, dark, foreboding.
     * Minor key (Am), slow arpeggios, low drone, sparse melody.
     */
    playCryptMusic() {
        this._bpm = 80;
        this._patternLength = 16;
        this._melodyType = 'triangle';
        this._bassType = 'sine';
        this._melodyVol = 0.1;
        this._bassVol = 0.12;
        this._rhythmVol = 0.06;

        // Melody: sparse Am arpeggio pattern (A3-C4-E4-D4 variations)
        this._melodyPattern = [
            NOTE_FREQ['A3'], REST,           NOTE_FREQ['C4'], REST,
            NOTE_FREQ['E4'], REST,           NOTE_FREQ['D4'], REST,
            NOTE_FREQ['C4'], REST,           NOTE_FREQ['A3'], REST,
            NOTE_FREQ['E4'], REST,           NOTE_FREQ['C4'], REST
        ];

        // Bass: low A2 drone pattern
        this._bassPattern = [
            NOTE_FREQ['A2'], REST,           REST,             REST,
            NOTE_FREQ['A2'], REST,           REST,             REST,
            NOTE_FREQ['E2'], REST,           REST,             REST,
            NOTE_FREQ['A2'], REST,           REST,             REST
        ];

        // Rhythm: very soft, sparse kicks
        this._rhythmPattern = [
            1, 0, 0, 0,
            0, 0, 0, 0,
            1, 0, 0, 0,
            0, 0, 0, 0
        ];

        // Low drone on A2
        this._startDrone(NOTE_FREQ['A2'], 0.06);

        this._startSequencer();
    },

    /**
     * Stronghold Music: Aggressive, marching, war drums.
     * Heavy percussion, square wave power notes.
     */
    playStrongholdMusic() {
        this._bpm = 130;
        this._patternLength = 16;
        this._melodyType = 'sawtooth';
        this._bassType = 'square';
        this._melodyVol = 0.1;
        this._bassVol = 0.13;
        this._rhythmVol = 0.12;

        // Melody: aggressive E minor pattern
        this._melodyPattern = [
            NOTE_FREQ['E3'], NOTE_FREQ['E3'], NOTE_FREQ['G3'], REST,
            NOTE_FREQ['A3'], REST,             NOTE_FREQ['B3'], REST,
            NOTE_FREQ['A3'], NOTE_FREQ['A3'], NOTE_FREQ['G3'], REST,
            NOTE_FREQ['E3'], REST,             NOTE_FREQ['B3'], NOTE_FREQ['A3']
        ];

        // Bass: power notes E2, A2
        this._bassPattern = [
            NOTE_FREQ['E2'], REST,            NOTE_FREQ['E2'], REST,
            NOTE_FREQ['A2'], REST,            NOTE_FREQ['A2'], REST,
            NOTE_FREQ['E2'], REST,            NOTE_FREQ['E2'], REST,
            NOTE_FREQ['A2'], REST,            NOTE_FREQ['E2'], REST
        ];

        // Rhythm: strong marching beat
        this._rhythmPattern = [
            3, 0, 2, 0,
            1, 0, 2, 0,
            3, 0, 2, 0,
            1, 2, 1, 2
        ];

        this._startSequencer();
    },

    /**
     * Forest Music: Mysterious, ethereal, floating.
     * Pentatonic scale, soft bass, very light rhythm.
     * Includes subtle delay effects via repeated quiet notes.
     */
    playForestMusic() {
        this._bpm = 90;
        this._patternLength = 16;
        this._melodyType = 'triangle';
        this._bassType = 'sine';
        this._melodyVol = 0.1;
        this._bassVol = 0.1;
        this._rhythmVol = 0.04;

        // Melody: pentatonic (C4-D4-F4-G4-A4) floating pattern
        this._melodyPattern = [
            NOTE_FREQ['C4'], REST,            NOTE_FREQ['F4'], REST,
            NOTE_FREQ['G4'], REST,            NOTE_FREQ['A4'], REST,
            REST,            NOTE_FREQ['D4'], REST,             NOTE_FREQ['G4'],
            NOTE_FREQ['F4'], REST,            NOTE_FREQ['C4'], REST
        ];

        // Bass: C3-G2 slowly alternating
        this._bassPattern = [
            NOTE_FREQ['C3'], REST,            REST,             REST,
            REST,            REST,            NOTE_FREQ['G2'], REST,
            REST,            REST,            NOTE_FREQ['C3'], REST,
            REST,            REST,            NOTE_FREQ['G2'], REST
        ];

        // Rhythm: ambient, minimal
        this._rhythmPattern = [
            0, 0, 0, 2,
            0, 0, 0, 0,
            0, 0, 0, 2,
            0, 0, 0, 0
        ];

        // Gentle drone on C3
        this._startDrone(NOTE_FREQ['C3'], 0.04);

        this._startSequencer();
    },

    /**
     * Ice Music: Crystalline, clean, cold and vast.
     * High register, sine tones, glass-like percussion.
     */
    playIceMusic() {
        this._bpm = 95;
        this._patternLength = 16;
        this._melodyType = 'sine';
        this._bassType = 'sine';
        this._melodyVol = 0.1;
        this._bassVol = 0.1;
        this._rhythmVol = 0.05;

        // Melody: D major high register (D5-Fs5-A5-D6)
        this._melodyPattern = [
            NOTE_FREQ['D5'],  REST,             NOTE_FREQ['Fs5'], REST,
            NOTE_FREQ['A5'],  REST,             NOTE_FREQ['D6'],  REST,
            NOTE_FREQ['A5'],  REST,             NOTE_FREQ['Fs5'], REST,
            NOTE_FREQ['D5'],  REST,             NOTE_FREQ['A5'],  REST
        ];

        // Bass: very low D2 pedal
        this._bassPattern = [
            NOTE_FREQ['D2'],  REST,             REST,              REST,
            REST,             REST,             NOTE_FREQ['D2'],   REST,
            REST,             REST,             NOTE_FREQ['A2'],   REST,
            REST,             REST,             NOTE_FREQ['D2'],   REST
        ];

        // Rhythm: glass tinks (hi-hat only, gentle)
        this._rhythmPattern = [
            0, 0, 2, 0,
            0, 2, 0, 0,
            0, 0, 2, 0,
            0, 2, 0, 0
        ];

        // Cold drone
        this._startDrone(NOTE_FREQ['D2'], 0.04);

        this._startSequencer();
    },

    /**
     * Volcano Music: Epic, dramatic, intense final battle.
     * Sawtooth power chords, heavy drums, heroic melody.
     * Most complex and layered music track.
     */
    playVolcanoMusic() {
        this._bpm = 140;
        this._patternLength = 16;
        this._melodyType = 'sawtooth';
        this._bassType = 'sawtooth';
        this._melodyVol = 0.11;
        this._bassVol = 0.14;
        this._rhythmVol = 0.13;

        // Melody: heroic D minor pattern
        this._melodyPattern = [
            NOTE_FREQ['D4'],  NOTE_FREQ['D4'],  NOTE_FREQ['F4'],  REST,
            NOTE_FREQ['A4'],  REST,              NOTE_FREQ['D5'],  NOTE_FREQ['C5'],
            NOTE_FREQ['A4'],  REST,              NOTE_FREQ['F4'],  REST,
            NOTE_FREQ['D4'],  NOTE_FREQ['F4'],  NOTE_FREQ['A4'],  NOTE_FREQ['D5']
        ];

        // Bass: power chord roots D2+A2
        this._bassPattern = [
            NOTE_FREQ['D2'],  REST,              NOTE_FREQ['D2'],  REST,
            NOTE_FREQ['A2'],  REST,              NOTE_FREQ['D2'],  REST,
            NOTE_FREQ['D2'],  REST,              NOTE_FREQ['A2'],  REST,
            NOTE_FREQ['F2'],  REST,              NOTE_FREQ['D2'],  REST
        ];

        // Rhythm: heavy double-time drums
        this._rhythmPattern = [
            3, 2, 1, 2,
            3, 2, 1, 2,
            3, 2, 1, 2,
            3, 2, 3, 2
        ];

        this._startSequencer();
    },

    /**
     * Boss Music: intense override for boss fights.
     * Faster tempo, heavier bass, dramatic tension.
     */
    playBossMusic() {
        this.stopMusic();

        if (!Audio.ctx || !Audio.musicEnabled) return;

        this.isPlaying = true;

        this._bpm = 155;
        this._patternLength = 16;
        this._melodyType = 'sawtooth';
        this._bassType = 'square';
        this._melodyVol = 0.11;
        this._bassVol = 0.15;
        this._rhythmVol = 0.14;

        // Melody: tense chromatic minor pattern
        this._melodyPattern = [
            NOTE_FREQ['E4'],  REST,              NOTE_FREQ['G4'],  NOTE_FREQ['Fs4'],
            NOTE_FREQ['E4'],  REST,              NOTE_FREQ['B4'],  REST,
            NOTE_FREQ['A4'],  NOTE_FREQ['G4'],  NOTE_FREQ['E4'],  REST,
            NOTE_FREQ['Fs4'], REST,              NOTE_FREQ['E4'],  NOTE_FREQ['B3']
        ];

        // Bass: driving E minor with chromatic movement
        this._bassPattern = [
            NOTE_FREQ['E2'],  NOTE_FREQ['E2'],  REST,              NOTE_FREQ['E2'],
            NOTE_FREQ['G2'],  REST,              NOTE_FREQ['E2'],  REST,
            NOTE_FREQ['E2'],  NOTE_FREQ['E2'],  REST,              NOTE_FREQ['B2'],
            NOTE_FREQ['A2'],  REST,              NOTE_FREQ['E2'],  NOTE_FREQ['E2']
        ];

        // Rhythm: relentless pounding
        this._rhythmPattern = [
            3, 2, 1, 2,
            3, 2, 3, 2,
            3, 2, 1, 2,
            3, 3, 3, 2
        ];

        // Ominous drone
        this._startDrone(NOTE_FREQ['E2'], 0.07);

        this._startSequencer();
    },

    /**
     * Menu Music: atmospheric title screen music.
     * Slow, mysterious arpeggios in minor key.
     * Sets the dark fantasy mood.
     */
    playMenuMusic() {
        this.stopMusic();

        if (!Audio.ctx || !Audio.musicEnabled) return;

        this.isPlaying = true;

        this._bpm = 70;
        this._patternLength = 16;
        this._melodyType = 'triangle';
        this._bassType = 'sine';
        this._melodyVol = 0.08;
        this._bassVol = 0.1;
        this._rhythmVol = 0.03;

        // Melody: mysterious Am arpeggio, slow and atmospheric
        this._melodyPattern = [
            NOTE_FREQ['A3'],  REST,             REST,              NOTE_FREQ['C4'],
            REST,             REST,             NOTE_FREQ['E4'],   REST,
            REST,             NOTE_FREQ['A4'],  REST,              REST,
            NOTE_FREQ['G4'],  REST,             NOTE_FREQ['E4'],   REST
        ];

        // Bass: deep, slow movement
        this._bassPattern = [
            NOTE_FREQ['A2'],  REST,             REST,              REST,
            REST,             REST,             REST,              REST,
            NOTE_FREQ['E2'],  REST,             REST,              REST,
            REST,             REST,             NOTE_FREQ['A2'],   REST
        ];

        // Rhythm: barely there
        this._rhythmPattern = [
            0, 0, 0, 0,
            0, 0, 0, 2,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];

        // Atmospheric drone
        this._startDrone(NOTE_FREQ['A2'], 0.05);

        this._startSequencer();
    }
};


// ============================================================
// SECTION 4: AUTO-INITIALIZATION AND EVENT HOOKS
// ============================================================

/**
 * Set up audio initialization on first user interaction.
 * Browsers require a user gesture to start AudioContext.
 */
(function() {
    var audioStarted = false;

    function initAudioOnGesture() {
        if (audioStarted) return;
        audioStarted = true;

        Audio.init();
        Audio.resume();

        console.log('[Audio] Audio started on user gesture.');
    }

    // Listen for any user interaction to start audio
    document.addEventListener('click', initAudioOnGesture, { once: false });
    document.addEventListener('keydown', initAudioOnGesture, { once: false });
    document.addEventListener('touchstart', initAudioOnGesture, { once: false });
})();
