// Level generator: themes, goals, item placement
export const THEMES = [
  {
    id: 'beauty', floor: ['#ff9fcb', '#ffcfe5'], sky: '#ffc9e0', fog: '#ffd9ea',
    small: [['lipstick', 0.8], ['nailpolish', 0.8], ['perfume', 0.75], ['mirror', 0.8], ['ring', 0.8], ['sunglasses', 0.8]],
    medium: [['gift_purple', 1.0], ['bag', 1.0], ['headphones', 1.0], ['camera', 1.0], ['donut', 0.95], ['heels', 1.0], ['brush', 1.0]],
    large: [['teddy', 2.0], ['gift_yellow', 2.3], ['gift_red', 3.0], ['bag', 2.8], ['heels', 2.4]], decal: 'beauty', movers: [],
  },
  {
    id: 'sweets', floor: ['#ffd58a', '#ffecc2'], sky: '#ffe2b0', fog: '#ffeccb',
    small: [['candy', 0.7], ['macaron', 0.75], ['donut', 0.8], ['apple', 0.8], ['chocobar', 0.8], ['popsicle', 0.75]],
    medium: [['cupcake', 1.0], ['icecream', 1.0], ['lollipop', 1.0], ['donut', 1.3], ['milkshake', 1.0], ['pancakes', 1.0]],
    large: [['cake', 1.6], ['cupcake', 2.6], ['icecream', 2.6], ['cake', 2.4], ['milkshake', 2.4], ['pancakes', 2.2]], decal: 'sweets', movers: ['donut'],
  },
  {
    id: 'toys', floor: ['#a6d3ff', '#d2e9ff'], sky: '#bfe0ff', fog: '#d5ebff',
    small: [['blocks', 0.6], ['ball', 0.6], ['duck', 0.7], ['candy', 0.7], ['dice', 0.7], ['yoyo', 0.7]],
    medium: [['teddy', 0.9], ['robot', 0.9], ['rocket', 0.9], ['toycar', 1.0], ['gift_purple', 1.0], ['train', 0.8]],
    large: [['teddy', 2.4], ['robot', 2.4], ['rocket', 2.6], ['ball', 3.2], ['train', 2.0]], decal: 'toys', movers: ['toycar', 'duck', 'ball', 'train'],
  },
  {
    id: 'picnic', floor: ['#a6e68c', '#cdf4bb'], sky: '#c4ecff', fog: '#d9f4e6',
    small: [['apple', 0.8], ['juice', 0.8], ['sandwich', 0.7], ['candy', 0.7], ['hotdog', 0.75], ['frisbee', 0.8]],
    medium: [['watermelon', 1.0], ['cupcake', 1.0], ['basket', 0.8], ['ball', 1.0], ['flowerpot', 1.0]],
    large: [['basket', 2.0], ['watermelon', 2.6], ['tree', 1.8], ['bench', 1.8], ['parasol', 1.6]], decal: 'picnic', movers: ['ball', 'frisbee'],
  },
  {
    id: 'city', floor: ['#bfc3db', '#dcdeee'], sky: '#bcd6ff', fog: '#d6e2f7',
    small: [['cone', 0.8], ['hydrant', 0.8], ['mailbox', 0.75], ['apple', 0.7], ['trashbin', 0.8]],
    medium: [['bench', 0.9], ['lamp', 0.8], ['tree', 0.9], ['car', 0.85], ['taxi', 0.85], ['trafficlight', 0.8], ['bike', 0.9]],
    large: [['bus', 1.0], ['house', 1.2], ['car', 2.0], ['house', 1.7], ['trafficlight', 1.8]], decal: 'city', movers: ['car', 'taxi', 'bike', 'bus'],
  },
  {
    id: 'beach', floor: ['#ffd99a', '#fff0cc'], sky: '#9fe0ff', fog: '#cdefff',
    small: [['shell', 0.85], ['starfish', 0.85], ['juice', 0.8], ['lifebuoy', 0.75]],
    medium: [['bucket', 1.0], ['crab', 1.0], ['ball', 1.0], ['surfboard', 0.8], ['sandcastle', 0.7]],
    large: [['sandcastle', 1.8], ['parasol', 1.7], ['palm', 1.3], ['boat', 1.2]], decal: 'beach', movers: ['crab', 'ball'],
  },
  {
    id: 'farm', floor: ['#b9e08a', '#d8f0b0'], sky: '#bfe6ff', fog: '#dff3e2',
    small: [['egg', 0.9], ['carrot', 0.85], ['corn', 0.85], ['apple', 0.8]],
    medium: [['chicken', 1.0], ['pumpkin', 1.0], ['milkcan', 0.9], ['haybale', 0.8]],
    large: [['cow', 1.4], ['tractor', 1.4], ['barn', 1.4], ['haybale', 2.0]], decal: 'farm', movers: ['chicken'],
  },
  {
    id: 'space', floor: ['#3a3778', '#4b48a0'], sky: '#1d1a45', fog: '#2a2760',
    small: [['star', 0.8], ['meteor', 0.75], ['planet', 0.7], ['alien', 0.75]],
    medium: [['ufo', 1.0], ['astronaut', 1.0], ['satellite', 0.9], ['rocket', 0.9]],
    large: [['planet', 2.4], ['rover', 1.6], ['rocket', 2.4], ['ufo', 2.4]], decal: 'space', movers: ['ufo', 'alien', 'rover'],
  },
];

