
const CACHE_NAME = 'harmonyhub-v2';
const INSTRUMENTS_CACHE = 'harmonyhub-instruments-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/onlinevirtualinstrument.ico',
  '/HarmonyHubOnlineVirtualInstrument-192x192.png',
  '/HarmonyHubOnlineVirtualInstrument-512x512.png',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Instrument sound files for offline caching
const instrumentSounds = [
  '/sounds/piano/C4.mp3',
  '/sounds/piano/D4.mp3',
  '/sounds/piano/E4.mp3',
  '/sounds/piano/F4.mp3',
  '/sounds/piano/G4.mp3',
  '/sounds/piano/A4.mp3',
  '/sounds/piano/B4.mp3',
  '/sounds/drums/kick.mp3',
  '/sounds/drums/snare.mp3',
  '/sounds/drums/hihat.mp3',
  '/sounds/drums/crash.mp3',
  '/sounds/guitar/E2.mp3',
  '/sounds/guitar/A2.mp3',
  '/sounds/guitar/D3.mp3',
  '/sounds/guitar/G3.mp3',
  '/sounds/guitar/B3.mp3',
  '/sounds/guitar/E4.mp3'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_NAME).then(cache => {
        console.log('Opened app cache');
        return cache.addAll(urlsToCache);
      }),
      // Cache instrument sounds
      caches.open(INSTRUMENTS_CACHE).then(cache => {
        console.log('Opened instruments cache');
        return cache.addAll(instrumentSounds.filter(url => {
          // Only cache if the sound file exists
          return fetch(url, { method: 'HEAD' })
            .then(response => response.ok)
            .catch(() => false);
        }));
      })
    ])
  );
  self.skipWaiting();
});

// Fetch event with improved caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first, then cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Instrument sounds - cache first, then network
  if (instrumentSounds.some(sound => url.pathname.includes(sound.split('/').pop()))) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then(fetchResponse => {
              const responseClone = fetchResponse.clone();
              caches.open(INSTRUMENTS_CACHE)
                .then(cache => cache.put(request, responseClone));
              return fetchResponse;
            });
        })
    );
    return;
  }

  // App shell and static resources
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        const fetchRequest = request.clone();
        
        return fetch(fetchRequest).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
            
          return response;
        });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, INSTRUMENTS_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline actions when connection is restored
  return Promise.resolve();
}

// Push notifications (for future use)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/HarmonyHubOnlineVirtualInstrument-192x192.png',
      badge: '/HarmonyHubOnlineVirtualInstrument-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
