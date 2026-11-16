// App shell: screens, navigation, modals, economy glue
import * as THREE from './lib/three.module.min.js';
import { I } from './icons.js';
import { t, setLang, getLang, fmt, fmtDuration } from './i18n.js';
import * as St from './state.js';
import { S } from './state.js';
import { MATS, MAT_ORDER, matCost, PERKS, LOGIN_REWARDS, GIFT_COOLDOWN_MS } from './data.js';
const giftCooldown = () => Math.max(3600000, GIFT_COOLDOWN_MS - St.perks().giftH * 3600000);
import { BUILDINGS, BUILDING_ORDER, BOOSTERS, REFILL_GEMS, EXTRA_TIME_GEMS,
  PLOT_UNLOCK, MAX_BUILDING_LEVEL, upgradeCost, incomeOf } from './data.js';
import { THEMES } from './levels.js';
import { sfx, haptic, unlockAudio } from './audio.js';
import { HoleGame } from './game.js';
import { modelIcon } from './models.js';
import { CityScene, buildingIcon } from './city.js';
import { xmasActive, xmasEndsAt } from './event.js';
import { initAds, canShow, usesLeft, showRewarded, showPrivacyOptionsButton, openPrivacyOptions } from './ads.js';

// "Watch an ad" button (only rendered when an ad can be shown)
function adBtn(place, label, id) {
  if (!canShow(place)) return '';
  return `<button class="btn btn-ad" id="${id}"><span class="ad-ico">▶</span> ${label} <small class="ad-left">${usesLeft(place)}/5</small></button>`;
}
async function watchAd(place, btn, onReward) {
  if (btn) btn.disabled = true;
  const wasPaused = game && game.paused;
  const ok = await showRewarded(place);
  if (ok) { onReward(); haptic('medium'); }
  else { toast(t('adFail')); if (btn) btn.disabled = false; }
  if (game) game.paused = wasPaused;
  return ok;
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const Cap = window.Capacitor;
const native = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const plugin = (n) => native && Cap.Plugins ? Cap.Plugins[n] : null;
// recording mode for promo videos (?rec): time is stepped manually, frame by frame
const REC = /[?&]rec\b/.test(location.search);
window.__RECMODE = REC;

let renderer, city, game, mode = 'menu', tab = 'play';

function icons(root = document) {
  root.querySelectorAll('i[data-i]').forEach((el) => { if (!el.firstChild) el.innerHTML = I[el.dataset.i] || ''; });
}
function texts(root = document) { root.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); }); }

// ---------------------------------------------------------------- materials & perks helpers
const visMats = () => MAT_ORDER.filter((m) => m !== 'festive' || xmasActive() || (S.mats.festive || 0) > 0);
function matChips(cost, showHave = true) {
  return Object.keys(cost).map((m) => {
    const ok = (S.mats[m] || 0) >= cost[m];
    return `<span class="mchip ${showHave ? (ok ? 'ok' : 'no') : ''}">${MATS[m].icon} ${showHave ? fmt(S.mats[m] || 0) + '/' : ''}${fmt(cost[m])}</span>`;
  }).join('');
}
function gainChips(m) { return MAT_ORDER.filter((k) => m[k]).map((k) => `<span class="mchip ok">${MATS[k].icon} +${fmt(m[k])}</span>`).join(''); }
function perkText(type, lv) { const pk = PERKS[type]; return pk ? t('pk_' + pk.key, { n: pk.per * lv }) : ''; }
function perksList() {
  const P = St.perks(); const keys = Object.keys(P).filter((k) => P[k] > 0);
  return keys.map((k) => `<div class="perk-row"><span>${t('pk_' + k, { n: P[k] })}</span></div>`).join('');
}

// ---------------------------------------------------------------- toast & modal
let toastT;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800);
}
let modalOnClose = null;
function modal(html, onClose) {
  $('#modal-card').innerHTML = html; icons($('#modal-card'));
  $('#modal').classList.remove('hidden'); modalOnClose = onClose === undefined ? null : onClose;
  return $('#modal-card');
}
function closeModal(silent) {
  $('#modal').classList.add('hidden');
  const f = modalOnClose; modalOnClose = null;
  if (f && !silent) f();
}
$('#modal').addEventListener('pointerdown', (e) => { if (e.target.id === 'modal' && modalOnClose !== false) { sfx.click(); closeModal(); } });

// ---------------------------------------------------------------- top bar
function refreshTop() {
  $('#hearts-n').textContent = S.hearts;
  $('#coins-n').textContent = fmt(S.coins);
  $('#gems-n').textContent = fmt(S.gems);
  const ms = St.msToNextHeart();
  $('#hearts-t').textContent = S.hearts < St.maxHearts() ? fmtDuration(ms) : '';
  const n = St.tasksReady(); const b = $('#tasks-badge');
  b.textContent = n; b.classList.toggle('on', n > 0);
}