export const HAZARD_LEVEL = 5;

// Holiday season world (used for every 2nd level while the event is on)
export const XMAS_THEME = {
  id: 'xmas', floor: ['#a9d3ff', '#e6f3ff'], sky: '#cfe6ff', fog: '#e6f2ff', snow: true,
  small: [['candycane', 0.8], ['ornament', 0.75], ['bell', 0.8], ['cookie', 0.8]],
  medium: [['santahat', 0.95], ['stocking', 1.0], ['gingerbread', 1.0], ['present_green', 1.0], ['present_white', 1.0]],
  large: [['xtree', 1.5], ['snowman', 2.0], ['sled', 1.4], ['gingerhouse', 1.3]], decal: 'xmas', movers: ['present_green', 'present_white'],
};

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function generateLevel(n, opts = {}) {
  const R = rng(n * 7919 + 13);
  const theme = (opts.xmas && n > 1 && n % 2 === 0) ? XMAS_THEME : THEMES[(n - 1) % THEMES.length];
  const d = Math.min(n, 30);
  const W = 20 + d * 0.45;     // world half-extent x
  const H = W * 1.45;          // world half-extent z
  const kind = n >= 10 && n % 10 === 0 ? 'boss' : n >= 5 && n % 5 === 0 ? 'hard' : 'normal';
  const time = kind === 'boss' ? Math.min(200, 150 + d * 1.5) : Math.min(150, 75 + d * 2.5);

  const pick = (arr) => arr[Math.floor(R() * arr.length)];
  const shuffled = (arr) => arr.slice().sort(() => R() - 0.5);

  // Goals: 2 small/medium + 1 (medium or large later)
  const goalCount = n < 3 ? 2 : 3;
  // goal 1: tiny items, goal 2: medium items (needs growing), goal 3: tiny again
  const tinyPool = shuffled(theme.small.map((x) => x[0])), medPool = shuffled(theme.medium.map((x) => x[0]));
  const goalTypes = [], goalTiers = [];
  const pushGoal = (pool, tier) => { const nm = pool.find((x) => !goalTypes.includes(x)); if (nm) { goalTypes.push(nm); goalTiers.push(tier); } };
  pushGoal(tinyPool, 'tiny'); pushGoal(medPool, 'medium'); if (goalCount > 2) pushGoal(tinyPool, 'tiny');
  const hardK = kind === 'hard' ? 1.3 : 1;
  let goals = goalTypes.map((name, i) => ({ name, tier: goalTiers[i], got: 0,
    need: Math.round((goalTiers[i] === 'medium' ? 4 + d * 0.45 : 10 + d * 1.0 - (i === 2 ? 3 : 0)) * hardK) }));
  if (kind === 'boss') goals = [{ name: theme.large[0][0], need: 1, got: 0, big: true, boss: true }];
  else if (n >= 4) {
    const big = pick(theme.large);
    goals.push({ name: big[0], need: Math.min(3, 1 + Math.floor(d / 10)), got: 0, big: true, tier: 'large' });
  }

  const items = [];
  const occupied = [];
  const free = (x, z, r) => {
    if (Math.abs(x) > W - r || Math.abs(z) > H - r) return false;
    if (Math.hypot(x, z - H * 0.75) < 4.5) return false; // keep hole spawn clear
    for (const o of occupied) if (Math.hypot(o[0] - x, o[1] - z) < o[2] + r + 0.05) return false;
    return true;
  };
  const place = (name, scale, x, z, foot, big = false) => {
    const r = foot * scale;
    if (!free(x, z, r)) return false;
    occupied.push([x, z, r]);
    items.push({ name, scale, x, z, rot: R() * Math.PI * 2, big });
    return true;
  };

  return { n, kind, theme, W, H, time, goals, items, place, R, pick, shuffled, opts };
}

