// Level generator: themes, goals, item placement
export const THEMES = [
  {
    id: 'gifts', floor: ['#c9b3ff', '#e6dcff'], sky: '#d9c9ff', fog: '#e6dcff',
    small: [['dice', 0.8], ['yoyo', 0.8], ['candy', 0.8], ['sunglasses', 0.8], ['lollipop', 0.8]],
    medium: [['gift_purple', 1.0], ['headphones', 1.0], ['camera', 1.0], ['basket', 1.0], ['toycar', 1.0]],
    large: [['gift_yellow', 2.3], ['gift_red', 2.6], ['teddy', 2.2]], decal: 'gifts', movers: [],
  },
  {
    id: 'sweets', floor: ['#ffd58a', '#ffecc2'], sky: '#ffe2b0', fog: '#ffeccb',
    small: [['candy', 0.7], ['macaron', 0.75], ['donut', 0.8], ['apple', 0.8], ['chocobar', 0.8], ['popsicle', 0.75]],
    medium: [['cupcake', 1.0], ['icecream', 1.0], ['lollipop', 1.0], ['donut', 1.3], ['milkshake', 1.0], ['pancakes', 1.0]],
    large: [['cake', 1.6], ['cupcake', 2.6], ['icecream', 2.6], ['cake', 2.4], ['milkshake', 2.4], ['pancakes', 2.2]], decal: 'sweets', movers: ['donut'],
  },
  {
    id: 'food', wood: true, floor: ['#c97a43', '#e0a070'], sky: '#ffd6b5', fog: '#ffe4cc',
    small: [['coffee', 0.8], ['croissant', 0.8], ['tomato', 0.8], ['fries', 0.8], ['lettuce', 0.8]],
    medium: [['pizza', 1.0], ['bread', 1.0], ['burger', 1.0], ['teapot', 1.0], ['coffee', 1.0]],
    large: [['pizza', 2.4], ['burger', 2.4], ['bread', 2.2], ['teapot', 2.2]], decal: 'food', movers: ['tomato'],
  },
  {
    id: 'toys', wood: true, floor: ['#c97a43', '#e0a070'], sky: '#bfe0ff', fog: '#d5ebff',
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
  const kind = n >= 10 && n % 10 === 0 ? 'boss' : n >= 5 && n % 5 === 0 ? 'hard' : 'normal';
  const W = (14 + d * 0.35) * (kind === 'boss' ? 1.3 : 1); // world half-extent x (compact = dense, tidy boards)
  const H = W * 1.45;          // world half-extent z
  const time = kind === 'boss' ? Math.min(170, 120 + d * 1.5) : Math.min(150, 75 + d * 2.5);

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
    need: Math.round((goalTiers[i] === 'medium' ? Math.min(24, 6 + d * 0.6) : i === 0 ? Math.min(80, 24 + d * 2.5) : Math.min(60, 16 + d * 2)) * hardK) }));
  if (kind === 'boss') goals = [{ name: theme.large[0][0], need: 1, got: 0, big: true, boss: true }];
  else if (n >= 4) {
    const bl = theme.large.filter((x) => !goalTypes.includes(x[0]));
    const big = pick(bl.length ? bl : theme.large);
    goals.push({ name: big[0], need: Math.min(3, 1 + Math.floor(d / 10)), got: 0, big: true, tier: 'large' });
  }

  const items = [];
  const occupied = [];
  const free = (x, z, r) => {
    if (Math.abs(x) > W - r || Math.abs(z) > H - r) return false;
    if (Math.hypot(x, z - H * 0.6) < 2.6) return false; // keep hole spawn clear
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
  // Tidy layout: every item type sits in neat blocks (grids, rows, rings).
  // Goal items exist ONLY as many times as the goal asks for, so the counter is exact.
  const { theme, W, H, goals, place, R, pick } = level;
  const d = Math.min(level.n, 30);
  const mid = (tier) => { const [a, b] = TIER_R[tier]; return (a + b) / 2; };
  const put = (name, r, x, z, big = false) => { const f = footOf(name); return place(name, r / f, x, z, f, big); };
  const items = level.items;
  const goalNames = new Set(goals.map((g) => g.name));
  const rnd = (a, b) => a + R() * (b - a);
  const rx = (m) => rnd(-(W - m), W - m), rz = (m) => rnd(-(H - m), H - m);

  // try to put a whole formation; returns how many were placed (all-or-nothing per attempt)
  const fits = (pts, r) => {
    const tmp = [];
    for (const [x, z] of pts) {
      if (Math.abs(x) > W - r || Math.abs(z) > H - r || Math.hypot(x, z - H * 0.6) < 2.6) return false;
      for (const t of tmp) if (Math.hypot(t[0] - x, t[1] - z) < 2 * r) return false;
      tmp.push([x, z]);
    }
    return true;
  };
  const grid = (cx, cz, cols, rows, gap, ang) => {
    const pts = [], c = Math.cos(ang), s = Math.sin(ang);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const u = (i - (cols - 1) / 2) * gap, v = (j - (rows - 1) / 2) * gap;
      pts.push([cx + u * c - v * s, cz + u * s + v * c]);
    }
    return pts;
  };
  const ring = (cx, cz, cnt, rad) => Array.from({ length: cnt }, (_, i) => { const a = i / cnt * Math.PI * 2; return [cx + Math.cos(a) * rad, cz + Math.sin(a) * rad]; });
  const formation = (name, r, pts, big = false) => {
    let n = 0;
    for (const [x, z] of pts) if (put(name, r, x, z, big)) n++;
    return n;
  };
  // place `count` items of one type as blocks; returns placed count
  const blocks = (name, tier, count, big = false) => {
    const r = big ? 2.4 : mid(tier), gap = 2 * r + (tier === 'tiny' ? 0.14 : 0.3);
    let left = count, tries = 0;
    while (left > 0 && tries < 400) {
      tries++;
      let pts;
      if (big) pts = [[rx(r + 1), rz(r + 1)]];
      else if (tier === 'medium') {
        const n = Math.min(left, 3 + Math.floor(R() * 3));
        pts = R() < 0.5 ? grid(rx(6), rz(6), n, 1, gap, Math.round(R() * 2) * Math.PI / 2) : grid(rx(6), rz(6), Math.min(n, 3), Math.ceil(n / 3), gap, 0).slice(0, n);
      } else {
        const want = Math.min(left, 9 + Math.floor(R() * 22));
        const shape = R();
        if (shape < 0.6) { // rectangle
          const cols = Math.max(2, Math.round(Math.sqrt(want * rnd(0.6, 1.6)))), rows = Math.ceil(want / cols);
          pts = grid(rx(gap * cols / 2 + 1), rz(gap * rows / 2 + 1), cols, rows, gap, R() < 0.75 ? 0 : Math.PI / 4).slice(0, want);
        } else if (shape < 0.85) { // ring
          const cnt = Math.max(8, Math.min(want, 22)), rad = gap * cnt / (Math.PI * 2);
          pts = ring(rx(rad + 1), rz(rad + 1), cnt, rad);
        } else { // double row
          const cols = Math.ceil(want / 2);
          pts = grid(rx(gap * cols / 2 + 1), rz(3), cols, 2, gap, R() < 0.5 ? 0 : Math.PI / 2).slice(0, want);
        }
      }
      if (!fits(pts, r)) continue;
      left -= formation(name, r, pts, big);
    }
    return count - left;
  };

  // 0) boss: one giant item near the middle of the map, ringed by tiny filler
  for (const g of goals) {
    if (!g.boss) continue;
    const f = footOf(g.name); g.scale = 3.1 / f;
    place(g.name, g.scale, 0, -H * 0.15, f, true);
    items[items.length - 1].boss = true;
    g.available = 1;
  }
  // 1) goal items: exactly the amount asked for
  for (const g of goals) {
    if (g.boss) continue;
    const tier = g.big ? 'large' : (g.tier || 'tiny');
    const placed = blocks(g.name, tier, g.need, !!g.big);
    g.need = g.available = Math.max(1, placed);
  }
  // 2) filler: other item types (never a goal type), also in tidy blocks
  const fillTiny = theme.small.map((x) => x[0]).filter((n) => !goalNames.has(n));
  const fillMed = theme.medium.map((x) => x[0]).filter((n) => !goalNames.has(n));
  const fillLarge = theme.large.map((x) => x[0]).filter((n) => !goalNames.has(n));
  const boss = level.kind === 'boss';
  const tinyTypes = fillTiny.slice(0, boss ? 3 : 2), medTypes = fillMed.slice(0, boss ? 3 : 2);
  for (const nm of tinyTypes) blocks(nm, 'tiny', Math.round((30 + d * 1.5) * (boss ? 1.5 : 1)));
  for (const nm of medTypes) blocks(nm, 'medium', Math.round((6 + d * 0.3) * (boss ? 2 : 1)));
  // large landmarks with a ring of tiny filler around them
  const larges = (boss ? 5 : 2) + Math.floor(d / 6);
  for (let i = 0, tries = 0; i < larges && fillLarge.length && tries < 200; tries++) {
    const r = mid('large'), x = rx(r + 3), z = rz(r + 3);
    const nm = tinyTypes.length ? tinyTypes[i % tinyTypes.length] : null, tr = mid('tiny'), cnt = 14, rad = r + 0.9;
    const pts = nm ? ring(x, z, cnt, rad) : [];
    if (!fits([[x, z]], r) || (nm && !fits(pts, tr))) continue;
    if (!put(fillLarge[i % fillLarge.length], r, x, z, true)) continue;
    if (nm) formation(nm, tr, pts);
    i++;
  }
  // 2b) hazards: bombs from level 5
  level.hazards = 0;
  if (level.n >= HAZARD_LEVEL) {
    const want = Math.max(2, Math.min(8, 2 + Math.floor((level.n - HAZARD_LEVEL) / 6) + (level.kind === 'hard' ? 2 : level.kind === 'boss' ? -1 : 0)));
    for (let i = 0, tries = 0; i < want && tries < 600; tries++) {
      const br = [0.7, 1.0, 1.4, 1.9][i % 4];
      const x = rx(3), z = rz(3);
      if (Math.hypot(x, z - H * 0.6) < 7) continue;
      if (put('bomb', br, x, z)) { items[items.length - 1].hazard = true; level.hazards++; i++; }
    }
  }
  // 3) a light sprinkle of loose filler so the floor never feels empty
  for (let i = 0, tries = 0; i < 20 + d && tinyTypes.length && tries < 600; tries++) {
    if (put(tinyTypes[i % tinyTypes.length], mid('tiny'), rx(1), rz(1))) i++;
  }
  // 4) floor pickups
  const pk = [['coinpile', 'coins', 6 + Math.floor(d / 5)], ['clock', 'time', level.n >= 3 ? 2 : 0], ['gem', 'gem', level.n >= 3 && R() < 0.55 ? 1 : 0]];
  for (const [name, kind, count] of pk) {
    for (let i = 0, tries = 0; i < count && tries < 300; tries++) {
      if (put(name, 0.42, rx(2), rz(2))) { items[items.length - 1].pickup = kind; i++; }
    }
  }
  // 5) a few filler items wander around (never goal items, so blocks stay neat)
  const movers = (theme.movers || []).filter((n) => !goalNames.has(n));
  let nm = 0; const maxMovers = 4 + Math.min(6, Math.floor(d / 3));
  items.forEach((it) => { if (nm < maxMovers && !it.hazard && !it.pickup && !it.big && movers.includes(it.name) && R() < 0.3) { it.mover = true; nm++; } });
  return level;
}
