// ============================================
// EFFECTS — enhanced particles, screen effects
// The HEART of game feel — now with more juice!
// ============================================

// --- PARTICLES ---
const particles = [];
const MAX = 800;

export function emit(x, y, count, opts = {}) {
  const { color = '#ff0', speed = 2, speedVar = 1, life = 0.5, lifeVar = 0.2,
    size = 3, sizeVar = 1, gravity = 0, angle = null, spread = Math.PI * 2,
    friction = 0.98, glow = false, fadeColor = null, trail = false } = opts;
  for (let i = 0; i < count && particles.length < MAX; i++) {
    const a = angle !== null ? angle + (Math.random() - 0.5) * spread : Math.random() * Math.PI * 2;
    const s = speed + (Math.random() - 0.5) * speedVar * 2;
    const l = Math.max(0.1, life + (Math.random() - 0.5) * lifeVar * 2);
    particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: l, maxLife: l,
      size: Math.max(1, size + (Math.random() - 0.5) * sizeVar * 2),
      color, gravity, friction, glow, fadeColor, trail,
      prevX: x, prevY: y,
    });
  }
}

export function explosion(x, y, scale = 1) {
  // White flash core
  emit(x, y, Math.floor(6 * scale), { color: '#fff', speed: 1.5, life: 0.1, size: 10 * scale, glow: true });
  // Fire ring
  emit(x, y, Math.floor(18 * scale), { color: '#f80', speed: 3.5 * scale, speedVar: 2, life: 0.35, size: 4 * scale, gravity: 0.6, glow: true, fadeColor: '#840' });
  emit(x, y, Math.floor(12 * scale), { color: '#ff0', speed: 2.5 * scale, life: 0.28, size: 3 * scale, gravity: 0.4, fadeColor: '#a80' });
  // Sparks with trails
  emit(x, y, Math.floor(10 * scale), { color: '#fa0', speed: 5 * scale, speedVar: 3, life: 0.6, size: 2, gravity: 1.8, friction: 0.94, trail: true });
  // Smoke
  emit(x, y, Math.floor(8 * scale), { color: '#444', speed: 0.8, life: 1.0, size: 7 * scale, gravity: -0.6, friction: 0.97, fadeColor: '#222' });
  // Shockwave ring particles
  for (let a = 0; a < Math.PI * 2; a += Math.PI * 2 / 12) {
    emit(x, y, 1, { color: '#ff8', speed: 4 * scale, life: 0.15, size: 2, angle: a, spread: 0.1, glow: true });
  }
}

export function bulletTrail(x, y, angle) {
  emit(x, y, 1, { color: '#ff8', speed: 0.3, life: 0.15, size: 2, angle: angle + Math.PI, spread: 0.3 });
}

export function muzzleFlash(x, y, angle) {
  emit(x, y, 5, { color: '#ff8', speed: 3.5, life: 0.07, size: 5, angle, spread: 0.5, glow: true });
  emit(x, y, 3, { color: '#fff', speed: 1.5, life: 0.05, size: 4, glow: true });
  // Side sparks
  emit(x, y, 2, { color: '#fa0', speed: 2, life: 0.1, size: 2, angle: angle + Math.PI / 2, spread: 0.3 });
  emit(x, y, 2, { color: '#fa0', speed: 2, life: 0.1, size: 2, angle: angle - Math.PI / 2, spread: 0.3 });
}

export function impact(x, y, angle) {
  emit(x, y, 8, { color: '#ff0', speed: 2.5, speedVar: 1, life: 0.18, size: 2, angle: angle + Math.PI, spread: 1.0 });
  // Impact ring
  emit(x, y, 3, { color: '#fff', speed: 1, life: 0.06, size: 4, glow: true });
}

export function hitSpark(x, y, color = '#f44') {
  emit(x, y, 10, { color, speed: 3, speedVar: 1.5, life: 0.3, size: 3, gravity: 1.8, friction: 0.95, trail: true });
  // Flash
  emit(x, y, 2, { color: '#fff', speed: 0.5, life: 0.05, size: 6, glow: true });
}

export function deathEffect(x, y, color = '#f44') {
  // Big explosion
  explosion(x, y, 1.5);
  // Colored debris flying out
  emit(x, y, 16, { color, speed: 4, speedVar: 2, life: 0.7, size: 4, sizeVar: 2, gravity: 2.5, friction: 0.93, trail: true });
  // Soul/energy escape
  emit(x, y, 8, { color: '#fff', speed: 1.2, life: 1.0, size: 2, gravity: -2.0, friction: 0.99, glow: true });
  // Ground scorch mark particles
  emit(x, y, 6, { color: '#333', speed: 1.5, life: 1.5, size: 3, gravity: 0, friction: 0.85 });
}

export function engineTrail(x, y) {
  emit(x, y, 2, { color: '#f80', speed: 0.6, life: 0.25, size: 3, gravity: 0.5, fadeColor: '#840' });
  if (Math.random() > 0.4) emit(x, y, 1, { color: '#ff0', speed: 0.4, life: 0.15, size: 2, glow: true });
}

