// ============================================
// ATMOSPHERE — cinematic visual effects engine
// Parallax backgrounds, ambient particles, fog,
// vignette, dynamic lighting, weather, horizon
// ============================================

// --- Ambient particles ---
const ambientParticles = [];
const MAX_AMBIENT = 180;

const AMBIENT_PRESETS = {
  forest: {
    types: [
      { color: '#4a8', chance: 0.4, size: [1, 3], speed: [0.1, 0.4], life: [4, 8], drift: 0.3, glow: false },
      { color: '#8f8', chance: 0.25, size: [1, 2], speed: [0.05, 0.2], life: [5, 10], drift: 0.15, glow: true },
      { color: '#ff8', chance: 0.15, size: [1, 1], speed: [0.02, 0.1], life: [6, 12], drift: 0.1, glow: true },
    ],
    fogColor: [10, 40, 10],
    fogDensity: 0.1,
    skyColors: ['#010804', '#020f05', '#061808', '#0a2a0a'],
    nebulaColor: 'rgba(15,60,15,0.06)',
    lightColor: '#2a6a2a',
    horizonGlow: '#0a3a0a',
    weatherType: 'none',
  },
  desert: {
    types: [
      { color: '#c8a060', chance: 0.5, size: [1, 2], speed: [0.3, 0.8], life: [3, 6], drift: 0.6, glow: false },
      { color: '#e0c080', chance: 0.3, size: [1, 1], speed: [0.5, 1.2], life: [2, 4], drift: 0.8, glow: false },
      { color: '#ffa040', chance: 0.05, size: [1, 2], speed: [0.1, 0.3], life: [4, 7], drift: 0.2, glow: true },
    ],
    fogColor: [40, 30, 10],
    fogDensity: 0.07,
    skyColors: ['#1a1508', '#1f180a', '#2a2010', '#1a1005'],
    nebulaColor: 'rgba(60,40,10,0.05)',
    lightColor: '#6a5a2a',
    horizonGlow: '#3a2a0a',
    weatherType: 'sandstorm',
  },
  ice: {
    types: [
      { color: '#cdf', chance: 0.6, size: [1, 3], speed: [0.15, 0.5], life: [5, 10], drift: 0.4, glow: false },
      { color: '#eef', chance: 0.3, size: [2, 4], speed: [0.1, 0.3], life: [6, 12], drift: 0.2, glow: false },
      { color: '#8cf', chance: 0.1, size: [1, 2], speed: [0.05, 0.15], life: [8, 14], drift: 0.1, glow: true },
    ],
    fogColor: [15, 15, 35],
    fogDensity: 0.12,
    skyColors: ['#030308', '#050510', '#0a0a20', '#080818'],
    nebulaColor: 'rgba(20,30,80,0.06)',
    lightColor: '#4a6a9a',
    horizonGlow: '#1a2a5a',
    weatherType: 'snow',
  },
  crystal: {
    types: [
      { color: '#c0f', chance: 0.35, size: [1, 2], speed: [0.08, 0.25], life: [5, 10], drift: 0.15, glow: true },
      { color: '#80f', chance: 0.25, size: [1, 3], speed: [0.05, 0.15], life: [6, 12], drift: 0.1, glow: true },
      { color: '#f0f', chance: 0.1, size: [1, 1], speed: [0.03, 0.1], life: [8, 16], drift: 0.08, glow: true },
      { color: '#a0f8ff', chance: 0.05, size: [2, 3], speed: [0.02, 0.08], life: [10, 18], drift: 0.05, glow: true },
    ],
    fogColor: [20, 5, 30],
    fogDensity: 0.08,
    skyColors: ['#050110', '#0a0318', '#10051a', '#0a0215'],
    nebulaColor: 'rgba(40,10,60,0.08)',
    lightColor: '#6a2a8a',
    horizonGlow: '#3a1a5a',
    weatherType: 'none',
  },
  volcanic: {
    types: [
      { color: '#f80', chance: 0.5, size: [1, 3], speed: [0.3, 1.0], life: [2, 5], drift: 0.2, glow: true },
      { color: '#f40', chance: 0.3, size: [1, 3], speed: [0.2, 0.6], life: [3, 6], drift: 0.15, glow: true },
      { color: '#444', chance: 0.3, size: [2, 5], speed: [0.1, 0.3], life: [4, 8], drift: 0.3, glow: false },
      { color: '#ff0', chance: 0.08, size: [1, 1], speed: [0.5, 1.5], life: [1, 3], drift: 0.1, glow: true },
    ],
    fogColor: [30, 10, 5],
    fogDensity: 0.11,
    skyColors: ['#120502', '#1a0805', '#2a1008', '#150502'],
    nebulaColor: 'rgba(60,20,5,0.08)',
    lightColor: '#8a3a1a',
    horizonGlow: '#5a1a08',
    weatherType: 'embers',
  },
  ruins: {
    types: [
      { color: '#889', chance: 0.3, size: [1, 2], speed: [0.1, 0.3], life: [5, 10], drift: 0.2, glow: false },
      { color: '#667', chance: 0.2, size: [1, 1], speed: [0.05, 0.15], life: [6, 12], drift: 0.15, glow: false },
      { color: '#0af', chance: 0.1, size: [1, 2], speed: [0.03, 0.1], life: [8, 14], drift: 0.05, glow: true },
    ],
    fogColor: [10, 10, 15],
    fogDensity: 0.09,
    skyColors: ['#040406', '#060608', '#0a0a0d', '#080810'],
    nebulaColor: 'rgba(20,20,40,0.05)',
    lightColor: '#3a3a5a',
    horizonGlow: '#1a1a3a',
    weatherType: 'none',
  },
  station: {
    types: [
      { color: '#0aa', chance: 0.2, size: [1, 1], speed: [0.05, 0.15], life: [6, 12], drift: 0.05, glow: true },
      { color: '#555', chance: 0.2, size: [1, 2], speed: [0.08, 0.2], life: [4, 8], drift: 0.1, glow: false },
      { color: '#ff0', chance: 0.03, size: [1, 1], speed: [0.8, 1.5], life: [0.5, 1.5], drift: 0.02, glow: true },
    ],
    fogColor: [8, 8, 16],
    fogDensity: 0.06,
    skyColors: ['#020204', '#040408', '#080810', '#060610'],
    nebulaColor: 'rgba(10,30,40,0.04)',
    lightColor: '#2a4a5a',
    horizonGlow: '#0a2a3a',
    weatherType: 'none',
  }
};

