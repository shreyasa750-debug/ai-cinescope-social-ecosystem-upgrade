// CineScope Enhanced Service Worker for Offline Support
const CACHE_VERSION = 'v2';
const CACHE_NAME = `cinescope-${CACHE_VERSION}`;
const RUNTIME_CACHE = `cinescope-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `cinescope-images-${CACHE_VERSION}`;
const API_CACHE = `cinescope-api-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
];

// Cache size limits
const MAX_IMAGE_CACHE_SIZE = 50;
const MAX_API_CACHE_SIZE = 30;
const CACHE_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !name.includes(CACHE_VERSION))
            .map((name) => {
              console.log('[ServiceWorker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Strategy 1: Network-first for API calls (with cache fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Strategy 2: Cache-first for images (TMDB posters, local images)
  if (url.hostname.includes('image.tmdb.org') || 
      url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Strategy 3: Stale-while-revalidate for static assets
  if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Strategy 4: Network-first for HTML pages
  event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
});

// Network-first strategy: Try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Manage cache size
      manageCacheSize(cacheName, cacheName === API_CACHE ? MAX_API_CACHE_SIZE : 100);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    // Return a generic offline response for other requests
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' })
    });
  }
}

// Cache-first strategy: Try cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Check if cache is expired
    const cacheDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    
    if (now - cacheDate < CACHE_EXPIRATION_TIME) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Manage cache size for images
      manageCacheSize(cacheName, MAX_IMAGE_CACHE_SIZE);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed for image:', request.url);
    return cachedResponse || new Response('Image unavailable', { status: 404 });
  }
}

// Stale-while-revalidate: Return cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const cache = caches.open(cacheName);
        cache.then(c => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Manage cache size to prevent unlimited growth
async function manageCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Delete oldest entries (FIFO)
    const deleteCount = keys.length - maxItems;
    await Promise.all(
      keys.slice(0, deleteCount).map(request => cache.delete(request))
    );
    console.log(`[ServiceWorker] Trimmed ${deleteCount} items from ${cacheName}`);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-ratings') {
    event.waitUntil(syncPendingActions('ratings'));
  }
  if (event.tag === 'sync-watchlist') {
    event.waitUntil(syncPendingActions('watchlist'));
  }
  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncPendingActions('reviews'));
  }
});

// Sync pending actions when back online
async function syncPendingActions(type) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['pending-actions'], 'readonly');
    const store = transaction.objectStore('pending-actions');
    const actions = await store.getAll();
    
    const filteredActions = actions.filter(action => action.type === type);
    
    for (const action of filteredActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        if (response.ok) {
          // Remove from pending actions
          const deleteTransaction = db.transaction(['pending-actions'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('pending-actions');
          await deleteStore.delete(action.id);
          console.log(`[ServiceWorker] Synced ${type} action:`, action.id);
        }
      } catch (error) {
        console.error(`[ServiceWorker] Failed to sync ${type}:`, error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync error:', error);
  }
}

// IndexedDB helper for offline data storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cinescope-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('cached-data')) {
        db.createObjectStore('cached-data', { keyPath: 'key' });
      }
    };
  });
}

// Push notification support
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from CineScope',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'view', title: 'View', icon: '/icons/view.png' },
      { action: 'close', title: 'Close', icon: '/icons/close.png' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'CineScope', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked');
  event.notification.close();
  
  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url;
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// Message handler for communication with app
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then(cache => cache.addAll(event.data.urls))
    );
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => 
        Promise.all(cacheNames.map(name => caches.delete(name)))
      )
    );
  }
});

console.log('[ServiceWorker] Loaded');