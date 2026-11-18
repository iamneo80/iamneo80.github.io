// N E O — offline cache (cache-first for this site's own files)
var CACHE = 'neo-v1';
var CORE = ['./', 'index.html', 'mallu.html', 'resmi-nair.html', 'insta-vs-reality.html', 'all-works.html',
  'photo.webp', 'photo.jpg', 'avatar.webp', 'avatar.jpg', 'favicon.png', 'apple-touch-icon.png',
  'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];
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
  e.respondWith(caches.match(e.request).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    });
  }));
});
