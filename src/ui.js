// ============================================
// UI — HUD, buttons, HP bars, notifications, transitions
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
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,30,30,0.85)';
    ctx.fillRect(250, 8 + i * 36, 300, 28);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(250, 8 + i * 36, 300, 28);
    ctx.fillStyle = '#0ff';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(n.text, 400, 27 + i * 36);
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

// --- HP Bar ---
export function hpBar(ctx, x, y, w, h, cur, max, color = '#0f0') {
  const r = Math.max(0, cur / max);
  // BG
  ctx.fillStyle = '#111';
  ctx.fillRect(x, y, w, h);
  // Fill
  const c = r > 0.5 ? color : r > 0.25 ? '#ff0' : '#f00';
  ctx.fillStyle = c;
  ctx.fillRect(x + 1, y + 1, (w - 2) * r, h - 2);
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(x + 1, y + 1, (w - 2) * r, Math.floor(h / 3));
  // Border
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

// --- Button ---
export function button(ctx, x, y, w, h, text, mx, my) {
  const hover = mx >= x && mx <= x + w && my >= y && my <= y + h;
  // Shadow
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 2, y + 2, w, h);
  // Body
  ctx.fillStyle = hover ? '#1a4a4a' : '#0a2828';
  ctx.fillRect(x, y, w, h);
  // Highlight
  ctx.fillStyle = hover ? 'rgba(0,255,255,0.12)' : 'rgba(0,255,255,0.04)';
  ctx.fillRect(x + 1, y + 1, w - 2, h / 3);
  // Border
  ctx.strokeStyle = hover ? '#0ff' : '#055';
  ctx.lineWidth = hover ? 2 : 1;
  ctx.strokeRect(x, y, w, h);
  // Text
  ctx.fillStyle = hover ? '#fff' : '#0cc';
  ctx.font = '13px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  return hover;
}
