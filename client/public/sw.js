// Madifa Video Platform Service Worker
const CACHE_NAME = 'madifa-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching offline page');
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

// Fetch event - Network first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Network first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        console.log('[ServiceWorker] Serving from cache');
        return caches.match(event.request)
          .then((response) => {
            // Return cached response or offline page
            return response || caches.match(OFFLINE_URL);
          });
      })
  );
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
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    data: data.data
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;
  
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

// Sync watchlist data when online
async function syncWatchlist() {
  try {
    const response = await fetch('/api/sync/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: localStorage.getItem('offlineWatchlist')
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
    const response = await fetch('/api/sync/watch-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: localStorage.getItem('offlineWatchHistory')
    });
    
    if (response.ok) {
      localStorage.removeItem('offlineWatchHistory');
      console.log('[ServiceWorker] Watch history synced successfully');
    }
  } catch (error) {
    console.error('[ServiceWorker] Failed to sync watch history:', error);
  }
}