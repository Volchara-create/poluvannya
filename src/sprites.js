// ============================================
// SPRITES — Enter the Gungeon style pre-rendered
// Round shapes, thick outlines, big eyes, bright colors
// All sprites cached on offscreen canvases
// ============================================

const cache = {};

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

// --- Drawing helpers ---
function outline(ctx, x, y, r, fill, stroke = '#111', lw = 2) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
}

function roundRect(ctx, x, y, w, h, fill, stroke = '#111', lw = 2) {
  ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = lw;
  ctx.beginPath();
  const r = Math.min(3, w / 4, h / 4);
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.fill(); ctx.stroke();
}

function eye(ctx, x, y, r, pupilDir = 0) {
  // White
  outline(ctx, x, y, r, '#fff', '#111', 1.5);
  // Pupil
  ctx.beginPath();
  ctx.arc(x + pupilDir * r * 0.3, y + r * 0.15, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = '#111'; ctx.fill();
  // Shine
  ctx.beginPath();
  ctx.arc(x + pupilDir * r * 0.1 - r * 0.2, y - r * 0.2, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}

function glow(ctx, x, y, r, color, alpha = 0.15) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'transparent');
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ============================================
// PLAYER — Bounty Hunter (Gungeon style)
// ============================================
function renderPlayer(frame) {
  const key = 'player_' + frame;
  if (cache[key]) return cache[key];
  const [c, g] = makeCanvas(48, 56);
  const cx = 24, cy = 28;

  // Shadow
  g.globalAlpha = 0.2;
  g.fillStyle = '#000';
  g.beginPath(); g.ellipse(cx, 50, 12, 4, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1;

  // Legs
  const legOff = frame === 1 ? 2 : frame === 2 ? -2 : 0;
  roundRect(g, 14, 38 + legOff, 7, 10, '#1a5a5a', '#0a3a3a', 1.5);
  roundRect(g, 27, 38 - legOff, 7, 10, '#1a5a5a', '#0a3a3a', 1.5);
  // Boots
  roundRect(g, 13, 45 + legOff, 9, 5, '#0d3d3d', '#082828', 1.5);
  roundRect(g, 26, 45 - legOff, 9, 5, '#0d3d3d', '#082828', 1.5);

  // Body
  roundRect(g, 13, 24, 22, 18, '#1a6a6a', '#0a4a4a', 2);
  // Chest plate
  roundRect(g, 15, 26, 18, 8, '#2a8a8a', '#1a6a6a', 1);
  // Belt
  roundRect(g, 13, 38, 22, 4, '#886600', '#664400', 1.5);

  // Head (big, round — Gungeon style)
  outline(g, cx, 16, 13, '#1a7a7a', '#0a5a5a', 2.5);
  // Helmet top
  g.beginPath();
  g.arc(cx, 14, 13, Math.PI, 0);
  g.fillStyle = '#1a8888'; g.fill();
  g.strokeStyle = '#0a5a5a'; g.lineWidth = 2; g.stroke();

  // Visor (big glowing stripe)
  g.fillStyle = '#0ff';
  g.shadowColor = '#0ff'; g.shadowBlur = 8;
  g.beginPath();
  g.moveTo(12, 16); g.lineTo(36, 16);
  g.lineTo(34, 21); g.lineTo(14, 21);
  g.closePath(); g.fill();
  g.shadowBlur = 0;
  // Visor detail
  g.fillStyle = '#088';
  g.fillRect(16, 18, 16, 1);

  // Antenna
  g.strokeStyle = '#0aa'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(32, 6); g.lineTo(34, 1); g.stroke();
  g.fillStyle = '#0ff'; g.shadowColor = '#0ff'; g.shadowBlur = 4;
  outline(g, 34, 1, 2, '#0ff', '#088', 1);
  g.shadowBlur = 0;

  // Chest emblem
  glow(g, cx, 31, 4, '#0ff', 0.3);
  g.fillStyle = '#0ff';
  g.beginPath(); g.arc(cx, 31, 2, 0, Math.PI * 2); g.fill();

  cache[key] = c;
  return c;
}

// ============================================
// HQ Player (smaller, walking)
// ============================================
function renderHQPlayer(dir) {
  const key = 'hqplayer_' + dir;
  if (cache[key]) return cache[key];
  const [c, g] = makeCanvas(28, 36);
  const cx = 14;

  // Shadow
  g.globalAlpha = 0.15;
  g.fillStyle = '#000';
  g.beginPath(); g.ellipse(cx, 33, 8, 3, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1;

  // Legs
  roundRect(g, 7, 24, 5, 7, '#1a5a5a', '#0a3a3a', 1);
  roundRect(g, 16, 24, 5, 7, '#1a5a5a', '#0a3a3a', 1);

  // Body
  roundRect(g, 6, 14, 16, 12, '#1a6a6a', '#0a4a4a', 1.5);

  // Head
  outline(g, cx, 9, 9, '#1a7a7a', '#0a5a5a', 1.5);
  // Visor
  g.fillStyle = '#0ff'; g.shadowColor = '#0ff'; g.shadowBlur = 4;
  g.fillRect(7, 9, 14, 3);
  g.shadowBlur = 0;

  cache[key] = c;
  return c;
}

// ============================================
// ENEMIES
// ============================================

// Shooter — tall purple alien, 3 eyes
function renderShooter(frame) {
  const key = 'shooter_' + frame;
  if (cache[key]) return cache[key];
  const [c, g] = makeCanvas(44, 56);
  const cx = 22;

  // Shadow
  g.globalAlpha = 0.15; g.fillStyle = '#000';
  g.beginPath(); g.ellipse(cx, 52, 10, 3, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1;

  // Legs (thin alien)
  roundRect(g, 13, 38, 5, 12, '#3a1555', '#2a0a40', 1.5);
  roundRect(g, 26, 38, 5, 12, '#3a1555', '#2a0a40', 1.5);
  // Clawed feet
  g.fillStyle = '#4a2068'; g.strokeStyle = '#2a0a40'; g.lineWidth = 1;
  g.fillRect(10, 48, 8, 3); g.strokeRect(10, 48, 8, 3);
  g.fillRect(25, 48, 8, 3); g.strokeRect(25, 48, 8, 3);

  // Robe body
  g.beginPath();
  g.moveTo(10, 22); g.lineTo(34, 22);
  g.lineTo(36, 40); g.lineTo(8, 40);
  g.closePath();
  g.fillStyle = '#3a1858'; g.fill();
  g.strokeStyle = '#2a0a40'; g.lineWidth = 2; g.stroke();
  // Robe markings
  g.strokeStyle = '#a0f'; g.lineWidth = 1; g.globalAlpha = 0.4;
  g.beginPath(); g.moveTo(12, 28); g.lineTo(32, 28); g.stroke();
  g.beginPath(); g.moveTo(12, 33); g.lineTo(32, 33); g.stroke();
  g.globalAlpha = 1;

  // Head (elongated alien skull)
  g.beginPath();
  g.ellipse(cx, 12, 10, 14, 0, 0, Math.PI * 2);
  g.fillStyle = '#5a2878'; g.fill();
  g.strokeStyle = '#3a1555'; g.lineWidth = 2; g.stroke();

  // 3 eyes (glowing magenta)
  eye(g, 14, 10, 3.5, 0);
  eye(g, 22, 8, 3.5, 0);
  eye(g, 30, 10, 3.5, 0);
  // Eye glow
  glow(g, 14, 10, 6, '#f0f', 0.15);
  glow(g, 22, 8, 6, '#f0f', 0.15);
  glow(g, 30, 10, 6, '#f0f', 0.15);

  // Arms with rifle
  roundRect(g, 2, 26, 6, 14, '#3a1858', '#2a0a40', 1);
  roundRect(g, 36, 26, 6, 14, '#3a1858', '#2a0a40', 1);
  // Plasma rifle
  roundRect(g, 36, 32, 16, 5, '#665500', '#443300', 1.5);
  g.fillStyle = '#f80'; g.shadowColor = '#f80'; g.shadowBlur = 3;
  outline(g, 50, 34, 2, '#f80', '#a50', 1);
  g.shadowBlur = 0;

  cache[key] = c;
  return c;
}

// Kamikaze — glowing bug
function renderKamikaze(frame) {
  const key = 'kamikaze_' + frame;
  if (cache[key]) return cache[key];
  const [c, g] = makeCanvas(40, 48);
  const cx = 20;

  // Danger glow
  glow(g, cx, 24, 20, '#ff0', 0.1);

  // Shadow
  g.globalAlpha = 0.12; g.fillStyle = '#000';
  g.beginPath(); g.ellipse(cx, 44, 9, 3, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1;

  // Wings
  g.globalAlpha = 0.4;
  const wf = frame === 1 ? 3 : frame === 2 ? -3 : 0;
  g.beginPath(); g.ellipse(7, 20 + wf, 8, 12, -0.3, 0, Math.PI * 2);
  g.fillStyle = '#aa8800'; g.fill(); g.strokeStyle = '#886600'; g.lineWidth = 1; g.stroke();
  g.beginPath(); g.ellipse(33, 20 - wf, 8, 12, 0.3, 0, Math.PI * 2);
  g.fillStyle = '#aa8800'; g.fill(); g.strokeStyle = '#886600'; g.lineWidth = 1; g.stroke();
  g.globalAlpha = 1;

  // Antennae
  g.strokeStyle = '#888800'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(15, 10); g.quadraticCurveTo(12, 2, 10, 0); g.stroke();
  g.beginPath(); g.moveTo(25, 10); g.quadraticCurveTo(28, 2, 30, 0); g.stroke();
  outline(g, 10, 0, 2, '#ff0', '#aa0', 1);
  outline(g, 30, 0, 2, '#ff0', '#aa0', 1);

  // Head
  outline(g, cx, 12, 8, '#6a5500', '#4a3500', 2);
  // Compound eyes (red, big)
  eye(g, 15, 11, 4, -1);
  eye(g, 25, 11, 4, 1);
  // Override eye color to red
  g.beginPath(); g.arc(15 - 1.2, 11.6, 2.2, 0, Math.PI * 2);
  g.fillStyle = '#f00'; g.fill();
  g.beginPath(); g.arc(25 + 1.2, 11.6, 2.2, 0, Math.PI * 2);
  g.fillStyle = '#f00'; g.fill();

  // Thorax
  outline(g, cx, 24, 9, '#7a6500', '#5a4500', 2);
  // Danger stripes
  g.fillStyle = '#ff8800';
  g.fillRect(12, 21, 16, 2);
  g.fillRect(12, 25, 16, 2);

  // Abdomen
  g.beginPath(); g.ellipse(cx, 34, 7, 8, 0, 0, Math.PI * 2);
  g.fillStyle = '#6a5500'; g.fill();
  g.strokeStyle = '#4a3500'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#ff8800';
  g.fillRect(14, 31, 12, 2);
  g.fillRect(14, 35, 12, 2);

  // Stinger (glowing)
  g.fillStyle = '#ff0'; g.shadowColor = '#ff0'; g.shadowBlur = 6;
  g.beginPath(); g.moveTo(18, 40); g.lineTo(cx, 48); g.lineTo(22, 40); g.fill();
  g.shadowBlur = 0;

  // Small legs
  g.strokeStyle = '#5a4500'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(12, 22); g.lineTo(6, 26); g.stroke();
  g.beginPath(); g.moveTo(28, 22); g.lineTo(34, 26); g.stroke();
  g.beginPath(); g.moveTo(12, 28); g.lineTo(5, 32); g.stroke();
  g.beginPath(); g.moveTo(28, 28); g.lineTo(35, 32); g.stroke();

  cache[key] = c;
  return c;
}

// Shield — massive armored golem
function renderShield(frame) {
  const key = 'shield_' + frame;
  if (cache[key]) return cache[key];
  const [c, g] = makeCanvas(56, 64);
  const cx = 28;

  // Shadow
  g.globalAlpha = 0.2; g.fillStyle = '#000';
  g.beginPath(); g.ellipse(cx, 60, 16, 5, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1;

  // Legs (thick armored)
  roundRect(g, 14, 44, 10, 14, '#2a3a55', '#1a2540', 2);
  roundRect(g, 32, 44, 10, 14, '#2a3a55', '#1a2540', 2);
  // Boots
  roundRect(g, 12, 54, 14, 6, '#3a4a6a', '#2a3555', 2);
  roundRect(g, 30, 54, 14, 6, '#3a4a6a', '#2a3555', 2);

  // Massive body
  roundRect(g, 10, 18, 36, 30, '#2a3a58', '#1a2848', 2.5);
  // Armor plates
  roundRect(g, 12, 20, 32, 10, '#3a4a6a', '#2a3a55', 1);
  roundRect(g, 12, 34, 32, 10, '#3a4a6a', '#2a3a55', 1);
  // Center power core
  glow(g, cx, 32, 10, '#0af', 0.2);
  outline(g, cx, 32, 5, '#0af', '#068', 1.5);
  outline(g, cx, 32, 3, '#0ff', '#0af', 1);

  // Energy shield (left arm)
  roundRect(g, 0, 14, 12, 36, '#4a6a9a', '#3a5a8a', 2);
  // Shield runes
  g.fillStyle = '#0af'; g.shadowColor = '#0af'; g.shadowBlur = 3;
  g.fillRect(3, 20, 6, 1); g.fillRect(3, 26, 6, 1);
  g.fillRect(3, 32, 6, 1); g.fillRect(3, 38, 6, 1);
  g.shadowBlur = 0;

  // Weapon arm (right)
  roundRect(g, 44, 22, 8, 16, '#3a4a6a', '#2a3a55', 1.5);
  roundRect(g, 48, 26, 12, 8, '#4a5a7a', '#3a4a6a', 1.5);
  g.fillStyle = '#0af'; g.shadowColor = '#0af'; g.shadowBlur = 3;
  outline(g, 58, 30, 3, '#0af', '#068', 1);
  g.shadowBlur = 0;

  // Head (small, armored)
  outline(g, cx, 11, 10, '#4a5a7a', '#3a4a6a', 2.5);
  // Visor slit
  g.fillStyle = '#0ff'; g.shadowColor = '#0ff'; g.shadowBlur = 6;
  g.fillRect(20, 10, 16, 4);
  g.shadowBlur = 0;
  // Helmet fins
  roundRect(g, 16, 4, 4, 10, '#5a6a8a', '#4a5a7a', 1);
  roundRect(g, 36, 4, 4, 10, '#5a6a8a', '#4a5a7a', 1);

  cache[key] = c;
  return c;
}

// Boss — Warden Xar'Voth
function renderBoss(frame) {
  const key = 'boss_' + frame;
  if (cache[key]) return cache[key];
  const [c, g] = makeCanvas(72, 88);
  const cx = 36;

  // Shadow
  g.globalAlpha = 0.2; g.fillStyle = '#000';
  g.beginPath(); g.ellipse(cx, 82, 20, 6, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 1;

  // Legs
  roundRect(g, 20, 60, 12, 16, '#3a0a0a', '#2a0505', 2);
  roundRect(g, 40, 60, 12, 16, '#3a0a0a', '#2a0505', 2);
  // Clawed feet
  g.fillStyle = '#6a1818';
  g.beginPath(); g.moveTo(16, 74); g.lineTo(24, 78); g.lineTo(18, 78); g.fill();
  g.beginPath(); g.moveTo(26, 74); g.lineTo(34, 78); g.lineTo(28, 78); g.fill();
  g.beginPath(); g.moveTo(46, 74); g.lineTo(54, 78); g.lineTo(48, 78); g.fill();
  g.beginPath(); g.moveTo(56, 74); g.lineTo(48, 78); g.lineTo(54, 78); g.fill();

  // Massive body
  roundRect(g, 12, 30, 48, 34, '#4a1010', '#2a0505', 3);
  // Exoskeleton
  roundRect(g, 15, 32, 42, 10, '#5a1818', '#3a0a0a', 1);
  // Rib markings
  g.strokeStyle = '#6a2020'; g.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    g.beginPath(); g.moveTo(18, 46 + i * 5); g.lineTo(54, 46 + i * 5); g.stroke();
  }
  // Core (pulsing red orb)
  glow(g, cx, 42, 14, '#f00', 0.2);
  outline(g, cx, 42, 6, '#f00', '#a00', 2);
  outline(g, cx, 42, 3, '#ff4444', '#f00', 1);
  g.fillStyle = '#ff8888';
  g.beginPath(); g.arc(cx, 42, 2, 0, Math.PI * 2); g.fill();

  // Arms
  roundRect(g, 2, 32, 10, 20, '#4a1515', '#2a0808', 2);
  roundRect(g, 60, 32, 10, 20, '#4a1515', '#2a0808', 2);
  // Forearms
  roundRect(g, 0, 50, 10, 16, '#5a1818', '#3a0a0a', 1.5);
  roundRect(g, 62, 50, 10, 16, '#5a1818', '#3a0a0a', 1.5);
  // Claws
  g.fillStyle = '#8a3030';
  for (let i = 0; i < 3; i++) {
    g.beginPath(); g.moveTo(i * 4, 64); g.lineTo(i * 4 - 2, 72); g.lineTo(i * 4 + 3, 64); g.fill();
    g.beginPath(); g.moveTo(62 + i * 4, 64); g.lineTo(62 + i * 4 - 2, 72); g.lineTo(62 + i * 4 + 3, 64); g.fill();
  }

  // Head
  outline(g, cx, 18, 14, '#5a1818', '#3a0a0a', 3);
  // Crown/crest
  g.fillStyle = '#aa2020';
  g.beginPath();
  g.moveTo(24, 8); g.lineTo(28, 2); g.lineTo(32, 6); g.lineTo(36, 0);
  g.lineTo(40, 6); g.lineTo(44, 2); g.lineTo(48, 8);
  g.lineTo(cx, 12); g.closePath(); g.fill();
  g.strokeStyle = '#881515'; g.lineWidth = 1; g.stroke();

  // HORNS
  g.fillStyle = '#8a3030'; g.strokeStyle = '#5a1818'; g.lineWidth = 2;
  // Left horn
  g.beginPath(); g.moveTo(22, 12); g.quadraticCurveTo(14, 4, 10, -2);
  g.lineTo(14, 0); g.quadraticCurveTo(18, 6, 26, 12); g.fill(); g.stroke();
  // Right horn
  g.beginPath(); g.moveTo(50, 12); g.quadraticCurveTo(58, 4, 62, -2);
  g.lineTo(58, 0); g.quadraticCurveTo(54, 6, 46, 12); g.fill(); g.stroke();

  // Eyes (glowing yellow, menacing)
  g.fillStyle = '#ff0'; g.shadowColor = '#ff0'; g.shadowBlur = 8;
  eye(g, 29, 16, 5, -1);
  eye(g, 43, 16, 5, 1);
  g.shadowBlur = 0;
  // Override pupils to red slits
  g.fillStyle = '#f00';
  g.fillRect(28, 14, 2, 5);
  g.fillRect(42, 14, 2, 5);

  // Teeth
  g.fillStyle = '#eee';
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.moveTo(27 + i * 4, 26); g.lineTo(29 + i * 4, 30); g.lineTo(31 + i * 4, 26);
    g.fill();
  }

  cache[key] = c;
  return c;
}

// Space enemies
function renderSpaceBasic() {
  if (cache.spaceBasic) return cache.spaceBasic;
  const [c, g] = makeCanvas(32, 36);
  // Red fighter body
  g.beginPath();
  g.moveTo(16, 2); g.lineTo(28, 30); g.lineTo(4, 30); g.closePath();
  g.fillStyle = '#8a2020'; g.fill();
  g.strokeStyle = '#5a1010'; g.lineWidth = 2; g.stroke();
  // Wings
  roundRect(g, 0, 14, 8, 14, '#6a1515', '#4a0a0a', 1.5);
  roundRect(g, 24, 14, 8, 14, '#6a1515', '#4a0a0a', 1.5);
  // Cockpit
  outline(g, 16, 14, 4, '#ff0', '#aa0', 1.5);
  // Engine
  g.fillStyle = '#f44'; g.shadowColor = '#f44'; g.shadowBlur = 3;
  outline(g, 16, 32, 3, '#f44', '#a22', 1);
  g.shadowBlur = 0;
  cache.spaceBasic = c;
  return c;
}

function renderSpaceFast() {
  if (cache.spaceFast) return cache.spaceFast;
  const [c, g] = makeCanvas(28, 32);
  // Yellow interceptor
  g.beginPath();
  g.moveTo(14, 0); g.lineTo(26, 24); g.lineTo(2, 24); g.closePath();
  g.fillStyle = '#8a7700'; g.fill();
  g.strokeStyle = '#5a4400'; g.lineWidth = 2; g.stroke();
  // Delta wings
  g.beginPath(); g.moveTo(0, 12); g.lineTo(6, 8); g.lineTo(6, 20); g.closePath();
  g.fillStyle = '#6a5500'; g.fill();
  g.beginPath(); g.moveTo(28, 12); g.lineTo(22, 8); g.lineTo(22, 20); g.closePath();
  g.fillStyle = '#6a5500'; g.fill();
  // Cockpit
  outline(g, 14, 10, 3, '#ff0', '#aa0', 1);
  cache.spaceFast = c;
  return c;
}

function renderSpaceHeavy() {
  if (cache.spaceHeavy) return cache.spaceHeavy;
  const [c, g] = makeCanvas(44, 40);
  // Armored body
  roundRect(g, 6, 2, 32, 32, '#4a1818', '#2a0808', 2.5);
  roundRect(g, 10, 4, 24, 10, '#5a2020', '#3a0a0a', 1);
  // Side cannons
  roundRect(g, 0, 10, 6, 14, '#444', '#222', 1.5);
  roundRect(g, 38, 10, 6, 14, '#444', '#222', 1.5);
  g.fillStyle = '#f44';
  outline(g, 3, 22, 2, '#f44', '#a22', 1);
  outline(g, 41, 22, 2, '#f44', '#a22', 1);
  // Eyes
  g.fillStyle = '#ff0'; g.shadowColor = '#ff0'; g.shadowBlur = 3;
  eye(g, 16, 10, 4, 0);
  eye(g, 28, 10, 4, 0);
  g.shadowBlur = 0;
  cache.spaceHeavy = c;
  return c;
}

// Commander NPC
function renderCommander() {
  if (cache.commander) return cache.commander;
  const [c, g] = makeCanvas(32, 40);
  const cx = 16;

  // Legs
  roundRect(g, 9, 28, 5, 8, '#1a1a28', '#111118', 1);
  roundRect(g, 18, 28, 5, 8, '#1a1a28', '#111118', 1);

  // Body (uniform)
  roundRect(g, 7, 16, 18, 14, '#1a3a1a', '#0a2a0a', 2);
  // Epaulettes
  roundRect(g, 5, 16, 4, 3, '#aa8800', '#886600', 1);
  roundRect(g, 23, 16, 4, 3, '#aa8800', '#886600', 1);
  // Medals
  outline(g, 11, 23, 1.5, '#ff0', '#aa0', 0.5);
  outline(g, 15, 23, 1.5, '#f00', '#a00', 0.5);
  outline(g, 19, 23, 1.5, '#0af', '#068', 0.5);

  // Head
  outline(g, cx, 9, 8, '#c8a882', '#a08060', 2);
  // Eyes
  eye(g, 13, 8, 2.5, 0);
  eye(g, 19, 8, 2.5, 0);
  // Scar
  g.strokeStyle = '#a08060'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(20, 6); g.lineTo(21, 12); g.stroke();

  // Cap
  roundRect(g, 7, 0, 18, 6, '#1a3a1a', '#0a2a0a', 1.5);
  roundRect(g, 6, 5, 20, 3, '#2a4a2a', '#1a3a1a', 1);
  // Badge
  outline(g, cx, 3, 2, '#aa8800', '#886600', 0.5);

  cache.commander = c;
  return c;
}

// Ship sprite
function renderShip() {
  if (cache.ship) return cache.ship;
  const [c, g] = makeCanvas(40, 52);
  const cx = 20;

  // Main body
  g.beginPath();
  g.moveTo(cx, 2); g.lineTo(cx + 10, 18); g.lineTo(cx + 8, 40);
  g.lineTo(cx - 8, 40); g.lineTo(cx - 10, 18); g.closePath();
  g.fillStyle = '#0a5a6a'; g.fill();
  g.strokeStyle = '#085858'; g.lineWidth = 2; g.stroke();

  // Wings
  g.beginPath(); g.moveTo(cx - 10, 16); g.lineTo(cx - 20, 28);
  g.lineTo(cx - 18, 34); g.lineTo(cx - 8, 28); g.closePath();
  g.fillStyle = '#085858'; g.fill(); g.strokeStyle = '#064040'; g.lineWidth = 1.5; g.stroke();
  g.beginPath(); g.moveTo(cx + 10, 16); g.lineTo(cx + 20, 28);
  g.lineTo(cx + 18, 34); g.lineTo(cx + 8, 28); g.closePath();
  g.fillStyle = '#085858'; g.fill(); g.strokeStyle = '#064040'; g.lineWidth = 1.5; g.stroke();

  // Cockpit
  outline(g, cx, 12, 5, '#0ff', '#088', 1.5);
  g.fillStyle = '#088'; g.beginPath(); g.arc(cx, 12, 3, 0, Math.PI * 2); g.fill();

  // Wing tips
  outline(g, cx - 19, 31, 2, '#f00', '#800', 1);
  outline(g, cx + 19, 31, 2, '#f00', '#800', 1);

  // Detail lines
  g.strokeStyle = '#0aa'; g.lineWidth = 0.5;
  g.beginPath(); g.moveTo(cx, 6); g.lineTo(cx, 36); g.stroke();

  cache.ship = c;
  return c;
}

// ============================================
// PUBLIC API
// ============================================
export function getPlayer(frame = 0) { return renderPlayer(frame); }
export function getHQPlayer(dir = 'down') { return renderHQPlayer(dir); }
export function getShooter(frame = 0) { return renderShooter(frame); }
export function getKamikaze(frame = 0) { return renderKamikaze(frame); }
export function getShield(frame = 0) { return renderShield(frame); }
export function getBoss(frame = 0) { return renderBoss(frame); }
export function getSpaceBasic() { return renderSpaceBasic(); }
export function getSpaceFast() { return renderSpaceFast(); }
export function getSpaceHeavy() { return renderSpaceHeavy(); }
export function getCommander() { return renderCommander(); }
export function getShip() { return renderShip(); }
export function getDefeatedBoss() {
  if (cache.defBoss) return cache.defBoss;
  const [c, g] = makeCanvas(72, 40);
  g.globalAlpha = 0.4;
  g.translate(36, 20);
  g.scale(0.7, 0.4);
  g.translate(-36, -44);
  g.drawImage(renderBoss(0), 0, 0);
  // X eyes
  g.globalAlpha = 0.6;
  g.strokeStyle = '#880'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(26, 13); g.lineTo(32, 19); g.moveTo(32, 13); g.lineTo(26, 19); g.stroke();
  g.beginPath(); g.moveTo(40, 13); g.lineTo(46, 19); g.moveTo(46, 13); g.lineTo(40, 19); g.stroke();
  cache.defBoss = c;
  return c;
}

// Clear cache (if needed)
export function clearCache() {
  for (const k in cache) delete cache[k];
}
