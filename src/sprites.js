// ============================================
// PIXEL ART SPRITES — all game characters drawn with pixels
// ============================================

// Draw player (bounty hunter in armor)
export function drawPlayer(ctx, dir, weaponType, invincible, time) {
  if (invincible > 0 && Math.floor(time * 15) % 2) return;

  ctx.save();
  // Body armor
  ctx.fillStyle = '#0a3a3a';
  ctx.fillRect(-5, -4, 10, 10);
  // Chest plate
  ctx.fillStyle = '#0a5a5a';
  ctx.fillRect(-4, -3, 8, 5);
  // Helmet
  ctx.fillStyle = '#0a4a4a';
  ctx.fillRect(-4, -9, 8, 6);
  // Visor
  ctx.fillStyle = '#0ff';
  ctx.fillRect(-3, -8, 6, 2);
  // Legs
  ctx.fillStyle = '#064';
  ctx.fillRect(-4, 6, 3, 5);
  ctx.fillRect(1, 6, 3, 5);
  // Arms
  ctx.fillStyle = '#085';
  ctx.fillRect(-7, -2, 3, 6);
  ctx.fillRect(4, -2, 3, 6);
  // Belt
  ctx.fillStyle = '#880';
  ctx.fillRect(-5, 3, 10, 2);
  ctx.restore();
}

