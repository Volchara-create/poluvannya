// ============================================
// ENEMY — pixel art alien races with animations
// ============================================

// Zyx'ari — tall purple alien sniper with 3 eyes
export function drawShooter(ctx, time, hp, maxHP) {
  const breathe = Math.sin(time * 4) * 0.5;
  const idle = Math.sin(time * 2) * 1;

  // Shadow
  ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 20, 8, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

  // Thin legs
  ctx.fillStyle = '#1a0828';
  ctx.fillRect(-4, 12, 3, 8);
  ctx.fillRect(1, 12, 3, 8);
  // Feet (clawed)
  ctx.fillStyle = '#2a1038';
  ctx.fillRect(-6, 18, 4, 3);
  ctx.fillRect(2, 18, 4, 3);

  // Body (slim, robed)
  ctx.fillStyle = '#2a1040';
  ctx.fillRect(-6, -4 + breathe, 12, 18);
  // Robe pattern
  ctx.fillStyle = '#3a1855';
  ctx.fillRect(-5, -2 + breathe, 10, 6);
  // Markings (glowing purple lines)
  ctx.fillStyle = '#a0f';
  ctx.globalAlpha = 0.3 + Math.sin(time * 3) * 0.1;
  ctx.fillRect(-4, 1 + breathe, 8, 1);
  ctx.fillRect(-4, 5 + breathe, 8, 1);
  ctx.fillRect(-4, 9 + breathe, 8, 1);
  ctx.globalAlpha = 1;

  // Head (elongated alien skull)
  ctx.fillStyle = '#4a2068';
  ctx.fillRect(-7, -16 + idle, 14, 13);
  ctx.fillRect(-5, -20 + idle, 10, 5);
  ctx.fillRect(-3, -22 + idle, 6, 3);
  // Jaw
  ctx.fillStyle = '#3a1555';
  ctx.fillRect(-5, -5 + idle, 10, 3);

  // 3 eyes (glowing magenta)
  ctx.fillStyle = '#f0f';
  ctx.shadowColor = '#f0f';
  ctx.shadowBlur = 4;
  ctx.fillRect(-5, -14 + idle, 3, 3);
  ctx.fillRect(-1, -15 + idle, 3, 3);
  ctx.fillRect(3, -14 + idle, 3, 3);
  ctx.shadowBlur = 0;

  // Long arms
  ctx.fillStyle = '#2a1045';
  ctx.fillRect(-10, -2 + breathe, 4, 3);
  ctx.fillRect(-12, 0 + breathe, 3, 10);
  ctx.fillRect(6, -2 + breathe, 4, 3);
  ctx.fillRect(9, 0 + breathe, 3, 10);

  // Plasma rifle
  ctx.fillStyle = '#554400';
  ctx.fillRect(11, 6, 14, 4);
  ctx.fillStyle = '#f80';
  ctx.shadowColor = '#f80';
  ctx.shadowBlur = 3;
  ctx.fillRect(23, 7, 3, 2);
  ctx.shadowBlur = 0;
}