// ---------------------------------------------------------------- tabs
function showTab(name) {
  tab = name;
  $$('.tab').forEach((el) => el.classList.toggle('active', el.id === 'tab-' + name));
  $$('#nav button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  city.active = name === 'city';
  if (name === 'play') renderMap();
  if (name === 'city') { renderCityHud(); toyStoreGift(); }
  if (name === 'tasks') renderTasks();
  if (name === 'shop') renderShop();
}

function renderMap() {
  const el = $('#map');
  const cur = S.level, from = Math.max(1, cur - 6), to = cur + 8;
  let html = '';
  for (let n = from; n <= to; n++) {
    const st = S.stars[n] || 0;
    const cls = n < cur ? 'done' : n === cur ? 'cur' : '';
    const off = Math.sin(n * 1.3) * 70;
    html += `<div class="node ${cls}" style="transform:translateX(${off}px)">${n}
      ${n < cur ? `<div class="stars">${[1, 2, 3].map(k => `<i data-i="star" class="${k <= st ? '' : 'off'}"></i>`).join('')}</div>` : ''}</div>`;
    if (n < to) html += `<div class="node-path" style="transform:translateX(${(off + Math.sin((n + 1) * 1.3) * 70) / 2}px)"></div>`;
  }
  el.innerHTML = html; icons(el);
  const curEl = el.querySelector('.node.cur'); if (curEl) curEl.scrollIntoView({ block: 'center' });
  const th = THEMES[(cur - 1) % THEMES.length];
  const xm = xmasActive() && cur > 1 && cur % 2 === 0;
  $('#play-theme').textContent = t('theme_' + (xm ? 'xmas' : th.id));
  const bn = $('#xmas-banner');
  if (xmasActive()) { const days = Math.max(1, Math.ceil((xmasEndsAt() - Date.now()) / 86400000)); bn.innerHTML = `<b>🎄 ${t('xmasTitle')}</b><span>${t('xmasBanner')}</span><small>${t('xmasEnds', { n: days })}</small>`; bn.classList.remove('hidden'); }
  else bn.classList.add('hidden');
  $('#btn-play').innerHTML = `${t('level')} ${cur}`;
}

function renderCityHud() {
  $('#city-income').textContent = fmt(St.totalIncome());
  $('#city-perhour').textContent = t('perHour');
  $('#city-pop').textContent = fmt(St.population());
  $('#city-lvl-l').textContent = t('cityLevel');
  $('#city-lvl').textContent = St.cityLevel();
  let pending = 0; S.plots.forEach((p, i) => pending += St.pendingIncome(i));
  const btn = $('#btn-collect');
  btn.innerHTML = `<i data-i="coin"></i> ${t('collect')} ${pending > 0 ? fmt(pending) : ''}`; icons(btn);
  btn.disabled = pending <= 0;
  $('#city-mats').innerHTML = visMats().map((m) => `<span class="mchip">${MATS[m].icon} ${fmt(S.mats[m] || 0)}</span>`).join('');
  $('#city-hint').classList.toggle('hidden', !!(S.tut.city || S.plots.some((p) => p.b)));
}
function openBonuses() {
  sfx.click();
  const list = perksList();
  const card = modal(`<h2>⚡ ${t('bonuses')}</h2><div class="perk-list">${list || `<p>${t('noBonuses')}</p>`}</div>
    <div class="actions"><button class="btn btn-green" id="m-close">${t('close')}</button></div>`);
  card.querySelector('#m-close').onclick = () => closeModal();
}

function renderTasks() {
  St.ensureDaily();
  const el = $('#tasks-list');
  const rw = (r) => `${r.coins ? `<span><i data-i="coin"></i>${fmt(r.coins)}</span>` : ''}${r.gems ? `<span><i data-i="gem"></i>${r.gems}</span>` : ''}`;
  el.innerHTML = `<div class="sec-title">${t('daily')}</div>` + S.daily.tasks.map((tk) => {
    const done = tk.progress >= tk.target;
    return `<div class="card task">
      <div class="tx"><b>${t('t_' + tk.type, { n: tk.target })}</b>
        <div class="prog"><div style="width:${Math.min(100, tk.progress / tk.target * 100)}%"></div></div>
        <small style="direction:ltr;display:block;color:#8a7aa8">${fmt(tk.progress)} / ${fmt(tk.target)}</small></div>
      <div class="rw">${rw(tk.reward)}</div>
      ${tk.claimed ? `<button class="btn btn-gray" disabled>${t('claimed')}</button>`
        : `<button class="btn ${done ? 'btn-green' : 'btn-gray'}" data-claim="${tk.id}" ${done ? '' : 'disabled'}>${t('claim')}</button>`}
    </div>`;
  }).join('') + (S.daily.tasks.every(x => x.claimed) ? `<div class="card" style="text-align:center"><b>${t('allDone')}</b></div>` : '');
  icons(el);
  el.querySelectorAll('[data-claim]').forEach((b) => b.onclick = () => {
    const r = St.claimTask(+b.dataset.claim);
    if (r) { sfx.coin(); haptic('medium'); toast('+' + (r.coins ? fmt(r.coins) + ' 🪙 ' : '') + (r.gems ? r.gems + ' 💎' : '')); renderTasks(); }
  });
}

const SKIN_LIST = [{ id: 'classic', name: 'skinClassic', css: 'radial-gradient(circle,#05010d 52%,#c58cff 54%,#c58cff 62%,rgba(190,110,255,.35) 66%,transparent 74%)' },
  { id: 'candy', name: 'skinCandy', css: 'radial-gradient(circle,#05010d 52%,transparent 53%),repeating-conic-gradient(#ff2f4e 0 15deg,#fff 15deg 30deg)', event: true }];
function skinCards() {
  return SKIN_LIST.map((k) => {
    const own = S.skins.includes(k.id), using = S.skin === k.id;
    return `<div class="card shop-item"><div class="skin-ico" style="background:${k.css}"></div><b>${t(k.name)}</b>
      ${own ? `<button class="btn ${using ? 'btn-gray' : 'btn-green'}" data-skin="${k.id}" ${using ? 'disabled' : ''}>${using ? t('inUse') : t('use')}</button>` : `<p>🎄 ${t('eventOnly')}</p>`}</div>`;
  }).join('');
}
function holidayGift(after) {
  const yr = String(new Date().getFullYear() + (new Date().getMonth() === 0 ? -1 : 0));
  if (!xmasActive() || S.xmasGift === yr) return after && after();
  const card = modal(`<div class="big-ico" style="font-size:72px;line-height:90px">🎅</div><h2>${t('xmasGiftTitle')}</h2><p>${t('xmasGiftText')}</p>
    <div class="skin-ico" style="margin:6px auto;background:${SKIN_LIST[1].css}"></div><b>${t('skinCandy')}</b>
    <div class="mrow" style="justify-content:center;margin:8px 0"><span class="mchip ok">🪙 +300</span><span class="mchip ok">💎 +10</span><span class="mchip ok">🎄 +20</span></div>
    <div class="actions"><button class="btn btn-green btn-big" id="xg-open">${t('open')} 🎁</button></div>`, false);
  card.querySelector('#xg-open').onclick = () => {
    S.xmasGift = yr; if (!S.skins.includes('candy')) S.skins.push('candy'); S.skin = 'candy';
    S.coins += 300; S.gems += 10; S.mats.festive = (S.mats.festive || 0) + 20; St.save();
    sfx.win(); haptic('heavy'); closeModal(true); refreshTop(); if (after) after();
  };
}

function renderShop() {
  const el = $('#shop-list');
  const giftReady = Date.now() - S.giftTs >= giftCooldown();
  el.innerHTML = `
    <div class="card row">
      <div class="big-ico" style="width:60px;height:60px;margin:0"><i data-i="gift" style="width:60px;height:60px"></i></div>
      <div class="grow"><b style="font-size:18px">${t('freeGift')}</b><br><small style="color:#6b5a8f">+100 🪙 +2 💎</small></div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:stretch">
        <button class="btn ${giftReady ? 'btn-green' : 'btn-gray'}" id="btn-gift" ${giftReady ? '' : 'disabled'}>${giftReady ? t('claim') : fmtDuration(giftCooldown() - (Date.now() - S.giftTs))}</button>
        ${giftReady ? '' : adBtn('gift', t('adNow'), 'btn-adgift')}
      </div>
    </div>
    ${canShow('freeboost') ? `<div class="card row">
      <div class="shop-item" style="flex:none"><div class="ico" style="width:56px;height:56px"><i data-i="magnet" style="width:30px;height:30px"></i></div></div>
      <div class="grow"><b style="font-size:17px">${t('adBoostTitle')}</b><br><small style="color:#6b5a8f">${t('adBoostDesc')}</small></div>
      ${adBtn('freeboost', t('adWatch'), 'btn-adboost')}
    </div>` : ''}
    <div class="sec-title">${t('skins')}</div>
    <div class="shop-grid">${skinCards()}</div>
    <div class="sec-title">${t('boosters')}</div>
    <div class="shop-grid">${Object.keys(BOOSTERS).map((k) => `
      <div class="card shop-item">
        <div class="ico"><i data-i="${k}"></i></div>
        <b>${t(k)}</b><p>${t(k + 'D')}</p>
        <div class="own">× ${S.boosters[k] || 0}</div>
        <button class="btn btn-yellow" data-buy="${k}" ${S.coins >= BOOSTERS[k].price ? '' : 'disabled'}><i data-i="coin"></i>${fmt(BOOSTERS[k].price)}</button>
      </div>`).join('')}
    </div>
    <div class="sec-title">${t('hearts')}</div>
    <div class="card row">
      <i data-i="heart" style="width:50px;height:50px"></i>
      <div class="grow"><b style="font-size:18px">${t('refill')}</b><br><small style="color:#6b5a8f;direction:ltr;display:inline-block">${S.hearts}/${St.maxHearts()}</small></div>
      <button class="btn btn-pink" id="btn-refill" ${S.hearts < St.maxHearts() && S.gems >= REFILL_GEMS ? '' : 'disabled'} style="direction:ltr"><i data-i="gem"></i>${REFILL_GEMS}</button>
    </div>
    <div class="card row">
      <i data-i="coin" style="width:50px;height:50px"></i>
      <div class="grow"><b style="font-size:18px;direction:ltr;display:inline-block">+500</b></div>
      <button class="btn btn-pink" id="btn-exchange" ${S.gems >= 10 ? '' : 'disabled'} style="direction:ltr"><i data-i="gem"></i>10</button>
    </div>`;
  icons(el);
  el.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => {
    const k = b.dataset.buy;
    if (St.spendCoins(BOOSTERS[k].price)) { S.boosters[k] = (S.boosters[k] || 0) + 1; St.save(); sfx.coin(); haptic(); renderShop(); }
    else { sfx.error(); toast(t('notEnough')); }
  });
  const ag = $('#btn-adgift'); if (ag) ag.onclick = () => watchAd('gift', ag, () => { S.giftTs = 0; S.coins += 100; S.gems += 2; S.giftTs = Date.now(); St.save(); sfx.win(); renderShop(); });
  const abo = $('#btn-adboost'); if (abo) abo.onclick = () => watchAd('freeboost', abo, () => { const ks = Object.keys(BOOSTERS); const k = ks[Math.floor(Math.random() * ks.length)]; S.boosters[k] = (S.boosters[k] || 0) + 1; St.save(); sfx.coin(); toast('+1 ' + t(k)); renderShop(); });
  el.querySelectorAll('[data-skin]').forEach((b) => b.onclick = () => { S.skin = b.dataset.skin; St.save(); sfx.click(); renderShop(); });
  const g = $('#btn-gift'); if (g && giftReady) g.onclick = () => { S.giftTs = Date.now(); S.coins += 100; S.gems += 2; St.save(); sfx.win(); renderShop(); };
  $('#btn-refill').onclick = () => { if (St.spendGems(REFILL_GEMS)) { St.refillHearts(); sfx.goal(); renderShop(); } };
  $('#btn-exchange').onclick = () => { if (St.spendGems(10)) { St.addCoins(500); sfx.coin(); renderShop(); } };
}

