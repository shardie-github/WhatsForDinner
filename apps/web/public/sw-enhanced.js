/**
 * Enhanced Service Worker for Offline Caching
 * Provides versioned cache with manual refresh control
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `whatsfordinner-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline';

// Cache shell + critical assets
const SHELL_CACHE = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Cache critical API endpoints (with versioning)
const API_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*$/,
];

// Install: Cache shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing, version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching shell');
        return cache.addAll(SHELL_CACHE.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating, version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseToCache = response.clone();
          
          // Cache API responses matching patterns
          const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
          
          if (shouldCache) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If navigating to a page, show offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_PAGE);
          }
          
          // Otherwise return error response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Message handler for manual cache refresh
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_REFRESH') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        return self.registration.update();
      })
    );
  }
});
