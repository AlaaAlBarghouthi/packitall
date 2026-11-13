// Save data, economy, hearts and daily tasks
import { BUILDINGS, PLOT_UNLOCK, MAX_HEARTS, HEART_REGEN_MS, TASK_TEMPLATES,
  incomeOf, INCOME_CAP_HOURS, upgradeCost, MAX_BUILDING_LEVEL } from './data.js';

const KEY = 'packitall_save_v1';
const listeners = new Set();
const Cap = () => (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ? window.Capacitor : null;
const Prefs = () => { const c = Cap(); return c && c.Plugins && c.Plugins.Preferences; };

function fresh() {
  return {
    v: 1,
    coins: 300, gems: 25, level: 1,
    stars: {},
    hearts: MAX_HEARTS, heartTs: Date.now(),
    boosters: { magnet: 2, tornado: 1, freeze: 1, grow: 1 },
    plots: PLOT_UNLOCK.map(() => ({ b: null, lv: 0, ts: 0 })),
    settings: { sound: true, vib: true, lang: null },
    daily: null,
    giftTs: 0,
    stats: { swallowed: 0, levels: 0, built: 0 },
    tutorial: true,
  };
}

export let S = fresh();

export async function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) {}
  const p = Prefs();
  if (p) {
    try { const r = await p.get({ key: KEY }); if (r && r.value) raw = r.value; } catch (e) {}
  }
  if (raw) {
    try {
      const d = JSON.parse(raw);
      S = Object.assign(fresh(), d);
      S.settings = Object.assign(fresh().settings, d.settings || {});
      S.boosters = Object.assign(fresh().boosters, d.boosters || {});
      S.stats = Object.assign(fresh().stats, d.stats || {});
      while (S.plots.length < PLOT_UNLOCK.length) S.plots.push({ b: null, lv: 0, ts: 0 });
    } catch (e) { S = fresh(); }
  }
  tickHearts();
  ensureDaily();
}

let saveTimer = null;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 150);
  emit();
}
export function saveNow() {
  const raw = JSON.stringify(S);
  try { localStorage.setItem(KEY, raw); } catch (e) {}
  const p = Prefs();
  if (p) p.set({ key: KEY, value: raw }).catch(() => {});
}
export function resetAll() {
  const lang = S.settings.lang;
  S = fresh(); S.settings.lang = lang;
  ensureDaily(); saveNow(); emit();
}

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach(f => { try { f(S); } catch (e) { console.error(e); } }); }

// ---- currency
export function addCoins(n) { S.coins += n; if (n > 0) progressTask('coins', n); save(); }
export function spendCoins(n) { if (S.coins < n) return false; S.coins -= n; save(); return true; }
export function addGems(n) { S.gems += n; save(); }
export function spendGems(n) { if (S.gems < n) return false; S.gems -= n; save(); return true; }

// ---- hearts
export function tickHearts() {
  if (S.hearts >= MAX_HEARTS) { S.heartTs = Date.now(); return; }
  const now = Date.now();
  const gained = Math.floor((now - S.heartTs) / HEART_REGEN_MS);
  if (gained > 0) {
    S.hearts = Math.min(MAX_HEARTS, S.hearts + gained);
    S.heartTs = S.hearts >= MAX_HEARTS ? now : S.heartTs + gained * HEART_REGEN_MS;
    save();
  }
}
export function msToNextHeart() {
  if (S.hearts >= MAX_HEARTS) return 0;
  return HEART_REGEN_MS - (Date.now() - S.heartTs);
}
export function loseHeart() {
  if (S.hearts >= MAX_HEARTS) S.heartTs = Date.now();
  S.hearts = Math.max(0, S.hearts - 1); save();
}
export function refillHearts() { S.hearts = MAX_HEARTS; S.heartTs = Date.now(); save(); }

// ---- city
export function plotUnlocked(i) { return S.level >= PLOT_UNLOCK[i]; }
export function build(i, type) {
  const def = BUILDINGS[type];
  if (!def || !plotUnlocked(i) || S.plots[i].b) return false;
  if (!spendCoins(def.cost)) return false;
  S.plots[i] = { b: type, lv: 1, ts: Date.now() };
  S.stats.built++; progressTask('build', 1); save();
  return true;
}
export function upgrade(i) {
  const p = S.plots[i];
  if (!p.b || p.lv >= MAX_BUILDING_LEVEL) return false;
  collectPlot(i);
  if (!spendCoins(upgradeCost(p.b, p.lv))) return false;
  p.lv++; progressTask('build', 1); save();
  return true;
}
export function pendingIncome(i) {
  const p = S.plots[i];
  if (!p.b) return 0;
  const hrs = Math.min(INCOME_CAP_HOURS, (Date.now() - p.ts) / 3600000);
  return Math.floor(incomeOf(p.b, p.lv) * hrs);
}
export function collectPlot(i) {
  const n = pendingIncome(i);
  S.plots[i].ts = Date.now();
  if (n > 0) addCoins(n);
  return n;
}
export function collectAll() {
  let total = 0;
  S.plots.forEach((p, i) => { if (p.b) { const n = pendingIncome(i); if (n > 0) { total += n; p.ts = Date.now(); } } });
  if (total > 0) { addCoins(total); progressTask('collect', 1); }
  return total;
}
export function totalIncome() {
  return S.plots.reduce((a, p) => a + (p.b ? incomeOf(p.b, p.lv) : 0), 0);
}
export function population() {
  return S.plots.reduce((a, p) => a + (p.b ? BUILDINGS[p.b].pop * p.lv : 0), 0);
}
export function cityLevel() {
  const pts = S.plots.reduce((a, p) => a + (p.b ? p.lv : 0), 0);
  return 1 + Math.floor(pts / 3);
}

// ---- daily tasks
function today() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
export function ensureDaily() {
  if (S.daily && S.daily.day === today()) return;
  const pool = TASK_TEMPLATES.slice();
  // shuffle and take 4
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const tasks = pool.slice(0, 4).map((tp, k) => ({
    id: k, type: tp.type,
    target: Math.max(1, Math.round(tp.base + tp.perLevel * (S.level - 1))),
    progress: 0, reward: tp.reward, claimed: false,
  }));
  S.daily = { day: today(), tasks };
  save();
}
export function progressTask(type, n) {
  if (!S.daily) return;
  let changed = false;
  S.daily.tasks.forEach(tk => {
    if (tk.type === type && !tk.claimed && tk.progress < tk.target) {
      tk.progress = Math.min(tk.target, tk.progress + n); changed = true;
    }
  });
  if (changed) save();
}
export function claimTask(id) {
  const tk = S.daily.tasks.find(x => x.id === id);
  if (!tk || tk.claimed || tk.progress < tk.target) return null;
  tk.claimed = true;
  if (tk.reward.coins) S.coins += tk.reward.coins;
  if (tk.reward.gems) S.gems += tk.reward.gems;
  save();
  return tk.reward;
}
export function tasksReady() {
  return S.daily ? S.daily.tasks.filter(t => !t.claimed && t.progress >= t.target).length : 0;
}