// ---------------------------------------------------------------- city interactions
function onPlotTap(i) {
  sfx.click();
  const p = S.plots[i];
  if (!St.plotUnlocked(i)) {
    toast(`${t('unlockAt')} ${PLOT_UNLOCK[i]}`); return;
  }
  city.focusPlot(i);
  if (!p.b) return openBuildMenu(i);
  const pend = St.pendingIncome(i);
  const maxed = p.lv >= MAX_BUILDING_LEVEL;
  const cost = maxed ? 0 : upgradeCost(p.b, p.lv);
  const card = modal(`
    <img src="${buildingIcon(p.b, p.lv)}" style="width:120px;height:120px">
    <h2>${t('bld_' + p.b)}</h2>
    <p>${t('lvl')} ${p.lv}/${MAX_BUILDING_LEVEL} · ${t('income')}: <b style="direction:ltr;display:inline-block">${fmt(incomeOf(p.b, p.lv))}${t('perHour')}</b></p>
    <div class="perk-box"><b>⚡ ${t('perk')}:</b> ${perkText(p.b, p.lv)}${maxed ? '' : `<br><small>${t('nextLv')}: ${perkText(p.b, p.lv + 1)}</small>`}</div>
    <div class="actions">
      <button class="btn btn-yellow" id="m-collect" ${pend > 0 ? '' : 'disabled'}><i data-i="coin"></i>${t('collect')} ${pend > 0 ? fmt(pend) : ''}</button>
      ${maxed ? `<button class="btn btn-gray" disabled>${t('maxed')}</button>` :
        `<div class="mrow">${matChips(matCost(p.b, p.lv + 1))}</div>
         <button class="btn btn-green" id="m-up" ${S.coins >= cost && St.hasMats(matCost(p.b, p.lv + 1)) ? '' : 'disabled'}>${t('upgrade')} <span style="direction:ltr;display:inline-flex;align-items:center;gap:4px"><i data-i="coin"></i>${fmt(cost)}</span></button>
         <small style="color:#6b5a8f">${t('income')} → <b style="direction:ltr;display:inline-block">${fmt(incomeOf(p.b, p.lv + 1))}${t('perHour')}</b></small>`}
      <button class="btn btn-gray" id="m-close">${t('close')}</button>
    </div>`);
  icons(card);
  card.querySelector('#m-close').onclick = () => { sfx.click(); closeModal(); };
  const c = card.querySelector('#m-collect'); if (c) c.onclick = () => { const n = St.collectPlot(i); St.progressTask('collect', 1); sfx.coin(); toast('+' + fmt(n)); closeModal(); renderCityHud(); };
  const u = card.querySelector('#m-up'); if (u) u.onclick = () => {
    if (St.upgrade(i)) { sfx.build(); haptic('heavy'); city.refresh(); city.burst(i); toast(t('upgraded')); closeModal(); renderCityHud(); }
    else { sfx.error(); toast(t('notEnough')); }
  };
}

