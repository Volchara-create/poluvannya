// ============================================
// PLAYER — pixel art bounty hunter with animations
// ============================================

import * as FX from './effects.js';
import { playSound } from './sound.js';

// Pixel sprite data — each row is one line of pixels
// Format: [[color, x, y, w, h], ...]
const BODY_PIXELS = [
  // Helmet
  ['#0a4a4a', -7, -20, 14, 3],  // top
  ['#0a5555', -8, -17, 16, 8],  // main
  ['#0ff',    -6, -15, 12, 3],   // visor (glowing)
  ['#066',    -5, -14, 10, 1],   // visor detail
  // Antenna
  ['#088', 6, -24, 2, 5],
  ['#0ff', 6, -25, 2, 2],
  // Neck
  ['#0a3535', -3, -12, 6, 3],
  // Shoulders
  ['#0a5050', -11, -9, 5, 5],
  ['#0a5050', 6, -9, 5, 5],
  // Torso
  ['#0a3a3a', -8, -9, 16, 14],
  ['#0d5050', -6, -7, 12, 6],   // chest plate
  ['#0a6060', -5, -6, 10, 3],   // highlight
  // Belt
  ['#664400', -8, 3, 16, 3],
  ['#553300', 7, 1, 3, 5],      // holster
  // Backpack
  ['#083838', -10, -6, 3, 10],
  ['#0a4a4a', -10, -4, 2, 3],   // detail
];

const LEG_PIXELS = [
  // Left leg
  ['#0a4040', -6, 6, 4, 8],
  ['#1a3030', -7, 12, 5, 5],    // boot
  // Right leg
  ['#0a4040', 2, 6, 4, 8],
  ['#1a3030', 2, 12, 5, 5],     // boot
];

export function drawPlayer(ctx, invincible, time, isMoving) {
  if (invincible > 0 && Math.floor(time * 16) % 2) {
    ctx.globalAlpha = 0.3;
  }

  // Walking animation
  const walkAnim = isMoving ? Math.sin(time * 12) * 3 : 0;

  // Shadow
  ctx.save();
  ctx.globalAlpha = (invincible > 0 ? 0.1 : 0.2);
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 16, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Legs (with walk animation)
  ctx.save();
  // Left leg
  ctx.fillStyle = '#0a4040';
  ctx.fillRect(-6, 6 + walkAnim * 0.4, 4, 8);
  ctx.fillStyle = '#1a3030';
  ctx.fillRect(-7, 12 + walkAnim * 0.5, 5, 5);
  // Right leg
  ctx.fillStyle = '#0a4040';
  ctx.fillRect(2, 6 - walkAnim * 0.4, 4, 8);
  ctx.fillStyle = '#1a3030';
  ctx.fillRect(2, 12 - walkAnim * 0.5, 5, 5);
  ctx.restore();

  // Body
  for (const [color, x, y, w, h] of BODY_PIXELS) {
    ctx.fillStyle = color;
    if (color === '#0ff') {
      ctx.shadowColor = '#0ff';
      ctx.shadowBlur = 6;
    }
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;
}

export function drawWeapon(ctx, angle, type) {
  ctx.save();
  ctx.rotate(angle);

  switch (type) {
    case 'pistol':
      // Grip
      ctx.fillStyle = '#333';
      ctx.fillRect(8, 1, 5, 5);
      // Body
      ctx.fillStyle = '#555';
      ctx.fillRect(10, -3, 14, 6);
      // Barrel
      ctx.fillStyle = '#777';
      ctx.fillRect(22, -2, 5, 4);
      // Muzzle hole
      ctx.fillStyle = '#222';
      ctx.fillRect(25, -1, 2, 2);
      // Detail
      ctx.fillStyle = '#444';
      ctx.fillRect(12, -1, 4, 2);
      break;
    case 'machinegun':
      // Stock
      ctx.fillStyle = '#333';
      ctx.fillRect(4, -2, 6, 4);
      // Body
      ctx.fillStyle = '#444';
      ctx.fillRect(9, -5, 20, 10);
      // Barrel
      ctx.fillStyle = '#555';
      ctx.fillRect(27, -3, 8, 6);
      ctx.fillStyle = '#666';
      ctx.fillRect(33, -2, 4, 4);
      // Magazine
      ctx.fillStyle = '#333';
      ctx.fillRect(14, 5, 6, 7);
      // Top rail
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(12, -7, 12, 3);
      // Handle
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(20, 5, 3, 5);
      break;
    case 'sniper':
      // Stock
      ctx.fillStyle = '#3a3028';
      ctx.fillRect(2, -2, 8, 4);
      // Body
      ctx.fillStyle = '#444';
      ctx.fillRect(9, -3, 26, 6);
      // Long barrel
      ctx.fillStyle = '#555';
      ctx.fillRect(33, -2, 10, 4);
      ctx.fillStyle = '#666';
      ctx.fillRect(41, -1, 3, 2);
      // Scope
      ctx.fillStyle = '#0af';
      ctx.shadowColor = '#0af';
      ctx.shadowBlur = 3;
      ctx.fillRect(18, -8, 6, 5);
      ctx.fillStyle = '#044';
      ctx.fillRect(19, -7, 4, 3);
      ctx.shadowBlur = 0;
      // Bipod
      ctx.fillStyle = '#444';
      ctx.fillRect(14, 3, 2, 6);
      ctx.fillRect(18, 3, 2, 6);
      break;
    case 'sword':
      // Handle
      ctx.fillStyle = '#664400';
      ctx.fillRect(6, -3, 8, 6);
      // Guard
      ctx.fillStyle = '#888';
      ctx.fillRect(4, -5, 3, 10);
      // Blade (energy)
      ctx.fillStyle = '#aaf';
      ctx.shadowColor = '#aaf';
      ctx.shadowBlur = 8;
      ctx.fillRect(13, -2, 24, 4);
      // Blade tip
      ctx.fillStyle = '#ddf';
      ctx.fillRect(35, -1, 5, 2);
      // Blade inner glow
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.4;
      ctx.fillRect(15, -1, 20, 2);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      break;
  }
  ctx.restore();
}

// Crosshair
export function drawCrosshair(ctx, mx, my) {
  ctx.save();
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.8;
  const s = 10;
  // Outer cross
  ctx.beginPath();
  ctx.moveTo(mx - s, my); ctx.lineTo(mx - 4, my);
  ctx.moveTo(mx + 4, my); ctx.lineTo(mx + s, my);
  ctx.moveTo(mx, my - s); ctx.lineTo(mx, my - 4);
  ctx.moveTo(mx, my + 4); ctx.lineTo(mx, my + s);
  ctx.stroke();
  // Center dot
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 3;
  ctx.fillRect(mx - 1, my - 1, 2, 2);
  ctx.restore();
}