// --- Parallax star layers (cached) ---
const starLayers = [];
function initStars() {
  if (starLayers.length > 0) return;
  for (let layer = 0; layer < 4; layer++) {
    const stars = [];
    const count = [80, 50, 30, 12][layer];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * 1600,
        y: Math.random() * 1200,
        size: [1, 1, 1.5, 2.5][layer],
        brightness: 0.1 + Math.random() * 0.25 + layer * 0.1,
        twinkleSpeed: 0.8 + Math.random() * 3,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: ['#99a', '#aa9', '#aaa', '#99c', '#cc9', '#9cf', '#fc9'][Math.floor(Math.random() * 7)]
      });
    }
    starLayers.push({ stars, speed: [0.01, 0.03, 0.07, 0.12][layer] });
  }
}

// --- Pre-rendered textures (cached) ---
let vignetteCanvas = null;
function getVignette(w, h) {
  if (vignetteCanvas && vignetteCanvas.width === w) return vignetteCanvas;
  vignetteCanvas = document.createElement('canvas');
  vignetteCanvas.width = w; vignetteCanvas.height = h;
  const vc = vignetteCanvas.getContext('2d');
  const g = vc.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
  g.addColorStop(0, 'transparent');
  g.addColorStop(0.6, 'rgba(0,0,0,0.12)');
  g.addColorStop(0.85, 'rgba(0,0,0,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0.6)');
  vc.fillStyle = g;
  vc.fillRect(0, 0, w, h);
  return vignetteCanvas;
}

