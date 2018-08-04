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

  // =========== General Database Functionality ===========

  // Opens the idb database and returns a promise
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

  // Stores the value (and key) in an IDB store
  storeInDB(storeName, value, key = null) {
    return this._dbPromise.then(db => {
      // Leaves function if there is no database
      if (!db) return;

      // Creates a new transaction
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      if (storeName !== 'restaurants') {
        key ? store.put(value, key) : store.put(value);

      } else {
        // Checks if multiple values are being stored
        if (Array.isArray(value)) {
          // Loops through restaurants and stores each in database
          value.forEach(v => {
            store.put(v);
          });
        } else {
          // Places single value in idb
          store.put(value);
        }
      }

      // Returns promise of transaction
      return tx.complete;
    })
  }

  // =========== Restaurant Store Functionality ===========

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

  // =========== Reviews Database Functionality ===========

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

}
