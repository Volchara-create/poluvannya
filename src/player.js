// ============================================
// PLAYER — enhanced pixel art bounty hunter
// Detailed sprite with smooth animations
// ============================================

import * as FX from './effects.js';
import { playSound } from './sound.js';

export function drawPlayer(ctx, invincible, time, isMoving) {
  if (invincible > 0 && Math.floor(time * 16) % 2) ctx.globalAlpha = 0.3;

  const walkAnim = isMoving ? Math.sin(time * 12) * 3 : 0;
  const breathe = Math.sin(time * 3) * 0.5;
  const bobY = isMoving ? Math.abs(Math.sin(time * 12)) * 1.5 : 0;

  // Shadow
  ctx.save();
  ctx.globalAlpha = (invincible > 0 ? 0.08 : 0.18);
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 18, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(0, -bobY);

  // Legs with animation
  ctx.save();
  // Left leg
  ctx.fillStyle = '#0a4040';
  ctx.fillRect(-6, 6 + walkAnim * 0.5, 5, 8);
  ctx.fillStyle = '#1a3030';
  ctx.fillRect(-7, 12 + walkAnim * 0.6, 6, 5);
  // Boot detail
  ctx.fillStyle = '#0a2828';
  ctx.fillRect(-8, 15 + walkAnim * 0.6, 7, 2);
  // Right leg
  ctx.fillStyle = '#0a4040';
  ctx.fillRect(1, 6 - walkAnim * 0.5, 5, 8);
  ctx.fillStyle = '#1a3030';
  ctx.fillRect(1, 12 - walkAnim * 0.6, 6, 5);
  ctx.fillStyle = '#0a2828';
  ctx.fillRect(1, 15 - walkAnim * 0.6, 7, 2);
  ctx.restore();

  // Backpack
  ctx.fillStyle = '#083838';
  ctx.fillRect(-11, -7 + breathe, 4, 12);
  ctx.fillStyle = '#0a4a4a';
  ctx.fillRect(-11, -5 + breathe, 3, 4);
  // Backpack light
  ctx.fillStyle = '#0f0';
  ctx.shadowColor = '#0f0'; ctx.shadowBlur = 2;
  ctx.fillRect(-10, -2 + breathe, 1, 1);
  ctx.shadowBlur = 0;

  // Torso
  ctx.fillStyle = '#0a3a3a';
  ctx.fillRect(-8, -9 + breathe, 16, 16);
  // Chest plate
  ctx.fillStyle = '#0d5050';
  ctx.fillRect(-6, -7 + breathe, 12, 7);
  // Chest highlight
  ctx.fillStyle = '#0a6a6a';
  ctx.fillRect(-5, -6 + breathe, 10, 3);
  // Center line detail
  ctx.fillStyle = '#088';
  ctx.fillRect(-1, -6 + breathe, 2, 10);
  // Chest emblem (small diamond)
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff'; ctx.shadowBlur = 3;
  ctx.fillRect(-1, -4 + breathe, 2, 2);
  ctx.shadowBlur = 0;

  // Shoulders (armored)
  ctx.fillStyle = '#0a5555';
  ctx.fillRect(-11, -9 + breathe, 5, 6);
  ctx.fillRect(6, -9 + breathe, 5, 6);
  // Shoulder pads highlight
  ctx.fillStyle = '#0c6666';
  ctx.fillRect(-10, -9 + breathe, 4, 2);
  ctx.fillRect(7, -9 + breathe, 4, 2);
  // Shoulder glow
  ctx.fillStyle = '#0ff';
  ctx.globalAlpha = 0.2 + Math.sin(time * 4) * 0.1;
  ctx.fillRect(-10, -8 + breathe, 1, 1);
  ctx.fillRect(9, -8 + breathe, 1, 1);
  ctx.globalAlpha = invincible > 0 && Math.floor(time * 16) % 2 ? 0.3 : 1;

  // Belt
  ctx.fillStyle = '#664400';
  ctx.fillRect(-8, 4 + breathe, 16, 3);
  ctx.fillStyle = '#886600';
  ctx.fillRect(-2, 4 + breathe, 4, 3);
  // Holster
  ctx.fillStyle = '#553300';
  ctx.fillRect(7, 2 + breathe, 3, 5);

  // Neck
  ctx.fillStyle = '#0a3535';
  ctx.fillRect(-3, -12, 6, 4);

  // Helmet
  ctx.fillStyle = '#0a4a4a';
  ctx.fillRect(-8, -17, 16, 8);
  ctx.fillStyle = '#0a5555';
  ctx.fillRect(-7, -20, 14, 4);
  ctx.fillRect(-5, -22, 10, 3);
  // Helmet top ridge
  ctx.fillStyle = '#0c6666';
  ctx.fillRect(-4, -22, 8, 1);

  // Visor (main glow feature)
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff'; ctx.shadowBlur = 8;
  ctx.fillRect(-6, -16, 12, 3);
  ctx.shadowBlur = 0;
  // Visor detail line
  ctx.fillStyle = '#088';
  ctx.fillRect(-5, -15, 10, 1);
  // Visor reflection
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.2;
  ctx.fillRect(-5, -16, 4, 1);
  ctx.globalAlpha = invincible > 0 && Math.floor(time * 16) % 2 ? 0.3 : 1;

  // Antenna
  ctx.fillStyle = '#088';
  ctx.fillRect(6, -26, 2, 5);
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff'; ctx.shadowBlur = 4;
  ctx.fillRect(6, -27, 2, 2);
  ctx.shadowBlur = 0;

  // Energy lines on suit (animated)
  ctx.fillStyle = '#0ff';
  ctx.globalAlpha = 0.15 + Math.sin(time * 5) * 0.08;
  ctx.fillRect(-7, -3 + breathe, 1, 8);
  ctx.fillRect(6, -3 + breathe, 1, 8);
  ctx.globalAlpha = 1;

  ctx.restore(); // bobY
  ctx.globalAlpha = 1;
}