function openBuildMenu(i) {
  S.tut.city = true; St.save();
  const list = BUILDING_ORDER.filter((k) => !BUILDINGS[k].event || xmasActive() || S.plots.some((p) => p.b === k)).map((k) => {
    const d = BUILDINGS[k]; const lockd = S.level < d.unlock; const mc = matCost(k, 1); const afford = S.coins >= d.cost && St.hasMats(mc);
    return `<div class="bld ${lockd ? 'locked' : ''}">
      <div class="bi" style="background-image:url(${buildingIcon(k)})"></div>
      <div class="bt"><b>${t('bld_' + k)}</b>
        ${lockd ? `<small><i data-i="lock"></i> ${t('unlockAt')} ${d.unlock}</small>` : `<span class="perk-line">⚡ ${perkText(k, 1)}</span><div class="mrow">${matChips(mc)}</div>`}</div>
      ${lockd ? '' : `<button class="btn ${afford ? 'btn-green' : 'btn-gray'}" data-b="${k}" ${afford ? '' : 'disabled'}><i data-i="coin"></i>${fmt(d.cost)}</button>`}
    </div>`;
  }).join('');
  const card = modal(`<h2>${t('build')}</h2><p>${t('chooseBuilding')}</p><div class="mrow" style="justify-content:center;margin-bottom:8px">${visMats().map((m) => `<span class="mchip">${MATS[m].icon} ${fmt(S.mats[m] || 0)}</span>`).join('')}</div><div class="bld-list">${list}</div>
    <div class="actions"><button class="btn btn-gray" id="m-close">${t('close')}</button></div>`);
  card.querySelector('#m-close').onclick = () => { sfx.click(); closeModal(); };
  card.querySelectorAll('[data-b]').forEach((b) => b.onclick = () => {
    if (St.build(i, b.dataset.b)) { sfx.build(); haptic('heavy'); city.refresh(); city.burst(i); toast(t('built')); closeModal(); renderCityHud(); }
    else { sfx.error(); toast(St.hasMats(matCost(b.dataset.b, 1)) ? t('notEnough') : t('needMats')); }
  });
}