// Vex Bug — glowing kamikaze insect
export function drawKamikaze(ctx, time, hp, maxHP) {
  const pulse = 0.5 + Math.sin(time * 14) * 0.4;
  const wingFlap = Math.sin(time * 30) * 4;

  // Danger glow aura
  ctx.save();
  ctx.globalAlpha = pulse * 0.12;
  ctx.fillStyle = '#ff0';
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Shadow
  ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 16, 7, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

  // Wings (4, rapidly flapping)
  ctx.save();
  ctx.globalAlpha = 0.35;
  // Top wings
  ctx.fillStyle = '#aa8800';
  ctx.fillRect(-14, -5 + wingFlap, 8, 12);
  ctx.fillRect(6, -5 - wingFlap, 8, 12);
  // Bottom wings
  ctx.fillStyle = '#886600';
  ctx.fillRect(-11, 4 - wingFlap * 0.5, 6, 8);
  ctx.fillRect(5, 4 + wingFlap * 0.5, 6, 8);
  ctx.restore();

  // Antennae
  ctx.fillStyle = '#888800';
  ctx.fillRect(-4, -14, 2, 5);
  ctx.fillRect(2, -14, 2, 5);
  ctx.fillStyle = '#ff0';
  ctx.fillRect(-4, -15, 2, 2);
  ctx.fillRect(2, -15, 2, 2);

  // Head
  ctx.fillStyle = '#5a4a00';
  ctx.fillRect(-6, -10, 12, 7);
  // Compound eyes (red)
  ctx.fillStyle = '#f00';
  ctx.shadowColor = '#f00';
  ctx.shadowBlur = 3;
  ctx.fillRect(-5, -9, 4, 4);
  ctx.fillRect(1, -9, 4, 4);
  ctx.shadowBlur = 0;
  // Mandibles
  ctx.fillStyle = '#884400';
  ctx.fillRect(-4, -4, 2, 4);
  ctx.fillRect(2, -4, 2, 4);

  // Thorax
  ctx.fillStyle = '#6a5500';
  ctx.fillRect(-7, -4, 14, 10);
  // Danger stripes
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(-6, -2, 12, 2);
  ctx.fillRect(-6, 2, 12, 2);

  // Abdomen
  ctx.fillStyle = '#5a4500';
  ctx.fillRect(-6, 6, 12, 8);
  ctx.fillRect(-4, 14, 8, 3);
  // More stripes
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(-5, 8, 10, 2);
  ctx.fillRect(-5, 12, 10, 2);

  // Stinger (glowing, pulsing)
  ctx.fillStyle = '#ff0';
  ctx.shadowColor = '#ff0';
  ctx.shadowBlur = 5 * pulse;
  ctx.fillRect(-1, 16, 2, 5);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-1, 19, 2, 2);
  ctx.shadowBlur = 0;

  // Legs (small)
  ctx.fillStyle = '#4a3a00';
  ctx.fillRect(-8, 2, 2, 4);
  ctx.fillRect(6, 2, 2, 4);
  ctx.fillRect(-9, 6, 2, 3);
  ctx.fillRect(7, 6, 2, 3);
}

// Kron Guard — massive armored golem
export function drawShield(ctx, time, hp, maxHP) {
  const breathe = Math.sin(time * 2) * 0.5;

  // Shadow
  ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 24, 14, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

  // Legs (thick, armored)
  ctx.fillStyle = '#1a2540';
  ctx.fillRect(-8, 14, 6, 10);
  ctx.fillRect(2, 14, 6, 10);
  // Heavy boots
  ctx.fillStyle = '#2a3555';
  ctx.fillRect(-10, 22, 8, 4);
  ctx.fillRect(1, 22, 8, 4);

  // Body (massive)
  ctx.fillStyle = '#1a2a48';
  ctx.fillRect(-13, -8 + breathe, 26, 24);
  // Armor plates
  ctx.fillStyle = '#2a3a5a';
  ctx.fillRect(-12, -6 + breathe, 24, 7);
  ctx.fillRect(-12, 5 + breathe, 24, 7);
  // Rivets
  ctx.fillStyle = '#4a5a7a';
  ctx.fillRect(-10, -5 + breathe, 2, 2);
  ctx.fillRect(8, -5 + breathe, 2, 2);
  ctx.fillRect(-10, 7 + breathe, 2, 2);
  ctx.fillRect(8, 7 + breathe, 2, 2);
  // Center power core
  ctx.fillStyle = '#0af';
  ctx.shadowColor = '#0af';
  ctx.shadowBlur = 6;
  ctx.fillRect(-3, 0 + breathe, 6, 6);
  ctx.fillStyle = '#0ff';
  ctx.fillRect(-2, 1 + breathe, 4, 4);
  ctx.shadowBlur = 0;

  // Energy Shield (left arm)
  ctx.fillStyle = '#3a5a8a';
  ctx.fillRect(-22, -12, 9, 28);
  ctx.strokeStyle = '#6af';
  ctx.shadowColor = '#6af';
  ctx.shadowBlur = 4;
  ctx.lineWidth = 1;
  ctx.strokeRect(-22, -12, 9, 28);
  // Shield runes
  ctx.fillStyle = '#0af';
  ctx.fillRect(-20, -8, 5, 1);
  ctx.fillRect(-20, -2, 5, 1);
  ctx.fillRect(-20, 4, 5, 1);
  ctx.fillRect(-20, 10, 5, 1);
  ctx.shadowBlur = 0;

  // Weapon arm (right)
  ctx.fillStyle = '#2a3a55';
  ctx.fillRect(13, -4 + breathe, 6, 12);
  // Arm cannon
  ctx.fillStyle = '#3a4a6a';
  ctx.fillRect(17, -2 + breathe, 10, 8);
  ctx.fillStyle = '#0af';
  ctx.shadowColor = '#0af';
  ctx.shadowBlur = 3;
  ctx.fillRect(25, 0 + breathe, 3, 4);
  ctx.shadowBlur = 0;

  // Head (small, heavily armored)
  ctx.fillStyle = '#3a4a6a';
  ctx.fillRect(-7, -18, 14, 11);
  ctx.fillRect(-5, -20, 10, 3);
  // Visor slit
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 5;
  ctx.fillRect(-5, -15, 10, 3);
  ctx.shadowBlur = 0;
  // Helmet fins
  ctx.fillStyle = '#4a5a7a';
  ctx.fillRect(-9, -19, 3, 6);
  ctx.fillRect(6, -19, 3, 6);
}

