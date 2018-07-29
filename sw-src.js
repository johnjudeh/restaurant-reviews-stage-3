/**
 * Imports the IndexedDB Promised node package.
 */
import idb from 'idb';

const staticCacheName = 'mws-restaurant-v12';
const cacheWhiteList = [ staticCacheName ];
const IDB_DATABASE_NAME = 'restaurants-app';
const PORT = 1337;
const REVIEWS_URL = `http://localhost:${PORT}/reviews`;

// Event fires when service worker is first discovered
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/restaurant.html',
        '/js/main-bundle.js',
        '/js/restaurant-bundle.js',
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
  const request = event.request;
  const requestUrl = new URL(request.url);

  // Checks if request is from page origin
  if (requestUrl.origin === location.origin
      && request.method !== 'POST' ) {

    event.respondWith(
      caches.open(staticCacheName).then(cache => {
        // Searchs for respone in cache
        return cache.match(event.request).then(response => {

          if (!response) {
            return fetch(event.request).then(networkResponse => {
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
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Awaits sync event to perform background sync
self.addEventListener('sync', event => {
  if (event.tag === event.tag) {
    event.waitUntil(sendRequestInOutbox(event.tag));
  }
})

function sendRequestInOutbox(outboxTag) {
  const dbPromise = idb.open(IDB_DATABASE_NAME, 2);

  return dbPromise.then(db => {
    // Leaves function if there is no database
    if (!db) return;

    console.log('opened database');

    // Creates a new transaction
    const tx = db.transaction('reviews-outbox', 'readwrite');
    const store = tx.objectStore('reviews-outbox');

    // Retrieve outbox item
    return store.get(outboxTag);

  }).then(requestBody => {

    console.log(requestBody);

    // Code leads up to here --> next steps below
      // 1. send request and ensure response
      // 2. update idb with review
      // 3. delete review from idb outbox

      

    // fetch(REVIEWS_URL, {
    //   method: 'POST',
    //   body: JSON.stringify(requestBody)
    // }).then(response => {
    //   if (response.status === 201) { // Got a success response from the server!
    //     return response.json();
    //   } else { // Oops!. Got an error from server.
    //     const error = (`Request failed. Returned status of ${response.status}`);
    //     throw error;
    //   }
    // })
    // .then(review => {
    //   // Updates IDB database with new review
    //   offlineController.updateReviewsDBRecord(restaurant.id, review);
    //   callback(null, review);
    // })
    // .catch(error => {
    //   callback(error, null);
    // });



  })

}
