// ============================================
// RENDERER — pixel art drawing helpers, UI, transitions
// ============================================

import { mouseX, mouseY, isButtonHover } from './input.js';

// Screen transition
let transition = { active: false, alpha: 0, direction: 'in', speed: 2, callback: null };

export function fadeOut(speed = 2, callback) {
  transition = { active: true, alpha: 0, direction: 'out', speed, callback };
}

export function fadeIn(speed = 2) {
  transition = { active: true, alpha: 1, direction: 'in', speed, callback: null };
}

export function updateTransition(ctx, dt) {
  if (!transition.active) return;

  if (transition.direction === 'out') {
    transition.alpha += dt * transition.speed;
    if (transition.alpha >= 1) {
      transition.alpha = 1;
      if (transition.callback) transition.callback();
      transition.direction = 'in';
      transition.callback = null;
    }
  } else {
    transition.alpha -= dt * transition.speed;
    if (transition.alpha <= 0) {
      transition.alpha = 0;
      transition.active = false;
    }
  }

  ctx.save();
  ctx.globalAlpha = transition.alpha;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 800, 600);
  ctx.restore();
}

export function isTransitioning() {
  return transition.active && transition.direction === 'out';
}

// Smooth camera
export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.shakeTimer = 0;
  }

  follow(x, y, mapW, mapH, smoothing = 0.08) {
    this.targetX = Math.max(0, Math.min(mapW - 800, x - 400));
    this.targetY = Math.max(0, Math.min(mapH - 600, y - 300));
    this.x += (this.targetX - this.x) * smoothing;
    this.y += (this.targetY - this.y) * smoothing;
  }

  shake(intensity = 5, duration = 0.2) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  update(dt) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  apply(ctx) {
    ctx.translate(-this.x + this.shakeX, -this.y + this.shakeY);
  }
}

// Hit stop (freeze frame on big hits)
let hitStopTimer = 0;
export function triggerHitStop(duration = 0.05) {
  hitStopTimer = duration;
}

export function isHitStopped() {
  return hitStopTimer > 0;
}

export function updateHitStop(dt) {
  if (hitStopTimer > 0) hitStopTimer -= dt;
}

// Draw pixel-art style button
export function drawButton(ctx, x, y, w, h, text) {
  const hover = isButtonHover(x, y, w, h);

  ctx.save();
  // Shadow
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 2, y + 2, w, h);
  // Body
  ctx.fillStyle = hover ? '#1a4a4a' : '#0a2a2a';
  ctx.fillRect(x, y, w, h);
  // Border
  ctx.strokeStyle = hover ? '#0ff' : '#066';
  ctx.lineWidth = hover ? 2 : 1;
  ctx.strokeRect(x, y, w, h);
  // Highlight top
  ctx.fillStyle = hover ? 'rgba(0,255,255,0.15)' : 'rgba(0,255,255,0.05)';
  ctx.fillRect(x + 1, y + 1, w - 2, h / 3);
  // Text
  ctx.fillStyle = hover ? '#fff' : '#0ff';
  ctx.font = '14px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.restore();

  return hover;
}

// HP bar with pixel style
export function drawHPBar(ctx, x, y, w, h, current, max, color = '#0f0') {
  const ratio = Math.max(0, current / max);
  // Background
  ctx.fillStyle = '#111';
  ctx.fillRect(x, y, w, h);
  // Fill
  const fillColor = ratio > 0.5 ? color : ratio > 0.25 ? '#ff0' : '#f00';
  ctx.fillStyle = fillColor;
  ctx.fillRect(x + 1, y + 1, (w - 2) * ratio, h - 2);
  // Border
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

// Draw crosshair at mouse position (during hunt)
export function drawCrosshair(ctx) {
  ctx.save();
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.7;
  const cx = mouseX;
  const cy = mouseY;
  const sz = 8;
  // Cross
  ctx.beginPath();
  ctx.moveTo(cx - sz, cy); ctx.lineTo(cx - 3, cy);
  ctx.moveTo(cx + 3, cy); ctx.lineTo(cx + sz, cy);
  ctx.moveTo(cx, cy - sz); ctx.lineTo(cx, cy - 3);
  ctx.moveTo(cx, cy + 3); ctx.lineTo(cx, cy + sz);
  ctx.stroke();
  // Dot
  ctx.fillStyle = '#0ff';
  ctx.fillRect(cx - 1, cy - 1, 2, 2);
  ctx.restore();
}

// Pixel art sprite drawing helper
export function drawPixelSprite(ctx, x, y, pixels, scale = 1) {
  // pixels is array of {x, y, color} or 2D color array
  for (const p of pixels) {
    ctx.fillStyle = p.color;
    ctx.fillRect(x + p.x * scale, y + p.y * scale, scale, scale);
  }
}

// Notification system
const notifications = [];

export function showNotification(text) {
  notifications.push({ text, timer: 3 });
}

export function renderNotifications(ctx, dt) {
  for (let i = notifications.length - 1; i >= 0; i--) {
    notifications[i].timer -= dt;
    if (notifications[i].timer <= 0) {
      notifications.splice(i, 1);
      continue;
    }
    const n = notifications[i];
    const alpha = Math.min(1, n.timer);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,40,40,0.85)';
    ctx.fillRect(250, 10 + i * 38, 300, 30);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(250, 10 + i * 38, 300, 30);
    ctx.fillStyle = '#0ff';
    ctx.font = '13px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(n.text, 400, 30 + i * 38);
    ctx.restore();
  }
}
