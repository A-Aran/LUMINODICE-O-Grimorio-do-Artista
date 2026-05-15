const CACHE_NAME = 'grimorio-v100';
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
  // Handle standard HTTP/S requests only (skip chrome-extension or other protocols)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Clone the response to use it for cache
        const clonedResponse = networkResponse.clone();

        // Dynamically cache successful GET responses (like new hashed JS/CSS assets)
        if (e.request.method === 'GET' && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clonedResponse);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If the network request fails, attempt to load from cache
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and it's a navigation request, fall back to root index.html relative to base
          if (e.request.mode === 'navigate') {
            return caches.match('./') || caches.match('./index.html');
          }
        });
      })
  );
});
