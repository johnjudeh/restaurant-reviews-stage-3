/**
 * Imports the IndexedDB Promised node package.
 */
import idb from 'idb';

const staticCacheName = 'mws-restaurant-v12';
const cacheWhiteList = [staticCacheName];
const IDB_DATABASE_NAME = 'restaurants-app';
const PORT = 1337;
const REVIEWS_URL = `http://localhost:${PORT}/reviews`;

/**
 * Event fires when service worker is first discovered.
 */
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

/**
 * Event fires when new sw is intalled and ready to take over page.
 */
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

/**
 * Handles how a page makes fetch requests.
 */
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

/**
 * Awaits message to update service worker.
 */
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

/**
 * Awaits sync event to perform background sync.
 */
self.addEventListener('sync', event => {
  // Checks which outbox the request is in
  const tagPrefix = event.tag.split('_')[0];
  // Calls the handler for sending messages once connectivity is established
  event.waitUntil(sendRequestInOutbox(tagPrefix, event.tag));
})

/**
 * Sends requests stored in idb outbox and deletes outbox value.
 */
function sendRequestInOutbox(prefix, outboxTag) {
  // Opens database and saves promise
  const outboxStoreName = (prefix === 'rev') ? 'reviews-outbox' : 'fav-rest-outbox';
  const updateStoreName = (prefix === 'rev') ? 'reviews' : 'restaurants';
  const dbPromise = idb.open(IDB_DATABASE_NAME, 2);

  // Gets outbox data from idb database and sends the request
  return getFromDatabase(dbPromise, outboxStoreName, outboxTag)
    .then(dbData => {

    // Send request and ensure response
    if (prefix === 'rev') {
      return fetch(REVIEWS_URL, {
        method: 'POST',
        body: JSON.stringify(dbData)
      });
    } else {
      const isFavUpdateURL = `http://localhost:${PORT}/restaurants/${dbData.id}?is_favorite=${dbData.is_favorite}`;
      return fetch(isFavUpdateURL, {
        method: 'PUT'
      });
    }

  // Converts response to json if successful or throws an error
  }).then(response => {
    if (response.status === 201 || response.status === 200) { // Got a success response from the server!
      return response.json();
    } else { // Oops!. Got an error from server.
      const error = (`Request failed. Returned status of ${response.status}`);
      throw error;
    }

  // Updates the IDB db with the response from the server
  }).then(responseData => { // Updates IDB database with new review
    const restaurantId = Number(responseData.restaurant_id);

    if (prefix === 'rev') {
      // Gets the restaurant reviews from the database and updates the relevant review
      return getFromDatabase(dbPromise, updateStoreName, restaurantId)
        .then(storeReviews => {

          // Loops through stored reviews and updates the review that was in the outbox
          storeReviews = storeReviews.map(storeReview => {
            if (storeReview.hasOwnProperty('outboxKey') && storeReview['outboxKey'] === outboxTag) {
              return responseData;
            } else {
              return storeReview;
            }
          });

          return putInDatabase(dbPromise, updateStoreName, storeReviews, restaurantId);
        });

    } else {
      // Simply puts the new record into the database
      return putInDatabase(dbPromise, updateStoreName, responseData);
    }

  // Deletes any completed requests from the outbox
  }).then(() => {
    return deleteFromDatabase(dbPromise, outboxStoreName, outboxTag);

  // Handles any error thrown through process
  }).catch(error => {
    console.error(error);

  });

}

/**
 * Gets value from given database store.
 */
function getFromDatabase(dbPromise, storeName, key) {

  return dbPromise.then(db => {
    // Leaves function if there is no database
    if (!db) return;

    // Creates a new transaction
    const tx = db.transaction(storeName);
    const store = tx.objectStore(storeName);

    // Retrieve outbox item and return
    return store.get(key);

  });

}

/**
 * Puts value in given database store.
 */
function putInDatabase(dbPromise, storeName, value, key = null) {

  return dbPromise.then(db => {
    // Leaves function if there is no database
    if (!db) return;

    // Creates a new transaction
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Retrieve outbox item
    if (key) {
      store.put(value, key);
    } else {
      store.put(value);
    }

    // Returns a resolved promise
    return tx.complete;

  });

}

/**
 * Deletes value from given database store.
 */
function deleteFromDatabase(dbPromise, storeName, key) {

  return dbPromise.then(db => {
    // Leaves function if there is no database
    if (!db) return;

    // Creates a new transaction
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Retrieve outbox item
    return store.delete(key);

  });

}
