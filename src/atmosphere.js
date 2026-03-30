// ============================================
// ATMOSPHERE — visual atmosphere & post-processing
// Parallax backgrounds, ambient particles, fog,
// vignette, dynamic lighting, god rays
// ============================================

// --- Ambient particles (dust, snow, embers, spores) ---
const ambientParticles = [];
const MAX_AMBIENT = 120;

const AMBIENT_PRESETS = {
  forest: {
    types: [
      { color: '#4a8', chance: 0.4, size: [1, 3], speed: [0.1, 0.4], life: [4, 8], drift: 0.3, glow: false },  // leaves
      { color: '#8f8', chance: 0.2, size: [1, 2], speed: [0.05, 0.2], life: [5, 10], drift: 0.15, glow: true }, // fireflies
      { color: '#ff8', chance: 0.15, size: [1, 1], speed: [0.02, 0.1], life: [6, 12], drift: 0.1, glow: true }, // pollen
    ],
    fogColor: 'rgba(10,40,10,',
    fogDensity: 0.08,
    skyGradient: ['#020a04', '#0a1a0a', '#061808'],
    lightColor: '#2a6a2a',
    lightIntensity: 0.04,
  },
  desert: {
    types: [
      { color: '#c8a060', chance: 0.5, size: [1, 2], speed: [0.3, 0.8], life: [3, 6], drift: 0.6, glow: false }, // sand
      { color: '#e0c080', chance: 0.2, size: [1, 1], speed: [0.5, 1.2], life: [2, 4], drift: 0.8, glow: false }, // dust
    ],
    fogColor: 'rgba(40,30,10,',
    fogDensity: 0.06,
    skyGradient: ['#1a1508', '#2a2010', '#1a1005'],
    lightColor: '#6a5a2a',
    lightIntensity: 0.05,
  },
  ice: {
    types: [
      { color: '#cdf', chance: 0.5, size: [1, 3], speed: [0.15, 0.5], life: [5, 10], drift: 0.4, glow: false }, // snow
      { color: '#eef', chance: 0.3, size: [2, 4], speed: [0.1, 0.3], life: [6, 12], drift: 0.2, glow: false }, // snowflake
      { color: '#8cf', chance: 0.1, size: [1, 2], speed: [0.05, 0.15], life: [8, 14], drift: 0.1, glow: true }, // ice sparkle
    ],
    fogColor: 'rgba(15,15,35,',
    fogDensity: 0.1,
    skyGradient: ['#050510', '#0a0a20', '#080818'],
    lightColor: '#4a6a9a',
    lightIntensity: 0.04,
  },
  crystal: {
    types: [
      { color: '#c0f', chance: 0.3, size: [1, 2], speed: [0.08, 0.25], life: [5, 10], drift: 0.15, glow: true }, // crystal dust
      { color: '#80f', chance: 0.2, size: [1, 3], speed: [0.05, 0.15], life: [6, 12], drift: 0.1, glow: true },  // magic motes
      { color: '#f0f', chance: 0.1, size: [1, 1], speed: [0.03, 0.1], life: [8, 16], drift: 0.08, glow: true },  // energy sparks
    ],
    fogColor: 'rgba(20,5,30,',
    fogDensity: 0.07,
    skyGradient: ['#0a0318', '#10051a', '#0a0215'],
    lightColor: '#6a2a8a',
    lightIntensity: 0.05,
  },
  volcanic: {
    types: [
      { color: '#f80', chance: 0.4, size: [1, 2], speed: [0.3, 0.8], life: [2, 5], drift: 0.2, glow: true },   // embers
      { color: '#f40', chance: 0.2, size: [1, 3], speed: [0.2, 0.6], life: [3, 6], drift: 0.15, glow: true },  // sparks
      { color: '#444', chance: 0.3, size: [2, 4], speed: [0.1, 0.3], life: [4, 8], drift: 0.3, glow: false },  // ash
    ],
    fogColor: 'rgba(30,10,5,',
    fogDensity: 0.09,
    skyGradient: ['#1a0805', '#2a1008', '#150502'],
    lightColor: '#8a3a1a',
    lightIntensity: 0.06,
  },
  ruins: {
    types: [
      { color: '#889', chance: 0.3, size: [1, 2], speed: [0.1, 0.3], life: [5, 10], drift: 0.2, glow: false }, // dust
      { color: '#667', chance: 0.2, size: [1, 1], speed: [0.05, 0.15], life: [6, 12], drift: 0.15, glow: false },
      { color: '#0af', chance: 0.08, size: [1, 1], speed: [0.03, 0.1], life: [8, 14], drift: 0.05, glow: true }, // ancient energy
    ],
    fogColor: 'rgba(10,10,15,',
    fogDensity: 0.08,
    skyGradient: ['#060608', '#0a0a0d', '#080810'],
    lightColor: '#3a3a5a',
    lightIntensity: 0.03,
  },
  station: {
    types: [
      { color: '#0aa', chance: 0.15, size: [1, 1], speed: [0.05, 0.15], life: [6, 12], drift: 0.05, glow: true }, // sparks
      { color: '#555', chance: 0.2, size: [1, 2], speed: [0.08, 0.2], life: [4, 8], drift: 0.1, glow: false },   // steam
    ],
    fogColor: 'rgba(8,8,16,',
    fogDensity: 0.05,
    skyGradient: ['#040408', '#080810', '#060610'],
    lightColor: '#2a4a5a',
    lightIntensity: 0.03,
  }
};

