// === CORE ENGINE ===

// ============================================================
// SECTION 1: CONSTANTS & CONFIG
// ============================================================

const CANVAS_W = 960, CANVAS_H = 540;
const GRAVITY = 0.3;
const SCROLL_SPEED = 2;

// Game states enum
const STATE = {
  MENU: 0,
  LEVEL_INTRO: 1,
  PLAYING: 2,
  BOSS_FIGHT: 3,
  LEVEL_COMPLETE: 4,
  GAME_OVER: 5,
  VICTORY: 6,
  PAUSED: 7
};

// Colors config for pixel art
const COLORS = {
  // Goku
  gokuGiOrange: '#FF6600',
  gokuGiOrangeDark: '#CC5200',
  gokuGiOrangeLight: '#FF8833',
  gokuBelt: '#2244AA',
  gokuBeltLight: '#3366CC',
  gokuSkin: '#FFD3A8',
  gokuSkinShadow: '#E0A870',
  gokuHairBlack: '#111111',
  gokuHairHighlight: '#333333',
  gokuBoots: '#2244AA',
  gokuBootsLight: '#3366CC',
  gokuWristband: '#2244AA',
  gokuEyeWhite: '#FFFFFF',
  gokuEyePupil: '#111111',

  // Nimbus Cloud
  cloudYellow: '#FFE44D',
  cloudYellowLight: '#FFF080',
  cloudYellowDark: '#DDBB22',
  cloudTrail: '#FFF8CC',

  // Ki / Energy
  kiBlue: '#44AAFF',
  kiBlueBright: '#88CCFF',
  kiBlueCore: '#FFFFFF',
  kiYellow: '#FFEE44',
  kiYellowBright: '#FFFF88',
  kamehamehaBlue: '#4488FF',
  kamehamehaCoreWhite: '#EEEEFF',
  spiritBombWhite: '#FFFFFF',
  spiritBombBlue: '#88BBFF',
  spiritBombGlow: '#AADDFF',

  // Aura
  auraSuperYellow: '#FFD700',
  auraChargeBlue: '#66BBFF',
  auraWhite: '#FFFFFF',

  // Enemies - Level 1 (Red Ribbon)
  rrSoldierGreen: '#556B2F',
  rrSoldierHelmet: '#8B0000',
  rrRobotGray: '#888888',
  rrRobotDark: '#555555',
  rrRobotRed: '#CC0000',
  rrNinjaPurple: '#4B0082',
  rrNinjaDark: '#2D004F',

  // Enemies - Level 2 (Namek / Frieza)
  friezaSoldierPurple: '#9944CC',
  friezaArmorWhite: '#EEEEEE',
  friezaArmorBrown: '#886644',
  dodoriaPink: '#FF77AA',
  dodoriaPinkDark: '#CC4488',
  ginyuPurple: '#7722CC',
  ginyuBodyBlack: '#222222',

  // Enemies - Level 3 (Dark Realm)
  cellGreen: '#228B22',
  cellGreenDark: '#145214',
  cellSpots: '#111111',
  darkCloneShadow: '#220044',
  darkCloneGlow: '#8800FF',
  buuPink: '#FFB6C1',
  buuPinkDark: '#FF8899',

  // Bosses
  bossLevel1Core: '#FF0000',
  bossLevel1Metal: '#AAAAAA',
  bossLevel1MetalDark: '#666666',
  bossLevel2Purple: '#7700BB',
  bossLevel2PurpleDark: '#440066',
  bossLevel2Tail: '#550088',
  bossLevel3Dark: '#110022',
  bossLevel3Eyes: '#FF0044',
  bossLevel3Glow: '#CC00FF',

  // Backgrounds - Level 1 (Earth)
  skyBlue: '#87CEEB',
  skyBlueDark: '#5DADE2',
  mountainGreen: '#2E7D32',
  mountainGreenLight: '#4CAF50',
  hillGreen: '#388E3C',
  groundBrown: '#6D4C41',
  buildingGray: '#9E9E9E',

  // Backgrounds - Level 2 (Namek)
  namekSkyGreen: '#77BB77',
  namekSkyGreenDark: '#558855',
  namekGroundBlue: '#557788',
  namekGroundTeal: '#448877',
  namekRockBrown: '#887755',
  namekWater: '#4488AA',

  // Backgrounds - Level 3 (Dark Realm)
  voidWhite: '#F8F8F8',
  darkRealmBg: '#0A0015',
  darkRealmPurple: '#1A0030',
  nebulaBlue: '#1133AA',
  nebulaPink: '#AA1166',
  starWhite: '#FFFFFF',
  starYellow: '#FFEE88',

  // UI / HUD
  hpGreen: '#44DD44',
  hpYellow: '#DDDD22',
  hpRed: '#DD2222',
  hpBarBg: '#333333',
  hpBarBorder: '#FFFFFF',
  kiBarBlue: '#2288FF',
  kiBarGlow: '#88CCFF',
  kiBarBg: '#222244',
  kiBarBorder: '#AABBFF',
  scoreGold: '#FFD700',
  uiWhite: '#FFFFFF',
  uiBlack: '#000000',
  uiShadow: '#000000',
  bossHpRed: '#CC0000',
  bossHpBg: '#440000',

  // Effects
  explosionOrange: '#FF6600',
  explosionYellow: '#FFCC00',
  explosionRed: '#FF2200',
  explosionWhite: '#FFFFFF',
  hitWhite: '#FFFFFF',
  flashWhite: '#FFFFFF',
  flashRed: '#FF000066',

  // Powerups
  senzuGreen: '#22CC22',
  senzuGreenLight: '#66EE66',
  kiOrbBlue: '#4488FF',
  kiOrbGlow: '#88CCFF',
  dragonBallOrange: '#FF8800',
  dragonBallStar: '#CC0000',
  speedBoostYellow: '#FFDD00',
  speedBoostGlow: '#FFFF88'
};

