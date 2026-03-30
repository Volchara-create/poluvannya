// ============================================
// ENEMY — uses pre-rendered Gungeon-style sprites
// ============================================

import * as SPR from './sprites.js';

export function drawShooter(ctx, time) {
  const frame = Math.floor(time * 3) % 3;
  const sprite = SPR.getShooter(frame);
  // Breathing animation
  const breathe = Math.sin(time * 3) * 0.5;
  ctx.save();
  ctx.translate(0, breathe);
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();
}

export function drawKamikaze(ctx, time) {
  const frame = Math.floor(time * 8) % 3;
  const sprite = SPR.getKamikaze(frame);
  // Rapid wobble
  const wobble = Math.sin(time * 14) * 0.08;
  ctx.save();
  ctx.rotate(wobble);
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();
}

export function drawShield(ctx, time) {
  const frame = Math.floor(time * 2) % 3;
  const sprite = SPR.getShield(frame);
  const breathe = Math.sin(time * 2) * 0.5;
  ctx.save();
  ctx.translate(0, breathe);
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();
}

export function drawBoss(ctx, time, ability, isShielded, isInvisible) {
  if (isInvisible && Math.floor(time * 8) % 3 !== 0) ctx.globalAlpha = 0.1;
  const frame = Math.floor(time * 2) % 3;
  const sprite = SPR.getBoss(frame);
  const breathe = Math.sin(time * 2) * 1;
  ctx.save();
  ctx.translate(0, breathe);
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();

  // Shield effect
  if (isShielded) {
    ctx.save();
    ctx.strokeStyle = '#0ff'; ctx.lineWidth = 3;
    ctx.globalAlpha = 0.25 + Math.sin(time * 8) * 0.15;
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#0ff';
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Ability aura
  if (ability) {
    ctx.save();
    ctx.globalAlpha = 0.12 + Math.sin(time * 6) * 0.08;
    ctx.strokeStyle = '#f0f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

// Space enemies
export function drawSpaceBasic(ctx, time) {
  const sprite = SPR.getSpaceBasic();
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  // Engine glow
  ctx.fillStyle = '#f44'; ctx.shadowColor = '#f44'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.arc(0, sprite.height / 2, 2 + Math.random() * 2, 0, Math.PI * 2);
  ctx.fill(); ctx.shadowBlur = 0;
}

export function drawSpaceFast(ctx, time) {
  const sprite = SPR.getSpaceFast();
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  // Engine trail
  ctx.fillStyle = '#f80'; ctx.globalAlpha = 0.5 + Math.random() * 0.3;
  const trailLen = 4 + Math.random() * 8;
  ctx.beginPath(); ctx.moveTo(-2, sprite.height / 2);
  ctx.lineTo(0, sprite.height / 2 + trailLen);
  ctx.lineTo(2, sprite.height / 2); ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawSpaceHeavy(ctx, time) {
  const sprite = SPR.getSpaceHeavy();
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
}

// Commander NPC
export function drawCommander(ctx, time) {
  const sprite = SPR.getCommander();
  const breathe = Math.sin(time * 3) * 0.3;
  ctx.save();
  ctx.translate(0, breathe);
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();
}

// Defeated boss
export function drawDefeatedBoss(ctx, time) {
  ctx.save();
  ctx.globalAlpha = 0.35 + Math.sin(time * 2) * 0.08;
  const sprite = SPR.getDefeatedBoss();
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();
}

// HQ walking character
export function drawHQPlayer(ctx, dir, time) {
  const sprite = SPR.getHQPlayer(dir);
  const walk = Math.sin(time * 8) * 0.5;
  ctx.save();
  ctx.translate(0, -Math.abs(walk));
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();
}