// --- Parallax star layers ---
const starLayers = [];
function initStars() {
  if (starLayers.length > 0) return;
  for (let layer = 0; layer < 3; layer++) {
    const stars = [];
    const count = [60, 40, 20][layer];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * 1400,
        y: Math.random() * 1100,
        size: [1, 1.5, 2][layer],
        brightness: 0.15 + Math.random() * 0.3 + layer * 0.12,
        twinkleSpeed: 1 + Math.random() * 3,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: ['#aac', '#cca', '#ccc', '#aaf', '#ffa'][Math.floor(Math.random() * 5)]
      });
    }
    starLayers.push({ stars, speed: [0.02, 0.05, 0.1][layer] });
  }
}

// --- Vignette (pre-rendered) ---
let vignetteCanvas = null;
function getVignette(w, h) {
  if (vignetteCanvas && vignetteCanvas.width === w && vignetteCanvas.height === h) return vignetteCanvas;
  vignetteCanvas = document.createElement('canvas');
  vignetteCanvas.width = w;
  vignetteCanvas.height = h;
  const vc = vignetteCanvas.getContext('2d');
  const g = vc.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.72);
  g.addColorStop(0, 'transparent');
  g.addColorStop(0.7, 'rgba(0,0,0,0.15)');
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  vc.fillStyle = g;
  vc.fillRect(0, 0, w, h);
  return vignetteCanvas;
}

// --- Scanlines (pre-rendered) ---
let scanCanvas = null;
function getScanlines(w, h) {
  if (scanCanvas && scanCanvas.width === w && scanCanvas.height === h) return scanCanvas;
  scanCanvas = document.createElement('canvas');
  scanCanvas.width = w;
  scanCanvas.height = h;
  const sc = scanCanvas.getContext('2d');
  sc.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 0; y < h; y += 3) {
    sc.fillRect(0, y, w, 1);
  }
  return scanCanvas;
}

// ============================================
// PUBLIC API
// ============================================

// Update ambient particles
export function updateAmbient(dt, planet, camX, camY, mw, mh) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) return;

  // Spawn new particles
  for (const type of preset.types) {
    if (ambientParticles.length >= MAX_AMBIENT) break;
    if (Math.random() < type.chance * dt * 8) {
      const sz = type.size[0] + Math.random() * (type.size[1] - type.size[0]);
      const spd = type.speed[0] + Math.random() * (type.speed[1] - type.speed[0]);
      const life = type.life[0] + Math.random() * (type.life[1] - type.life[0]);
      ambientParticles.push({
        x: camX + Math.random() * 850 - 25,
        y: camY + Math.random() * 650 - 25,
        vx: (Math.random() - 0.5) * type.drift * 2,
        vy: -spd + (Math.random() - 0.3) * spd * 0.5,
        size: sz,
        life,
        maxLife: life,
        color: type.color,
        glow: type.glow,
        drift: type.drift,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  // Update existing
  for (let i = ambientParticles.length - 1; i >= 0; i--) {
    const p = ambientParticles[i];
    p.driftPhase += dt * 1.5;
    p.x += p.vx + Math.sin(p.driftPhase) * p.drift * 0.5;
    p.y += p.vy;
    p.life -= dt;
    if (p.life <= 0) ambientParticles.splice(i, 1);
  }
}

// Render sky gradient background
export function renderSky(ctx, planet, w, h) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) return;

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, preset.skyGradient[0]);
  g.addColorStop(0.5, preset.skyGradient[1]);
  g.addColorStop(1, preset.skyGradient[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Render parallax stars (for space/dark scenes)
export function renderStars(ctx, time, camX, camY, w, h) {
  initStars();
  for (const layer of starLayers) {
    for (const s of layer.stars) {
      const sx = ((s.x - camX * layer.speed) % (w + 40)) - 20;
      const sy = ((s.y - camY * layer.speed) % (h + 40)) - 20;
      const twinkle = 0.5 + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.5;
      ctx.globalAlpha = s.brightness * twinkle;
      ctx.fillStyle = s.color;
      if (s.size > 1.5) {
        // Bigger stars get a tiny glow
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 3;
      }
      ctx.fillRect(sx, sy, s.size, s.size);
      ctx.shadowBlur = 0;
    }
  }
  ctx.globalAlpha = 1;
}

// Render ambient particles (in world space, call inside camera transform)
export function renderAmbientWorld(ctx, camX, camY) {
  for (const p of ambientParticles) {
    const progress = 1 - p.life / p.maxLife;
    // Fade in and out
    const fadeIn = Math.min(1, p.life / (p.maxLife * 0.8));
    const fadeOut = Math.min(1, (p.maxLife - (p.maxLife - p.life)) / (p.maxLife * 0.2));
    const alpha = Math.min(fadeIn, 1 - progress * 0.8) * (p.glow ? 0.7 : 0.5);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    if (p.glow) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.size * 3;
    }
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.restore();
  }
}

// Render ground fog (in world space)
export function renderFog(ctx, planet, time, mw, mh) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset || preset.fogDensity <= 0) return;

  // Bottom fog layer
  const fh = mh * 0.35;
  const g = ctx.createLinearGradient(0, mh - fh, 0, mh);
  g.addColorStop(0, 'transparent');
  g.addColorStop(0.5, preset.fogColor + (preset.fogDensity * 0.5) + ')');
  g.addColorStop(1, preset.fogColor + preset.fogDensity + ')');
  ctx.fillStyle = g;
  ctx.fillRect(0, mh - fh, mw, fh);

  // Drifting fog patches
  for (let i = 0; i < 3; i++) {
    const fx = ((i * 450 + time * 15) % (mw + 300)) - 150;
    const fy = mh * 0.55 + i * 80 + Math.sin(time * 0.5 + i) * 30;
    const fw = 250 + i * 60;
    const ffh = 60 + i * 20;
    const fg = ctx.createRadialGradient(fx + fw / 2, fy, 10, fx + fw / 2, fy, fw / 2);
    fg.addColorStop(0, preset.fogColor + (preset.fogDensity * 0.4) + ')');
    fg.addColorStop(1, 'transparent');
    ctx.fillStyle = fg;
    ctx.fillRect(fx, fy - ffh / 2, fw, ffh);
  }
}