// ============================================================
// SECTION 2: INPUT HANDLER
// ============================================================

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  z: false,    // ki blast
  x: false,    // melee
  c: false,    // kamehameha charge
  v: false     // spirit bomb
};

// Track just-pressed for single-fire actions
const keysJustPressed = {
  z: false,
  x: false,
  v: false
};

const keysPrevious = {
  z: false,
  x: false,
  v: false
};

function updateInputJustPressed() {
  keysJustPressed.z = keys.z && !keysPrevious.z;
  keysJustPressed.x = keys.x && !keysPrevious.x;
  keysJustPressed.v = keys.v && !keysPrevious.v;
  keysPrevious.z = keys.z;
  keysPrevious.x = keys.x;
  keysPrevious.v = keys.v;
}

window.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    keys[e.key] = true;
    e.preventDefault();
  }
  if (e.key === 'z' || e.key === 'Z') { keys.z = true; e.preventDefault(); }
  if (e.key === 'x' || e.key === 'X') { keys.x = true; e.preventDefault(); }
  if (e.key === 'c' || e.key === 'C') { keys.c = true; e.preventDefault(); }
  if (e.key === 'v' || e.key === 'V') { keys.v = true; e.preventDefault(); }
});

window.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    keys[e.key] = false;
  }
  if (e.key === 'z' || e.key === 'Z') { keys.z = false; }
  if (e.key === 'x' || e.key === 'X') { keys.x = false; }
  if (e.key === 'c' || e.key === 'C') { keys.c = false; }
  if (e.key === 'v' || e.key === 'V') { keys.v = false; }
});

// Touch control support
const touchButtons = {};
let touchControlsVisible = false;

function initTouchControls(canvas) {
  const btnSize = 60;
  const margin = 15;
  const bottomY = CANVAS_H - btnSize - margin;
  const dpadCenterX = margin + btnSize + 10;
  const dpadCenterY = bottomY - btnSize - 10;

  // D-pad buttons (left side)
  touchButtons.ArrowUp    = { x: dpadCenterX - btnSize / 2, y: dpadCenterY - btnSize - 5, w: btnSize, h: btnSize, label: 'U', active: false };
  touchButtons.ArrowDown  = { x: dpadCenterX - btnSize / 2, y: dpadCenterY + btnSize + 5, w: btnSize, h: btnSize, label: 'D', active: false };
  touchButtons.ArrowLeft  = { x: dpadCenterX - btnSize - btnSize / 2 - 5, y: dpadCenterY, w: btnSize, h: btnSize, label: 'L', active: false };
  touchButtons.ArrowRight = { x: dpadCenterX + btnSize / 2 + 5, y: dpadCenterY, w: btnSize, h: btnSize, label: 'R', active: false };

  // Action buttons (right side)
  const actionX = CANVAS_W - margin - btnSize * 2 - 20;
  touchButtons.z = { x: actionX + btnSize + 20, y: bottomY - btnSize - 10, w: btnSize, h: btnSize, label: 'Ki', active: false, color: COLORS.kiBlue };
  touchButtons.x = { x: actionX, y: bottomY, w: btnSize, h: btnSize, label: 'Hit', active: false, color: COLORS.explosionOrange };
  touchButtons.c = { x: actionX + btnSize + 20, y: bottomY, w: btnSize, h: btnSize, label: 'KHH', active: false, color: COLORS.kamehamehaBlue };
  touchButtons.v = { x: actionX, y: bottomY - btnSize - 10, w: btnSize, h: btnSize, label: 'SB', active: false, color: COLORS.spiritBombBlue };

  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

  touchControlsVisible = true;
}

function getTouchPos(canvas, touch) {
  var rect = canvas.getBoundingClientRect();
  var scaleX = CANVAS_W / rect.width;
  var scaleY = CANVAS_H / rect.height;
  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY
  };
}

