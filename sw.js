const CACHE_NAME = 'grimorio-v13';
const ASSETS = [
  './',
  './index.html',
  './favicon.svg?v=3',
  './favicon.png?v=3',
  './icon-192.png?v=3',
  './icon-512.png?v=3',
  './grimorio_icon.png',
  './screenshot-wide.png?v=3',
  './screenshot-mobile.png?v=3',
  './manifest.json?v=3'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
