// Imports the IndexedDB Promised node package
// Imports the ServiceWorker class from sw/index.js
import idb from 'idb';
import ServiceWorker from './sw/index';

// Manages all tasks needed for offline functionality
class OfflineController {
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

    // Create / open the database and create / open Object Store
    return idb.open(this.IDB_DATABASE_NAME, 1, upgradeDB => {
      const store = upgradeDB.createObjectStore('restaurants', {
        keyPath: 'id'
      });
      // store.createIndex();
    });
  }

  // Pass restaurants to idb Store
  storeInDatabase(restaurants) {
    this._dbPromise.then((db) => {
      // Leaves function if there is no database
      if (!db) return;

      // Creates a new transaction
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');

      // Loops through restaurants and stores each in database
      restaurants.forEach(restaurant => {
        store.put(restaurant);
      });

    })
  }
}

module.exports = OfflineController;
