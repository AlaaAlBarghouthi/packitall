// Static game data: buildings, plots, boosters, tasks

export const BUILDINGS = {
  house:      { cost: 200,   income: 20,   unlock: 1,  pop: 4 },
  fountain:   { cost: 300,   income: 15,   unlock: 1,  pop: 2 },
  cafe:       { cost: 500,   income: 45,   unlock: 2,  pop: 6 },
  icecream:   { cost: 800,   income: 70,   unlock: 3,  pop: 6 },
  bakery:     { cost: 1100,  income: 95,   unlock: 4,  pop: 8 },
  park:       { cost: 900,   income: 60,   unlock: 5,  pop: 5 },
  boutique:   { cost: 1500,  income: 130,  unlock: 6,  pop: 10 },
  greenhouse: { cost: 2000,  income: 170,  unlock: 8,  pop: 8 },
  toystore:   { cost: 2600,  income: 220,  unlock: 10, pop: 12 },
  cinema:     { cost: 3500,  income: 300,  unlock: 12, pop: 16 },
  mansion:    { cost: 4500,  income: 380,  unlock: 14, pop: 14 },
  hotel:      { cost: 6000,  income: 500,  unlock: 16, pop: 30 },
  ferris:     { cost: 7500,  income: 620,  unlock: 18, pop: 20 },
  tower:      { cost: 9000,  income: 750,  unlock: 20, pop: 40 },
  stadium:    { cost: 12000, income: 1000, unlock: 23, pop: 50 },
  castle:     { cost: 16000, income: 1400, unlock: 26, pop: 60 },
  workshop:   { cost: 1200,  income: 110,  unlock: 2,  pop: 10, event: 'xmas' },
};
export const BUILDING_ORDER = Object.keys(BUILDINGS);

// ---- Materials: everything you swallow becomes building material of its category
export const MATS = {
  gift:   { icon: '🎁' },
  sweet:  { icon: '🍩' },
  toy:    { icon: '🧸' },
  nature: { icon: '🌳' },
  city:   { icon: '🧱' },
  festive: { icon: '🎄' },
};
export const MAT_ORDER = Object.keys(MATS);
export const MATERIAL_OF = {
  ring: 'gift', heels: 'gift', sunglasses: 'gift', brush: 'gift', chocobar: 'sweet', popsicle: 'sweet', milkshake: 'sweet', pancakes: 'sweet',
  dice: 'toy', yoyo: 'toy', train: 'toy', hotdog: 'nature', frisbee: 'nature', flowerpot: 'nature', parasol: 'nature', trashbin: 'city', trafficlight: 'city', bike: 'city',
  shell: 'nature', starfish: 'nature', sandcastle: 'nature', surfboard: 'nature', crab: 'nature', bucket: 'nature', lifebuoy: 'nature', palm: 'nature', boat: 'city',
  chicken: 'nature', egg: 'sweet', carrot: 'nature', pumpkin: 'nature', haybale: 'nature', corn: 'nature', milkcan: 'sweet', cow: 'nature', tractor: 'city', barn: 'city',
  planet: 'toy', star: 'toy', satellite: 'city', ufo: 'toy', astronaut: 'toy', alien: 'toy', meteor: 'city', rover: 'city',
  perfume: 'gift', lipstick: 'gift', gift_purple: 'gift', gift_yellow: 'gift', gift_red: 'gift', bag: 'gift', headphones: 'gift', camera: 'gift', mirror: 'gift', nailpolish: 'gift',
  donut: 'sweet', cupcake: 'sweet', candy: 'sweet', lollipop: 'sweet', icecream: 'sweet', macaron: 'sweet', cake: 'sweet',
  teddy: 'toy', ball: 'toy', blocks: 'toy', duck: 'toy', rocket: 'toy', robot: 'toy', toycar: 'toy',
  watermelon: 'nature', sandwich: 'nature', juice: 'nature', basket: 'nature', apple: 'nature', tree: 'nature', bench: 'nature',
  xtree: 'festive', snowman: 'festive', candycane: 'festive', gingerbread: 'festive', ornament: 'festive', stocking: 'festive', bell: 'festive', santahat: 'festive', present_green: 'festive', present_white: 'festive', cookie: 'festive', sled: 'festive', gingerhouse: 'festive',
  cone: 'city', hydrant: 'city', mailbox: 'city', lamp: 'city', car: 'city', taxi: 'city', bus: 'city', house: 'city',
};
export function materialGain(r) { return Math.max(1, Math.round(r * r * 3)); }

