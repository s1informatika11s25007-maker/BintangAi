/**
 * SambungJaga AI — Service Worker for P5 Offline-First Progressive Web App
 * Caches HTML, CSS, JS, Fonts & Assets so URL opens instantly (0 ms) when 100% offline.
 */

const CACHE_NAME = 'sambungjaga-ai-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/Friendly Futuristic Robot Mascot.png'
];

// Install Event: Cache Core App Shell Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Ignore Supabase & Groq API requests (let them fallback to IndexedDB in JS)
  if (event.request.url.includes('supabase.co') || event.request.url.includes('groq.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return cached index.html for navigation when offline
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Background Sync Event: P5 Ledger Offline Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-p5-ledger') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_OFFLINE_LEDGER' });
        });
      })
    );
  }
});
