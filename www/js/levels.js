// Level generator: themes, goals, item placement
export const THEMES = [
  {
    id: 'beauty', floor: ['#ff9fcb', '#ffcfe5'], sky: '#ffc9e0', fog: '#ffd9ea',
    small: [['lipstick', 0.8], ['nailpolish', 0.8], ['perfume', 0.75], ['mirror', 0.8]],
    medium: [['gift_purple', 1.0], ['bag', 1.0], ['headphones', 1.0], ['camera', 1.0], ['donut', 0.95]],
    large: [['teddy', 2.0], ['gift_yellow', 2.3], ['gift_red', 3.0], ['bag', 2.8]],
  },
  {
    id: 'sweets', floor: ['#ffd58a', '#ffecc2'], sky: '#ffe2b0', fog: '#ffeccb',
    small: [['candy', 0.7], ['macaron', 0.75], ['donut', 0.8], ['apple', 0.8]],
    medium: [['cupcake', 1.0], ['icecream', 1.0], ['lollipop', 1.0], ['donut', 1.3]],
    large: [['cake', 1.6], ['cupcake', 2.6], ['icecream', 2.6], ['cake', 2.4]],
  },
  {
    id: 'toys', floor: ['#a6d3ff', '#d2e9ff'], sky: '#bfe0ff', fog: '#d5ebff',
    small: [['blocks', 0.6], ['ball', 0.6], ['duck', 0.7], ['candy', 0.7]],
    medium: [['teddy', 0.9], ['robot', 0.9], ['rocket', 0.9], ['toycar', 1.0], ['gift_purple', 1.0]],
    large: [['teddy', 2.4], ['robot', 2.4], ['rocket', 2.6], ['ball', 3.2]],
  },
  {
    id: 'picnic', floor: ['#a6e68c', '#cdf4bb'], sky: '#c4ecff', fog: '#d9f4e6',
    small: [['apple', 0.8], ['juice', 0.8], ['sandwich', 0.7], ['candy', 0.7]],
    medium: [['watermelon', 1.0], ['cupcake', 1.0], ['basket', 0.8], ['ball', 1.0]],
    large: [['basket', 2.0], ['watermelon', 2.6], ['tree', 1.8], ['bench', 1.8]],
  },
  {
    id: 'city', floor: ['#bfc3db', '#dcdeee'], sky: '#bcd6ff', fog: '#d6e2f7',
    small: [['cone', 0.8], ['hydrant', 0.8], ['mailbox', 0.75], ['apple', 0.7]],
    medium: [['bench', 0.9], ['lamp', 0.8], ['tree', 0.9], ['car', 0.85], ['taxi', 0.85]],
    large: [['bus', 1.0], ['house', 1.2], ['car', 2.0], ['house', 1.7]],
  },
];

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function generateLevel(n) {
  const R = rng(n * 7919 + 13);
  const theme = THEMES[(n - 1) % THEMES.length];
  const d = Math.min(n, 30);
  const W = 22 + d * 0.5;      // world half-extent x
  const H = W * 1.45;          // world half-extent z
  const time = Math.min(150, 75 + d * 2.5);

  const pick = (arr) => arr[Math.floor(R() * arr.length)];
  const shuffled = (arr) => arr.slice().sort(() => R() - 0.5);

  // Goals: 2 small/medium + 1 (medium or large later)
  const goalCount = n < 3 ? 2 : 3;
  const pool = shuffled([...theme.small, ...theme.medium]);
  const goalTypes = [];
  for (const [name] of pool) { if (!goalTypes.includes(name)) goalTypes.push(name); if (goalTypes.length >= goalCount) break; }
  const goals = goalTypes.map((name, i) => ({ name, need: Math.round(6 + d * 0.9 + (i === 0 ? 4 : 0) - i * 2), got: 0 }));
  if (n >= 4) {
    const big = pick(theme.large);
    goals.push({ name: big[0], need: Math.min(4, 1 + Math.floor(d / 8)), got: 0, big: true, scale: big[1] });
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

  return { n, theme, W, H, time, goals, items, place, R, pick, shuffled };
}

// Fill the level with items. Needs footprint lookup (from models) -> done here to keep levels.js data-only
export function populate(level, footOf) {
  const { theme, W, H, goals, place, R, pick } = level;
  const d = Math.min(level.n, 30);

  // 1) goal items, guaranteed amount * 1.35
  for (const g of goals) {
    const tier = [...theme.small, ...theme.medium, ...theme.large].find(t => t[0] === g.name && (!g.big || t[1] === g.scale));
    const scale = g.big ? g.scale : (tier ? tier[1] : 1);
    g.scale = scale;
    const total = Math.ceil(g.need * (g.big ? 1.5 : 1.35));
    let placed = 0, tries = 0;
    while (placed < total && tries < 4000) {
      tries++;
      // cluster around a random center
      const cx = (R() * 2 - 1) * (W - 3), cz = (R() * 2 - 1) * (H - 3);
      const k = g.big ? 1 : 3 + Math.floor(R() * 4);
      for (let i = 0; i < k && placed < total; i++) {
        const a = R() * Math.PI * 2, rr = R() * 2.2;
        if (place(g.name, scale * (0.92 + R() * 0.16), cx + Math.cos(a) * rr, cz + Math.sin(a) * rr, footOf(g.name), !!g.big)) placed++;
      }
    }
    g.available = placed;
    g.need = Math.min(g.need, placed);
  }

  // 2) filler patterns: grids and rings of small items
  const patterns = 10 + Math.floor(d * 0.6);
  for (let p = 0; p < patterns; p++) {
    const [name, sc] = pick(R() < 0.6 ? theme.small : theme.medium);
    const cx = (R() * 2 - 1) * (W - 4), cz = (R() * 2 - 1) * (H - 4);
    const f = footOf(name) * sc;
    const gap = f * 2 + 0.25;
    if (R() < 0.5) {
      const cols = 2 + Math.floor(R() * 3), rows = 2 + Math.floor(R() * 3);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++)
        place(name, sc, cx + (i - cols / 2) * gap, cz + (j - rows / 2) * gap, footOf(name));
    } else {
      const cnt = 6 + Math.floor(R() * 5), rad = gap * cnt / (Math.PI * 2);
      for (let i = 0; i < cnt; i++) { const a = i / cnt * Math.PI * 2; place(name, sc, cx + Math.cos(a) * rad, cz + Math.sin(a) * rad, footOf(name)); }
    }
  }
  // 3) large landmarks
  const larges = 4 + Math.floor(d / 3);
  for (let i = 0, tries = 0; i < larges && tries < 300; tries++) {
    const [name, sc] = pick(theme.large);
    if (place(name, sc * (0.9 + R() * 0.2), (R() * 2 - 1) * (W - 3), (R() * 2 - 1) * (H - 3), footOf(name), true)) i++;
  }
  // 4) random scatter
  const scatter = 60 + d * 3;
  for (let i = 0, tries = 0; i < scatter && tries < 2000; tries++) {
    const [name, sc] = pick(R() < 0.7 ? theme.small : theme.medium);
    if (place(name, sc * (0.9 + R() * 0.2), (R() * 2 - 1) * (W - 1), (R() * 2 - 1) * (H - 1), footOf(name))) i++;
  }
  return level;
}