// Fill the level with items. Needs footprint lookup (from models) -> done here to keep levels.js data-only
// Absolute footprint radius for each size tier (the hole starts at radius 0.9)
//   tiny   → can be swallowed right away
//   medium → needs the hole to grow (radius ~1.1–1.5)
//   large  → needs a big hole (radius ~2.4–3.2)
export const TIER_R = { tiny: [0.36, 0.52], medium: [1.0, 1.38], large: [2.2, 2.95] };

export function populate(level, footOf) {
  const { theme, W, H, goals, place, R, pick } = level;
  const d = Math.min(level.n, 30);
  const rOf = (tier) => { const [a, b] = TIER_R[tier]; return a + R() * (b - a); };
  const put = (name, r, x, z, big = false) => { const f = footOf(name); return place(name, r / f, x, z, f, big); };

  // 0) boss: one giant item near the middle of the map
  for (const g of goals) {
    if (!g.boss) continue;
    const f = footOf(g.name); g.scale = 4.0 / f;
    place(g.name, g.scale, 0, -level.H * 0.15, f, true);
    level.items[level.items.length - 1].boss = true;
    g.available = 1;
  }
  // 1) goal items, guaranteed amount * 1.35
  for (const g of goals) {
    if (g.boss) continue;
    const tier = g.big ? 'large' : (g.tier || 'tiny');
    const total = Math.ceil(g.need * (g.big ? 1.5 : 1.35));
    let placed = 0, tries = 0;
    while (placed < total && tries < 4000) {
      tries++;
      // cluster around a random center
      const cx = (R() * 2 - 1) * (W - 3), cz = (R() * 2 - 1) * (H - 3);
      const k = g.big ? 1 : 3 + Math.floor(R() * 4);
      for (let i = 0; i < k && placed < total; i++) {
        const r = g.big ? 2.3 + R() * 0.25 : rOf(tier), a = R() * Math.PI * 2, rr = R() * (tier === 'medium' ? 4 : 2.2);
        if (put(g.name, r, cx + Math.cos(a) * rr, cz + Math.sin(a) * rr, !!g.big)) placed++;
      }
    }
    g.available = placed;
    g.need = Math.min(g.need, placed);
  }

  // 2) filler patterns: grids and rings of small items
  const patterns = 20 + Math.floor(d * 0.8);
  for (let p = 0; p < patterns; p++) {
    const med = R() < 0.28;
    const [name] = pick(med ? theme.medium : theme.small);
    const cx = (R() * 2 - 1) * (W - 4), cz = (R() * 2 - 1) * (H - 4);
    const r = rOf(med ? 'medium' : 'tiny');
    const gap = r * 2 + 0.25;
    if (R() < 0.3) {
      // a line / trail of items
      const n = (med ? 3 : 6) + Math.floor(R() * (med ? 3 : 6)), a = R() * Math.PI;
      for (let i = 0; i < n; i++) put(name, r, cx + Math.cos(a) * (i - n / 2) * gap, cz + Math.sin(a) * (i - n / 2) * gap);
    } else if (R() < 0.55) {
      const cols = (med ? 2 : 3) + Math.floor(R() * 3), rows = (med ? 2 : 3) + Math.floor(R() * 2);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) put(name, r, cx + (i - cols / 2) * gap, cz + (j - rows / 2) * gap);
    } else {
      const cnt = (med ? 5 : 8) + Math.floor(R() * 6), rad = gap * cnt / (Math.PI * 2);
      for (let i = 0; i < cnt; i++) { const a = i / cnt * Math.PI * 2; put(name, r, cx + Math.cos(a) * rad, cz + Math.sin(a) * rad); }
    }
  }
  // 2b) hazards: bombs from level 5 (more every 3 levels)
  level.hazards = 0;
  if (level.n >= HAZARD_LEVEL) {
    const want = Math.max(2, Math.min(12, 3 + Math.floor((level.n - HAZARD_LEVEL) / 4) + (level.kind === 'hard' ? 2 : level.kind === 'boss' ? -1 : 0)));
    for (let i = 0, tries = 0; i < want && tries < 600; tries++) {
      const br = [0.7, 1.0, 1.4, 1.9][i % 4];
      const x = (R() * 2 - 1) * (W - 3), z = (R() * 2 - 1) * (H - 3);
      if (Math.hypot(x, z - H * 0.75) < 7) continue;            // never near the start
      if (put('bomb', br, x, z)) { level.items[level.items.length - 1].hazard = true; level.hazards++; i++; }
    }
  }
  // 3) large landmarks
  const larges = 4 + Math.floor(d / 3);
  for (let i = 0, tries = 0; i < larges && tries < 300; tries++) {
    const [name] = pick(theme.large);
    if (put(name, rOf('large'), (R() * 2 - 1) * (W - 3), (R() * 2 - 1) * (H - 3), true)) i++;
  }
  // 4) random scatter
  const scatter = 110 + d * 4;
  for (let i = 0, tries = 0; i < scatter && tries < 2000; tries++) {
    const med = R() < 0.22;
    const [name] = pick(med ? theme.medium : theme.small);
    if (put(name, rOf(med ? 'medium' : 'tiny'), (R() * 2 - 1) * (W - 1), (R() * 2 - 1) * (H - 1))) i++;
  }
  // 5) floor pickups: coin piles, clocks (+time), a rare gem
  const pk = [['coinpile', 'coins', 6 + Math.floor(d / 5)], ['clock', 'time', level.n >= 3 ? 2 : 0], ['gem', 'gem', level.n >= 3 && R() < 0.55 ? 1 : 0]];
  for (const [name, kind, count] of pk) {
    for (let i = 0, tries = 0; i < count && tries < 300; tries++) {
      if (put(name, 0.42, (R() * 2 - 1) * (W - 2), (R() * 2 - 1) * (H - 2))) { level.items[level.items.length - 1].pickup = kind; i++; }
    }
  }
  // 6) some items wander around
  const movers = theme.movers || [];
  let nm = 0; const maxMovers = 8 + Math.min(12, d);
  level.items.forEach((it) => { if (nm < maxMovers && !it.hazard && !it.pickup && !it.big && movers.includes(it.name) && R() < 0.35) { it.mover = true; nm++; } });
  return level;
}
