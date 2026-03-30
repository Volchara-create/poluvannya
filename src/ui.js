// ============================================
// UI — HUD, buttons, HP bars, notifications, transitions
// Enhanced with gradients, glow effects, rounded edges
// ============================================

// --- Notifications ---
const notifications = [];

export function notify(text) { notifications.push({ text, timer: 3 }); }

export function renderNotifications(ctx, dt) {
  for (let i = notifications.length - 1; i >= 0; i--) {
    const n = notifications[i];
    n.timer -= dt;
    if (n.timer <= 0) { notifications.splice(i, 1); continue; }
    const a = Math.min(1, n.timer);
    const slideIn = Math.min(1, (3 - n.timer) * 5); // Slide in animation
    const yOff = i * 40 + (1 - slideIn) * -20;
    ctx.save();
    ctx.globalAlpha = a * slideIn;

    // Background with gradient
    const ng = ctx.createLinearGradient(250, 8 + yOff, 550, 8 + yOff);
    ng.addColorStop(0, 'rgba(0,40,40,0.9)');
    ng.addColorStop(0.5, 'rgba(0,30,30,0.95)');
    ng.addColorStop(1, 'rgba(0,40,40,0.9)');
    ctx.fillStyle = ng;
    ctx.fillRect(250, 8 + yOff, 300, 30);

    // Glow border
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 6;
    ctx.strokeRect(250, 8 + yOff, 300, 30);
    ctx.shadowBlur = 0;

    // Corner accents
    ctx.fillStyle = '#0ff';
    ctx.fillRect(250, 8 + yOff, 8, 1);
    ctx.fillRect(250, 8 + yOff, 1, 8);
    ctx.fillRect(542, 8 + yOff, 8, 1);
    ctx.fillRect(549, 8 + yOff, 1, 8);
    ctx.fillRect(250, 37 + yOff, 8, 1);
    ctx.fillRect(250, 30 + yOff, 1, 8);
    ctx.fillRect(542, 37 + yOff, 8, 1);
    ctx.fillRect(549, 30 + yOff, 1, 8);

    // Text with glow
    ctx.fillStyle = '#0ff';
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 4;
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(n.text, 400, 28 + yOff);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// --- Fade transition ---
let fade = { alpha: 0, dir: 'none', speed: 2.5, cb: null };

export function fadeOut(speed = 2.5, cb) { fade = { alpha: 0, dir: 'out', speed, cb }; }
export function fadeIn(speed = 2.5) { fade = { alpha: 1, dir: 'in', speed, cb: null }; }
export function isFading() { return fade.dir === 'out'; }

export function renderFade(ctx, dt) {
  if (fade.dir === 'none') return;
  if (fade.dir === 'out') {
    fade.alpha += dt * fade.speed;
    if (fade.alpha >= 1) { fade.alpha = 1; if (fade.cb) fade.cb(); fade.dir = 'in'; fade.cb = null; }
  } else {
    fade.alpha -= dt * fade.speed;
    if (fade.alpha <= 0) { fade.alpha = 0; fade.dir = 'none'; }
  }
  ctx.save();
  ctx.globalAlpha = fade.alpha;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);
  ctx.restore();
}

// --- HP Bar (enhanced with gradient, glow, segmented look) ---
export function hpBar(ctx, x, y, w, h, cur, max, color = '#0f0') {
  const r = Math.max(0, cur / max);

  // Background with depth
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#151515';
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

  // Color based on health
  const c = r > 0.5 ? color : r > 0.25 ? '#ff0' : '#f00';

  // Gradient fill
  const fillW = (w - 2) * r;
  if (fillW > 0) {
    const hg = ctx.createLinearGradient(x + 1, y, x + 1, y + h);
    hg.addColorStop(0, c);
    hg.addColorStop(0.4, c);
    hg.addColorStop(0.5, lightenColor(c, 0.3));
    hg.addColorStop(0.6, c);
    hg.addColorStop(1, darkenColor(c, 0.4));
    ctx.fillStyle = hg;
    ctx.fillRect(x + 1, y + 1, fillW, h - 2);

    // Shine on top
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x + 1, y + 1, fillW, Math.max(1, Math.floor(h / 3)));

    // Glow at the end of the bar
    if (h > 4) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.shadowColor = c;
      ctx.shadowBlur = 4;
      ctx.fillStyle = c;
      ctx.fillRect(x + fillW - 2, y + 1, 3, h - 2);
      ctx.restore();
    }
  }

  // Border with subtle glow
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // Segment lines for bigger bars
  if (w > 60 && h > 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    const segW = w / 10;
    for (let sx = x + segW; sx < x + w - 1; sx += segW) {
      ctx.fillRect(sx, y + 1, 1, h - 2);
    }
  }
}

// --- Button (enhanced with gradient, hover glow, corner details) ---
export function button(ctx, x, y, w, h, text, mx, my) {
  const hover = mx >= x && mx <= x + w && my >= y && my <= y + h;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x + 2, y + 2, w, h);

  // Body gradient
  const bg = ctx.createLinearGradient(x, y, x, y + h);
  if (hover) {
    bg.addColorStop(0, '#1a5a5a');
    bg.addColorStop(0.5, '#0e3a3a');
    bg.addColorStop(1, '#0a2a2a');
  } else {
    bg.addColorStop(0, '#0e2e2e');
    bg.addColorStop(0.5, '#082020');
    bg.addColorStop(1, '#061818');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);

  // Top highlight
  ctx.fillStyle = hover ? 'rgba(0,255,255,0.15)' : 'rgba(0,255,255,0.05)';
  ctx.fillRect(x + 1, y + 1, w - 2, Math.floor(h / 3));

  // Border with glow on hover
  if (hover) {
    ctx.save();
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  } else {
    ctx.strokeStyle = '#066';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }

  // Corner accents
  const cl = 6;
  ctx.fillStyle = hover ? '#0ff' : '#066';
  // Top-left
  ctx.fillRect(x, y, cl, 1);
  ctx.fillRect(x, y, 1, cl);
  // Top-right
  ctx.fillRect(x + w - cl, y, cl, 1);
  ctx.fillRect(x + w - 1, y, 1, cl);
  // Bottom-left
  ctx.fillRect(x, y + h - 1, cl, 1);
  ctx.fillRect(x, y + h - cl, 1, cl);
  // Bottom-right
  ctx.fillRect(x + w - cl, y + h - 1, cl, 1);
  ctx.fillRect(x + w - 1, y + h - cl, 1, cl);

  // Text with optional glow
  ctx.fillStyle = hover ? '#fff' : '#0cc';
  if (hover) {
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 4;
  }
  ctx.font = '13px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.shadowBlur = 0;
  return hover;
}

// --- Color helpers ---
function parseHex(hex) {
  hex = hex.replace('#', '');
  // Handle 3-char hex (#0f0 -> 00ff00)
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
}

function lightenColor(hex, amount) {
  const [r,g,b] = parseHex(hex);
  return `rgb(${Math.min(255,Math.floor(r+(255-r)*amount))},${Math.min(255,Math.floor(g+(255-g)*amount))},${Math.min(255,Math.floor(b+(255-b)*amount))})`;
}

function darkenColor(hex, amount) {
  const [r,g,b] = parseHex(hex);
  return `rgb(${Math.max(0,Math.floor(r*(1-amount)))},${Math.max(0,Math.floor(g*(1-amount)))},${Math.max(0,Math.floor(b*(1-amount)))})`;
}