let scanCanvas = null;
function getScanlines(w, h) {
  if (scanCanvas && scanCanvas.width === w) return scanCanvas;
  scanCanvas = document.createElement('canvas');
  scanCanvas.width = w; scanCanvas.height = h;
  const sc = scanCanvas.getContext('2d');
  sc.fillStyle = 'rgba(0,0,0,0.035)';
  for (let y = 0; y < h; y += 3) sc.fillRect(0, y, w, 1);
  return scanCanvas;
}

// --- Ground texture cache ---
const groundTextures = {};
function getGroundTexture(planet, mw, mh) {
  const key = planet + mw + mh;
  if (groundTextures[key]) return groundTextures[key];
  const c = document.createElement('canvas');
  c.width = mw; c.height = mh;
  const gc = c.getContext('2d');
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) return null;

  // Noise-like texture
  gc.globalAlpha = 0.04;
  for (let x = 0; x < mw; x += 12) {
    for (let y = 0; y < mh; y += 12) {
      const hash = ((x * 73856093) ^ (y * 19349663)) & 0xFF;
      if (hash < 90) {
        gc.fillStyle = preset.lightColor;
        gc.fillRect(x, y, 1 + (hash % 3), 1 + (hash % 2));
      }
    }
  }
  gc.globalAlpha = 1;

  // Grid for station
  if (planet === 'station') {
    gc.strokeStyle = 'rgba(0,170,170,0.025)';
    gc.lineWidth = 1;
    for (let x = 0; x < mw; x += 60) {
      gc.beginPath(); gc.moveTo(x, 0); gc.lineTo(x, mh); gc.stroke();
    }
    for (let y = 0; y < mh; y += 60) {
      gc.beginPath(); gc.moveTo(0, y); gc.lineTo(mw, y); gc.stroke();
    }
  }

  // Organic ground marks for natural planets
  if (['forest', 'desert', 'ice', 'volcanic'].includes(planet)) {
    gc.globalAlpha = 0.02;
    for (let i = 0; i < 15; i++) {
      const cx = Math.random() * mw, cy = Math.random() * mh;
      const r = 20 + Math.random() * 60;
      const gg = gc.createRadialGradient(cx, cy, 0, cx, cy, r);
      gg.addColorStop(0, preset.lightColor);
      gg.addColorStop(1, 'transparent');
      gc.fillStyle = gg;
      gc.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    gc.globalAlpha = 1;
  }

  groundTextures[key] = c;
  return c;
}

// ============================================
// PUBLIC API
// ============================================

export function updateAmbient(dt, planet, camX, camY, mw, mh) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) return;
  for (const type of preset.types) {
    if (ambientParticles.length >= MAX_AMBIENT) break;
    if (Math.random() < type.chance * dt * 10) {
      const sz = type.size[0] + Math.random() * (type.size[1] - type.size[0]);
      const spd = type.speed[0] + Math.random() * (type.speed[1] - type.speed[0]);
      const life = type.life[0] + Math.random() * (type.life[1] - type.life[0]);
      ambientParticles.push({
        x: camX + Math.random() * 850 - 25,
        y: camY + Math.random() * 650 - 25,
        vx: (Math.random() - 0.5) * type.drift * 2,
        vy: -spd + (Math.random() - 0.3) * spd * 0.5,
        size: sz, life, maxLife: life,
        color: type.color, glow: type.glow,
        drift: type.drift, driftPhase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2,
      });
    }
  }
  for (let i = ambientParticles.length - 1; i >= 0; i--) {
    const p = ambientParticles[i];
    p.driftPhase += dt * 1.5;
    p.x += p.vx + Math.sin(p.driftPhase) * p.drift * 0.5;
    p.y += p.vy;
    p.rotation += p.rotSpeed * dt;
    p.life -= dt;
    if (p.life <= 0) ambientParticles.splice(i, 1);
  }
}

