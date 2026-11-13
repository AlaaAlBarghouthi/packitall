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
};
export const BUILDING_ORDER = Object.keys(BUILDINGS);
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
