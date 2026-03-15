let audioCtx = null;
let musicGain = null;
let sfxGain = null;
let musicPlaying = false;
let musicTimeout = null;
let currentBeat = 0;

const BPM = 140;
const BEAT_DURATION = 60 / BPM;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  musicGain = audioCtx.createGain();
  musicGain.gain.value = 0.15;
  musicGain.connect(audioCtx.destination);
  sfxGain = audioCtx.createGain();
  sfxGain.gain.value = 0.25;
  sfxGain.connect(audioCtx.destination);
}

// --- Note helpers ---
const NOTE_FREQS = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, G5: 783.99,
};

function playTone(freq, startTime, duration, type, gainNode) {
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0.3, startTime);
  env.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.95);
  osc.connect(env);
  env.connect(gainNode);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

// --- Background music: catchy loop ---
// Melody: playful, cat-like, pentatonic-ish
const MELODY = [
  'E4','G4','A4','G4', 'E4','D4','C4','D4',
  'E4','G4','A4','B4', 'A4','G4','E4','D4',
  'C4','D4','E4','G4', 'A4','G4','E4','D4',
  'C4','E4','D4','C4', 'D4','E4','G4','E4',
];

const BASS = [
  'C3','C3','G3','G3', 'A3','A3','E3','E3',
  'C3','C3','G3','G3', 'A3','A3','E3','E3',
  'F3','F3','C3','C3', 'G3','G3','D3','D3',
  'C3','C3','E3','E3', 'G3','G3','C3','C3',
];

function scheduleBeat() {
  if (!musicPlaying || !audioCtx) return;

  const now = audioCtx.currentTime;
  const beatLen = BEAT_DURATION;
  const melodyIdx = currentBeat % MELODY.length;
  const bassIdx = currentBeat % BASS.length;

  // Melody — square wave, staccato
  const melodyNote = MELODY[melodyIdx];
  if (melodyNote && NOTE_FREQS[melodyNote]) {
    playTone(NOTE_FREQS[melodyNote], now, beatLen * 0.7, 'square', musicGain);
  }

  // Bass — triangle wave, sustained
  const bassNote = BASS[bassIdx];
  if (bassNote && NOTE_FREQS[bassNote]) {
    playTone(NOTE_FREQS[bassNote], now, beatLen * 0.9, 'triangle', musicGain);
  }

  // Hi-hat on every other beat
  if (currentBeat % 2 === 0) {
    playNoise(now, beatLen * 0.05);
  }

  currentBeat++;
  musicTimeout = setTimeout(scheduleBeat, beatLen * 1000);
}

function playNoise(startTime, duration) {
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const env = audioCtx.createGain();
  env.gain.setValueAtTime(0.08, startTime);
  env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 8000;
  noise.connect(filter);
  filter.connect(env);
  env.connect(musicGain);
  noise.start(startTime);
  noise.stop(startTime + duration);
}

function startMusic() {
  if (musicPlaying) return;
  initAudio();
  musicPlaying = true;
  currentBeat = 0;
  scheduleBeat();
}

function stopMusic() {
  musicPlaying = false;
  if (musicTimeout) {
    clearTimeout(musicTimeout);
    musicTimeout = null;
  }
}

// --- Sound effects ---
function sfxEatSushi() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(880, now, 0.06, 'square', sfxGain);
  playTone(1100, now + 0.04, 0.06, 'square', sfxGain);
}

function sfxEatWasabi() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(440, now, 0.08, 'sawtooth', sfxGain);
  playTone(660, now + 0.06, 0.08, 'sawtooth', sfxGain);
  playTone(880, now + 0.12, 0.08, 'sawtooth', sfxGain);
  playTone(1100, now + 0.18, 0.12, 'sawtooth', sfxGain);
}

function sfxEatRat() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(200, now, 0.1, 'sawtooth', sfxGain);
  playTone(400, now + 0.05, 0.1, 'sawtooth', sfxGain);
  playTone(800, now + 0.1, 0.15, 'sawtooth', sfxGain);
}

function sfxDeath() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(440, now, 0.15, 'square', sfxGain);
  playTone(330, now + 0.15, 0.15, 'square', sfxGain);
  playTone(220, now + 0.3, 0.15, 'square', sfxGain);
  playTone(110, now + 0.45, 0.3, 'square', sfxGain);
}

function sfxLevelComplete() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(523.25, now, 0.12, 'square', sfxGain);
  playTone(659.26, now + 0.12, 0.12, 'square', sfxGain);
  playTone(783.99, now + 0.24, 0.12, 'square', sfxGain);
  playTone(1046.5, now + 0.36, 0.3, 'square', sfxGain);
}

function sfxGameOver() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playTone(392, now, 0.25, 'triangle', sfxGain);
  playTone(330, now + 0.3, 0.25, 'triangle', sfxGain);
  playTone(262, now + 0.6, 0.25, 'triangle', sfxGain);
  playTone(196, now + 0.9, 0.5, 'triangle', sfxGain);
}
