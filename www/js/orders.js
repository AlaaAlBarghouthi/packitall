// Shop orders: city shops ask for items you swallowed in levels. Deliver them for coins
// and stars; stars level the shop up (better orders, +15% income per level, gems).
import { THEMES } from './levels.js';
import { S, save } from './state.js';

export const ORDER_SHOPS = {
  cafe:       ['coffee', 'croissant', 'donut', 'cupcake', 'macaron', 'teapot', 'milkshake'],
  bakery:     ['bread', 'croissant', 'cake', 'cupcake', 'pancakes', 'donut', 'egg'],
  pizzeria:   ['pizza', 'tomato', 'corn', 'lettuce', 'burger', 'fries', 'milkcan'],
  icecream:   ['icecream', 'popsicle', 'milkshake', 'chocobar', 'candy', 'lollipop', 'macaron'],
  greenhouse: ['tomato', 'carrot', 'lettuce', 'corn', 'pumpkin', 'apple', 'watermelon', 'flowerpot'],
};
export const SHOP_MAX = 5;
export const STARS_TO_NEXT = [0, 3, 5, 7, 10]; // index = current level
export const ORDER_WAIT_MS = 8 * 60 * 1000;   // next order after delivery
export const LEVELUP_GEMS = 5;

// item -> 't' (small) or 'm' (medium), and the world it comes from
const TIER = {}, WORLD = {};
THEMES.forEach((th, i) => { for (const [n] of th.small) { TIER[n] = TIER[n] || 't'; if (WORLD[n] === undefined) WORLD[n] = i; } });
THEMES.forEach((th, i) => { for (const [n] of th.medium) { TIER[n] = TIER[n] || 'm'; if (WORLD[n] === undefined) WORLD[n] = i; } });
export const itemWorld = (n) => (WORLD[n] === undefined ? null : THEMES[WORLD[n]].id);

export const isOrderShop = (type) => !!ORDER_SHOPS[type];
export function shopInfo(type) {
  if (!S.shops[type]) S.shops[type] = { lv: 1, xp: 0 };
  return S.shops[type];
}

function pick(arr, k) {
  const a = arr.slice(), out = [];
  while (a.length && out.length < k) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  return out;
}

export function genOrder(type) {
  const sh = shopInfo(type), lv = sh.lv;
  // only items from worlds the player has already reached
  const reached = Math.min(THEMES.length, Math.max(1, S.level));
  let pool = ORDER_SHOPS[type].filter((n) => WORLD[n] !== undefined && WORLD[n] < reached);
  if (pool.length < 2) pool = ORDER_SHOPS[type].filter((n) => WORLD[n] !== undefined).sort((a, b) => WORLD[a] - WORLD[b]).slice(0, 3);
  const k = Math.min(pool.length, lv >= 3 ? 3 : 2);
  const items = pick(pool, k).map((n) => {
    const tiny = TIER[n] === 't';
    const need = tiny ? 6 + lv * 2 + Math.floor(Math.random() * 4) : 2 + lv + Math.floor(Math.random() * 2);
    return [n, need];
  });
  const base = items.reduce((a, [n, c]) => a + c * (TIER[n] === 't' ? 10 : 30), 0);
  const coins = Math.round(base * (1 + 0.3 * (lv - 1)) / 5) * 5;
  return { items, coins, ready: 0 };
}

/** Make sure every built order shop has an order. Returns the list of [type, order]. */
export function activeOrders() {
  const types = [...new Set(S.plots.filter((p) => p.b && isOrderShop(p.b)).map((p) => p.b))];
  let changed = false;
  for (const ty of types) if (!S.orders[ty]) { S.orders[ty] = genOrder(ty); changed = true; }
  if (changed) save();
  return types.map((ty) => [ty, S.orders[ty]]);
}

export const isWaiting = (o) => o.ready && Date.now() < o.ready;
export const canDeliver = (o) => !isWaiting(o) && o.items.every(([n, c]) => (S.pantry[n] || 0) >= c);
export const readyCount = () => activeOrders().filter(([, o]) => canDeliver(o)).length;

/** Deliver; returns { coins, levelUp, lv } or null. */
export function deliver(type) {
  const o = S.orders[type];
  if (!o || !canDeliver(o)) return null;
  for (const [n, c] of o.items) S.pantry[n] -= c;
  S.coins += o.coins;
  const sh = shopInfo(type);
  let levelUp = false;
  if (sh.lv < SHOP_MAX) {
    sh.xp++;
    if (sh.xp >= STARS_TO_NEXT[sh.lv]) { sh.xp = 0; sh.lv++; levelUp = true; S.gems += LEVELUP_GEMS; }
  }
  const coins = o.coins;
  S.orders[type] = genOrder(type);
  S.orders[type].ready = Date.now() + ORDER_WAIT_MS;
  save();
  return { coins, levelUp, lv: sh.lv };
}

/** Skip the wait (optional ad) or swap an order for a new one. */
export function skipWait(type) { if (S.orders[type]) { S.orders[type].ready = 0; save(); } }
export function swapOrder(type) { S.orders[type] = genOrder(type); save(); }

/** Which order items did this run help with? -> [[name, got]] */
export function usefulFromRun(itemsRun) {
  const want = new Set();
  for (const [, o] of activeOrders()) for (const [n] of o.items) want.add(n);
  return Object.keys(itemsRun || {}).filter((n) => want.has(n)).map((n) => [n, itemsRun[n]]);
}
