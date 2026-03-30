// ============================================
// PLAYER — uses pre-rendered Gungeon-style sprites
// ============================================

import * as FX from './effects.js';
import * as SPR from './sprites.js';

export function drawPlayer(ctx, invincible, time, isMoving) {
  if (invincible > 0 && Math.floor(time * 16) % 2) ctx.globalAlpha = 0.3;

  const walkFrame = isMoving ? (Math.floor(time * 8) % 3) : 0;
  const bobY = isMoving ? Math.abs(Math.sin(time * 12)) * 1.5 : 0;

  const sprite = SPR.getPlayer(walkFrame);
  ctx.save();
  ctx.translate(0, -bobY);
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();

  ctx.globalAlpha = 1;
}

export function drawWeapon(ctx, angle, type) {
  ctx.save();
  ctx.rotate(angle);

  switch (type) {
    case 'pistol':
      ctx.fillStyle = '#444'; ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, -3); ctx.lineTo(26, -3); ctx.lineTo(27, -1);
      ctx.lineTo(27, 3); ctx.lineTo(10, 4); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Barrel
      ctx.fillStyle = '#666';
      ctx.fillRect(22, -2, 6, 4);
      // Grip
      ctx.fillStyle = '#333';
      ctx.fillRect(10, 2, 5, 5);
      // Muzzle
      ctx.fillStyle = '#f80'; ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.arc(28, 0, 2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case 'machinegun':
      ctx.fillStyle = '#555'; ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(6, -5); ctx.lineTo(34, -5); ctx.lineTo(38, -3);
      ctx.lineTo(38, 3); ctx.lineTo(34, 5); ctx.lineTo(6, 5); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Barrel
      ctx.fillStyle = '#777'; ctx.fillRect(34, -2, 6, 4);
      // Magazine
      ctx.fillStyle = '#444'; ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
      ctx.fillRect(16, 5, 7, 8); ctx.strokeRect(16, 5, 7, 8);
      // Stock
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(4, -3, 6, 6);
      // Top rail
      ctx.fillStyle = '#4a4a4a'; ctx.fillRect(12, -7, 14, 3);
      break;
    case 'sniper':
      ctx.fillStyle = '#555'; ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(4, -3); ctx.lineTo(44, -3); ctx.lineTo(46, -1);
      ctx.lineTo(46, 1); ctx.lineTo(44, 3); ctx.lineTo(4, 3); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Scope
      ctx.fillStyle = '#0af'; ctx.shadowColor = '#0af'; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(22, -7, 4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#046';
      ctx.beginPath(); ctx.arc(22, -7, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Stock
      ctx.fillStyle = '#4a3828'; ctx.fillRect(2, -2, 8, 4);
      // Bipod
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(16, 3); ctx.lineTo(14, 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, 3); ctx.lineTo(22, 10); ctx.stroke();
      break;
    case 'sword':
      // Handle
      ctx.fillStyle = '#664400'; ctx.strokeStyle = '#442200'; ctx.lineWidth = 1;
      ctx.fillRect(6, -3, 8, 6); ctx.strokeRect(6, -3, 8, 6);
      // Guard
      ctx.fillStyle = '#aaa'; ctx.fillRect(4, -5, 3, 10);
      // Energy blade with glow
      const bladeGlow = 0.7 + Math.sin(Date.now() / 150) * 0.3;
      ctx.shadowColor = '#aaf'; ctx.shadowBlur = 12 * bladeGlow;
      const bg = ctx.createLinearGradient(14, 0, 42, 0);
      bg.addColorStop(0, '#aaf'); bg.addColorStop(0.8, '#ddf'); bg.addColorStop(1, '#fff');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(14, -3); ctx.lineTo(40, -1); ctx.lineTo(42, 0);
      ctx.lineTo(40, 1); ctx.lineTo(14, 3); ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
  }
  ctx.restore();
}

// Crosshair — rotating Gungeon style
export function drawCrosshair(ctx, mx, my) {
  ctx.save();
  const t = Date.now() / 1000;
  const s = 12;

  // Outer rotating ring
  ctx.strokeStyle = '#0ff'; ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath(); ctx.arc(mx, my, s + 2, t * 2, t * 2 + Math.PI * 1.5);
  ctx.stroke();

  // Cross lines
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = '#0ff'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mx - s, my); ctx.lineTo(mx - 4, my);
  ctx.moveTo(mx + 4, my); ctx.lineTo(mx + s, my);
  ctx.moveTo(mx, my - s); ctx.lineTo(mx, my - 4);
  ctx.moveTo(mx, my + 4); ctx.lineTo(mx, my + s);
  ctx.stroke();

  // Corner brackets
  ctx.globalAlpha = 0.5;
  const c = 5;
  ctx.beginPath();
  ctx.moveTo(mx - s, my - s + c); ctx.lineTo(mx - s, my - s); ctx.lineTo(mx - s + c, my - s);
  ctx.moveTo(mx + s - c, my - s); ctx.lineTo(mx + s, my - s); ctx.lineTo(mx + s, my - s + c);
  ctx.moveTo(mx - s, my + s - c); ctx.lineTo(mx - s, my + s); ctx.lineTo(mx - s + c, my + s);
  ctx.moveTo(mx + s - c, my + s); ctx.lineTo(mx + s, my + s); ctx.lineTo(mx + s, my + s - c);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = '#0ff'; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.arc(mx, my, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
