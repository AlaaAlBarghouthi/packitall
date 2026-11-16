// Optional rewarded ads only (player taps a button to watch). No forced ads anywhere.
import { AD } from './config.js';
import { S, save } from './state.js';
import { t } from './i18n.js';

const Cap = window.Capacitor;
const native = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const platform = native ? Cap.getPlatform() : 'web';
const A = () => (native && Cap.Plugins ? Cap.Plugins.AdMob : null);

let ready = false, loaded = false, loading = null, privacyRequired = false;

export async function initAds() {
  const M = A();
  if (!M) return;
  try {
    let ci = await M.requestConsentInfo();
    if (ci.isConsentFormAvailable && ci.status === 'REQUIRED') ci = await M.showConsentForm();
    privacyRequired = ci.privacyOptionsRequirementStatus === 'REQUIRED';
    if (ci.canRequestAds === false) return;
    if (platform === 'ios') { try { await M.requestTrackingAuthorization(); } catch (e) {} }
    await M.initialize({
      maxAdContentRating: 'General',          // family-friendly ads only
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
      initializeForTesting: AD.TEST,
    });
    ready = true;
    preload();
  } catch (e) { console.warn('ads init', e); }
}

function unitId() { return platform === 'ios' ? AD.ios.rewarded : AD.android.rewarded; }

function preload() {
  const M = A();
  if (!M || !ready || loaded) return Promise.resolve();
  if (!loading) {
    loading = M.prepareRewardVideoAd({ adId: unitId(), isTesting: AD.TEST })
      .then(() => { loaded = true; })
      .catch((e) => { loaded = false; console.warn('ad load', e); })
      .finally(() => { loading = null; });
  }
  return loading;
}

// ---- daily caps per placement
function today() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function caps() {
  if (!S.ads || S.ads.day !== today()) S.ads = { day: today(), n: {} };
  return S.ads;
}
export function usesLeft(place) { return Math.max(0, AD.DAILY_CAP - (caps().n[place] || 0)); }
export function adsEnabled() { return native ? ready : AD.WEB_DEMO; }
export function canShow(place) { return adsEnabled() && usesLeft(place) > 0; }
export function showPrivacyOptionsButton() { return native && privacyRequired; }
export function openPrivacyOptions() { const M = A(); if (M) M.showPrivacyOptionsForm().catch(() => {}); }

// Show a rewarded ad. Resolves true only if the reward was earned.
export async function showRewarded(place) {
  if (!canShow(place)) return false;
  let ok = false;
  if (native) ok = await showNative();
  else ok = await showWebDemo();
  if (ok) { const c = caps(); c.n[place] = (c.n[place] || 0) + 1; save(); }
  return ok;
}

async function showNative() {
  const M = A();
  if (!loaded) await preload();
  if (!loaded) return false;
  return new Promise(async (resolve) => {
    let rewarded = false, done = false;
    const finish = (v) => { if (done) return; done = true; hs.forEach((h) => h && h.remove && h.remove()); loaded = false; setTimeout(preload, 500); resolve(v); };
    const hs = [];
    hs.push(await M.addListener('onRewardedVideoAdReward', () => { rewarded = true; }));
    hs.push(await M.addListener('onRewardedVideoAdDismissed', () => setTimeout(() => finish(rewarded), 300)));
    hs.push(await M.addListener('onRewardedVideoAdFailedToShow', () => finish(false)));
    M.showRewardVideoAd().then((item) => { if (item) rewarded = true; }).catch(() => finish(rewarded));
  });
}

// Web version: a short demo "ad" screen so the flow can be tested
function showWebDemo() {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'ad-demo';
    let n = 3;
    el.innerHTML = `<div class="ad-demo-card"><div class="ad-demo-tag">AD · ${t('adDemo')}</div><div class="ad-demo-ico">🎬</div><b id="ad-n">${n}</b></div>`;
    document.body.appendChild(el);
    const iv = setInterval(() => {
      n--; const b = el.querySelector('#ad-n'); if (b) b.textContent = n;
      if (n <= 0) { clearInterval(iv); el.remove(); resolve(true); }
    }, 1000);
  });
}
