// ============================================
// SOUND — Web Audio API, different sounds per weapon
// ============================================

let ctx = null;

export function initAudio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
}

function osc(type, freq, freqEnd, dur, vol = 0.12, delay = 0) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  const t = ctx.currentTime + delay;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur);
}

export function playSound(type) {
  switch (type) {
    case 'shoot_pistol':
      osc('square', 900, 200, 0.08, 0.12);
      osc('sawtooth', 400, 100, 0.05, 0.05, 0.02);
      break;
    case 'shoot_machinegun':
      osc('square', 1200, 400, 0.035, 0.07);
      break;
    case 'shoot_sniper':
      osc('sawtooth', 500, 60, 0.22, 0.18);
      osc('square', 200, 30, 0.15, 0.08, 0.05);
      break;
    case 'shoot_sword':
      osc('triangle', 400, 150, 0.1, 0.12);
      osc('sine', 800, 300, 0.08, 0.06);
      break;
    case 'shoot':
      osc('square', 800, 200, 0.08, 0.1);
      break;
    case 'explosion':
      osc('sawtooth', 150, 15, 0.4, 0.2);
      osc('square', 80, 10, 0.3, 0.12, 0.05);
      osc('triangle', 200, 30, 0.2, 0.08);
      break;
    case 'hit':
      osc('triangle', 400, 100, 0.06, 0.1);
      break;
    case 'beep':
      osc('sine', 600, 580, 0.04, 0.03);
      break;
    case 'click':
      osc('sine', 1000, 900, 0.03, 0.06);
      break;
    case 'glitch':
      osc('sawtooth', 100 + Math.random() * 2000, 50 + Math.random() * 500, 0.12, 0.08);
      osc('square', Math.random() * 1000, Math.random() * 200, 0.08, 0.04, 0.03);
      break;
    case 'alarm':
      osc('square', 200, 800, 0.5, 0.1);
      break;
    case 'pickup':
      osc('sine', 400, 800, 0.12, 0.1);
      osc('sine', 600, 1000, 0.08, 0.06, 0.06);
      break;
    case 'death':
      osc('sawtooth', 400, 30, 0.8, 0.15);
      osc('square', 200, 20, 0.6, 0.1, 0.1);
      break;
  }
}