// Dynamic light around an entity (call in world space)
export function renderEntityLight(ctx, x, y, radius, color, intensity) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color.replace(')', ',' + intensity + ')').replace('rgb', 'rgba'));
  g.addColorStop(1, 'transparent');
  // If color is hex, convert
  ctx.globalAlpha = intensity;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = radius * 0.5;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Render dynamic lights for player & entities
export function renderLights(ctx, planet, playerX, playerY, enemies, boss, time) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Player glow
  ctx.globalAlpha = 0.06 + Math.sin(time * 3) * 0.015;
  const pg = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, 80);
  pg.addColorStop(0, '#0ff');
  pg.addColorStop(1, 'transparent');
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(playerX, playerY, 80, 0, Math.PI * 2);
  ctx.fill();

  // Enemy glows
  for (const e of enemies) {
    if (!e.alive) continue;
    ctx.globalAlpha = 0.04;
    const eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 50);
    eg.addColorStop(0, e.c || '#f44');
    eg.addColorStop(1, 'transparent');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 50, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boss glow
  if (boss?.alive) {
    const pulse = 0.05 + Math.sin(time * 4) * 0.02;
    ctx.globalAlpha = pulse;
    const bg = ctx.createRadialGradient(boss.x, boss.y, 0, boss.x, boss.y, 100);
    bg.addColorStop(0, '#f44');
    bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, 100, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Enhanced ground with texture patterns
export function renderGround(ctx, planet, mw, mh, time) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) return;

  // Base is already drawn by renderSky or the caller

  // Add subtle noise-like texture
  ctx.globalAlpha = 0.03;
  for (let x = 0; x < mw; x += 16) {
    for (let y = 0; y < mh; y += 16) {
      // Pseudo-random based on position
      const hash = ((x * 73856093) ^ (y * 19349663)) & 0xFF;
      if (hash < 80) {
        ctx.fillStyle = preset.lightColor;
        ctx.fillRect(x, y, 2 + (hash % 3), 2 + (hash % 2));
      }
    }
  }
  ctx.globalAlpha = 1;

  // Subtle grid lines for station theme
  if (planet === 'station') {
    ctx.strokeStyle = 'rgba(0,170,170,0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < mw; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, mh); ctx.stroke();
    }
    for (let y = 0; y < mh; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(mw, y); ctx.stroke();
    }
  }
}

// --- Post-processing (call AFTER all world rendering, in screen space) ---

// Vignette effect
export function renderVignette(ctx, w, h) {
  ctx.drawImage(getVignette(w, h), 0, 0);
}

// Scanline effect (very subtle)
export function renderScanlines(ctx, w, h) {
  ctx.globalAlpha = 0.5;
  ctx.drawImage(getScanlines(w, h), 0, 0);
  ctx.globalAlpha = 1;
}

// Color aberration effect (subtle)
export function renderAberration(ctx, w, h, intensity) {
  if (intensity <= 0) return;
  ctx.save();
  ctx.globalAlpha = intensity * 0.03;
  ctx.globalCompositeOperation = 'screen';
  // Shift red channel slightly
  ctx.drawImage(ctx.canvas, -1, 0);
  ctx.drawImage(ctx.canvas, 1, 0);
  ctx.restore();
}

// Full post-processing pass
export function postProcess(ctx, w, h, time) {
  renderVignette(ctx, w, h);
  renderScanlines(ctx, w, h);
}

// Clear ambient particles (on scene change)
export function clearAmbient() {
  ambientParticles.length = 0;
}

// Get preset for external use
export function getPreset(planet) {
  return AMBIENT_PRESETS[planet] || AMBIENT_PRESETS.forest;
}
