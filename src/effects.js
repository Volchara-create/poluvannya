// ============================================
// EFFECTS — particles, screen shake, hit stop, damage numbers
// The HEART of game feel
// ============================================

// --- PARTICLES ---
const particles = [];
const MAX = 600;

export function emit(x, y, count, opts = {}) {
  const { color = '#ff0', speed = 2, speedVar = 1, life = 0.5, lifeVar = 0.2,
    size = 3, sizeVar = 1, gravity = 0, angle = null, spread = Math.PI * 2,
    friction = 0.98, glow = false } = opts;
  for (let i = 0; i < count && particles.length < MAX; i++) {
    const a = angle !== null ? angle + (Math.random() - 0.5) * spread : Math.random() * Math.PI * 2;
    const s = speed + (Math.random() - 0.5) * speedVar * 2;
    const l = Math.max(0.1, life + (Math.random() - 0.5) * lifeVar * 2);
    particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: l, maxLife: l,
      size: Math.max(1, size + (Math.random() - 0.5) * sizeVar * 2),
      color, gravity, friction, glow
    });
  }
}

export function explosion(x, y, scale = 1) {
  // White flash core
  emit(x, y, Math.floor(5 * scale), { color: '#fff', speed: 1, life: 0.08, size: 8 * scale, glow: true });
  // Fire
  emit(x, y, Math.floor(15 * scale), { color: '#f80', speed: 3 * scale, speedVar: 2, life: 0.3, size: 4 * scale, gravity: 0.8, glow: true });
  emit(x, y, Math.floor(10 * scale), { color: '#ff0', speed: 2 * scale, life: 0.25, size: 3 * scale, gravity: 0.5 });
  // Sparks (long life, small)
  emit(x, y, Math.floor(8 * scale), { color: '#fa0', speed: 4 * scale, speedVar: 2, life: 0.5, size: 2, gravity: 1.5, friction: 0.95 });
  // Smoke
  emit(x, y, Math.floor(6 * scale), { color: '#333', speed: 0.8, life: 0.8, size: 6 * scale, gravity: -0.5, friction: 0.97 });
}

export function bulletTrail(x, y, angle) {
  emit(x, y, 1, { color: '#ff8', speed: 0.3, life: 0.12, size: 2, angle: angle + Math.PI, spread: 0.3 });
}

export function muzzleFlash(x, y, angle) {
  emit(x, y, 4, { color: '#ff8', speed: 3, life: 0.06, size: 4, angle, spread: 0.6, glow: true });
  emit(x, y, 2, { color: '#fff', speed: 1, life: 0.04, size: 3, glow: true });
}

export function impact(x, y, angle) {
  emit(x, y, 6, { color: '#ff0', speed: 2, speedVar: 1, life: 0.15, size: 2, angle: angle + Math.PI, spread: 1.2 });
}

export function hitSpark(x, y, color = '#f44') {
  emit(x, y, 8, { color, speed: 2.5, speedVar: 1, life: 0.25, size: 3, gravity: 1.5, friction: 0.96 });
}

export function deathEffect(x, y, color = '#f44') {
  // Big explosion + pixel debris
  explosion(x, y, 1.2);
  // Colored debris flying out
  emit(x, y, 12, { color, speed: 3, speedVar: 2, life: 0.6, size: 4, sizeVar: 2, gravity: 2, friction: 0.94 });
  // Soul/energy escape
  emit(x, y, 5, { color: '#fff', speed: 1, life: 0.8, size: 2, gravity: -1.5, friction: 0.99, glow: true });
}

export function engineTrail(x, y) {
  emit(x, y, 1, { color: '#f80', speed: 0.5, life: 0.2, size: 3, gravity: 0.5 });
  if (Math.random() > 0.5) emit(x, y, 1, { color: '#ff0', speed: 0.3, life: 0.1, size: 2 });
}

export function glitchBurst(x, y) {
  const colors = ['#f0f', '#0ff', '#ff0', '#f00', '#0f0'];
  emit(x, y, 10, { color: colors[Math.floor(Math.random() * colors.length)], speed: 3, life: 0.3, size: 3, glow: true });
}

export function pickupEffect(x, y) {
  emit(x, y, 12, { color: '#ff0', speed: 2, life: 0.4, size: 3, gravity: -1, glow: true });
  emit(x, y, 6, { color: '#fff', speed: 1.5, life: 0.3, size: 2, gravity: -0.5 });
}

// --- DAMAGE NUMBERS ---
const dmgNums = [];

export function damageNumber(x, y, amount, color = '#fff', big = false) {
  dmgNums.push({
    x: x + (Math.random() - 0.5) * 8, y,
    text: amount > 0 ? `-${amount}` : `+${Math.abs(amount)}`,
    color, life: big ? 1.2 : 0.8, vy: -1.8, big
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
  // Hit stop
  if (hitStopTimer > 0) { hitStopTimer -= dt; return; } // freeze everything during hit stop

  // Shake
  if (shakeTimer > 0) {
    shakeTimer -= dt;
    shakeX = (Math.random() - 0.5) * shakeIntensity * 2;
    shakeY = (Math.random() - 0.5) * shakeIntensity * 2;
    shakeIntensity *= 0.9;
  } else { shakeX = 0; shakeY = 0; shakeIntensity = 0; }

  // Flash
  if (flashAlpha > 0) flashAlpha -= dt * 3;

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vx *= p.friction; p.vy *= p.friction;
    p.x += p.vx; p.y += p.vy;
    p.vy += p.gravity * dt * 60;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Damage numbers
  for (let i = dmgNums.length - 1; i >= 0; i--) {
    dmgNums[i].y += dmgNums[i].vy;
    dmgNums[i].vy *= 0.97;
    dmgNums[i].life -= dt;
    if (dmgNums[i].life <= 0) dmgNums.splice(i, 1);
  }
}

// --- RENDER (call inside camera transform for world-space) ---
export function renderWorld(ctx) {
  // Particles
  for (const p of particles) {
    const progress = 1 - p.life / p.maxLife;
    const alpha = Math.max(0, 1 - progress * 1.2);
    const sz = p.size * (1 - progress * 0.6);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.glow) { ctx.shadowColor = p.color; ctx.shadowBlur = sz * 2; }
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
    ctx.restore();
  }

  // Damage numbers
  for (const d of dmgNums) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, d.life * 2.5);
    ctx.fillStyle = d.color;
    ctx.font = d.big ? 'bold 16px "Orbitron", sans-serif' : 'bold 11px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 2;
    ctx.fillText(d.text, d.x, d.y);
    ctx.restore();
  }
}

// --- RENDER SCREEN EFFECTS (call after camera restore) ---
export function renderScreen(ctx) {
  if (flashAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = flashColor;
    ctx.fillRect(0, 0, 800, 600);
    ctx.restore();
  }
}

export function clear() { particles.length = 0; dmgNums.length = 0; }
