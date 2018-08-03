/**
 * Imports the IndexedDB Promised node package
 * Imports the ServiceWorker class from sw/index.js
 */
import idb from 'idb';
import ServiceWorker from './sw/index';

/**
 * Manages all tasks needed for offline functionality
 */
export default class OfflineController {

  constructor() {
    // Creates new ServiceWorker on instantiation
    // TODO: turn me back on after development!
    this._serviceWorker = new ServiceWorker();
    // Creates / opens idb database
    this.IDB_DATABASE_NAME = 'restaurants-app';
    this._dbPromise = this._openDatabase();
  }

  // =========== ServiceWorker Functionality ===========

  createBackgroundSync(outboxKey) {
    return this._serviceWorker.createBackgroundSync(outboxKey);
  }

  // =========== Database Functionality ===========

  // Opens the idb database and returns the promise
  _openDatabase() {
    // If the browser does not support serviceWorker
    // we do not need a database
    if (!navigator.serviceWorker) {
      return Promise.Resolve();
    }

    // Create / open the database and create / open object store
    return idb.open(this.IDB_DATABASE_NAME, 2, upgradeDB => {
      switch (upgradeDB.oldVersion) {
        // Runs when browser has never heard of the database
        case 0:
          const restaurantsStore = upgradeDB.createObjectStore('restaurants', {
            keyPath: 'id'
          });

        // Runs when browser has version 1
        case 1:
          const reviewsStore = upgradeDB.createObjectStore('reviews');
          const reviewsOutboxStore = upgradeDB.createObjectStore('reviews-outbox');
          const favRestaurantOutboxStore = upgradeDB.createObjectStore('fav-rest-outbox');
      }

    });
  }

  // =========== Restaurant Store Functionality ===========

  // Pass restaurants to idb Store
  storeInRestaurantDB(restaurants) {
    return this._dbPromise.then(db => {
      // Leaves function if there is no database
      if (!db) return;

      // Creates a new transaction
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');

      // Checks if multiple results were returned
      if (Array.isArray(restaurants)) {
        // Loops through restaurants and stores each in database
        restaurants.forEach(restaurant => {
          store.put(restaurant);
        });
      } else {
        // Places single result in idb
        store.put(restaurants);
      }

      // Returns promise of transaction
      return tx.complete;
    })
  }

  // Pulls restaurants from database
  pullFromRestaurantDB(id) {
    return this._dbPromise.then(db => {
      // Leaves function if there is no database
      if (!db) return;

      // Converts id from number to string
      id = Number(id);

      // Creates a new transaction
      const tx = db.transaction('restaurants');
      const store = tx.objectStore('restaurants');

      if (id === 0) {
        // Returns all restaurants if id passed is 0
        return store.getAll().then(restaurants => {
          return restaurants;
        });

      } else {
        return store.get(id).then(restaurant => {
          return restaurant;
        });
      }
    });
  }

  // Updates the database values
  updateRestaurantDBRecord(id, propName, propValue) {
    return this._dbPromise.then(db => {
      // Leaves function if there is no database
      if (!db) return;

      // Converts id from number to string
      id = Number(id);

      // Creates a new transaction
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');

      // Get restaurant, update value and put back in database
      store.get(id).then(restaurant => {
        restaurant[propName] = propValue;
        store.put(restaurant);
      });

      // Returns promise of transaction
      return tx.complete;

    })
  }

  // =========== Reviews Database Functionality ===========

  // Pass reviews to idb Store
  storeInReviewsDB(reviews, restaurantId) {
    return this._dbPromise.then(db => {
      // Leaves function if there is no database
      if (!db) return;

      // Creates a new transaction
      const tx = db.transaction('reviews', 'readwrite');
      const store = tx.objectStore('reviews');

      // Adds all reviews under restaurant id
      store.put(reviews, Number(restaurantId));

      // Returns promise of transaction
      return tx.complete;
    })
  }

  // Pulls reviews from database
  pullFromReviewsDB(id) {
    return this._dbPromise.then(db => {
      // Leaves function if there is no database
      if (!db) return;

      // Converts id from number to string
      id = Number(id);

      // Creates a new transaction
      const tx = db.transaction('reviews');
      const store = tx.objectStore('reviews');

      return store.get(id).then(reviews => {
        return reviews;
      });

    });
  }

  // Updates the reviews database values
  updateReviewsDBRecord(id, review, addReview = true) {
    return this._dbPromise.then(db => {
      // Leaves function if there is no database
      if (!db) return;

      // Converts id from number to string
      id = Number(id);

      // Creates a new transaction
      const tx = db.transaction('reviews', 'readwrite');
      const store = tx.objectStore('reviews');

      // Get restaurant, update value and put back in database
      store.get(id).then(reviews => {
        reviews.push(review);
        store.put(reviews, id);
      });

      // Returns promise of transaction
      return tx.complete;

    })
  }

  // =========== Reviews-Outbox Store Functionality ===========

  // Places review in reviews-outbox waiting for connectivity
  storeInOutboxDB(storeName, key, value) {
    return this._dbPromise.then(db => {
      // Leaves function if there is no database
      if (!db) return;

      // Creates a new transaction
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      // Places review in review-outbox
      store.put(value, key);

      // Returns promise of transaction
      return tx.complete;
    })
  }

}