function onCoinTap(i) {
  const n = St.collectPlot(i);
  if (n > 0) { St.progressTask('collect', 1); sfx.coin(); haptic(); toast('+' + fmt(n)); renderCityHud(); }
}

// ---------------------------------------------------------------- level flow
function startLevel() {
  unlockAudio();
  St.tickHearts();
  if (S.hearts <= 0) return noHearts();
  sfx.click();
  mode = 'game';
  closeModal(true);
  ['#topbar', '#tabs', '#nav'].forEach((s) => $(s).classList.add('hidden'));
  $('#game-hud').classList.remove('hidden');
  city.active = false;
  game.start(S.level, S.boosters, St.perks(), { tutorial: !S.tut.move && S.level === 1, xmas: xmasActive(), skin: S.skin });
  if (game.level.hazards && !S.tut.bomb) {
    game.paused = true; $('#intro').classList.remove('show');
    const card = modal(`<div class="bomb-hint"><img src="${modelIcon('bomb')}"><span class="no-sign">⚠️</span></div>
      <h2>${t('bombHintTitle')}</h2><p style="font-size:17px;font-weight:700;color:#3a1580">${t('bombHintText')}</p>
      <div class="actions"><button class="btn btn-green btn-big" id="bh-ok">${t('gotIt')}</button></div>`, false);
    card.querySelector('#bh-ok').onclick = () => { S.tut.bomb = true; St.save(); closeModal(true); game.paused = false; game._showIntro(); };
  }
}

function backToMenu(toTab = 'play') {
  mode = 'menu';
  game.running = false; game.clear();
  $('#game-hud').classList.add('hidden'); $('#tut').classList.add('hidden');
  ['#topbar', '#tabs', '#nav'].forEach((s) => $(s).classList.remove('hidden'));
  city.refresh();
  showTab(toTab);
}

function noHearts() {
  const card = modal(`<div class="big-ico"><i data-i="heart"></i></div><h2>${t('noHearts')}</h2>
    <p>${t('nextHeart')} <b id="nh-t" style="direction:ltr;display:inline-block"></b></p>
    <div class="actions">
      ${adBtn('heart', t('adHeart'), 'm-adheart')}
      <button class="btn btn-pink" id="m-refill" ${S.gems >= REFILL_GEMS ? '' : 'disabled'} style="direction:ltr"><i data-i="gem"></i>${REFILL_GEMS} · ${t('refill')}</button>
      <button class="btn btn-gray" id="m-close">${t('close')}</button></div>`);
  const ah = card.querySelector('#m-adheart');
  if (ah) ah.onclick = () => watchAd('heart', ah, () => { S.hearts = Math.min(St.maxHearts(), S.hearts + 1); St.save(); sfx.goal(); closeModal(); toast('+1 ♥'); });
  const upd = () => { const el = card.querySelector('#nh-t'); if (el) el.textContent = fmtDuration(St.msToNextHeart()); };
  upd(); const iv = setInterval(upd, 1000);
  modalOnClose = () => clearInterval(iv);
  card.querySelector('#m-close').onclick = () => closeModal();
  card.querySelector('#m-refill').onclick = () => { if (St.spendGems(REFILL_GEMS)) { St.refillHearts(); sfx.goal(); closeModal(); } };
}

function pauseGame() {
  if (mode !== 'game' || game.ended || game.paused) return;
  game.paused = true; sfx.click();
  const card = modal(`<h2>${t('paused')}</h2><p>${t('level')} ${game.level.n}</p>
    <div class="actions">
      <button class="btn btn-green" id="m-resume">${t('resume')}</button>
      <button class="btn btn-pink" id="m-quit">${t('quit')} <small>(-1 ♥)</small></button></div>`, () => { game.paused = false; });
  card.querySelector('#m-resume').onclick = () => { sfx.click(); closeModal(); };
  card.querySelector('#m-quit').onclick = () => {
    St.loseHeart(); commitRun(false); closeModal(true); backToMenu('play');
  };
}

function commitRun(win, res) {
  // coins, materials and swallowed items always count (keeps the city growing)
  const P = St.perks();
  const itemCoins = Math.round(game.coinsEarned * (1 + P.coinPct / 100));
  const tb = res ? Math.round(res.timeBonus * (1 + P.tbPct / 100)) : 0;
  const coins = itemCoins + tb + (res ? res.winBonus : 0);
  St.addCoins(coins);
  const mats = { ...game.matsRun }; St.addMats(mats);
  S.stats.swallowed += game.swallowed;
  St.progressTask('swallow', game.swallowed);
  game.swallowed = 0; game.coinsEarned = 0; game.matsRun = {};
  let gem = 0;
  if (win) {
    S.stats.levels++; St.progressTask('levels', 1);
    S.stars[res.level] = Math.max(S.stars[res.level] || 0, res.stars);
    if (res.level === S.level) S.level++;
    if (res.stars === 3) S.gems += 1;
    if (Math.random() * 100 < P.gemPct) { S.gems += 1; gem = 1; }
  }
  St.save();
  return { coins, itemCoins, tb, mats, gem };
}

