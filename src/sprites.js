// ============================================
// PIXEL ART SPRITES — larger, detailed characters
// Scale: ~2x bigger than before
// ============================================

// Draw player (bounty hunter in heavy armor) — ~20px wide
export function drawPlayer(ctx, dir, weaponType, invincible, time) {
  if (invincible > 0 && Math.floor(time * 15) % 2) return;
  const walk = Math.sin(time * 10) * 1.5;

  ctx.save();
  // Boots
  ctx.fillStyle = '#1a3030';
  ctx.fillRect(-7, 10 + walk * 0.3, 5, 7);
  ctx.fillRect(2, 10 - walk * 0.3, 5, 7);
  // Legs
  ctx.fillStyle = '#0a4040';
  ctx.fillRect(-6, 4 + walk * 0.2, 4, 8);
  ctx.fillRect(2, 4 - walk * 0.2, 4, 8);
  // Body armor (torso)
  ctx.fillStyle = '#0a3a3a';
  ctx.fillRect(-8, -8, 16, 14);
  // Chest plate highlight
  ctx.fillStyle = '#0d5050';
  ctx.fillRect(-6, -6, 12, 5);
  // Belt + holster
  ctx.fillStyle = '#664400';
  ctx.fillRect(-8, 4, 16, 3);
  ctx.fillStyle = '#553300';
  ctx.fillRect(6, 2, 3, 5);
  // Shoulders (armor pads)
  ctx.fillStyle = '#0a5050';
  ctx.fillRect(-11, -7, 4, 6);
  ctx.fillRect(7, -7, 4, 6);
  // Neck
  ctx.fillStyle = '#0a3030';
  ctx.fillRect(-3, -11, 6, 4);
  // Helmet
  ctx.fillStyle = '#0a4545';
  ctx.fillRect(-7, -18, 14, 9);
  ctx.fillRect(-6, -20, 12, 3);
  // Visor (glowing cyan)
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 4;
  ctx.fillRect(-5, -16, 10, 3);
  ctx.shadowBlur = 0;
  // Antenna
  ctx.fillStyle = '#088';
  ctx.fillRect(5, -22, 2, 5);
  ctx.fillStyle = '#0ff';
  ctx.fillRect(5, -23, 2, 2);
  // Backpack
  ctx.fillStyle = '#083838';
  ctx.fillRect(-9, -5, 3, 8);
  ctx.restore();
}