function handleTouchStart(e) {
  e.preventDefault();
  initAudioContext();
  var canvas = e.target;
  for (var i = 0; i < e.changedTouches.length; i++) {
    var pos = getTouchPos(canvas, e.changedTouches[i]);
    for (var key in touchButtons) {
      var btn = touchButtons[key];
      if (pos.x >= btn.x && pos.x <= btn.x + btn.w && pos.y >= btn.y && pos.y <= btn.y + btn.h) {
        btn.active = true;
        btn.touchId = e.changedTouches[i].identifier;
        keys[key] = true;
      }
    }
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  var canvas = e.target;
  // Reset all touch buttons first
  for (var key in touchButtons) {
    var btn = touchButtons[key];
    var stillTouched = false;
    for (var i = 0; i < e.touches.length; i++) {
      var pos = getTouchPos(canvas, e.touches[i]);
      if (pos.x >= btn.x && pos.x <= btn.x + btn.w && pos.y >= btn.y && pos.y <= btn.y + btn.h) {
        stillTouched = true;
        break;
      }
    }
    if (!stillTouched && btn.active) {
      btn.active = false;
      keys[key] = false;
    } else if (stillTouched && !btn.active) {
      btn.active = true;
      keys[key] = true;
    }
  }
}

function handleTouchEnd(e) {
  e.preventDefault();
  for (var i = 0; i < e.changedTouches.length; i++) {
    var id = e.changedTouches[i].identifier;
    for (var key in touchButtons) {
      var btn = touchButtons[key];
      if (btn.touchId === id) {
        btn.active = false;
        keys[key] = false;
      }
    }
  }
}

function drawTouchControls(ctx) {
  if (!touchControlsVisible) return;
  ctx.save();
  for (var key in touchButtons) {
    var btn = touchButtons[key];
    ctx.globalAlpha = btn.active ? 0.6 : 0.3;
    ctx.fillStyle = btn.color || '#FFFFFF';
    ctx.beginPath();
    ctx.arc(btn.x + btn.w / 2, btn.y + btn.h / 2, btn.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = btn.active ? 1.0 : 0.6;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }
  ctx.restore();
}

// ============================================================
// SECTION 3: SOUND SYSTEM (Web Audio API)
// ============================================================

var audioCtx = null;
var audioInitialized = false;
var masterGainNode = null;

function initAudioContext() {
  if (audioInitialized) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = 0.3;
    masterGainNode.connect(audioCtx.destination);
    audioInitialized = true;
  } catch (e) {
    // Web Audio API not supported
  }
}

// Ensure audio context is initialized on first user interaction
window.addEventListener('keydown', function initOnInput() {
  initAudioContext();
  window.removeEventListener('keydown', initOnInput);
}, { once: false });
window.addEventListener('click', function initOnClick() {
  initAudioContext();
  window.removeEventListener('click', initOnClick);
}, { once: false });

function playSound(name) {
  if (!audioCtx || !audioInitialized) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  var now = audioCtx.currentTime;

  switch (name) {

    case 'kiBlast': {
      // Short energy zap - two oscillators with fast frequency sweep
      var osc1 = audioCtx.createOscillator();
      var osc2 = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(800, now);
      osc2.frequency.exponentialRampToValueAtTime(200, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGainNode);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.2);
      osc2.stop(now + 0.2);
      break;
    }

    case 'kamehameha': {
      // Rising charge beam - long sustained oscillator with rising pitch
      var osc1 = audioCtx.createOscillator();
      var osc2 = audioCtx.createOscillator();
      var osc3 = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(4000, now + 0.8);
      filter.frequency.linearRampToValueAtTime(2000, now + 1.5);
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(100, now);
      osc1.frequency.linearRampToValueAtTime(400, now + 0.6);
      osc1.frequency.linearRampToValueAtTime(350, now + 1.5);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(150, now);
      osc2.frequency.linearRampToValueAtTime(450, now + 0.6);
      osc2.frequency.linearRampToValueAtTime(400, now + 1.5);
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(50, now);
      osc3.frequency.linearRampToValueAtTime(200, now + 0.6);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.5);
      gain.gain.setValueAtTime(0.3, now + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainNode);
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + 1.6);
      osc2.stop(now + 1.6);
      osc3.stop(now + 1.6);
      break;
    }

    case 'melee': {
      // Impact thud - noise burst with low frequency punch
      var bufferSize = audioCtx.sampleRate * 0.1;
      var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      var noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      var noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      var noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(600, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGainNode);

      var osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      var oscGain = audioCtx.createGain();
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(oscGain);
      oscGain.connect(masterGainNode);
      noise.start(now);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }

    case 'spiritBomb': {
      // Epic rising tone - multiple harmonics building up
      var duration = 2.5;
      for (var h = 0; h < 5; h++) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = (h % 2 === 0) ? 'sine' : 'triangle';
        var baseFreq = 80 + h * 60;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.linearRampToValueAtTime(baseFreq * 3, now + duration * 0.7);
        osc.frequency.linearRampToValueAtTime(baseFreq * 4, now + duration);
        var delay = h * 0.15;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.12, now + delay + duration * 0.4);
        gain.gain.linearRampToValueAtTime(0.2, now + duration * 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(masterGainNode);
        osc.start(now);
        osc.stop(now + duration + 0.1);
      }
      // Add rumble
      var rumbleOsc = audioCtx.createOscillator();
      var rumbleGain = audioCtx.createGain();
      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.setValueAtTime(30, now);
      rumbleOsc.frequency.linearRampToValueAtTime(60, now + duration);
      rumbleGain.gain.setValueAtTime(0.15, now);
      rumbleGain.gain.linearRampToValueAtTime(0.3, now + duration * 0.8);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(masterGainNode);
      rumbleOsc.start(now);
      rumbleOsc.stop(now + duration + 0.1);
      break;
    }

    case 'explosion': {
      // Boom - filtered noise with descending frequency envelope
      var bufferSize = audioCtx.sampleRate * 0.5;
      var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      var noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      var filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);
      var gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainNode);

      // Low punch
      var osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
      var oscGain = audioCtx.createGain();
      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(oscGain);
      oscGain.connect(masterGainNode);
      noise.start(now);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }

    case 'powerup': {
      // Cheerful chime - ascending arpeggiated notes
      var notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
      for (var i = 0; i < notes.length; i++) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(notes[i], now + i * 0.07);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.001, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(masterGainNode);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.3);
      }
      break;
    }

    case 'hit': {
      // Damage taken - quick descending burst with noise
      var osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      var gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(masterGainNode);
      // Noise component
      var bufferSize = audioCtx.sampleRate * 0.12;
      var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      var noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      var noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      var noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1000, now);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGainNode);
      osc.start(now);
      noise.start(now);
      osc.stop(now + 0.25);
      break;
    }

    case 'bossIntro': {
      // Dramatic rumble - low oscillators with rising intensity
      var duration = 2.0;
      var osc1 = audioCtx.createOscillator();
      var osc2 = audioCtx.createOscillator();
      var osc3 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(35, now);
      osc1.frequency.linearRampToValueAtTime(50, now + duration);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(70, now);
      osc2.frequency.linearRampToValueAtTime(90, now + duration * 0.7);
      osc2.frequency.linearRampToValueAtTime(55, now + duration);
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(45, now);
      osc3.frequency.linearRampToValueAtTime(80, now + duration * 0.5);
      osc3.frequency.linearRampToValueAtTime(40, now + duration);
      var gain1 = audioCtx.createGain();
      gain1.gain.setValueAtTime(0.05, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + duration * 0.6);
      gain1.gain.linearRampToValueAtTime(0.25, now + duration * 0.8);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
      var gain2 = audioCtx.createGain();
      gain2.gain.setValueAtTime(0.02, now);
      gain2.gain.linearRampToValueAtTime(0.15, now + duration * 0.5);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
      var gain3 = audioCtx.createGain();
      gain3.gain.setValueAtTime(0.01, now);
      gain3.gain.linearRampToValueAtTime(0.1, now + duration * 0.5);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + duration);
      var filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.linearRampToValueAtTime(800, now + duration * 0.6);
      filter.frequency.linearRampToValueAtTime(200, now + duration);
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);
      gain1.connect(filter);
      gain2.connect(filter);
      gain3.connect(filter);
      filter.connect(masterGainNode);
      osc1.start(now); osc2.start(now); osc3.start(now);
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
      osc3.stop(now + duration + 0.1);

      // Noise rumble
      var bufferSize = audioCtx.sampleRate * duration;
      var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        var t = i / bufferSize;
        var envelope = Math.sin(t * Math.PI) * 0.3;
        data[i] = (Math.random() * 2 - 1) * envelope;
      }
      var noiseSrc = audioCtx.createBufferSource();
      noiseSrc.buffer = buffer;
      var nFilter = audioCtx.createBiquadFilter();
      nFilter.type = 'lowpass';
      nFilter.frequency.setValueAtTime(150, now);
      nFilter.frequency.linearRampToValueAtTime(400, now + duration * 0.5);
      nFilter.frequency.linearRampToValueAtTime(100, now + duration);
      var nGain = audioCtx.createGain();
      nGain.gain.setValueAtTime(0.15, now);
      noiseSrc.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(masterGainNode);
      noiseSrc.start(now);
      break;
    }

    case 'levelComplete': {
      // Victory fanfare - ascending triumphant melody
      var melody = [
        { f: 523, t: 0.0,  d: 0.15 }, // C5
        { f: 587, t: 0.12, d: 0.15 }, // D5
        { f: 659, t: 0.24, d: 0.15 }, // E5
        { f: 784, t: 0.36, d: 0.25 }, // G5
        { f: 880, t: 0.55, d: 0.15 }, // A5
        { f: 784, t: 0.67, d: 0.15 }, // G5
        { f: 1047, t: 0.82, d: 0.5  }, // C6 (sustained)
      ];
      // Harmony
      var harmony = [
        { f: 330, t: 0.0,  d: 0.4 },  // E4
        { f: 392, t: 0.36, d: 0.4 },  // G4
        { f: 523, t: 0.82, d: 0.5 },  // C5
      ];
      for (var i = 0; i < melody.length; i++) {
        var n = melody[i];
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.001, now + n.t);
        gain.gain.linearRampToValueAtTime(0.18, now + n.t + 0.01);
        gain.gain.setValueAtTime(0.18, now + n.t + n.d * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(masterGainNode);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.05);
      }
      for (var i = 0; i < harmony.length; i++) {
        var n = harmony[i];
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.001, now + n.t);
        gain.gain.linearRampToValueAtTime(0.1, now + n.t + 0.02);
        gain.gain.setValueAtTime(0.1, now + n.t + n.d * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(masterGainNode);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.05);
      }
      break;
    }

    case 'gameOver': {
      // Sad descending tone - minor key descending melody
      var notes = [
        { f: 392, t: 0.0,  d: 0.35 }, // G4
        { f: 349, t: 0.3,  d: 0.35 }, // F4
        { f: 311, t: 0.6,  d: 0.35 }, // Eb4
        { f: 262, t: 0.9,  d: 0.7 },  // C4 (sustained)
      ];
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        // Add slight vibrato on final note
        if (i === notes.length - 1) {
          var lfo = audioCtx.createOscillator();
          var lfoGain = audioCtx.createGain();
          lfo.frequency.value = 5;
          lfoGain.gain.value = 4;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start(now + n.t);
          lfo.stop(now + n.t + n.d + 0.1);
        }
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.001, now + n.t);
        gain.gain.linearRampToValueAtTime(0.2, now + n.t + 0.02);
        gain.gain.setValueAtTime(0.2, now + n.t + n.d * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(masterGainNode);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.15);
      }
      // Low drone
      var drone = audioCtx.createOscillator();
      var droneGain = audioCtx.createGain();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(65, now);
      drone.frequency.linearRampToValueAtTime(55, now + 1.6);
      droneGain.gain.setValueAtTime(0.1, now);
      droneGain.gain.linearRampToValueAtTime(0.15, now + 0.5);
      droneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      drone.connect(droneGain);
      droneGain.connect(masterGainNode);
      drone.start(now);
      drone.stop(now + 1.7);
      break;
    }
  }
}