export function glitchBurst(x, y) {
  const colors = ['#f0f', '#0ff', '#ff0', '#f00', '#0f0'];
  emit(x, y, 15, { color: colors[Math.floor(Math.random() * colors.length)], speed: 4, life: 0.35, size: 3, glow: true });
  // Scanline disruption
  emit(x, y, 5, { color: '#fff', speed: 6, life: 0.08, size: 1, angle: 0, spread: 0.05, glow: true });
  emit(x, y, 5, { color: '#fff', speed: 6, life: 0.08, size: 1, angle: Math.PI, spread: 0.05, glow: true });
}

export function pickupEffect(x, y) {
  // Rising sparkles
  emit(x, y, 15, { color: '#ff0', speed: 2.5, life: 0.5, size: 3, gravity: -1.5, glow: true });
  emit(x, y, 8, { color: '#fff', speed: 2, life: 0.35, size: 2, gravity: -1.0 });
  // Ring
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    emit(x, y, 1, { color: '#ff0', speed: 3, life: 0.2, size: 2, angle: a, spread: 0.1, glow: true });
  }
}

// --- DAMAGE NUMBERS ---
const dmgNums = [];

export function damageNumber(x, y, amount, color = '#fff', big = false) {
  dmgNums.push({
    x: x + (Math.random() - 0.5) * 10, y,
    text: amount > 0 ? `-${amount}` : `+${Math.abs(amount)}`,
    color, life: big ? 1.4 : 0.9, vy: -2.0, big,
    scale: big ? 1.3 : 1.0,
  });
}

// --- SCREEN SHAKE ---
let shakeX = 0, shakeY = 0, shakeIntensity = 0, shakeTimer = 0;

export function shake(intensity = 5, duration = 0.15) {
  shakeIntensity = Math.max(shakeIntensity, intensity);
  shakeTimer = Math.max(shakeTimer, duration);
}

export function getShake() { return { x: shakeX, y: shakeY }; }

// --- HIT STOP ---
let hitStopTimer = 0;

export function hitStop(duration = 0.04) { hitStopTimer = Math.max(hitStopTimer, duration); }
export function isHitStopped() { return hitStopTimer > 0; }

// --- SCREEN FLASH ---
let flashAlpha = 0, flashColor = '#fff';

export function screenFlash(color = '#fff', alpha = 0.3) { flashColor = color; flashAlpha = alpha; }

// --- UPDATE ---
export function update(dt) {
  if (hitStopTimer > 0) { hitStopTimer -= dt; return; }

  // Shake
  if (shakeTimer > 0) {
    shakeTimer -= dt;
    shakeX = (Math.random() - 0.5) * shakeIntensity * 2;
    shakeY = (Math.random() - 0.5) * shakeIntensity * 2;
    shakeIntensity *= 0.88;
  } else { shakeX = 0; shakeY = 0; shakeIntensity = 0; }

  // Flash
  if (flashAlpha > 0) flashAlpha -= dt * 2.5;

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.prevX = p.x; p.prevY = p.y;
    p.vx *= p.friction; p.vy *= p.friction;
    p.x += p.vx; p.y += p.vy;
    p.vy += p.gravity * dt * 60;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Damage numbers
  for (let i = dmgNums.length - 1; i >= 0; i--) {
    dmgNums[i].y += dmgNums[i].vy;
    dmgNums[i].vy *= 0.96;
    dmgNums[i].life -= dt;
    if (dmgNums[i].life <= 0) dmgNums.splice(i, 1);
  }
}

// --- RENDER ---
export function renderWorld(ctx) {
  for (const p of particles) {
    const progress = 1 - p.life / p.maxLife;
    const alpha = Math.max(0, 1 - progress * 1.3);
    const sz = p.size * (1 - progress * 0.5);
    if (alpha < 0.02) continue;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Trail line
    if (p.trail && progress < 0.7) {
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = alpha * 0.4;
      ctx.lineWidth = Math.max(0.5, sz * 0.5);
      ctx.beginPath();
      ctx.moveTo(p.prevX, p.prevY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }

    // Color fading
    if (p.fadeColor && progress > 0.4) {
      ctx.fillStyle = p.fadeColor;
    } else {
      ctx.fillStyle = p.color;
    }

    if (p.glow) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = sz * 2.5;
    }
    ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
    ctx.restore();
  }

  // Damage numbers with outline
  for (const d of dmgNums) {
    const progress = 1 - d.life / (d.big ? 1.4 : 0.9);
    ctx.save();
    ctx.globalAlpha = Math.min(1, d.life * 2.5);
    const scale = d.scale * (1 + (1 - Math.min(1, d.life * 3)) * 0.2);
    ctx.font = d.big ? `bold ${Math.floor(16 * scale)}px "Orbitron", sans-serif` : `bold ${Math.floor(12 * scale)}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center';
    // Shadow/outline
    ctx.fillStyle = '#000';
    ctx.fillText(d.text, d.x + 1, d.y + 1);
    // Main text
    ctx.fillStyle = d.color;
    ctx.shadowColor = d.color;
    ctx.shadowBlur = d.big ? 6 : 3;
    ctx.fillText(d.text, d.x, d.y);
    ctx.restore();
  }
}

// --- SCREEN EFFECTS ---
export function renderScreen(ctx) {
  if (flashAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, flashAlpha);
    ctx.fillStyle = flashColor;
    ctx.fillRect(0, 0, 800, 600);
    ctx.restore();
  }
}

export function clear() { particles.length = 0; dmgNums.length = 0; }
