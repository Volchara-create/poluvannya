// ============================================
// SOUND SYSTEM — Web Audio API synthesized sounds
// ============================================

let audioCtx = null;

export function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

export function playSound(type, volume = 1) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const t = audioCtx.currentTime;
  const v = volume;

  switch (type) {
    case 'shoot_pistol':
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
      gain.gain.setValueAtTime(0.12 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t); osc.stop(t + 0.08);
      break;

    case 'shoot_machinegun':
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);
      gain.gain.setValueAtTime(0.08 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.start(t); osc.stop(t + 0.04);
      break;

    case 'shoot_sniper':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
      gain.gain.setValueAtTime(0.18 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t); osc.stop(t + 0.2);
      break;

    case 'shoot_sword':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.12);
      gain.gain.setValueAtTime(0.15 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.start(t); osc.stop(t + 0.12);
      break;

    case 'shoot':
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
      gain.gain.setValueAtTime(0.12 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
      break;

    case 'explosion': {
      // Multi-layer explosion
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2); gain2.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.4);
      gain.gain.setValueAtTime(0.2 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(80, t);
      osc2.frequency.exponentialRampToValueAtTime(15, t + 0.3);
      gain2.gain.setValueAtTime(0.15 * v, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t); osc.stop(t + 0.4);
      osc2.start(t); osc2.stop(t + 0.3);
      break;
    }

    case 'hit':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.06);
      gain.gain.setValueAtTime(0.1 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.start(t); osc.stop(t + 0.06);
      break;

    case 'beep':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      gain.gain.setValueAtTime(0.04 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.start(t); osc.stop(t + 0.04);
      break;

    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, t);
      gain.gain.setValueAtTime(0.08 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.start(t); osc.stop(t + 0.03);
      break;

    case 'glitch': {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2); gain2.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(Math.random() * 2000 + 100, t);
      osc.frequency.setValueAtTime(Math.random() * 2000 + 100, t + 0.05);
      gain.gain.setValueAtTime(0.08 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(Math.random() * 500 + 50, t);
      gain2.gain.setValueAtTime(0.05 * v, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t); osc.stop(t + 0.12);
      osc2.start(t); osc2.stop(t + 0.08);
      break;
    }

    case 'alarm':
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(800, t + 0.5);
      gain.gain.setValueAtTime(0.1 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t); osc.stop(t + 0.5);
      break;

    case 'pickup':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
      gain.gain.setValueAtTime(0.1 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
      break;

    case 'death':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.8);
      gain.gain.setValueAtTime(0.15 * v, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.start(t); osc.stop(t + 0.8);
      break;

    case 'ambient': {
      // Low drone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t);
      gain.gain.setValueAtTime(0.03 * v, t);
      gain.gain.linearRampToValueAtTime(0.05 * v, t + 1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3);
      osc.start(t); osc.stop(t + 3);
      break;
    }
  }
}