// ============================================================
// SECTION 4: PARTICLE SYSTEM
// ============================================================

class Particle {
  constructor(x, y, vx, vy, life, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.initialSize = size;
    this.alpha = 1.0;
    this.gravity = 0;
    this.friction = 1.0;
    this.shrink = true;
    this.fadeOut = true;
    this.glow = false;
    this.glowSize = 0;
    this.shape = 'square'; // 'square', 'circle', 'diamond'
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) return false;

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    var lifeRatio = this.life / this.maxLife;

    if (this.fadeOut) {
      this.alpha = lifeRatio;
    }

    if (this.shrink) {
      this.size = this.initialSize * lifeRatio;
    }

    return true;
  }

  draw(ctx) {
    if (this.life <= 0 || this.size < 0.2) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    // Glow effect
    if (this.glow && this.glowSize > 0) {
      ctx.globalAlpha = this.alpha * 0.3;
      ctx.fillStyle = this.color;
      if (this.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + this.glowSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(
          this.x - (this.size + this.glowSize) / 2,
          this.y - (this.size + this.glowSize) / 2,
          this.size + this.glowSize,
          this.size + this.glowSize
        );
      }
      ctx.globalAlpha = this.alpha;
    }

    ctx.fillStyle = this.color;

    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'diamond':
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
        break;
      case 'square':
      default:
        ctx.fillRect(
          this.x - this.size / 2,
          this.y - this.size / 2,
          this.size,
          this.size
        );
        break;
    }

    ctx.restore();
  }
}

