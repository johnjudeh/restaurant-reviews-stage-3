const staticCacheName = 'mws-restaurant-v12';
const cacheWhiteList = [ staticCacheName ];

// Event fires when service worker is first discovered
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/restaurant.html',
        '/js/main-bundle.js',
        '/js/restaurant_info.js',
        '/css/styles.css'
      ]);
    })
  );
});

// Event fires when new sw is intalled and ready to take over page
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => {
        return !cacheWhiteList.includes(cacheName);
      }).map(cacheName => {
        console.log('Deleting:', cacheName);
        return caches.delete(cacheName);
      })
    })
  );
});

// Handles how a page makes fetch requests
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Checks if request is from page origin
  if (requestUrl.origin === location.origin) {

    event.respondWith(
      caches.open(staticCacheName).then(cache => {
        // Searchs for respone in cache
        return cache.match(event.request).then(response => {

          if (!response) {
            const networkFetch = fetch(event.request).then(networkResponse => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }

          return response;
        })
      })
    );
  }
});

// Awaits message to update service worker
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