// Draw player weapon pointing at angle
export function drawPlayerWeapon(ctx, angle, weaponType) {
  ctx.save();
  ctx.rotate(angle);

  switch (weaponType) {
    case 'pistol':
      ctx.fillStyle = '#555';
      ctx.fillRect(8, -2, 10, 4);
      ctx.fillStyle = '#888';
      ctx.fillRect(16, -1, 3, 2);
      break;
    case 'machinegun':
      ctx.fillStyle = '#444';
      ctx.fillRect(6, -3, 16, 6);
      ctx.fillStyle = '#666';
      ctx.fillRect(20, -2, 4, 4);
      ctx.fillStyle = '#333';
      ctx.fillRect(8, 3, 4, 3); // magazine
      break;
    case 'sniper':
      ctx.fillStyle = '#444';
      ctx.fillRect(6, -2, 20, 4);
      ctx.fillStyle = '#666';
      ctx.fillRect(24, -1, 4, 2);
      ctx.fillStyle = '#0af';
      ctx.fillRect(14, -4, 3, 2); // scope
      break;
    case 'sword':
      ctx.fillStyle = '#aaf';
      ctx.fillRect(8, -1, 18, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(24, -1, 3, 3); // tip
      ctx.fillStyle = '#880';
      ctx.fillRect(5, -2, 4, 5); // handle
      break;
  }
  ctx.restore();
}

// Draw enemy based on type
export function drawEnemy(ctx, type, time) {
  switch (type) {
    case 'shooter':
      drawShooterAlien(ctx, time);
      break;
    case 'kamikaze':
      drawKamikazeBug(ctx, time);
      break;
    case 'shield':
      drawShieldGolem(ctx, time);
      break;
  }
}

function drawShooterAlien(ctx, time) {
  // Tall thin alien with 3 eyes
  // Body
  ctx.fillStyle = '#2a0a3a';
  ctx.fillRect(-4, -6, 8, 14);
  // Head (elongated)
  ctx.fillStyle = '#4a1a5a';
  ctx.fillRect(-5, -13, 10, 8);
  ctx.fillRect(-3, -15, 6, 3);
  // 3 eyes
  ctx.fillStyle = '#f0f';
  ctx.fillRect(-3, -12, 2, 2);
  ctx.fillRect(-1, -13, 2, 2);
  ctx.fillRect(1, -12, 2, 2);
  // Thin legs
  ctx.fillStyle = '#1a0a2a';
  ctx.fillRect(-3, 8, 2, 5);
  ctx.fillRect(1, 8, 2, 5);
  // Long arms
  ctx.fillStyle = '#3a1a4a';
  ctx.fillRect(-7, -4, 3, 2);
  ctx.fillRect(4, -4, 3, 2);
  // Weapon in hand
  ctx.fillStyle = '#fa0';
  ctx.fillRect(7, -5, 8, 3);
  ctx.fillStyle = '#ff0';
  ctx.fillRect(14, -4, 2, 1);
}

function drawKamikazeBug(ctx, time) {
  const pulse = 0.6 + Math.sin(time * 10) * 0.3;
  // Glow aura
  ctx.save();
  ctx.globalAlpha = pulse * 0.2;
  ctx.fillStyle = '#ff0';
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Body (oval bug)
  ctx.fillStyle = '#5a4a00';
  ctx.fillRect(-5, -4, 10, 9);
  ctx.fillRect(-4, -6, 8, 2);
  ctx.fillRect(-4, 5, 8, 2);
  // Stripes
  ctx.fillStyle = '#aa0';
  ctx.fillRect(-4, -2, 8, 2);
  ctx.fillRect(-4, 2, 8, 2);
  // Wings
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#ff0';
  const wingOff = Math.sin(time * 20) * 2;
  ctx.fillRect(-9, -3 + wingOff, 4, 6);
  ctx.fillRect(5, -3 - wingOff, 4, 6);
  ctx.restore();
  // Eyes (red, angry)
  ctx.fillStyle = '#f00';
  ctx.fillRect(-3, -5, 2, 2);
  ctx.fillRect(1, -5, 2, 2);
  // Mandibles
  ctx.fillStyle = '#880';
  ctx.fillRect(-3, 6, 2, 3);
  ctx.fillRect(1, 6, 2, 3);
}

function drawShieldGolem(ctx, time) {
  // Heavy armored golem
  // Body (wide)
  ctx.fillStyle = '#1a2a4a';
  ctx.fillRect(-8, -6, 16, 14);
  // Armor plates
  ctx.fillStyle = '#2a3a5a';
  ctx.fillRect(-7, -5, 14, 4);
  ctx.fillRect(-7, 1, 14, 4);
  // Head (small, armored)
  ctx.fillStyle = '#3a4a6a';
  ctx.fillRect(-5, -11, 10, 6);
  // Visor (blue glow)
  ctx.fillStyle = '#0ff';
  ctx.fillRect(-4, -9, 8, 2);
  // Legs (thick)
  ctx.fillStyle = '#1a2a3a';
  ctx.fillRect(-6, 8, 4, 5);
  ctx.fillRect(2, 8, 4, 5);
  // Shield arm (left)
  ctx.fillStyle = '#3a5a8a';
  ctx.fillRect(-14, -7, 6, 16);
  ctx.strokeStyle = '#6af';
  ctx.lineWidth = 1;
  ctx.strokeRect(-14, -7, 6, 16);
  // Right arm (weapon)
  ctx.fillStyle = '#2a3a5a';
  ctx.fillRect(8, -3, 4, 8);
  ctx.fillStyle = '#888';
  ctx.fillRect(10, -5, 3, 4);
}

// Draw boss
export function drawBoss(ctx, ability, time, isShielded, isInvisible) {
  if (isInvisible && Math.floor(time * 10) % 3 !== 0) {
    ctx.globalAlpha = 0.15;
  }
  // Large alien commander
  // Body
  ctx.fillStyle = '#3a0a0a';
  ctx.fillRect(-10, -8, 20, 18);
  ctx.fillStyle = '#4a1010';
  ctx.fillRect(-8, -6, 16, 5);
  // Head
  ctx.fillStyle = '#5a0a0a';
  ctx.fillRect(-7, -16, 14, 9);
  // Horns
  ctx.fillStyle = '#8a2a2a';
  ctx.fillRect(-9, -20, 3, 6);
  ctx.fillRect(6, -20, 3, 6);
  ctx.fillRect(-10, -22, 2, 3);
  ctx.fillRect(8, -22, 2, 3);
  // Eyes (glowing)
  ctx.fillStyle = '#ff0';
  ctx.fillRect(-5, -14, 3, 3);
  ctx.fillRect(2, -14, 3, 3);
  // Mouth
  ctx.fillStyle = '#a00';
  ctx.fillRect(-4, -9, 8, 2);
  // Arms
  ctx.fillStyle = '#3a1010';
  ctx.fillRect(-15, -5, 5, 10);
  ctx.fillRect(10, -5, 5, 10);
  // Claws
  ctx.fillStyle = '#8a2a2a';
  ctx.fillRect(-16, 4, 2, 4);
  ctx.fillRect(-13, 4, 2, 4);
  ctx.fillRect(12, 4, 2, 4);
  ctx.fillRect(14, 4, 2, 4);
  // Legs
  ctx.fillStyle = '#2a0808';
  ctx.fillRect(-7, 10, 5, 6);
  ctx.fillRect(2, 10, 5, 6);
  // Ability indicator
  if (ability) {
    ctx.fillStyle = '#f0f';
    ctx.globalAlpha = 0.5 + Math.sin(time * 5) * 0.3;
    ctx.fillRect(-2, -24, 4, 3);
    ctx.globalAlpha = 1;
  }
  // Shield effect
  if (isShielded) {
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4 + Math.sin(time * 8) * 0.2;
    ctx.strokeRect(-16, -24, 32, 42);
    ctx.globalAlpha = 1;
  }
}

// Draw ship (space mini-game)
export function drawShip(ctx, time) {
  // Main hull
  ctx.fillStyle = '#0a3a4a';
  ctx.fillRect(-6, -12, 12, 18);
  // Nose
  ctx.fillStyle = '#0a5a6a';
  ctx.fillRect(-4, -16, 8, 5);
  ctx.fillRect(-2, -18, 4, 3);
  // Wings
  ctx.fillStyle = '#085868';
  ctx.fillRect(-14, -2, 8, 10);
  ctx.fillRect(6, -2, 8, 10);
  // Wing tips
  ctx.fillStyle = '#0ff';
  ctx.fillRect(-14, 0, 2, 2);
  ctx.fillRect(12, 0, 2, 2);
  // Cockpit
  ctx.fillStyle = '#0ff';
  ctx.fillRect(-3, -14, 6, 4);
  ctx.fillStyle = '#088';
  ctx.fillRect(-2, -13, 4, 2);
  // Engine
  ctx.fillStyle = '#f80';
  ctx.globalAlpha = 0.6 + Math.random() * 0.3;
  const flameH = 4 + Math.random() * 6;
  ctx.fillRect(-4, 6, 3, flameH);
  ctx.fillRect(1, 6, 3, flameH);
  ctx.fillStyle = '#ff0';
  ctx.globalAlpha = 0.4 + Math.random() * 0.3;
  ctx.fillRect(-3, 8, 1, flameH - 2);
  ctx.fillRect(2, 8, 1, flameH - 2);
  ctx.globalAlpha = 1;
  // Detail lines
  ctx.strokeStyle = '#0aa';
  ctx.lineWidth = 1;
  ctx.strokeRect(-6, -12, 12, 18);
}

// Draw space enemies
export function drawSpaceEnemy(ctx, type, time) {
  switch (type) {
    case 'basic':
      ctx.fillStyle = '#a22';
      ctx.fillRect(-6, -8, 12, 14);
      ctx.fillRect(-8, -4, 4, 6);
      ctx.fillRect(4, -4, 4, 6);
      ctx.fillStyle = '#f44';
      ctx.fillRect(-4, -6, 8, 3);
      ctx.fillStyle = '#ff0';
      ctx.fillRect(-3, -4, 2, 2);
      ctx.fillRect(1, -4, 2, 2);
      break;
    case 'fast':
      ctx.fillStyle = '#aa0';
      ctx.fillRect(-4, -5, 8, 10);
      ctx.fillRect(-6, -2, 2, 4);
      ctx.fillRect(4, -2, 2, 4);
      ctx.fillStyle = '#ff0';
      ctx.fillRect(-2, -3, 4, 2);
      break;
    case 'heavy':
      ctx.fillStyle = '#622';
      ctx.fillRect(-10, -10, 20, 18);
      ctx.strokeStyle = '#a44';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -10, 20, 18);
      ctx.fillStyle = '#f44';
      ctx.fillRect(-6, -6, 12, 4);
      ctx.fillStyle = '#ff0';
      ctx.fillRect(-4, -4, 2, 2);
      ctx.fillRect(2, -4, 2, 2);
      // Armor detail
      ctx.fillStyle = '#844';
      ctx.fillRect(-8, 0, 16, 2);
      break;
  }
}

