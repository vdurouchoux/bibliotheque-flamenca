// Service Worker pour Bibliothèque Flamenca (PWA Standalone)
const CACHE_NAME = 'flamenco-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Navigation et requêtes standard : Network-First pour éviter tout écran blanc
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cached) => cached || caches.match('/'));
      })
    );
    return;
  }

  // Pour les autres requêtes, passer directement au réseau
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
