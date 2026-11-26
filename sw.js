// N E O — offline cache: pages network-first so updates show fast, assets cache-first
var CACHE = 'neo-v19';
var CORE = ['./', 'index.html', 'mallu.html', 'resmi-nair.html', 'insta-vs-reality.html', 'all-works.html', 'others.html',
  'photo.webp', 'photo.jpg', 'avatar.webp', 'avatar.jpg', 'favicon.png', 'apple-touch-icon.png',
  'icon-192.png', 'icon-512.png', 'top1.webp', 'top1.jpg', 'top2.webp', 'top2.jpg', 'top3.webp', 'top3.jpg', 'top4.webp', 'top4.jpg', 'top5.webp', 'top5.jpg', 'top6.webp', 'top6.jpg', 'top7.webp', 'top7.jpg', 'manifest.webmanifest'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  var isPage = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (isPage) {
    // Network-first: fresh page whenever online, cache only as the offline fallback
    e.respondWith(fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) { return hit || caches.match('index.html'); });
    }));
    return;
  }
  // Cache-first for images and other assets
  e.respondWith(caches.match(e.request).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    });
  }));
});
