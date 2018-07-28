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
    this._serviceWorker = new ServiceWorker();
    // Creates / opens idb database
    this.IDB_DATABASE_NAME = 'restaurants-app';
    this._dbPromise = this._openDatabase();
  }

  // Opens the idb database and returns the promise
  _openDatabase() {
    // If the browser does not support serviceWorker
    // we do not need a database
    if (!navigator.serviceWorker) {
      return Promise.Resolve();
    }

    // Create / open the database and create / open object store
    return idb.open(this.IDB_DATABASE_NAME, 1, upgradeDB => {
      const store = upgradeDB.createObjectStore('restaurants', {
        keyPath: 'id'
      });
    });
  }

  // Pass restaurants to idb Store
  storeInDatabase(restaurants) {
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
  pullFromDatabase(id) {
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
  updateDatabaseRecord(id, propName, propValue) {
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

}