const particles = [];

function spawnParticles(x, y, count, color, spread, speed, life, size) {
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var spd = speed * (0.3 + Math.random() * 0.7);
    var vx = Math.cos(angle) * spd;
    var vy = Math.sin(angle) * spd;
    var px = x + (Math.random() - 0.5) * spread;
    var py = y + (Math.random() - 0.5) * spread;
    var plife = life * (0.5 + Math.random() * 0.5);
    var psize = size * (0.5 + Math.random() * 0.5);
    var c = Array.isArray(color) ? color[randInt(0, color.length - 1)] : color;
    var p = new Particle(px, py, vx, vy, plife, c, psize);
    particles.push(p);
  }
}

function spawnExplosion(x, y, intensity) {
  var count = Math.floor(intensity * 8);
  var colors = [COLORS.explosionOrange, COLORS.explosionYellow, COLORS.explosionRed, COLORS.explosionWhite];
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var spd = (30 + Math.random() * 80) * (intensity / 3);
    var vx = Math.cos(angle) * spd;
    var vy = Math.sin(angle) * spd;
    var life = 0.3 + Math.random() * 0.6;
    var size = 2 + Math.random() * 5 * (intensity / 3);
    var p = new Particle(x, y, vx, vy, life, colors[randInt(0, colors.length - 1)], size);
    p.gravity = 30;
    p.friction = 0.97;
    p.shape = Math.random() > 0.5 ? 'circle' : 'square';
    particles.push(p);
  }
}