// materials needed to BUILD (level 1). Upgrades need matCost(type, nextLv).
export const BUILD_MATS = {
  house: { gift: 20 }, fountain: { gift: 15 }, cafe: { sweet: 25 }, icecream: { sweet: 40 },
  bakery: { sweet: 50, gift: 25 }, park: { nature: 35 }, boutique: { gift: 70 }, greenhouse: { nature: 60 },
  toystore: { toy: 70 }, cinema: { city: 60, toy: 40 }, mansion: { city: 90, gift: 40 }, hotel: { city: 110, sweet: 60 },
  ferris: { toy: 90, nature: 60 }, tower: { city: 160 }, stadium: { nature: 110, toy: 110 }, castle: { gift: 160, city: 160 },
  workshop: { festive: 50 },
};
export function matCost(type, lv) {
  const base = BUILD_MATS[type] || {}, k = lv <= 1 ? 1 : 1.5 * (lv - 1) + 0.5, out = {};
  for (const m in base) out[m] = Math.round(base[m] * k);
  return out;
}

// ---- Perks: every building type gives a bonus in levels (same type doesn't stack; highest level counts)
export const PERKS = {
  house:      { key: 'coinPct',  per: 5 },
  fountain:   { key: 'regenMin', per: 2 },
  cafe:       { key: 'magnetS',  per: 1 },
  icecream:   { key: 'coinPct',  per: 10 },
  bakery:     { key: 'timeS',    per: 4 },
  park:       { key: 'sizePct',  per: 7 },
  boutique:   { key: 'gemPct',   per: 20 },
  greenhouse: { key: 'freezeS',  per: 2 },
  toystore:   { key: 'dailyBoost', per: 1 },
  cinema:     { key: 'tornadoS', per: 1 },
  mansion:    { key: 'maxHearts', per: 1 },
  hotel:      { key: 'capH',     per: 2 },
  ferris:     { key: 'giftH',    per: 1 },
  tower:      { key: 'growS',    per: 3 },
  stadium:    { key: 'tbPct',    per: 25 },
  castle:     { key: 'coinPct',  per: 15 },
  workshop:   { key: 'festivePct', per: 25 },
};
export const PERK_ICON = { coinPct: '🪙', regenMin: '❤️', magnetS: '🧲', timeS: '⏱️', sizePct: '🕳️', gemPct: '💎', freezeS: '❄️', dailyBoost: '🎁', tornadoS: '🌪️', maxHearts: '❤️', capH: '🏦', giftH: '🎀', growS: '↔️', tbPct: '⏱️', festivePct: '🎄' };

// ---- 7-day login calendar
export const LOGIN_REWARDS = [
  { coins: 100 }, { boost: 'magnet' }, { coins: 200 }, { gems: 5 }, { coins: 300, boost: 'tornado' }, { boost: 'grow', gems: 3 }, { coins: 500, gems: 15 },
];
export const MAX_BUILDING_LEVEL = 3;
export const INCOME_CAP_HOURS = 4;

export function upgradeCost(type, lv) { return Math.round(BUILDINGS[type].cost * 1.5 * lv); }
export function incomeOf(type, lv) { return Math.round(BUILDINGS[type].income * (1 + 0.6 * (lv - 1))); }

// 4x4 grid of plots; value = player level needed to unlock the plot
export const PLOT_UNLOCK = [1, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 21, 24, 27];
export const GRID = 4;

export const BOOSTERS = {
  magnet:  { price: 150, icon: 'magnet' },
  tornado: { price: 250, icon: 'tornado' },
  freeze:  { price: 200, icon: 'freeze' },
  grow:    { price: 200, icon: 'grow' },
};

export const PRE_BOOSTERS = { bolt: { price: 180, icon: '⚡' }, hourglass: { price: 150, icon: '⏳' } };
export const STREAK_MAX = 3;

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 20 * 60 * 1000;
export const REFILL_GEMS = 30;
export const EXTRA_TIME_GEMS = 10;
export const GIFT_COOLDOWN_MS = 8 * 60 * 60 * 1000;

export const TASK_TEMPLATES = [
  { type: 'swallow', base: 120, perLevel: 12, reward: { coins: 150 } },
  { type: 'levels',  base: 3,   perLevel: 0.1, reward: { coins: 200, gems: 5 } },
  { type: 'booster', base: 3,   perLevel: 0,   reward: { coins: 120 } },
  { type: 'collect', base: 2,   perLevel: 0,   reward: { coins: 100 } },
  { type: 'build',   base: 1,   perLevel: 0.05, reward: { gems: 8 } },
  { type: 'coins',   base: 400, perLevel: 40,  reward: { coins: 150, gems: 3 } },
];
