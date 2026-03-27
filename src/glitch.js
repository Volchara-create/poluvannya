// ============================================
// GLITCH SYSTEM — Broken Reality effects
// ============================================

import { playSound } from './sound.js';

let glitchTimer = 0;
export let activeGlitch = null;
let glitchDuration = 0;

export function getGlitchLevel(missionNumber) {
  if (missionNumber < 5) return 1;
  if (missionNumber < 10) return 2;
  if (missionNumber < 15) return 3;
  if (missionNumber < 20) return 4;
  return 5;
}

export function updateGlitches(dt, missionNumber) {
  const level = getGlitchLevel(missionNumber);

  glitchTimer -= dt;
  if (glitchTimer <= 0) {
    const chance = level * 0.04;
    if (Math.random() < chance) {
      triggerGlitch(level);
    }
    glitchTimer = 3 + Math.random() * 6;
  }

  if (activeGlitch) {
    glitchDuration -= dt;
    if (glitchDuration <= 0) {
      activeGlitch = null;
    }
  }
}

export function triggerGlitch(level) {
  const types = ['text'];
  if (level >= 2) types.push('scanlines', 'flicker');
  if (level >= 3) types.push('shift', 'invert_controls');
  if (level >= 4) types.push('color_shift', 'fake_message');
  if (level >= 5) types.push('blackout', 'reverse_text');

  activeGlitch = types[Math.floor(Math.random() * types.length)];
  glitchDuration = 0.2 + Math.random() * 0.4;

  if (activeGlitch === 'blackout') glitchDuration = 0.4 + Math.random() * 0.4;
  if (activeGlitch === 'scanlines') glitchDuration = 0.5 + Math.random() * 0.8;

  playSound('glitch', 0.5);
}

export function renderGlitchEffects(ctx) {
  if (!activeGlitch) return;

  switch (activeGlitch) {
    case 'text': {
      const msgs = ['помилка системи', 'дані пошкоджено', "пам'ять фрагментована",
        'сигнал нестабільний', 'УВАГА', 'ERROR 0x04F2', 'SYSTEM BREACH', 'CORRUPTED'];
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#f00';
      ctx.font = '12px "Share Tech Mono", monospace';
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      ctx.fillText(msg, Math.random() * 600 + 50, Math.random() * 400 + 100);
      ctx.restore();
      break;
    }
    case 'scanlines':
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#000';
      for (let y = 0; y < 600; y += 3) {
        ctx.fillRect(0, y, 800, 1);
      }
      ctx.restore();
      break;
    case 'flicker':
      ctx.save();
      ctx.globalAlpha = 0.08 + Math.random() * 0.12;
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#0ff';
      ctx.fillRect(0, 0, 800, 600);
      ctx.restore();
      break;
    case 'shift': {
      // Horizontal line shift
      const shifts = Math.floor(Math.random() * 5) + 2;
      ctx.save();
      for (let i = 0; i < shifts; i++) {
        const y = Math.floor(Math.random() * 600);
        const h = Math.floor(Math.random() * 20) + 3;
        const shiftX = (Math.random() - 0.5) * 20;
        try {
          const imgData = ctx.getImageData(0, y, 800, h);
          ctx.putImageData(imgData, shiftX, y);
        } catch (e) {}
      }
      ctx.restore();
      break;
    }
    case 'blackout':
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 800, 600);
      ctx.restore();
      break;
    case 'color_shift':
      ctx.save();
      ctx.globalCompositeOperation = 'hue';
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      ctx.fillRect(0, 0, 800, 600);
      ctx.restore();
      break;
    case 'fake_message':
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(200, 250, 400, 100);
      ctx.strokeStyle = '#f00';
      ctx.strokeRect(200, 250, 400, 100);
      ctx.fillStyle = '#f00';
      ctx.font = '16px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('КРИТИЧНА ПОМИЛКА', 400, 290);
      ctx.fillStyle = '#aaa';
      ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillText('Цілісність системи порушена', 400, 320);
      ctx.restore();
      break;
  }
}

export function isControlsInverted() {
  return activeGlitch === 'invert_controls';
}