// Sky with multi-stop gradient and subtle nebula
export function renderSky(ctx, planet, w, h) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); return; }
  const colors = preset.skyColors;
  const g = ctx.createLinearGradient(0, 0, w * 0.3, h);
  for (let i = 0; i < colors.length; i++) g.addColorStop(i / (colors.length - 1), colors[i]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

// Parallax stars with twinkle
export function renderStars(ctx, time, camX, camY, w, h) {
  initStars();
  for (const layer of starLayers) {
    for (const s of layer.stars) {
      const sx = ((s.x - camX * layer.speed) % (w + 60)) - 30;
      const sy = ((s.y - camY * layer.speed) % (h + 60)) - 30;
      const twinkle = 0.4 + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.6;
      if (twinkle < 0.1) continue;
      ctx.globalAlpha = s.brightness * Math.max(0, twinkle);
      ctx.fillStyle = s.color;
      if (s.size >= 2) {
        ctx.shadowColor = s.color; ctx.shadowBlur = 4;
        // Cross shape for big stars
        ctx.fillRect(sx - 1, sy, 3, 1);
        ctx.fillRect(sx, sy - 1, 1, 3);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillRect(sx, sy, s.size, s.size);
      }
    }
  }
  ctx.globalAlpha = 1;
}

// Nebula clouds in background
export function renderNebulae(ctx, planet, time, w, h) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) return;
  // 2-3 nebula patches per planet
  const nebulae = [
    { x: w * 0.7, y: h * 0.3, r: 180, phase: 0 },
    { x: w * 0.2, y: h * 0.7, r: 140, phase: 2 },
    { x: w * 0.5, y: h * 0.15, r: 100, phase: 4 },
  ];
  for (const n of nebulae) {
    const pulse = 0.7 + Math.sin(time * 0.3 + n.phase) * 0.3;
    const g = ctx.createRadialGradient(n.x, n.y, n.r * 0.1, n.x, n.y, n.r * pulse);
    g.addColorStop(0, preset.nebulaColor);
    g.addColorStop(0.6, preset.nebulaColor.replace(/[\d.]+\)$/, '0.02)'));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
  }
}

// Ambient particles in world space
export function renderAmbientWorld(ctx) {
  for (const p of ambientParticles) {
    const progress = 1 - p.life / p.maxLife;
    const alpha = Math.min(1, p.life * 2 / p.maxLife) * (1 - progress * 0.7) * (p.glow ? 0.75 : 0.5);
    if (alpha < 0.02) continue;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    if (p.size > 2) ctx.rotate(p.rotation);
    if (p.glow) { ctx.shadowColor = p.color; ctx.shadowBlur = p.size * 4; }
    ctx.fillStyle = p.color;
    const sz = p.size * (1 - progress * 0.3);
    ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
    ctx.restore();
  }
}

// Fog system — bottom layer + drifting patches
export function renderFog(ctx, planet, time, mw, mh) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset || preset.fogDensity <= 0) return;
  const [fr, fg, fb] = preset.fogColor;

  // Bottom fog gradient
  const fh = mh * 0.4;
  const g = ctx.createLinearGradient(0, mh - fh, 0, mh);
  g.addColorStop(0, 'transparent');
  g.addColorStop(0.4, `rgba(${fr},${fg},${fb},${preset.fogDensity * 0.3})`);
  g.addColorStop(1, `rgba(${fr},${fg},${fb},${preset.fogDensity})`);
  ctx.fillStyle = g; ctx.fillRect(0, mh - fh, mw, fh);

  // Top fog (thinner)
  const tg = ctx.createLinearGradient(0, 0, 0, mh * 0.25);
  tg.addColorStop(0, `rgba(${fr},${fg},${fb},${preset.fogDensity * 0.5})`);
  tg.addColorStop(1, 'transparent');
  ctx.fillStyle = tg; ctx.fillRect(0, 0, mw, mh * 0.25);

  // Drifting fog patches
  for (let i = 0; i < 5; i++) {
    const fx = ((i * 380 + time * (10 + i * 3)) % (mw + 400)) - 200;
    const fy = mh * 0.3 + i * 120 + Math.sin(time * 0.4 + i * 1.5) * 40;
    const fw = 200 + i * 50;
    const ffh = 50 + i * 15;
    const ffg = ctx.createRadialGradient(fx + fw / 2, fy, 5, fx + fw / 2, fy, fw / 2);
    ffg.addColorStop(0, `rgba(${fr},${fg},${fb},${preset.fogDensity * 0.35})`);
    ffg.addColorStop(1, 'transparent');
    ctx.fillStyle = ffg;
    ctx.fillRect(fx, fy - ffh / 2, fw, ffh);
  }
}