// Draw weapon pointing at aim angle — scaled up
export function drawPlayerWeapon(ctx, angle, weaponType) {
  ctx.save();
  ctx.rotate(angle);

  switch (weaponType) {
    case 'pistol':
      ctx.fillStyle = '#444';
      ctx.fillRect(10, -3, 14, 6);
      ctx.fillStyle = '#666';
      ctx.fillRect(22, -2, 4, 4);
      ctx.fillStyle = '#333';
      ctx.fillRect(12, 3, 4, 4); // trigger guard
      // Muzzle
      ctx.fillStyle = '#888';
      ctx.fillRect(24, -1, 2, 2);
      break;
    case 'machinegun':
      ctx.fillStyle = '#383838';
      ctx.fillRect(8, -4, 22, 8);
      ctx.fillStyle = '#555';
      ctx.fillRect(28, -3, 5, 6);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(10, 4, 6, 5); // magazine
      ctx.fillStyle = '#444';
      ctx.fillRect(14, -6, 8, 3); // top rail
      // Handle
      ctx.fillStyle = '#333';
      ctx.fillRect(16, 4, 3, 4);
      break;
    case 'sniper':
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(8, -3, 28, 6);
      ctx.fillStyle = '#555';
      ctx.fillRect(34, -2, 5, 4);
      // Scope
      ctx.fillStyle = '#0af';
      ctx.fillRect(18, -7, 4, 4);
      ctx.fillStyle = '#066';
      ctx.fillRect(19, -6, 2, 2);
      // Bipod
      ctx.fillStyle = '#444';
      ctx.fillRect(12, 3, 2, 5);
      ctx.fillRect(16, 3, 2, 5);
      break;
    case 'sword':
      // Energy blade
      ctx.fillStyle = '#aaf';
      ctx.shadowColor = '#aaf';
      ctx.shadowBlur = 6;
      ctx.fillRect(12, -2, 22, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(32, -1, 4, 2); // tip glow
      ctx.shadowBlur = 0;
      // Handle
      ctx.fillStyle = '#664400';
      ctx.fillRect(6, -3, 7, 6);
      ctx.fillStyle = '#888';
      ctx.fillRect(5, -4, 2, 8); // guard
      break;
  }
  ctx.restore();
}

// ENEMIES — each is a unique alien race

// Shooter: tall thin alien "Zyx'ari" — snipers with 3 eyes
export function drawEnemy(ctx, type, time) {
  switch (type) {
    case 'shooter': drawZyxari(ctx, time); break;
    case 'kamikaze': drawVexBug(ctx, time); break;
    case 'shield': drawKronGuard(ctx, time); break;
  }
}

function drawZyxari(ctx, time) {
  // Tall thin purple alien with long arms
  // Legs (thin, insect-like)
  ctx.fillStyle = '#2a1040';
  ctx.fillRect(-5, 10, 3, 8);
  ctx.fillRect(2, 10, 3, 8);
  ctx.fillRect(-7, 16, 3, 3); // feet
  ctx.fillRect(4, 16, 3, 3);
  // Body (slim)
  ctx.fillStyle = '#3a1855';
  ctx.fillRect(-6, -4, 12, 16);
  ctx.fillStyle = '#4a2068';
  ctx.fillRect(-5, -2, 10, 6); // chest
  // Markings
  ctx.fillStyle = '#f0f';
  ctx.globalAlpha = 0.3;
  ctx.fillRect(-4, 0, 8, 1);
  ctx.fillRect(-4, 3, 8, 1);
  ctx.globalAlpha = 1;
  // Head (elongated oval)
  ctx.fillStyle = '#5a2878';
  ctx.fillRect(-7, -16, 14, 13);
  ctx.fillRect(-5, -19, 10, 4);
  // 3 eyes (glowing magenta)
  ctx.fillStyle = '#f0f';
  ctx.shadowColor = '#f0f';
  ctx.shadowBlur = 3;
  ctx.fillRect(-5, -14, 3, 3);
  ctx.fillRect(-1, -15, 3, 3);
  ctx.fillRect(3, -14, 3, 3);
  ctx.shadowBlur = 0;
  // Long arms
  ctx.fillStyle = '#3a1850';
  ctx.fillRect(-10, -2, 4, 3);
  ctx.fillRect(-12, 0, 3, 8);
  ctx.fillRect(6, -2, 4, 3);
  ctx.fillRect(9, 0, 3, 8);
  // Weapon (plasma rifle)
  ctx.fillStyle = '#886600';
  ctx.fillRect(10, 4, 12, 4);
  ctx.fillStyle = '#f80';
  ctx.fillRect(20, 5, 3, 2);
}

// Kamikaze: "Vex Bug" — glowing insect swarm creature
function drawVexBug(ctx, time) {
  const pulse = 0.5 + Math.sin(time * 12) * 0.4;
  const wingFlap = Math.sin(time * 25) * 3;

  // Glow aura
  ctx.save();
  ctx.globalAlpha = pulse * 0.15;
  ctx.fillStyle = '#ff0';
  ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Wings (4, flapping)
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#aa8800';
  // Top wings
  ctx.fillRect(-14, -6 + wingFlap, 7, 10);
  ctx.fillRect(7, -6 - wingFlap, 7, 10);
  // Bottom wings (smaller)
  ctx.fillStyle = '#886600';
  ctx.fillRect(-11, 2 - wingFlap, 5, 7);
  ctx.fillRect(6, 2 + wingFlap, 5, 7);
  ctx.restore();

  // Body (segmented)
  ctx.fillStyle = '#5a4a00';
  ctx.fillRect(-6, -8, 12, 6); // head segment
  ctx.fillStyle = '#6a5500';
  ctx.fillRect(-7, -3, 14, 8); // thorax
  ctx.fillStyle = '#5a4500';
  ctx.fillRect(-6, 5, 12, 8); // abdomen
  ctx.fillRect(-4, 12, 8, 4); // tail

  // Stripes (danger pattern)
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(-6, -1, 12, 2);
  ctx.fillRect(-6, 4, 12, 2);
  ctx.fillRect(-5, 9, 10, 2);

  // Eyes (red, compound)
  ctx.fillStyle = '#f00';
  ctx.shadowColor = '#f00';
  ctx.shadowBlur = 3;
  ctx.fillRect(-5, -7, 4, 3);
  ctx.fillRect(1, -7, 4, 3);
  ctx.shadowBlur = 0;

  // Mandibles
  ctx.fillStyle = '#884400';
  ctx.fillRect(-4, -10, 2, 4);
  ctx.fillRect(2, -10, 2, 4);

  // Stinger (glowing)
  ctx.fillStyle = '#ff0';
  ctx.shadowColor = '#ff0';
  ctx.shadowBlur = 4;
  ctx.fillRect(-1, 15, 2, 4);
  ctx.shadowBlur = 0;
}

// Shield: "Kron Guard" — massive armored golem-warrior
function drawKronGuard(ctx, time) {
  const breathe = Math.sin(time * 3) * 0.5;

  // Legs (thick, mechanical)
  ctx.fillStyle = '#1a2540';
  ctx.fillRect(-8, 12, 6, 8);
  ctx.fillRect(2, 12, 6, 8);
  // Boots (heavy)
  ctx.fillStyle = '#2a3555';
  ctx.fillRect(-9, 18, 8, 4);
  ctx.fillRect(1, 18, 8, 4);

  // Body (massive, wide)
  ctx.fillStyle = '#1a2a48';
  ctx.fillRect(-12, -6 + breathe, 24, 20);
  // Armor plates
  ctx.fillStyle = '#2a3a5a';
  ctx.fillRect(-11, -4 + breathe, 22, 6);
  ctx.fillRect(-11, 4 + breathe, 22, 6);
  // Center gem
  ctx.fillStyle = '#0af';
  ctx.shadowColor = '#0af';
  ctx.shadowBlur = 4;
  ctx.fillRect(-2, 0 + breathe, 4, 4);
  ctx.shadowBlur = 0;

  // Shield arm (LEFT — big energy shield)
  ctx.fillStyle = '#3a5a8a';
  ctx.fillRect(-20, -10, 8, 24);
  ctx.strokeStyle = '#6af';
  ctx.shadowColor = '#6af';
  ctx.shadowBlur = 3;
  ctx.lineWidth = 1;
  ctx.strokeRect(-20, -10, 8, 24);
  ctx.shadowBlur = 0;
  // Shield runes
  ctx.fillStyle = '#0af';
  ctx.fillRect(-18, -6, 4, 1);
  ctx.fillRect(-18, 0, 4, 1);
  ctx.fillRect(-18, 6, 4, 1);

  // Right arm (weapon arm)
  ctx.fillStyle = '#2a3a55';
  ctx.fillRect(12, -3, 5, 10);
  // Cannon on arm
  ctx.fillStyle = '#3a4a6a';
  ctx.fillRect(15, -1, 8, 6);
  ctx.fillStyle = '#0af';
  ctx.fillRect(21, 0, 3, 4);

  // Head (small, heavily armored)
  ctx.fillStyle = '#3a4a6a';
  ctx.fillRect(-7, -16, 14, 11);
  ctx.fillRect(-5, -18, 10, 3);
  // Visor (blue glow slit)
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 4;
  ctx.fillRect(-5, -13, 10, 3);
  ctx.shadowBlur = 0;
  // Helmet horns (small)
  ctx.fillStyle = '#4a5a7a';
  ctx.fillRect(-8, -17, 3, 4);
  ctx.fillRect(5, -17, 3, 4);
}

// BOSS — "Warden Xar'Voth" — huge alien warlord
export function drawBoss(ctx, ability, time, isShielded, isInvisible) {
  if (isInvisible && Math.floor(time * 10) % 3 !== 0) ctx.globalAlpha = 0.12;
  const breathe = Math.sin(time * 2.5) * 1;
  const eyeGlow = 0.7 + Math.sin(time * 5) * 0.3;

  // Legs (thick, clawed)
  ctx.fillStyle = '#2a0808';
  ctx.fillRect(-10, 16, 7, 10);
  ctx.fillRect(3, 16, 7, 10);
  // Clawed feet
  ctx.fillStyle = '#5a1515';
  ctx.fillRect(-12, 24, 4, 3);
  ctx.fillRect(-8, 25, 3, 3);
  ctx.fillRect(5, 24, 3, 3);
  ctx.fillRect(9, 25, 4, 3);

  // Body (massive)
  ctx.fillStyle = '#3a0a0a';
  ctx.fillRect(-14, -8 + breathe, 28, 26);
  // Chest armor/exoskeleton
  ctx.fillStyle = '#4a1515';
  ctx.fillRect(-12, -6 + breathe, 24, 8);
  ctx.fillStyle = '#5a1a1a';
  ctx.fillRect(-10, -4 + breathe, 20, 4);
  // Core (pulsing red)
  ctx.fillStyle = '#f00';
  ctx.shadowColor = '#f00';
  ctx.shadowBlur = 6 * eyeGlow;
  ctx.fillRect(-3, 2 + breathe, 6, 6);
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(-2, 3 + breathe, 4, 4);
  ctx.shadowBlur = 0;
  // Ribs/markings
  ctx.fillStyle = '#5a2020';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(-10, 10 + i * 4 + breathe, 20, 1);
  }

  // Arms (massive with claws)
  ctx.fillStyle = '#3a1010';
  ctx.fillRect(-20, -5 + breathe, 6, 14);
  ctx.fillRect(14, -5 + breathe, 6, 14);
  // Forearms
  ctx.fillStyle = '#4a1515';
  ctx.fillRect(-22, 6 + breathe, 6, 10);
  ctx.fillRect(16, 6 + breathe, 6, 10);
  // Claws
  ctx.fillStyle = '#8a3030';
  ctx.fillRect(-24, 14, 3, 6);
  ctx.fillRect(-21, 15, 3, 5);
  ctx.fillRect(18, 14, 3, 6);
  ctx.fillRect(21, 15, 3, 5);

  // Head (horned, menacing)
  ctx.fillStyle = '#5a1515';
  ctx.fillRect(-10, -22, 20, 15);
  ctx.fillRect(-8, -25, 16, 4);
  // Jaw
  ctx.fillStyle = '#4a1010';
  ctx.fillRect(-8, -9, 16, 4);
  // Teeth
  ctx.fillStyle = '#ddd';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-6 + i * 4, -9, 2, 3);
  }

  // Horns (large, curved)
  ctx.fillStyle = '#8a3030';
  ctx.fillRect(-14, -28, 4, 10);
  ctx.fillRect(-16, -32, 3, 6);
  ctx.fillRect(-17, -34, 2, 3);
  ctx.fillRect(10, -28, 4, 10);
  ctx.fillRect(13, -32, 3, 6);
  ctx.fillRect(15, -34, 2, 3);

  // Eyes (glowing yellow)
  ctx.fillStyle = '#ff0';
  ctx.shadowColor = '#ff0';
  ctx.shadowBlur = 5 * eyeGlow;
  ctx.fillRect(-7, -20, 4, 4);
  ctx.fillRect(3, -20, 4, 4);
  // Pupils
  ctx.fillStyle = '#f80';
  ctx.fillRect(-6, -19, 2, 2);
  ctx.fillRect(4, -19, 2, 2);
  ctx.shadowBlur = 0;

  // Crown/crest
  ctx.fillStyle = '#aa2020';
  ctx.fillRect(-6, -27, 12, 3);
  ctx.fillRect(-4, -29, 8, 3);

  // Ability aura
  if (ability) {
    ctx.save();
    ctx.globalAlpha = 0.2 + Math.sin(time * 6) * 0.1;
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 2;
    ctx.strokeRect(-26, -36, 52, 66);
    ctx.restore();
  }

  // Shield effect
  if (isShielded) {
    ctx.save();
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3 + Math.sin(time * 8) * 0.2;
    ctx.strokeRect(-28, -38, 56, 70);
    ctx.fillStyle = '#0ff';
    ctx.globalAlpha = 0.05;
    ctx.fillRect(-28, -38, 56, 70);
    ctx.restore();
  }
}