function onEnd(res) {
  if (res.win) {
    sfx.win(); haptic('heavy');
    const prevLevel = S.level;
    const cr = commitRun(true, res), total = cr.coins, runCoins = cr.itemCoins;
    const unlockedPlots = PLOT_UNLOCK.filter((u) => u === S.level && prevLevel < S.level).length;
    const newBld = BUILDING_ORDER.filter((k) => BUILDINGS[k].unlock === S.level && prevLevel < S.level);
    const card = modal(`
      <h2>${t('win')}</h2>
      <div class="big-stars">${[1, 2, 3].map((k) => `<i data-i="star" class="${k <= res.stars ? 'on' : ''}"></i>`).join('')}</div>
      <div class="reward-lines">
        <div><span>${t('swallowedC')}</span><b>${fmt(runCoins)}<i data-i="coin"></i></b></div>
        <div><span>${t('timeBonus')}</span><b>${fmt(cr.tb)}<i data-i="coin"></i></b></div>
        <div><span>${t('bonus')}</span><b>${fmt(res.winBonus)}<i data-i="coin"></i></b></div>
        <div class="total"><span>${t('earned')}</span><b>${fmt(total)}<i data-i="coin"></i></b></div>
      </div>
      <div class="mrow" style="justify-content:center">${gainChips(cr.mats)}</div>
      ${cr.gem ? `<p>💎 ${t('gemBonus')}</p>` : ''}
      ${newBld.length ? `<p>🔓 ${newBld.map((k) => t('bld_' + k)).join('، ')}</p>` : ''}
      ${unlockedPlots ? `<p>🔓 ${t('emptyPlot')} +${unlockedPlots}</p>` : ''}
      ${adBtn('double', t('adDouble') + ' +' + fmt(total), 'm-addouble')}
      <div class="actions h">
        <button class="btn btn-yellow" id="m-city"><i data-i="city"></i>${t('city')}</button>
        <button class="btn btn-green" id="m-next">${t('next')}</button>
      </div>`, false);
    card.querySelector('#m-next').onclick = () => { closeModal(true); startLevel(); };
    card.querySelector('#m-city').onclick = () => { sfx.click(); closeModal(true); backToMenu('city'); };
    const ad2 = card.querySelector('#m-addouble');
    if (ad2) ad2.onclick = () => watchAd('double', ad2, () => {
      St.addCoins(total); sfx.coin(); ad2.outerHTML = `<div class="ad-done">✓ +${fmt(total)} 🪙</div>`;
      const tl = card.querySelector('.reward-lines .total b'); if (tl) { tl.innerHTML = fmt(total * 2) + '<i data-i="coin"></i>'; icons(card); }
    });
  } else if (res.canExtend && res.reason === 'bomb') {
    game.paused = true;
    const card = modal(`<div class="big-ico" style="font-size:76px;line-height:90px">💥</div><h2>${t('boom')}</h2><p>${t('boomText')}</p>
      <div class="actions">
        ${adBtn('time', t('revive'), 'm-adrev')}
        <button class="btn btn-pink" id="m-rev" ${S.gems >= EXTRA_TIME_GEMS ? '' : 'disabled'}><span style="direction:ltr;display:inline-flex;align-items:center;gap:4px"><i data-i="gem"></i>${EXTRA_TIME_GEMS}</span> ${t('revive')}</button>
        <button class="btn btn-gray" id="m-give">${t('quit')} <small>(-1 ♥)</small></button></div>`, false);
    const doRevive = () => { game.revive(); sfx.goal(); closeModal(true); };
    card.querySelector('#m-rev').onclick = () => { if (St.spendGems(EXTRA_TIME_GEMS)) doRevive(); };
    card.querySelector('#m-give').onclick = () => { closeModal(true); onEnd({ ...res, canExtend: false }); };
    const ar = card.querySelector('#m-adrev'); if (ar) ar.onclick = () => watchAd('time', ar, doRevive);
  } else if (res.canExtend) {
    sfx.lose();
    game.paused = true;
    const card = modal(`<div class="big-ico"><i data-i="clock"></i></div><h2>${t('lose')}</h2>
      <div class="goals" style="justify-content:center;margin:8px auto;display:inline-flex">${$('#goals').innerHTML}</div>
      <div class="actions">
        ${adBtn('time', t('plus20'), 'm-adtime')}
        <button class="btn btn-pink" id="m-extra" ${S.gems >= EXTRA_TIME_GEMS ? '' : 'disabled'}><span style="direction:ltr;display:inline-flex;align-items:center;gap:4px"><i data-i="gem"></i>${EXTRA_TIME_GEMS}</span> ${t('plus20')}</button>
        <button class="btn btn-gray" id="m-give">${t('quit')} <small>(-1 ♥)</small></button></div>`, false);
    card.querySelector('#m-extra').onclick = () => {
      if (!St.spendGems(EXTRA_TIME_GEMS)) return;
      game.markExtended(); game.addTime(20); sfx.goal(); closeModal(true);
    };
    card.querySelector('#m-give').onclick = () => { closeModal(true); onEnd({ ...res, canExtend: false }); };
    const at = card.querySelector('#m-adtime');
    if (at) at.onclick = () => watchAd('time', at, () => { game.markExtended(); game.addTime(20); sfx.goal(); closeModal(true); });
  } else {
    sfx.lose();
    St.loseHeart();
    const cr = commitRun(false), coins = cr.coins;
    const card = modal(`<div class="big-ico"><i data-i="heart"></i></div><h2>${res.reason === 'bomb' ? t('boom') : t('lose')}</h2>
      <p>-1 ♥ · ${t('earned')} <b style="direction:ltr;display:inline-block">${fmt(coins)}</b> 🪙</p>
      <div class="mrow" style="justify-content:center">${gainChips(cr.mats)}</div>
      <div class="actions h">
        <button class="btn btn-gray" id="m-home">${t('home')}</button>
        <button class="btn btn-green" id="m-retry">${t('retry')}</button></div>`, false);
    card.querySelector('#m-home').onclick = () => { sfx.click(); closeModal(true); backToMenu('play'); };
    card.querySelector('#m-retry').onclick = () => { closeModal(true); startLevel(); };
  }
}