export function drawWeapon(ctx, angle, type) {
  ctx.save();
  ctx.rotate(angle);

  switch (type) {
    case 'pistol':
      ctx.fillStyle = '#444'; ctx.fillRect(8, 1, 5, 5);
      ctx.fillStyle = '#666'; ctx.fillRect(10, -3, 14, 6);
      ctx.fillStyle = '#888'; ctx.fillRect(22, -2, 6, 4);
      ctx.fillStyle = '#222'; ctx.fillRect(26, -1, 2, 2);
      ctx.fillStyle = '#555'; ctx.fillRect(12, -1, 4, 2);
      // Laser sight
      ctx.fillStyle = '#f00'; ctx.shadowColor = '#f00'; ctx.shadowBlur = 2;
      ctx.fillRect(16, -4, 1, 1); ctx.shadowBlur = 0;
      break;
    case 'machinegun':
      ctx.fillStyle = '#3a3a3a'; ctx.fillRect(4, -2, 6, 4);
      ctx.fillStyle = '#555'; ctx.fillRect(9, -5, 22, 10);
      ctx.fillStyle = '#666'; ctx.fillRect(29, -3, 9, 6);
      ctx.fillStyle = '#777'; ctx.fillRect(36, -2, 4, 4);
      ctx.fillStyle = '#444'; ctx.fillRect(14, 5, 7, 8);
      ctx.fillStyle = '#4a4a4a'; ctx.fillRect(12, -7, 14, 3);
      ctx.fillStyle = '#333'; ctx.fillRect(22, 5, 3, 5);
      // Heat vents
      ctx.fillStyle = '#f80'; ctx.globalAlpha = 0.2 + Math.random() * 0.1;
      ctx.fillRect(32, -4, 1, 2); ctx.fillRect(34, -4, 1, 2);
      ctx.globalAlpha = 1;
      break;
    case 'sniper':
      ctx.fillStyle = '#4a3828'; ctx.fillRect(2, -2, 8, 4);
      ctx.fillStyle = '#555'; ctx.fillRect(9, -3, 28, 6);
      ctx.fillStyle = '#666'; ctx.fillRect(35, -2, 12, 4);
      ctx.fillStyle = '#777'; ctx.fillRect(45, -1, 3, 2);
      // Scope
      ctx.fillStyle = '#08f'; ctx.shadowColor = '#08f'; ctx.shadowBlur = 4;
      ctx.fillRect(18, -9, 7, 6);
      ctx.fillStyle = '#046'; ctx.fillRect(19, -8, 5, 4);
      ctx.shadowBlur = 0;
      // Scope lens glow
      ctx.fillStyle = '#0af'; ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 300) * 0.1;
      ctx.fillRect(20, -7, 3, 2); ctx.globalAlpha = 1;
      // Bipod
      ctx.fillStyle = '#555'; ctx.fillRect(14, 3, 2, 7); ctx.fillRect(19, 3, 2, 7);
      break;
    case 'sword':
      ctx.fillStyle = '#664400'; ctx.fillRect(6, -3, 8, 6);
      ctx.fillStyle = '#aaa'; ctx.fillRect(4, -5, 3, 10);
      // Energy blade
      const bladeGlow = 0.7 + Math.sin(Date.now() / 150) * 0.3;
      ctx.fillStyle = '#aaf'; ctx.shadowColor = '#aaf'; ctx.shadowBlur = 10 * bladeGlow;
      ctx.fillRect(13, -2, 26, 4);
      ctx.fillStyle = '#ddf'; ctx.fillRect(37, -1, 6, 2);
      // Inner glow
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.5 * bladeGlow;
      ctx.fillRect(15, -1, 22, 2); ctx.globalAlpha = 1;
      // Edge sparkles
      if (Math.random() > 0.6) {
        ctx.fillStyle = '#fff';
        const sparkX = 15 + Math.random() * 22;
        ctx.fillRect(sparkX, -3, 1, 1);
      }
      ctx.shadowBlur = 0;
      break;
  }
  ctx.restore();
}

