// Save data, economy, hearts and daily tasks
import { BUILDINGS, PLOT_UNLOCK, MAX_HEARTS, HEART_REGEN_MS, TASK_TEMPLATES,
  incomeOf, INCOME_CAP_HOURS, upgradeCost, MAX_BUILDING_LEVEL, MAT_ORDER, matCost, PERKS, LOGIN_REWARDS } from './data.js';

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
    mats: { gift: 0, sweet: 0, toy: 0, nature: 0, city: 0 },
    login: { last: '', streak: 0 },
    toyDay: '',
    tut: { move: false, city: false },
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
      S.mats = Object.assign(fresh().mats, d.mats || {});
      S.login = Object.assign(fresh().login, d.login || {});
      S.tut = Object.assign(fresh().tut, d.tut || {});
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
export function maxHearts() { return MAX_HEARTS + perks().maxHearts; }
function regenMs() { return Math.max(5 * 60000, HEART_REGEN_MS - perks().regenMin * 60000); }
export function tickHearts() {
  const MH = maxHearts();
  if (S.hearts >= MH) { S.heartTs = Date.now(); return; }
  const now = Date.now(), RG = regenMs();
  const gained = Math.floor((now - S.heartTs) / RG);
  if (gained > 0) {
    S.hearts = Math.min(MH, S.hearts + gained);
    S.heartTs = S.hearts >= MH ? now : S.heartTs + gained * RG;
    save();
  }
}
export function msToNextHeart() {
  if (S.hearts >= maxHearts()) return 0;
  return regenMs() - (Date.now() - S.heartTs);
}
export function loseHeart() {
  if (S.hearts >= maxHearts()) S.heartTs = Date.now();
  S.hearts = Math.max(0, S.hearts - 1); save();
}
export function refillHearts() { S.hearts = maxHearts(); S.heartTs = Date.now(); save(); }

// ---- perks from buildings (highest level of each type counts)
export function perks() {
  const out = { coinPct: 0, regenMin: 0, magnetS: 0, timeS: 0, sizePct: 0, gemPct: 0, freezeS: 0, dailyBoost: 0, tornadoS: 0, maxHearts: 0, capH: 0, giftH: 0, growS: 0, tbPct: 0 };
  const best = {};
  S.plots.forEach((p) => { if (p.b) best[p.b] = Math.max(best[p.b] || 0, p.lv); });
  for (const b in best) { const pk = PERKS[b]; if (pk) out[pk.key] += pk.per * best[b]; }
  return out;
}

// ---- materials
export function addMats(m) { for (const k in m) S.mats[k] = (S.mats[k] || 0) + m[k]; save(); }
export function hasMats(cost) { return Object.keys(cost).every((k) => (S.mats[k] || 0) >= cost[k]); }
function spendMats(cost) { for (const k in cost) S.mats[k] -= cost[k]; }

// ---- city
export function plotUnlocked(i) { return S.level >= PLOT_UNLOCK[i]; }
export function build(i, type) {
  const def = BUILDINGS[type];
  if (!def || !plotUnlocked(i) || S.plots[i].b) return false;
  const mc = matCost(type, 1);
  if (S.coins < def.cost || !hasMats(mc)) return false;
  S.coins -= def.cost; spendMats(mc);
  S.plots[i] = { b: type, lv: 1, ts: Date.now() };
  S.stats.built++; progressTask('build', 1); save();
  return true;
}
export function upgrade(i) {
  const p = S.plots[i];
  if (!p.b || p.lv >= MAX_BUILDING_LEVEL) return false;
  collectPlot(i);
  const mc = matCost(p.b, p.lv + 1), cc = upgradeCost(p.b, p.lv);
  if (S.coins < cc || !hasMats(mc)) return false;
  S.coins -= cc; spendMats(mc);
  p.lv++; progressTask('build', 1); save();
  return true;
}
export function pendingIncome(i) {
  const p = S.plots[i];
  if (!p.b) return 0;
  const hrs = Math.min(INCOME_CAP_HOURS + perks().capH, (Date.now() - p.ts) / 3600000);
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

// ---- toy store: free boosters once a day
export function claimDailyBoosters() {
  const n = perks().dailyBoost; if (!n || S.toyDay === today()) return [];
  S.toyDay = today();
  const ks = ['magnet', 'tornado', 'freeze', 'grow'], got = [];
  for (let i = 0; i < n; i++) { const k = ks[Math.floor(Math.random() * ks.length)]; S.boosters[k] = (S.boosters[k] || 0) + 1; got.push(k); }
  save(); return got;
}

// ---- 7-day login calendar (missing a day starts again from day 1)
function yesterday() { const d = new Date(Date.now() - 86400000); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
export function loginPending() {
  if (S.login.last === today()) return -1;
  return S.login.last === yesterday() ? (S.login.streak % LOGIN_REWARDS.length) : 0;
}
export function claimLogin() {
  const idx = loginPending(); if (idx < 0) return null;
  const r = LOGIN_REWARDS[idx];
  if (r.coins) S.coins += r.coins;
  if (r.gems) S.gems += r.gems;
  if (r.boost) S.boosters[r.boost] = (S.boosters[r.boost] || 0) + 1;
  S.login = { last: today(), streak: idx + 1 };
  save(); return r;
}