// Draw HQ player (smaller, walking)
export function drawHQPlayer(ctx, dir, time) {
  // Simple walking character
  const walkOffset = Math.sin(time * 8) * 1;
  ctx.fillStyle = '#0a4a4a';
  ctx.fillRect(-4, -6 + walkOffset, 8, 8);
  ctx.fillStyle = '#0a3a3a';
  ctx.fillRect(-3, -9 + walkOffset, 6, 4);
  ctx.fillStyle = '#0ff';
  ctx.fillRect(-2, -8 + walkOffset, 4, 1);
  // Legs
  ctx.fillStyle = '#064';
  if (dir === 'left' || dir === 'right') {
    ctx.fillRect(-3, 2 + walkOffset, 2, 4 + Math.abs(walkOffset));
    ctx.fillRect(1, 2 + walkOffset, 2, 4 - Math.abs(walkOffset));
  } else {
    ctx.fillRect(-3, 2, 2, 4);
    ctx.fillRect(1, 2, 2, 4);
  }
}

// Draw defeated boss in dialogue
export function drawDefeatedBoss(ctx, time) {
  ctx.save();
  ctx.globalAlpha = 0.4 + Math.sin(time * 2) * 0.1;
  // Body collapsed
  ctx.fillStyle = '#3a0a0a';
  ctx.fillRect(-12, -4, 24, 12);
  // Head down
  ctx.fillStyle = '#5a0a0a';
  ctx.fillRect(-6, -10, 12, 8);
  // Horns
  ctx.fillStyle = '#8a2a2a';
  ctx.fillRect(-8, -14, 3, 5);
  ctx.fillRect(5, -14, 3, 5);
  // X eyes
  ctx.fillStyle = '#880';
  ctx.fillRect(-4, -8, 2, 2);
  ctx.fillRect(2, -8, 2, 2);
  ctx.restore();
}