function boosterTap(k) {
  if (mode !== 'game' || game.ended) return;
  if ((S.boosters[k] || 0) > 0) {
    if (game.useBooster(k)) {
      S.boosters[k]--; St.progressTask('booster', 1); St.save(); game._hudBoosters();
      $('#game-hud').classList.toggle('frozen', !!game.active.freeze);
    }
    return;
  }
  // offer to buy
  game.paused = true;
  const price = BOOSTERS[k].price;
  const card = modal(`<div class="shop-item"><div class="ico" style="width:80px;height:80px"><i data-i="${k}" style="width:44px;height:44px"></i></div></div>
    <h2>${t(k)}</h2><p>${t(k + 'D')}</p>
    <div class="actions">
      ${adBtn('booster', t('adFree'), 'm-adboost')}
      <button class="btn btn-yellow" id="m-buy" ${S.coins >= price ? '' : 'disabled'} style="direction:ltr"><i data-i="coin"></i>${fmt(price)}</button>
      <button class="btn btn-gray" id="m-close">${t('close')}</button></div>`, () => { game.paused = false; });
  const ab = card.querySelector('#m-adboost');
  if (ab) ab.onclick = () => watchAd('booster', ab, () => { S.boosters[k] = (S.boosters[k] || 0) + 1; St.save(); sfx.coin(); closeModal(); game._hudBoosters(); });
  card.querySelector('#m-close').onclick = () => closeModal();
  card.querySelector('#m-buy').onclick = () => {
    if (St.spendCoins(price)) { S.boosters[k] = (S.boosters[k] || 0) + 1; St.save(); sfx.coin(); closeModal(); game._hudBoosters(); }
  };
}

// ---------------------------------------------------------------- settings
function openSettings() {
  sfx.click();
  const card = modal(`<h2>${t('settings')}</h2>
    <div class="set-row"><span>${t('sound')}</span><button class="toggle ${S.settings.sound ? 'on' : ''}" id="s-sound"></button></div>
    <div class="set-row"><span>${t('vibration')}</span><button class="toggle ${S.settings.vib ? 'on' : ''}" id="s-vib"></button></div>
    <div class="set-row"><span>${t('language')}</span><div class="seg"><button data-l="ar" class="${getLang() === 'ar' ? 'on' : ''}">عربي</button><button data-l="en" class="${getLang() === 'en' ? 'on' : ''}">English</button></div></div>
    ${showPrivacyOptionsButton() ? `<div class="set-row"><span>${t('privacy')}</span><button class="btn btn-gray" id="s-privacy" style="min-height:36px;font-size:14px">⚙</button></div>` : ''}
    <div class="actions">
      <button class="btn btn-gray" id="s-reset">${t('reset')}</button>
      <button class="btn btn-green" id="m-close">${t('close')}</button></div>
    <p style="font-size:12px;margin-top:12px">Pack It All v1.0.0</p>`);
  card.querySelector('#s-sound').onclick = (e) => { S.settings.sound = !S.settings.sound; e.currentTarget.classList.toggle('on', S.settings.sound); St.save(); sfx.click(); };
  card.querySelector('#s-vib').onclick = (e) => { S.settings.vib = !S.settings.vib; e.currentTarget.classList.toggle('on', S.settings.vib); St.save(); haptic('medium'); };
  card.querySelectorAll('[data-l]').forEach((b) => b.onclick = () => { S.settings.lang = b.dataset.l; St.save(); applyLang(); closeModal(true); openSettings(); });
  card.querySelector('#m-close').onclick = () => { sfx.click(); closeModal(); };
  const sp = card.querySelector('#s-privacy'); if (sp) sp.onclick = () => openPrivacyOptions();
  card.querySelector('#s-reset').onclick = () => {
    const c2 = modal(`<h2>${t('reset')}</h2><p>${t('resetConfirm')}</p><div class="actions h">
      <button class="btn btn-gray" id="r-no">${t('no')}</button><button class="btn btn-pink" id="r-yes">${t('yes')}</button></div>`);
    c2.querySelector('#r-no').onclick = () => closeModal();
    c2.querySelector('#r-yes').onclick = () => { St.resetAll(); city.refresh(); closeModal(); showTab('play'); };
  };
}
function applyLang() {
  setLang(S.settings.lang || ((navigator.language || 'ar').toLowerCase().startsWith('ar') ? 'ar' : 'en'));
  texts(); if (city) showTab(tab);
}

// ---------------------------------------------------------------- welcome
function welcome() {
  const card = modal(`<div class="logo big" style="align-items:center;margin:6px auto 10px;transform:rotate(-4deg) scale(.8)"><span>PACK</span><span>IT ALL</span></div>
    <p style="font-size:18px;font-weight:700">${t('welcome')}</p>
    <div class="actions"><button class="btn btn-green btn-big" id="w-go">${t('play')}</button></div>`, () => { S.tutorial = false; St.save(); });
  card.querySelector('#w-go').onclick = () => { S.tutorial = false; St.save(); closeModal(true); startLevel(); };
}