// Ship (space mini-game) — bigger and more detailed
export function drawShip(ctx, time) {
  // Main hull
  ctx.fillStyle = '#0a3a4a';
  ctx.fillRect(-8, -20, 16, 30);
  // Nose cone
  ctx.fillStyle = '#0a5a6a';
  ctx.fillRect(-6, -26, 12, 8);
  ctx.fillRect(-4, -30, 8, 5);
  ctx.fillRect(-2, -32, 4, 3);
  // Wings
  ctx.fillStyle = '#085858';
  ctx.fillRect(-20, -4, 12, 16);
  ctx.fillRect(8, -4, 12, 16);
  // Wing detail
  ctx.fillStyle = '#0a6a6a';
  ctx.fillRect(-18, -2, 8, 4);
  ctx.fillRect(10, -2, 8, 4);
  // Wing tips (red lights)
  ctx.fillStyle = '#f00';
  ctx.fillRect(-20, 2, 3, 3);
  ctx.fillRect(17, 2, 3, 3);
  // Cockpit (glowing)
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 4;
  ctx.fillRect(-4, -24, 8, 6);
  ctx.fillStyle = '#088';
  ctx.fillRect(-3, -23, 6, 4);
  ctx.shadowBlur = 0;
  // Hull details
  ctx.strokeStyle = '#0aa';
  ctx.lineWidth = 1;
  ctx.strokeRect(-8, -20, 16, 30);
  ctx.fillStyle = '#055';
  ctx.fillRect(-6, -8, 12, 2);
  ctx.fillRect(-6, 0, 12, 2);
  // Engines (dual, with flame)
  ctx.fillStyle = '#f80';
  ctx.globalAlpha = 0.6 + Math.random() * 0.3;
  const f1 = 6 + Math.random() * 10;
  const f2 = 6 + Math.random() * 10;
  ctx.fillRect(-6, 10, 4, f1);
  ctx.fillRect(2, 10, 4, f2);
  ctx.fillStyle = '#ff0';
  ctx.globalAlpha = 0.3 + Math.random() * 0.3;
  ctx.fillRect(-5, 12, 2, f1 - 3);
  ctx.fillRect(3, 12, 2, f2 - 3);
  ctx.globalAlpha = 1;
}

