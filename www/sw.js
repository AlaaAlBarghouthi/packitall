// Offline cache for the web (home-screen) version. Not used inside the native apps.
const CACHE = 'packitall-v10';
const FILES = ['./', './index.html', './css/style.css', './fonts/BalooBhaijaan2.ttf', './icon.png', './icon-180.png', './icon-192.png', './icon-512.png',
  './js/main.js', './js/game.js', './js/city.js', './js/cityart.js', './js/ads.js', './js/config.js', './js/event.js', './js/levels.js', './js/models.js', './js/state.js', './js/data.js', './js/i18n.js', './js/audio.js', './js/icons.js', './js/lib/three.module.min.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))); self.clients.claim(); });
// network first (so updates arrive right away), cache as offline fallback
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); return res; })
    .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
});