// Horizon glow effect at map edges
export function renderHorizon(ctx, planet, mw, mh) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) return;
  // Bottom edge glow
  ctx.save();
  ctx.globalAlpha = 0.15;
  const hg = ctx.createLinearGradient(0, mh - 60, 0, mh);
  hg.addColorStop(0, 'transparent');
  hg.addColorStop(1, preset.horizonGlow);
  ctx.fillStyle = hg; ctx.fillRect(0, mh - 60, mw, 60);
  // Side edge glows
  const lg = ctx.createLinearGradient(0, 0, 40, 0);
  lg.addColorStop(0, preset.horizonGlow); lg.addColorStop(1, 'transparent');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, 40, mh);
  const rg = ctx.createLinearGradient(mw, 0, mw - 40, 0);
  rg.addColorStop(0, preset.horizonGlow); rg.addColorStop(1, 'transparent');
  ctx.fillStyle = rg; ctx.fillRect(mw - 40, 0, 40, mh);
  ctx.restore();
}

// Dynamic lights for entities
export function renderLights(ctx, planet, playerX, playerY, enemies, boss, time) {
  const preset = AMBIENT_PRESETS[planet];
  if (!preset) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Player glow — pulsing cyan light
  const playerPulse = 0.07 + Math.sin(time * 2.5) * 0.02;
  ctx.globalAlpha = playerPulse;
  const pg = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, 90);
  pg.addColorStop(0, '#0ff');
  pg.addColorStop(0.4, '#088');
  pg.addColorStop(1, 'transparent');
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.arc(playerX, playerY, 90, 0, Math.PI * 2); ctx.fill();

  // Enemy glows
  for (const e of enemies) {
    if (!e.alive) continue;
    ctx.globalAlpha = 0.045;
    const eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 55);
    eg.addColorStop(0, e.c || '#f44');
    eg.addColorStop(0.5, (e.c || '#f44') + '44');
    eg.addColorStop(1, 'transparent');
    ctx.fillStyle = eg;
    ctx.beginPath(); ctx.arc(e.x, e.y, 55, 0, Math.PI * 2); ctx.fill();
  }

  // Boss glow — menacing pulsing red
  if (boss?.alive) {
    const pulse = 0.06 + Math.sin(time * 3) * 0.03;
    ctx.globalAlpha = pulse;
    const bg = ctx.createRadialGradient(boss.x, boss.y, 0, boss.x, boss.y, 120);
    bg.addColorStop(0, '#f44');
    bg.addColorStop(0.3, '#a22');
    bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(boss.x, boss.y, 120, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

// Enhanced ground texture (cached)
export function renderGround(ctx, planet, mw, mh) {
  const tex = getGroundTexture(planet, mw, mh);
  if (tex) ctx.drawImage(tex, 0, 0);
}

// --- Post-processing ---
export function renderVignette(ctx, w, h) {
  ctx.drawImage(getVignette(w, h), 0, 0);
}

export function renderScanlines(ctx, w, h) {
  ctx.globalAlpha = 0.4;
  ctx.drawImage(getScanlines(w, h), 0, 0);
  ctx.globalAlpha = 1;
}

export function postProcess(ctx, w, h, time) {
  renderVignette(ctx, w, h);
  renderScanlines(ctx, w, h);
}

export function clearAmbient() { ambientParticles.length = 0; }
export function getPreset(planet) { return AMBIENT_PRESETS[planet] || AMBIENT_PRESETS.forest; }