function spawnKiTrail(x, y, dirX) {
  for (var i = 0; i < 3; i++) {
    var vx = -dirX * (10 + Math.random() * 20);
    var vy = (Math.random() - 0.5) * 15;
    var life = 0.15 + Math.random() * 0.2;
    var size = 2 + Math.random() * 3;
    var colors = [COLORS.kiBlue, COLORS.kiBlueBright, COLORS.kiBlueCore];
    var p = new Particle(x, y, vx, vy, life, colors[randInt(0, 2)], size);
    p.shape = 'circle';
    p.glow = true;
    p.glowSize = 3;
    particles.push(p);
  }
}

function spawnAuraGlow(x, y, color, intensity) {
  var count = Math.floor(intensity * 3);
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var dist = Math.random() * 15;
    var px = x + Math.cos(angle) * dist;
    var py = y + Math.sin(angle) * dist;
    var vx = (Math.random() - 0.5) * 10;
    var vy = -20 - Math.random() * 40;
    var life = 0.2 + Math.random() * 0.4;
    var size = 2 + Math.random() * 4;
    var p = new Particle(px, py, vx, vy, life, color, size);
    p.shape = 'diamond';
    p.glow = true;
    p.glowSize = 4;
    p.friction = 0.98;
    particles.push(p);
  }
}

function spawnCloudTrail(x, y) {
  for (var i = 0; i < 2; i++) {
    var vx = -15 - Math.random() * 20;
    var vy = (Math.random() - 0.5) * 8;
    var life = 0.3 + Math.random() * 0.4;
    var size = 4 + Math.random() * 6;
    var colors = [COLORS.cloudYellow, COLORS.cloudYellowLight, COLORS.cloudTrail];
    var p = new Particle(x, y, vx, vy, life, colors[randInt(0, 2)], size);
    p.shape = 'circle';
    p.friction = 0.96;
    particles.push(p);
  }
}

function spawnChargeSparkle(x, y, radius, color) {
  var angle = Math.random() * Math.PI * 2;
  var dist = radius * (0.6 + Math.random() * 0.4);
  var px = x + Math.cos(angle) * dist;
  var py = y + Math.sin(angle) * dist;
  // Move toward center
  var toX = x - px;
  var toY = y - py;
  var len = Math.sqrt(toX * toX + toY * toY) || 1;
  var spd = 30 + Math.random() * 50;
  var vx = (toX / len) * spd;
  var vy = (toY / len) * spd;
  var life = 0.2 + Math.random() * 0.3;
  var size = 1 + Math.random() * 3;
  var c = color || COLORS.auraChargeBlue;
  var p = new Particle(px, py, vx, vy, life, c, size);
  p.shape = 'diamond';
  p.glow = true;
  p.glowSize = 2;
  p.shrink = false;
  p.fadeOut = true;
  particles.push(p);
}

