// Madifa Video Platform Service Worker
const CACHE_NAME = 'madifa-cache-v1.1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/apple-touch-icon.png'
];

// Cache strategy for different URLs
const CACHE_STRATEGIES = {
  // Cache-first strategy for static assets and images
  cacheFirst: [
    '/icons/',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.ico',
    '.css',
    '.woff',
    '.woff2',
    '.ttf'
  ],
  // Network-first strategy for HTML and API endpoints
  networkFirst: [
    '/',
    '/index.html',
    '/browse',
    '/movie/',
    '/my-list',
    '/profile',
    '/downloads'
  ],
  // Network-only for authentication and payment endpoints
  networkOnly: [
    '/api/auth/',
    '/api/payments/'
  ]
};

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching offline page and static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Installation completed');
        return self.skipWaiting();
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Helper function to determine which caching strategy to use
function getStrategy(url) {
  // Check for network-only URLs first (authentication, payments)
  if (CACHE_STRATEGIES.networkOnly.some(pattern => url.includes(pattern))) {
    return 'networkOnly';
  }
  
  // Check for network-first URLs (HTML pages)
  if (CACHE_STRATEGIES.networkFirst.some(pattern => url.includes(pattern))) {
    return 'networkFirst';
  }
  
  // Check for cache-first URLs (static assets, images)
  if (CACHE_STRATEGIES.cacheFirst.some(pattern => url.includes(pattern))) {
    return 'cacheFirst';
  }
  
  // Default to network-first for anything else
  return 'networkFirst';
}

// Fetch event handler with different caching strategies
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  const strategy = getStrategy(event.request.url);
  
  switch (strategy) {
    case 'cacheFirst':
      // Cache-first strategy
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            if (response) {
              // Resource in cache, return it
              return response;
            }
            
            // Not in cache, fetch from network
            return fetch(event.request)
              .then((networkResponse) => {
                // Clone the response to store in cache and return
                const responseToCache = networkResponse.clone();
                
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
                
                return networkResponse;
              })
              .catch(() => {
                // If fetch fails (offline), return the offline page for HTML requests
                if (event.request.headers.get('accept').includes('text/html')) {
                  return caches.match(OFFLINE_URL);
                }
              });
          })
      );
      break;
      
    case 'networkFirst':
      // Network-first strategy
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Cache successful responses for future offline use
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Network failed, try to get from cache
            return caches.match(event.request)
              .then((cacheResponse) => {
                // Return cached version or offline page
                return cacheResponse || caches.match(OFFLINE_URL);
              });
          })
      );
      break;
      
    case 'networkOnly':
      // Network-only strategy (for auth/payments)
      event.respondWith(
        fetch(event.request)
          .catch(() => {
            // If network fails for auth/payments, return a custom response
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            
            // For API calls, return error JSON
            return new Response(
              JSON.stringify({ 
                error: true, 
                message: 'You are offline. Please check your connection for this action.' 
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          })
      );
      break;
  }
});

// Background sync for offline content
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-watchlist') {
    event.waitUntil(syncWatchlist());
  } else if (event.tag === 'sync-watchhistory') {
    event.waitUntil(syncWatchHistory());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { 
    title: 'New from Madifa', 
    body: 'Check out new content on Madifa!',
    icon: '/logo192.png'
  };
  
  const options = {
    body: data.body,
    icon: data.icon || '/logo192.png',
    badge: '/icons/badge.png',
    data: data.data || { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = new URL(
    event.notification.data?.url || '/', 
    self.location.origin
  ).href;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window/tab is already open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handler for skip-waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sync watchlist data when online
async function syncWatchlist() {
  try {
    const watchlistData = localStorage.getItem('offlineWatchlist');
    
    if (!watchlistData) {
      return;
    }
    
    const response = await fetch('/api/sync/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: watchlistData
    });
    
    if (response.ok) {
      localStorage.removeItem('offlineWatchlist');
      console.log('[ServiceWorker] Watchlist synced successfully');
    }
  } catch (error) {
    console.error('[ServiceWorker] Failed to sync watchlist:', error);
  }
}

// Sync watch history data when online
async function syncWatchHistory() {
  try {
    const historyData = localStorage.getItem('offlineWatchHistory');
    
    if (!historyData) {
      return;
    }
    
    const response = await fetch('/api/sync/watch-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: historyData
    });
    
    if (response.ok) {
      localStorage.removeItem('offlineWatchHistory');
      console.log('[ServiceWorker] Watch history synced successfully');
    }
  } catch (error) {
    console.error('[ServiceWorker] Failed to sync watch history:', error);
  }
}