// Space enemies — bigger and more detailed
export function drawSpaceEnemy(ctx, type, time) {
  switch (type) {
    case 'basic':
      // Red fighter drone
      ctx.fillStyle = '#8a2020';
      ctx.fillRect(-8, -10, 16, 18);
      ctx.fillStyle = '#aa3030';
      ctx.fillRect(-6, -8, 12, 6);
      // Wings
      ctx.fillStyle = '#6a1515';
      ctx.fillRect(-14, -4, 6, 10);
      ctx.fillRect(8, -4, 6, 10);
      // Cockpit
      ctx.fillStyle = '#ff0';
      ctx.fillRect(-3, -6, 6, 4);
      // Cannon
      ctx.fillStyle = '#444';
      ctx.fillRect(-2, 6, 4, 6);
      ctx.fillStyle = '#f44';
      ctx.fillRect(-1, 10, 2, 3);
      break;
    case 'fast':
      // Small yellow interceptor
      ctx.fillStyle = '#8a7700';
      ctx.fillRect(-5, -8, 10, 14);
      ctx.fillStyle = '#aa9900';
      ctx.fillRect(-4, -6, 8, 4);
      // Angled wings
      ctx.fillStyle = '#6a5500';
      ctx.fillRect(-10, -2, 5, 6);
      ctx.fillRect(5, -2, 5, 6);
      // Cockpit
      ctx.fillStyle = '#ff0';
      ctx.fillRect(-2, -5, 4, 3);
      // Engine
      ctx.fillStyle = '#f80';
      ctx.globalAlpha = 0.5 + Math.random() * 0.3;
      ctx.fillRect(-2, 5, 4, 4 + Math.random() * 4);
      ctx.globalAlpha = 1;
      break;
    case 'heavy':
      // Large armored battleship
      ctx.fillStyle = '#4a1a1a';
      ctx.fillRect(-14, -14, 28, 26);
      ctx.strokeStyle = '#8a3030';
      ctx.lineWidth = 2;
      ctx.strokeRect(-14, -14, 28, 26);
      // Armor panels
      ctx.fillStyle = '#5a2525';
      ctx.fillRect(-12, -12, 24, 6);
      ctx.fillRect(-12, 2, 24, 6);
      // Bridge
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-6, -8, 12, 6);
      // Eyes
      ctx.fillStyle = '#ff0';
      ctx.fillRect(-5, -6, 3, 3);
      ctx.fillRect(2, -6, 3, 3);
      // Side cannons
      ctx.fillStyle = '#333';
      ctx.fillRect(-16, -4, 3, 8);
      ctx.fillRect(13, -4, 3, 8);
      ctx.fillStyle = '#f44';
      ctx.fillRect(-16, 2, 3, 3);
      ctx.fillRect(13, 2, 3, 3);
      // Bottom armor
      ctx.fillStyle = '#6a2a2a';
      ctx.fillRect(-10, 10, 20, 4);
      break;
  }
}

