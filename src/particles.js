// ============================================
// PARTICLE SYSTEM — explosions, sparks, trails
// ============================================

const particles = [];
const damageNumbers = [];
const MAX_PARTICLES = 500;

// Create particle burst
export function emit(x, y, count, options = {}) {
  const {
    color = '#ff0',
    speed = 2,
    speedVar = 1,
    life = 0.5,
    lifeVar = 0.3,
    size = 3,
    sizeVar = 1,
    gravity = 0,
    angle = null,    // null = 360 degrees, otherwise specific angle
    spread = Math.PI * 2,
    fadeOut = true,
    shrink = true
  } = options;

  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const a = angle !== null
      ? angle + (Math.random() - 0.5) * spread
      : Math.random() * Math.PI * 2;
    const spd = speed + (Math.random() - 0.5) * speedVar * 2;
    const sz = size + (Math.random() - 0.5) * sizeVar * 2;
    const lf = life + (Math.random() - 0.5) * lifeVar * 2;

    particles.push({
      x, y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      life: lf,
      maxLife: lf,
      size: Math.max(1, sz),
      color,
      gravity,
      fadeOut,
      shrink
    });
  }
}

// Explosion effect
export function explosion(x, y, size = 1) {
  // Fire core
  emit(x, y, Math.floor(12 * size), {
    color: '#ff0', speed: 3 * size, life: 0.3, size: 4 * size, gravity: 0.5
  });
  // Outer sparks
  emit(x, y, Math.floor(8 * size), {
    color: '#f80', speed: 4 * size, life: 0.5, size: 2 * size, gravity: 0.3
  });
  // Smoke
  emit(x, y, Math.floor(6 * size), {
    color: '#555', speed: 1, life: 0.8, size: 6 * size, gravity: -0.3, shrink: false
  });
}

// Bullet impact sparks
export function impact(x, y, angle) {
  emit(x, y, 5, {
    color: '#ff0', speed: 2, life: 0.2, size: 2,
    angle: angle + Math.PI, spread: 1.0
  });
}

// Muzzle flash
export function muzzleFlash(x, y, angle) {
  emit(x, y, 3, {
    color: '#ff8', speed: 3, life: 0.08, size: 3,
    angle, spread: 0.5
  });
}

// Blood/hit effect
export function hitEffect(x, y, color = '#f44') {
  emit(x, y, 6, {
    color, speed: 2, life: 0.3, size: 3, gravity: 1
  });
}

// Engine trail
export function engineTrail(x, y, angle) {
  emit(x, y, 1, {
    color: '#f80', speed: 0.5, life: 0.3, size: 2,
    angle: angle + Math.PI, spread: 0.5
  });
  emit(x, y, 1, {
    color: '#ff0', speed: 0.3, life: 0.15, size: 1,
    angle: angle + Math.PI, spread: 0.3
  });
}

// Glitch particles
export function glitchBurst(x, y) {
  const colors = ['#f0f', '#0ff', '#ff0', '#f00'];
  emit(x, y, 8, {
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 3, life: 0.4, size: 2
  });
}

// Damage number floating up
export function damageNumber(x, y, amount, color = '#fff') {
  damageNumbers.push({
    x: x + (Math.random() - 0.5) * 10,
    y,
    text: `-${amount}`,
    color,
    life: 1.0,
    vy: -1.5
  });
}

// Update all particles
export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity * dt * 60;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const d = damageNumbers[i];
    d.y += d.vy;
    d.life -= dt;
    if (d.life <= 0) damageNumbers.splice(i, 1);
  }
}

// Render all particles (call within camera transform for world particles)
export function renderParticles(ctx) {
  for (const p of particles) {
    ctx.save();
    const progress = 1 - p.life / p.maxLife;
    ctx.globalAlpha = p.fadeOut ? Math.max(0, 1 - progress) : 0.8;
    const sz = p.shrink ? p.size * (1 - progress * 0.7) : p.size;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
    ctx.restore();
  }
}

// Render damage numbers (call within camera transform)
export function renderDamageNumbers(ctx) {
  for (const d of damageNumbers) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, d.life * 2);
    ctx.fillStyle = d.color;
    ctx.font = 'bold 12px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(d.text, d.x, d.y);
    ctx.restore();
  }
}

// Clear all
export function clearParticles() {
  particles.length = 0;
  damageNumbers.length = 0;
}