// ---------------------------------------------------------------- daily login + toy store
function dailyStuff() {
  if (St.loginPending() >= 0) return showLogin(() => toyStoreGift());
  toyStoreGift();
}
function toyStoreGift() {
  const got = St.claimDailyBoosters();
  if (got.length) { sfx.coin(); toast(t('toyGift') + ' ' + got.map((k) => t(k)).join('، ')); }
}
function rewardLabel(r) {
  return [r.coins ? `🪙${fmt(r.coins)}` : '', r.gems ? `💎${r.gems}` : '', r.boost ? { magnet: '🧲', tornado: '🌪️', freeze: '❄️', grow: '↔️' }[r.boost] : ''].filter(Boolean).join(' ');
}
function showLogin(after) {
  const idx = St.loginPending();
  const card = modal(`<h2>🎁 ${t('login')}</h2>
    <div class="login-grid">${LOGIN_REWARDS.map((r, i) => `<div class="lday ${i < idx ? 'done' : ''} ${i === idx ? 'today' : ''} ${i === 6 ? 'd7' : ''}">
      <span>${t('day')} ${i + 1}</span><span class="lr">${rewardLabel(r)}</span>${i < idx ? '✓' : ''}</div>`).join('')}</div>
    <p style="font-size:14px">${t('comeTomorrow')}</p>
    <div class="actions"><button class="btn btn-green btn-big" id="l-claim">${t('claim')}</button></div>`, false);
  card.querySelector('#l-claim').onclick = () => {
    const r = St.claimLogin(); if (r) { sfx.win(); haptic('medium'); toast('+ ' + rewardLabel(r)); }
    closeModal(true); refreshTop(); if (after) after();
  };
}

// ---------------------------------------------------------------- boot
async function boot() {
  icons();
  await St.load();
  applyLang();

  renderer = new THREE.WebGLRenderer({ canvas: $('#gl'), antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(REC ? (window.devicePixelRatio || 1) : Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  city = new CityScene(renderer, { onPlotTap, onCoinTap });
  game = new HoleGame(renderer, { onEnd, onTutorialDone: () => { S.tut.move = true; St.save(); } });
  city.resize();
  window.addEventListener('resize', () => { renderer.setSize(window.innerWidth, window.innerHeight); city.resize(); game._resize(); });

  // wiring
  $$('#nav button').forEach((b) => b.onclick = () => { unlockAudio(); sfx.click(); showTab(b.dataset.tab); });
  $$('[data-go]').forEach((b) => b.onclick = () => { sfx.click(); showTab(b.dataset.go); });
  $('#btn-play').onclick = startLevel;
  $('#btn-settings').onclick = openSettings;
  $('#btn-bonuses').onclick = openBonuses;
  $('#btn-pause').onclick = pauseGame;
  $('#btn-collect').onclick = () => { const n = St.collectAll(); if (n > 0) { sfx.coin(); haptic('medium'); toast('+' + fmt(n)); } renderCityHud(); };
  $$('.boost').forEach((b) => b.onclick = (e) => { e.stopPropagation(); boosterTap(b.dataset.b); });
  St.onChange(refreshTop);
  setInterval(() => { St.tickHearts(); refreshTop(); if (mode === 'menu' && tab === 'city') renderCityHud(); }, 1000);

  document.addEventListener('visibilitychange', () => { if (document.hidden) { St.saveNow(); pauseGame(); } });
  const App = plugin('App');
  if (App) {
    App.addListener('backButton', () => {
      if (!$('#modal').classList.contains('hidden')) { if (modalOnClose !== false) closeModal(); return; }
      if (mode === 'game') return pauseGame();
      if (tab !== 'play') return showTab('play');
      App.exitApp();
    });
    App.addListener('pause', () => { St.saveNow(); pauseGame(); });
  }
  const SB = plugin('StatusBar'); if (SB) { SB.setOverlaysWebView({ overlay: true }).catch(() => {}); SB.setStyle({ style: 'DARK' }).catch(() => {}); }

  ['#topbar', '#tabs', '#nav'].forEach((s) => $(s).classList.remove('hidden'));
  showTab('play'); refreshTop();

  if (REC) {
    window.__rec = {
      game, city, St, S: () => St.S, startLevel, backToMenu, showTab, closeModal,
      step(dt, n = 1, beforeEach, render = true) {
        for (let i = 0; i < n; i++) { if (beforeEach) beforeEach(i); if (mode === 'game') game.update(dt); else city.update(dt); }
        if (render) { if (mode === 'game') game.render(); else city.render(); }
      },
    };
    ['#loading'].forEach((q) => $(q).classList.add('out'));
    return;
  }
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (mode === 'game') { game.update(dt); game.render(); $('#game-hud').classList.toggle('frozen', !!game.active.freeze); }
    else { city.update(dt); city.render(); }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  setTimeout(() => { $('#loading').classList.add('out'); const SS = plugin('SplashScreen'); if (SS) SS.hide().catch(() => {}); }, 300);
  document.body.classList.toggle('xmas', xmasActive());
  if (S.tutorial) setTimeout(welcome, 500);
  else setTimeout(() => holidayGift(dailyStuff), 600);
  setTimeout(() => { initAds(); }, 1500);
}

// offline support when installed from Safari/Chrome (web version only)
if (!native && !REC && 'serviceWorker' in navigator && location.protocol === 'https:' && !location.hostname.endsWith('claude.ai') && !location.hostname.includes('claudeusercontent')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

boot().catch((e) => { console.error(e); document.body.insertAdjacentHTML('beforeend', `<pre style="position:fixed;bottom:0;color:#fff;z-index:999;font-size:11px;white-space:pre-wrap">${e && e.stack || e}</pre>`); });