export function drawCrosshair(ctx, mx, my) {
  ctx.save();
  const t = Date.now() / 1000;
  const pulse = 0.8 + Math.sin(t * 4) * 0.2;
  const s = 12;

  // Outer rotating ring
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(mx, my, s + 2, t * 2, t * 2 + Math.PI * 1.5);
  ctx.stroke();

  // Cross lines
  ctx.globalAlpha = 0.9 * pulse;
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mx - s, my); ctx.lineTo(mx - 4, my);
  ctx.moveTo(mx + 4, my); ctx.lineTo(mx + s, my);
  ctx.moveTo(mx, my - s); ctx.lineTo(mx, my - 4);
  ctx.moveTo(mx, my + 4); ctx.lineTo(mx, my + s);
  ctx.stroke();

  // Corner brackets
  ctx.strokeStyle = '#0ff';
  ctx.globalAlpha = 0.5;
  const c = 5;
  ctx.beginPath();
  // Top-left
  ctx.moveTo(mx - s, my - s + c); ctx.lineTo(mx - s, my - s); ctx.lineTo(mx - s + c, my - s);
  // Top-right
  ctx.moveTo(mx + s - c, my - s); ctx.lineTo(mx + s, my - s); ctx.lineTo(mx + s, my - s + c);
  // Bottom-left
  ctx.moveTo(mx - s, my + s - c); ctx.lineTo(mx - s, my + s); ctx.lineTo(mx - s + c, my + s);
  // Bottom-right
  ctx.moveTo(mx + s - c, my + s); ctx.lineTo(mx + s, my + s); ctx.lineTo(mx + s, my + s - c);
  ctx.stroke();

  // Center dot with glow
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 5;
  ctx.fillRect(mx - 1, my - 1, 2, 2);
  ctx.restore();
}