// HQ Player (walking character) — bigger
export function drawHQPlayer(ctx, dir, time) {
  const walk = Math.sin(time * 8) * 1.5;
  // Boots
  ctx.fillStyle = '#1a3030';
  ctx.fillRect(-5, 8 + walk * 0.3, 4, 5);
  ctx.fillRect(1, 8 - walk * 0.3, 4, 5);
  // Body
  ctx.fillStyle = '#0a3a3a';
  ctx.fillRect(-6, -4, 12, 14);
  ctx.fillStyle = '#0d5050';
  ctx.fillRect(-5, -2, 10, 5);
  // Head
  ctx.fillStyle = '#0a4545';
  ctx.fillRect(-5, -12, 10, 9);
  // Visor
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 3;
  ctx.fillRect(-4, -10, 8, 2);
  ctx.shadowBlur = 0;
}

// Commander NPC — military officer with scars
export function drawCommander(ctx, time) {
  const breathe = Math.sin(time * 3) * 0.3;
  // Legs
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(-4, 8, 3, 6);
  ctx.fillRect(1, 8, 3, 6);
  // Body (military uniform)
  ctx.fillStyle = '#1a2a1a';
  ctx.fillRect(-6, -3 + breathe, 12, 13);
  // Epaulettes
  ctx.fillStyle = '#aa8800';
  ctx.fillRect(-7, -2 + breathe, 3, 3);
  ctx.fillRect(4, -2 + breathe, 3, 3);
  // Medals
  ctx.fillStyle = '#ff0';
  ctx.fillRect(-4, 2 + breathe, 2, 2);
  ctx.fillStyle = '#f00';
  ctx.fillRect(-1, 2 + breathe, 2, 2);
  ctx.fillStyle = '#0af';
  ctx.fillRect(2, 2 + breathe, 2, 2);
  // Head
  ctx.fillStyle = '#c8a882';
  ctx.fillRect(-5, -11, 10, 9);
  // Hair (military cut)
  ctx.fillStyle = '#333';
  ctx.fillRect(-5, -13, 10, 3);
  // Scar
  ctx.fillStyle = '#a08060';
  ctx.fillRect(1, -9, 1, 4);
  // Eyes
  ctx.fillStyle = '#333';
  ctx.fillRect(-3, -8, 2, 2);
  ctx.fillRect(2, -8, 2, 2);
  // Mouth (stern)
  ctx.fillStyle = '#a07060';
  ctx.fillRect(-2, -4, 4, 1);
  // Cap
  ctx.fillStyle = '#1a3a1a';
  ctx.fillRect(-6, -14, 12, 3);
  ctx.fillStyle = '#aa8800';
  ctx.fillRect(-5, -12, 10, 1);
}

// Defeated boss in dialogue
export function drawDefeatedBoss(ctx, time) {
  ctx.save();
  ctx.globalAlpha = 0.35 + Math.sin(time * 2) * 0.08;
  // Collapsed body
  ctx.fillStyle = '#3a0a0a';
  ctx.fillRect(-16, -4, 32, 16);
  ctx.fillStyle = '#4a1515';
  ctx.fillRect(-14, -2, 28, 6);
  // Head (down)
  ctx.fillStyle = '#5a1515';
  ctx.fillRect(-8, -14, 16, 12);
  // Horns (broken)
  ctx.fillStyle = '#8a3030';
  ctx.fillRect(-11, -18, 3, 6);
  ctx.fillRect(8, -18, 3, 6);
  // X eyes (defeated)
  ctx.fillStyle = '#880';
  ctx.fillRect(-5, -10, 2, 2);
  ctx.fillRect(-3, -12, 2, 2);
  ctx.fillRect(2, -10, 2, 2);
  ctx.fillRect(4, -12, 2, 2);
  ctx.restore();
}