// BOSS — Warden Xar'Voth
export function drawBoss(ctx, time, ability, isShielded, isInvisible) {
  if (isInvisible && Math.floor(time * 8) % 3 !== 0) { ctx.globalAlpha = 0.1; }
  const breathe = Math.sin(time * 2) * 1.5;
  const eyePulse = 0.6 + Math.sin(time * 5) * 0.4;

  // Shadow
  ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 30, 18, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

  // Legs
  ctx.fillStyle = '#2a0808';
  ctx.fillRect(-10, 18, 8, 12);
  ctx.fillRect(2, 18, 8, 12);
  // Clawed feet
  ctx.fillStyle = '#5a1515';
  ctx.fillRect(-13, 28, 4, 3);
  ctx.fillRect(-9, 29, 3, 3);
  ctx.fillRect(6, 28, 3, 3);
  ctx.fillRect(10, 29, 4, 3);

  // Body
  ctx.fillStyle = '#3a0a0a';
  ctx.fillRect(-16, -10 + breathe, 32, 30);
  // Exoskeleton plates
  ctx.fillStyle = '#4a1515';
  ctx.fillRect(-14, -8 + breathe, 28, 8);
  ctx.fillStyle = '#5a1a1a';
  ctx.fillRect(-12, -6 + breathe, 24, 4);
  // Rib markings
  ctx.fillStyle = '#5a2020';
  for (let i = 0; i < 4; i++) ctx.fillRect(-12, 4 + i * 5 + breathe, 24, 1);

  // Core (pulsing red orb)
  ctx.fillStyle = '#f00';
  ctx.shadowColor = '#f00';
  ctx.shadowBlur = 10 * eyePulse;
  ctx.fillRect(-4, 2 + breathe, 8, 8);
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(-3, 3 + breathe, 6, 6);
  ctx.fillStyle = '#ff8888';
  ctx.fillRect(-2, 4 + breathe, 4, 4);
  ctx.shadowBlur = 0;

  // Arms
  ctx.fillStyle = '#3a1010';
  ctx.fillRect(-22, -6 + breathe, 7, 16);
  ctx.fillRect(15, -6 + breathe, 7, 16);
  // Forearms
  ctx.fillStyle = '#4a1515';
  ctx.fillRect(-24, 8 + breathe, 7, 12);
  ctx.fillRect(17, 8 + breathe, 7, 12);
  // Claws
  ctx.fillStyle = '#8a3030';
  ctx.fillRect(-26, 18, 3, 7);
  ctx.fillRect(-23, 19, 3, 6);
  ctx.fillRect(-20, 18, 2, 5);
  ctx.fillRect(19, 18, 2, 5);
  ctx.fillRect(21, 19, 3, 6);
  ctx.fillRect(24, 18, 3, 7);

  // Head
  ctx.fillStyle = '#5a1515';
  ctx.fillRect(-11, -26, 22, 17);
  ctx.fillRect(-9, -30, 18, 5);
  // Crown/crest
  ctx.fillStyle = '#aa2020';
  ctx.fillRect(-7, -32, 14, 3);
  ctx.fillRect(-5, -34, 10, 3);
  // Jaw
  ctx.fillStyle = '#4a1010';
  ctx.fillRect(-9, -11, 18, 4);
  // Teeth
  ctx.fillStyle = '#ddd';
  for (let i = 0; i < 5; i++) ctx.fillRect(-7 + i * 3, -11, 2, 3);

  // HORNS (large, curved)
  ctx.fillStyle = '#8a3030';
  // Left horn
  ctx.fillRect(-15, -32, 4, 10);
  ctx.fillRect(-17, -38, 3, 8);
  ctx.fillRect(-19, -42, 3, 6);
  ctx.fillRect(-20, -44, 2, 3);
  // Right horn
  ctx.fillRect(11, -32, 4, 10);
  ctx.fillRect(14, -38, 3, 8);
  ctx.fillRect(16, -42, 3, 6);
  ctx.fillRect(18, -44, 2, 3);

  // Eyes (glowing yellow, menacing)
  ctx.fillStyle = '#ff0';
  ctx.shadowColor = '#ff0';
  ctx.shadowBlur = 8 * eyePulse;
  ctx.fillRect(-8, -24, 5, 5);
  ctx.fillRect(3, -24, 5, 5);
  // Pupils (red, slit)
  ctx.fillStyle = '#f00';
  ctx.fillRect(-6, -23, 2, 3);
  ctx.fillRect(5, -23, 2, 3);
  ctx.shadowBlur = 0;

  // Shield effect
  if (isShielded) {
    ctx.save();
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.25 + Math.sin(time * 8) * 0.15;
    ctx.strokeRect(-28, -46, 56, 80);
    ctx.fillStyle = '#0ff';
    ctx.globalAlpha = 0.04;
    ctx.fillRect(-28, -46, 56, 80);
    ctx.restore();
  }

  // Ability aura
  if (ability) {
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(time * 6) * 0.1;
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 2;
    ctx.strokeRect(-30, -48, 60, 84);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

// Space enemies
export function drawSpaceBasic(ctx, time) {
  // Red fighter
  ctx.fillStyle = '#6a1515';
  ctx.fillRect(-8, -12, 16, 20);
  ctx.fillStyle = '#8a2020';
  ctx.fillRect(-6, -10, 12, 8);
  // Wings
  ctx.fillStyle = '#5a1010';
  ctx.fillRect(-16, -4, 8, 12);
  ctx.fillRect(8, -4, 8, 12);
  // Cockpit
  ctx.fillStyle = '#ff0';
  ctx.fillRect(-3, -8, 6, 4);
  // Cannon
  ctx.fillStyle = '#444';
  ctx.fillRect(-2, 6, 4, 8);
  ctx.fillStyle = '#f44';
  ctx.shadowColor = '#f44'; ctx.shadowBlur = 3;
  ctx.fillRect(-1, 12, 2, 3);
  ctx.shadowBlur = 0;
}

export function drawSpaceFast(ctx, time) {
  // Yellow interceptor
  ctx.fillStyle = '#6a5500';
  ctx.fillRect(-6, -10, 12, 16);
  ctx.fillStyle = '#8a7700';
  ctx.fillRect(-4, -8, 8, 6);
  // Delta wings
  ctx.fillStyle = '#5a4400';
  ctx.fillRect(-12, -2, 6, 8);
  ctx.fillRect(6, -2, 6, 8);
  // Cockpit
  ctx.fillStyle = '#ff0';
  ctx.fillRect(-2, -6, 4, 3);
  // Engine
  ctx.fillStyle = '#f80';
  ctx.globalAlpha = 0.6 + Math.random() * 0.3;
  ctx.fillRect(-2, 5, 4, 4 + Math.random() * 5);
  ctx.globalAlpha = 1;
}

export function drawSpaceHeavy(ctx, time) {
  // Armored battlecruiser
  ctx.fillStyle = '#3a1515';
  ctx.fillRect(-16, -16, 32, 30);
  // Armor
  ctx.strokeStyle = '#6a2020';
  ctx.lineWidth = 2;
  ctx.strokeRect(-16, -16, 32, 30);
  ctx.fillStyle = '#4a2020';
  ctx.fillRect(-14, -14, 28, 8);
  ctx.fillRect(-14, 2, 28, 8);
  // Bridge
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(-8, -10, 16, 8);
  // Eyes
  ctx.fillStyle = '#ff0';
  ctx.shadowColor = '#ff0'; ctx.shadowBlur = 3;
  ctx.fillRect(-6, -8, 4, 4);
  ctx.fillRect(2, -8, 4, 4);
  ctx.shadowBlur = 0;
  // Side cannons
  ctx.fillStyle = '#333';
  ctx.fillRect(-20, -6, 4, 10);
  ctx.fillRect(16, -6, 4, 10);
  ctx.fillStyle = '#f44';
  ctx.fillRect(-20, 2, 4, 3);
  ctx.fillRect(16, 2, 4, 3);
  // Bottom plate
  ctx.fillStyle = '#5a2a2a';
  ctx.fillRect(-12, 12, 24, 4);
}

// Commander NPC in HQ
export function drawCommander(ctx, time) {
  const breathe = Math.sin(time * 3) * 0.3;

  // Legs
  ctx.fillStyle = '#1a1a28';
  ctx.fillRect(-4, 8, 3, 7);
  ctx.fillRect(1, 8, 3, 7);
  // Boots
  ctx.fillStyle = '#111118';
  ctx.fillRect(-5, 13, 4, 3);
  ctx.fillRect(0, 13, 4, 3);

  // Body (military uniform)
  ctx.fillStyle = '#1a2a1a';
  ctx.fillRect(-7, -4 + breathe, 14, 14);
  // Collar
  ctx.fillStyle = '#2a3a2a';
  ctx.fillRect(-5, -4 + breathe, 10, 3);
  // Epaulettes (gold)
  ctx.fillStyle = '#aa8800';
  ctx.fillRect(-8, -3 + breathe, 3, 3);
  ctx.fillRect(5, -3 + breathe, 3, 3);
  // Medals
  ctx.fillStyle = '#ff0';
  ctx.fillRect(-5, 3 + breathe, 2, 2);
  ctx.fillStyle = '#f00';
  ctx.fillRect(-2, 3 + breathe, 2, 2);
  ctx.fillStyle = '#0af';
  ctx.fillRect(1, 3 + breathe, 2, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(4, 3 + breathe, 2, 2);

  // Head
  ctx.fillStyle = '#c8a882';
  ctx.fillRect(-5, -13, 10, 10);
  // Hair
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(-5, -15, 10, 3);
  // Scar (right cheek)
  ctx.fillStyle = '#a08060';
  ctx.fillRect(2, -10, 1, 5);
  // Eyes (stern)
  ctx.fillStyle = '#222';
  ctx.fillRect(-3, -10, 2, 2);
  ctx.fillRect(2, -10, 2, 2);
  // Eyebrows
  ctx.fillStyle = '#333';
  ctx.fillRect(-4, -12, 3, 1);
  ctx.fillRect(1, -12, 3, 1);
  // Mouth
  ctx.fillStyle = '#a07060';
  ctx.fillRect(-2, -5, 4, 1);

  // Cap
  ctx.fillStyle = '#1a3a1a';
  ctx.fillRect(-6, -17, 12, 4);
  ctx.fillStyle = '#2a4a2a';
  ctx.fillRect(-7, -14, 14, 2);
  // Cap badge
  ctx.fillStyle = '#aa8800';
  ctx.fillRect(-2, -16, 4, 2);
}

// Defeated boss
export function drawDefeatedBoss(ctx, time) {
  ctx.save();
  ctx.globalAlpha = 0.3 + Math.sin(time * 2) * 0.08;
  // Collapsed
  ctx.fillStyle = '#3a0a0a';
  ctx.fillRect(-18, -4, 36, 16);
  ctx.fillStyle = '#4a1515';
  ctx.fillRect(-14, -2, 28, 6);
  // Head
  ctx.fillStyle = '#5a1515';
  ctx.fillRect(-8, -16, 16, 13);
  // Broken horns
  ctx.fillStyle = '#8a3030';
  ctx.fillRect(-11, -20, 3, 6);
  ctx.fillRect(8, -20, 3, 6);
  // X eyes
  ctx.fillStyle = '#880';
  ctx.fillRect(-5, -12, 2, 2);
  ctx.fillRect(-3, -10, 2, 2);
  ctx.fillRect(2, -12, 2, 2);
  ctx.fillRect(4, -10, 2, 2);
  ctx.restore();
}

// HQ walking character
export function drawHQPlayer(ctx, dir, time) {
  const walk = Math.sin(time * 8) * 1.5;
  // Boots
  ctx.fillStyle = '#1a3030';
  ctx.fillRect(-5, 10 + walk * 0.3, 4, 5);
  ctx.fillRect(1, 10 - walk * 0.3, 4, 5);
  // Body
  ctx.fillStyle = '#0a3a3a';
  ctx.fillRect(-6, -4, 12, 16);
  ctx.fillStyle = '#0d5050';
  ctx.fillRect(-5, -2, 10, 5);
  // Head
  ctx.fillStyle = '#0a4a4a';
  ctx.fillRect(-5, -13, 10, 10);
  // Visor
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 3;
  ctx.fillRect(-4, -10, 8, 2);
  ctx.shadowBlur = 0;
}