function updateParticles(dt) {
  for (var i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update(dt)) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles(ctx) {
  for (var i = 0; i < particles.length; i++) {
    particles[i].draw(ctx);
  }
}

// ============================================================
// SECTION 5: CAMERA SYSTEM
// ============================================================

const camera = {
  x: 0,
  y: 0,
  shake: 0,
  shakeDecay: 0.9,
  targetX: 0,
  targetY: 0,
  offsetX: 0,
  offsetY: 0,
  smoothing: 0.1
};

function shakeScreen(intensity) {
  camera.shake = Math.max(camera.shake, intensity);
}

function updateCamera(dt) {
  // Apply screen shake
  if (camera.shake > 0.5) {
    camera.offsetX = (Math.random() - 0.5) * camera.shake * 2;
    camera.offsetY = (Math.random() - 0.5) * camera.shake * 2;
    camera.shake *= camera.shakeDecay;
  } else {
    camera.shake = 0;
    camera.offsetX = 0;
    camera.offsetY = 0;
  }

  // Smooth follow toward target
  camera.x = lerp(camera.x, camera.targetX, camera.smoothing);
  camera.y = lerp(camera.y, camera.targetY, camera.smoothing);
}

function applyCameraTransform(ctx) {
  ctx.translate(
    -Math.round(camera.x + camera.offsetX),
    -Math.round(camera.y + camera.offsetY)
  );
}

function resetCameraTransform(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ============================================================
// SECTION 6: UTILITY FUNCTIONS
// ============================================================

function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// Screen flash effect global state
var screenFlash = {
  active: false,
  color: '#FFFFFF',
  alpha: 0,
  duration: 0,
  elapsed: 0
};

function flash(color, duration) {
  screenFlash.active = true;
  screenFlash.color = color || '#FFFFFF';
  screenFlash.alpha = 1.0;
  screenFlash.duration = duration || 0.2;
  screenFlash.elapsed = 0;
}

function updateFlash(dt) {
  if (!screenFlash.active) return;
  screenFlash.elapsed += dt;
  var t = screenFlash.elapsed / screenFlash.duration;
  if (t >= 1) {
    screenFlash.active = false;
    screenFlash.alpha = 0;
  } else {
    screenFlash.alpha = 1.0 - t;
  }
}

function drawFlash(ctx) {
  if (!screenFlash.active || screenFlash.alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = screenFlash.alpha;
  ctx.fillStyle = screenFlash.color;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
}

// ============================================================
// PIXEL TEXT SYSTEM
// ============================================================

// Each character is a 5x5 grid stored as a 25-character string of 1s and 0s
// Row-major order: chars[0..4] = row 0, chars[5..9] = row 1, etc.
const PIXEL_FONT = {
  'A': [
    0,1,1,1,0,
    1,0,0,0,1,
    1,1,1,1,1,
    1,0,0,0,1,
    1,0,0,0,1
  ],
  'B': [
    1,1,1,1,0,
    1,0,0,0,1,
    1,1,1,1,0,
    1,0,0,0,1,
    1,1,1,1,0
  ],
  'C': [
    0,1,1,1,1,
    1,0,0,0,0,
    1,0,0,0,0,
    1,0,0,0,0,
    0,1,1,1,1
  ],
  'D': [
    1,1,1,1,0,
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,0,0,1,
    1,1,1,1,0
  ],
  'E': [
    1,1,1,1,1,
    1,0,0,0,0,
    1,1,1,1,0,
    1,0,0,0,0,
    1,1,1,1,1
  ],
  'F': [
    1,1,1,1,1,
    1,0,0,0,0,
    1,1,1,1,0,
    1,0,0,0,0,
    1,0,0,0,0
  ],
  'G': [
    0,1,1,1,1,
    1,0,0,0,0,
    1,0,1,1,1,
    1,0,0,0,1,
    0,1,1,1,1
  ],
  'H': [
    1,0,0,0,1,
    1,0,0,0,1,
    1,1,1,1,1,
    1,0,0,0,1,
    1,0,0,0,1
  ],
  'I': [
    1,1,1,1,1,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0,
    1,1,1,1,1
  ],
  'J': [
    0,0,0,0,1,
    0,0,0,0,1,
    0,0,0,0,1,
    1,0,0,0,1,
    0,1,1,1,0
  ],
  'K': [
    1,0,0,0,1,
    1,0,0,1,0,
    1,1,1,0,0,
    1,0,0,1,0,
    1,0,0,0,1
  ],
  'L': [
    1,0,0,0,0,
    1,0,0,0,0,
    1,0,0,0,0,
    1,0,0,0,0,
    1,1,1,1,1
  ],
  'M': [
    1,0,0,0,1,
    1,1,0,1,1,
    1,0,1,0,1,
    1,0,0,0,1,
    1,0,0,0,1
  ],
  'N': [
    1,0,0,0,1,
    1,1,0,0,1,
    1,0,1,0,1,
    1,0,0,1,1,
    1,0,0,0,1
  ],
  'O': [
    0,1,1,1,0,
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,0,0,1,
    0,1,1,1,0
  ],
  'P': [
    1,1,1,1,0,
    1,0,0,0,1,
    1,1,1,1,0,
    1,0,0,0,0,
    1,0,0,0,0
  ],
  'Q': [
    0,1,1,1,0,
    1,0,0,0,1,
    1,0,1,0,1,
    1,0,0,1,0,
    0,1,1,0,1
  ],
  'R': [
    1,1,1,1,0,
    1,0,0,0,1,
    1,1,1,1,0,
    1,0,0,1,0,
    1,0,0,0,1
  ],
  'S': [
    0,1,1,1,1,
    1,0,0,0,0,
    0,1,1,1,0,
    0,0,0,0,1,
    1,1,1,1,0
  ],
  'T': [
    1,1,1,1,1,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0
  ],
  'U': [
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,0,0,1,
    0,1,1,1,0
  ],
  'V': [
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,0,0,1,
    0,1,0,1,0,
    0,0,1,0,0
  ],
  'W': [
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,1,0,1,
    1,1,0,1,1,
    1,0,0,0,1
  ],
  'X': [
    1,0,0,0,1,
    0,1,0,1,0,
    0,0,1,0,0,
    0,1,0,1,0,
    1,0,0,0,1
  ],
  'Y': [
    1,0,0,0,1,
    0,1,0,1,0,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0
  ],
  'Z': [
    1,1,1,1,1,
    0,0,0,1,0,
    0,0,1,0,0,
    0,1,0,0,0,
    1,1,1,1,1
  ],
  '0': [
    0,1,1,1,0,
    1,0,0,1,1,
    1,0,1,0,1,
    1,1,0,0,1,
    0,1,1,1,0
  ],
  '1': [
    0,0,1,0,0,
    0,1,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0,
    0,1,1,1,0
  ],
  '2': [
    0,1,1,1,0,
    1,0,0,0,1,
    0,0,1,1,0,
    0,1,0,0,0,
    1,1,1,1,1
  ],
  '3': [
    1,1,1,1,0,
    0,0,0,0,1,
    0,1,1,1,0,
    0,0,0,0,1,
    1,1,1,1,0
  ],
  '4': [
    1,0,0,1,0,
    1,0,0,1,0,
    1,1,1,1,1,
    0,0,0,1,0,
    0,0,0,1,0
  ],
  '5': [
    1,1,1,1,1,
    1,0,0,0,0,
    1,1,1,1,0,
    0,0,0,0,1,
    1,1,1,1,0
  ],
  '6': [
    0,1,1,1,0,
    1,0,0,0,0,
    1,1,1,1,0,
    1,0,0,0,1,
    0,1,1,1,0
  ],
  '7': [
    1,1,1,1,1,
    0,0,0,0,1,
    0,0,0,1,0,
    0,0,1,0,0,
    0,0,1,0,0
  ],
  '8': [
    0,1,1,1,0,
    1,0,0,0,1,
    0,1,1,1,0,
    1,0,0,0,1,
    0,1,1,1,0
  ],
  '9': [
    0,1,1,1,0,
    1,0,0,0,1,
    0,1,1,1,1,
    0,0,0,0,1,
    0,1,1,1,0
  ],
  ' ': [
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,0,0,0
  ],
  '!': [
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,0,0,0,
    0,0,1,0,0
  ],
  '-': [
    0,0,0,0,0,
    0,0,0,0,0,
    0,1,1,1,0,
    0,0,0,0,0,
    0,0,0,0,0
  ],
  ':': [
    0,0,0,0,0,
    0,0,1,0,0,
    0,0,0,0,0,
    0,0,1,0,0,
    0,0,0,0,0
  ],
  '.': [
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,1,0,0
  ],
  ',': [
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,1,0,0,
    0,1,0,0,0
  ],
  '?': [
    0,1,1,1,0,
    1,0,0,0,1,
    0,0,0,1,0,
    0,0,0,0,0,
    0,0,0,1,0
  ],
  '/': [
    0,0,0,0,1,
    0,0,0,1,0,
    0,0,1,0,0,
    0,1,0,0,0,
    1,0,0,0,0
  ],
  '(': [
    0,0,1,0,0,
    0,1,0,0,0,
    0,1,0,0,0,
    0,1,0,0,0,
    0,0,1,0,0
  ],
  ')': [
    0,0,1,0,0,
    0,0,0,1,0,
    0,0,0,1,0,
    0,0,0,1,0,
    0,0,1,0,0
  ],
  '+': [
    0,0,0,0,0,
    0,0,1,0,0,
    0,1,1,1,0,
    0,0,1,0,0,
    0,0,0,0,0
  ],
  '\'': [
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,0,0,0
  ],
  '"': [
    0,1,0,1,0,
    0,1,0,1,0,
    0,0,0,0,0,
    0,0,0,0,0,
    0,0,0,0,0
  ],
  '%': [
    1,0,0,0,1,
    0,0,0,1,0,
    0,0,1,0,0,
    0,1,0,0,0,
    1,0,0,0,1
  ],
  '#': [
    0,1,0,1,0,
    1,1,1,1,1,
    0,1,0,1,0,
    1,1,1,1,1,
    0,1,0,1,0
  ],
  '*': [
    0,0,0,0,0,
    0,1,0,1,0,
    0,0,1,0,0,
    0,1,0,1,0,
    0,0,0,0,0
  ],
  '=': [
    0,0,0,0,0,
    0,1,1,1,0,
    0,0,0,0,0,
    0,1,1,1,0,
    0,0,0,0,0
  ],
  '<': [
    0,0,0,1,0,
    0,0,1,0,0,
    0,1,0,0,0,
    0,0,1,0,0,
    0,0,0,1,0
  ],
  '>': [
    0,1,0,0,0,
    0,0,1,0,0,
    0,0,0,1,0,
    0,0,1,0,0,
    0,1,0,0,0
  ]
};

function drawPixelText(ctx, text, x, y, size, color) {
  ctx.fillStyle = color;
  var str = text.toUpperCase();
  var charWidth = 5;
  var charHeight = 5;
  var spacing = 1; // 1 pixel gap between characters
  var pixelSize = size;

  var cursorX = x;

  for (var c = 0; c < str.length; c++) {
    var ch = str[c];
    var glyph = PIXEL_FONT[ch];
    if (glyph) {
      for (var row = 0; row < charHeight; row++) {
        for (var col = 0; col < charWidth; col++) {
          if (glyph[row * charWidth + col]) {
            ctx.fillRect(
              cursorX + col * pixelSize,
              y + row * pixelSize,
              pixelSize,
              pixelSize
            );
          }
        }
      }
    }
    cursorX += (charWidth + spacing) * pixelSize;
  }
}

function getPixelTextWidth(text, size) {
  var charWidth = 5;
  var spacing = 1;
  return text.length * (charWidth + spacing) * size - spacing * size;
}

function drawPixelTextCentered(ctx, text, centerX, y, size, color) {
  var w = getPixelTextWidth(text, size);
  drawPixelText(ctx, text, centerX - w / 2, y, size, color);
}

function drawPixelTextWithShadow(ctx, text, x, y, size, color, shadowColor) {
  var sc = shadowColor || '#000000';
  drawPixelText(ctx, text, x + size, y + size, size, sc);
  drawPixelText(ctx, text, x, y, size, color);
}

function drawPixelTextCenteredWithShadow(ctx, text, centerX, y, size, color, shadowColor) {
  var w = getPixelTextWidth(text, size);
  var x = centerX - w / 2;
  drawPixelTextWithShadow(ctx, text, x, y, size, color, shadowColor);
}

// === END CORE ENGINE ===
