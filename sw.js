/**
 * MyParchi Pro - Service Worker
 * Enables offline functionality for PWA
 */

const CACHE_NAME = 'myparchi-v2.0.0';
const OFFLINE_URL = 'index.html';

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// External resources to cache on first fetch
const EXTERNAL_RESOURCES = [
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/dexie/dist/dexie.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Roboto+Mono:wght@500&display=swap'
];

// Install event - precache essential resources
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Precaching app shell...');
                return cache.addAll(PRECACHE_RESOURCES);
            })
            .then(() => {
                console.log('[SW] Precache complete');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Precache failed:', err);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients...');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) return;
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version
                    console.log('[SW] Serving from cache:', url.pathname);
                    return cachedResponse;
                }
                
                // Not in cache - fetch from network
                return fetch(request)
                    .then(networkResponse => {
                        // Check if valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            // For external resources, cache them
                            if (networkResponse && networkResponse.status === 200) {
                                const responseToCache = networkResponse.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(request, responseToCache);
                                    });
                            }
                            return networkResponse;
                        }
                        
                        // Clone response for caching
                        const responseToCache = networkResponse.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                console.log('[SW] Caching new resource:', url.pathname);
                                cache.put(request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(err => {
                        console.error('[SW] Fetch failed:', err);
                        
                        // For navigation requests, return offline page
                        if (request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // Return error for other requests
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Handle messages from main app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] Cache cleared');
        });
    }
});

// Background sync for future use
self.addEventListener('sync', event => {
    if (event.tag === 'sync-transactions') {
        console.log('[SW] Background sync triggered');
        // Future: sync transactions to cloud
    }
});

// Push notifications for future use
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'New notification from MyParchi',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'MyParchi', options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
