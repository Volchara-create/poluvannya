// ============================================
// SAVE SYSTEM — 3 independent slots
// ============================================

export function createNewSave() {
  return {
    missionNumber: 0,
    credits: 0,
    baseLevel: 1,
    playerHP: 100,
    playerMaxHP: 100,
    playerSpeed: 3,
    hpLevel: 1,
    speedLevel: 1,
    shipHP: 80,
    shipMaxHP: 80,
    shipSpeed: 3,
    shipDamage: 10,
    shipBullets: 1,
    shipHPLevel: 1,
    shipSpeedLevel: 1,
    shipDamageLevel: 1,
    shipBulletsLevel: 1,
    weapons: [{ type: 'pistol', level: 1 }],
    activeWeapon: 0,
    abilities: {},
    hasInsurance: false,
    miniMapLevel: 0,
    shipSkin: 'default',
    playerSkin: 'default',
    hqDecor: 'default',
    collectedPhrases: [],
    crueltyRating: 0,
    secretRoomFound: false,
    endingsReached: [],
    tutorialShown: {
      move: false,
      interact: false,
      shoot: false,
      weapon: false
    },
    stats: {
      totalKills: 0,
      totalDeaths: 0,
      totalCreditsEarned: 0,
      playTime: 0
    }
  };
}

export let saves = [null, null, null];
export let currentSlot = -1;
export let save = null;

export function loadSaves() {
  try {
    const data = localStorage.getItem('poluvannya_saves');
    if (data) saves = JSON.parse(data);
  } catch (e) {
    saves = [null, null, null];
  }
}

export function setSlot(slot, saveData) {
  currentSlot = slot;
  save = saveData;
  saves[slot] = saveData;
}

export function saveToDisk() {
  if (currentSlot < 0 || !save) return;
  saves[currentSlot] = save;
  localStorage.setItem('poluvannya_saves', JSON.stringify(saves));
}

export function deleteSave(slot) {
  saves[slot] = null;
  localStorage.setItem('poluvannya_saves', JSON.stringify(saves));
}

export function updateBaseLevel() {
  if (!save) return;
  if (save.missionNumber >= 20) save.baseLevel = 5;
  else if (save.missionNumber >= 15) save.baseLevel = 4;
  else if (save.missionNumber >= 10) save.baseLevel = 3;
  else if (save.missionNumber >= 5) save.baseLevel = 2;
  else save.baseLevel = 1;
}

// Weapons data
export const WEAPONS = {
  pistol: { name: 'Пістолет', damage: 10, fireRate: 350, range: 280, type: 'ranged', bulletSpeed: 7, bulletCount: 1 },
  sword: { name: 'Меч', damage: 25, fireRate: 500, range: 45, type: 'melee', bulletSpeed: 0, bulletCount: 0 },
  machinegun: { name: 'Кулемет', damage: 4, fireRate: 90, range: 220, type: 'ranged', bulletSpeed: 8, bulletCount: 1, overheat: true, maxHeat: 100, heatPerShot: 6, coolRate: 30 },
  sniper: { name: 'Снайперка', damage: 45, fireRate: 1100, range: 450, type: 'ranged', bulletSpeed: 12, bulletCount: 1 }
};

export function getWeaponDamage(weaponType, level) {
  const base = WEAPONS[weaponType].damage;
  return base + (level - 1) * Math.ceil(base * 0.3);
}
