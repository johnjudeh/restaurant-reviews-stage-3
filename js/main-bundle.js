(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Imports offline functionality
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _offlineController = require('./offlineController');

var _offlineController2 = _interopRequireDefault(_offlineController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Creates instance of OfflineController on page load
 * This registers the service worker and opens IndexedDB db
 */
var offlineController = new _offlineController2.default();

/**
 * Alt text for each restaurant
 */
var RESTARAUNT_ALT_TEXT = ['A busy but ambient atmosphere in Mission Chineese Food', 'A warm margherita pizza on a wooden surface', 'A modern restaurant with tables with cookers in the middle', 'A cozy deli on the corner of a Manhattan street', 'A cafeteria-like Italian restaurant with an open kitchen', 'A casual indoor barbeque kitchen with a large American flag hanging on the wall', 'The outside of the small Superiority Burger restaurant in Manhattan', 'A blue bold sign hangs above the Dutch restaurant', 'Mu Ramen\'s busy but cozy atmosphere with people eating with chopsticks', 'An exquisitely designed and well lit modern kitchen in Queens'];

/**
 * Common database helper functions.
 */

var DBHelper = function () {
  function DBHelper() {
    _classCallCheck(this, DBHelper);
  }

  _createClass(DBHelper, null, [{
    key: 'getSpecificRestaurantUrl',


    /**
     * Specific Restaurant URL From Server.
     */
    value: function getSpecificRestaurantUrl(id) {
      var port = 1337; // Change this to your server port
      return 'http://localhost:' + port + '/restaurants/' + id;
    }

    /**
     * Fetch all restaurants.
     */

    /* TODO: Delete the comments below once you have checked that errors
     are properly handled */

  }, {
    key: 'fetchRestaurants',
    value: function fetchRestaurants(callback) {
      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


      var searchUrl = void 0;

      if (id === 0) {
        searchUrl = DBHelper.ALL_RESTAURANTS_URL;
      } else {
        searchUrl = DBHelper.getSpecificRestaurantUrl(id);
      }

      fetch(searchUrl).then(function (response) {
        if (response.status === 200) {
          // Got a success response from the server!
          return response.json();
        } else {
          // Oops!. Got an error from server.
          var error = 'Request failed. Returned status of ' + response.status;
          throw error;
        }
      }).then(function (restaurants) {
        offlineController.storeInDatabase(restaurants);
        callback(null, restaurants);
      }).catch(function (error) {
        callback(error, null);
      });
    }

    /**
     * Fetch a restaurant by its ID.
     * TODO: delete the commented out code if it is not needed
     */

  }, {
    key: 'fetchRestaurantById',
    value: function fetchRestaurantById(id, callback) {
      // fetch all restaurants with proper error handling.
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback('Restaurant does not exist', null);
          // callback(error, null);
        } else {
          callback(null, restaurants);
          // const restaurant = restaurants.find(r => r.id == id);
          // if (restaurant) { // Got the restaurant
          //   callback(null, restaurant);
          // } else { // Restaurant does not exist in the database
          //   callback('Restaurant does not exist', null);
          // }
        }
      }, id);
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByCuisine',
    value: function fetchRestaurantByCuisine(cuisine, callback) {
      // Fetch all restaurants  with proper error handling
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          var results = restaurants.filter(function (r) {
            return r.cuisine_type == cuisine;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByNeighborhood',
    value: function fetchRestaurantByNeighborhood(neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          var results = restaurants.filter(function (r) {
            return r.neighborhood == neighborhood;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByCuisineAndNeighborhood',
    value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          var results = restaurants;
          if (cuisine != 'all') {
            // filter by cuisine
            results = results.filter(function (r) {
              return r.cuisine_type == cuisine;
            });
          }
          if (neighborhood != 'all') {
            // filter by neighborhood
            results = results.filter(function (r) {
              return r.neighborhood == neighborhood;
            });
          }
          callback(null, results);
        }
      });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */

  }, {
    key: 'fetchNeighborhoods',
    value: function fetchNeighborhoods(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Get all neighborhoods from all restaurants
          var neighborhoods = restaurants.map(function (v, i) {
            return restaurants[i].neighborhood;
          });
          // Remove duplicates from neighborhoods
          var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {
            return neighborhoods.indexOf(v) == i;
          });
          callback(null, uniqueNeighborhoods);
        }
      });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */

  }, {
    key: 'fetchCuisines',
    value: function fetchCuisines(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Get all cuisines from all restaurants
          var cuisines = restaurants.map(function (v, i) {
            return restaurants[i].cuisine_type;
          });
          // Remove duplicates from cuisines
          var uniqueCuisines = cuisines.filter(function (v, i) {
            return cuisines.indexOf(v) == i;
          });
          callback(null, uniqueCuisines);
        }
      });
    }

    /**
     * Restaurant page URL.
     */

  }, {
    key: 'urlForRestaurant',
    value: function urlForRestaurant(restaurant) {
      return './restaurant.html?id=' + restaurant.id;
    }

    /**
     * Restaurant image URL.
     */

  }, {
    key: 'imageUrlForRestaurant',
    value: function imageUrlForRestaurant(restaurant) {
      return '/img/' + restaurant.id + '-large.jpg';
    }

    /**
     * Restaurant image URLs for srcset.
     */

  }, {
    key: 'imageSrcSetForRestaurant',
    value: function imageSrcSetForRestaurant(restaurant) {
      return '/img/' + restaurant.id + '-small.jpg 330w,\n      /img/' + restaurant.id + '-small-medium.jpg 660w,\n      /img/' + restaurant.id + '-medium.jpg 740w,\n      /img/' + restaurant.id + '-large.jpg 1480w';
    }

    /**
     * Alt text for restaurant image.
     */

  }, {
    key: 'altTextForRestaurant',
    value: function altTextForRestaurant(restaurant) {
      return RESTARAUNT_ALT_TEXT[restaurant.id - 1];
    }

    /**
     * Map marker for a restaurant.
     */

  }, {
    key: 'mapMarkerForRestaurant',
    value: function mapMarkerForRestaurant(restaurant, map) {
      var marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP });
      return marker;
    }
  }, {
    key: 'ALL_RESTAURANTS_URL',

    /**
     * All Restaurants URL From Server.
     */
    get: function get() {
      var port = 1337; // Change this to your server port
      return 'http://localhost:' + port + '/restaurants';
    }
  }]);

  return DBHelper;
}();

// Exports DBHelper class


module.exports = DBHelper;

},{"./offlineController":3}],2:[function(require,module,exports){
'use strict';

var _dbhelper = require('./dbhelper');

var _dbhelper2 = _interopRequireDefault(_dbhelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var restaurants = void 0,
    neighborhoods = void 0,
    cuisines = void 0,
    markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', function (event) {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods() {
  _dbhelper2.default.fetchNeighborhoods(function (error, neighborhoods) {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML() {
  var neighborhoods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.neighborhoods;

  var select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(function (neighborhood) {
    var option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
function fetchCuisines() {
  _dbhelper2.default.fetchCuisines(function (error, cuisines) {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
function fillCuisinesHTML() {
  var cuisines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cuisines;

  var select = document.getElementById('cuisines-select');

  cuisines.forEach(function (cuisine) {
    var option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = function () {
  var loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  google.maps.event.addListener(self.map, 'tilesloaded', mapAssistiveStrategy);
  updateRestaurants();
};

/**
 * Ensures that only elements that should be focussable are
 */
function mapAssistiveStrategy() {
  var iframe = document.querySelector('iframe');
  var mapDiv = document.querySelectorAll('div[tabindex="0"]')[1];

  // Ensures that iframe is not focussable outside of javascript and has a title
  iframe.title = 'Restaurants map';
  iframe.setAttribute('tabindex', '-1');

  // Removes tabindex from mapDiv created by Google Maps
  setTimeout(function () {
    mapDiv.setAttribute('tabindex', '-1');
  }, 1000);
}

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
  var cSelect = document.getElementById('cuisines-select');
  var nSelect = document.getElementById('neighborhoods-select');

  var cIndex = cSelect.selectedIndex;
  var nIndex = nSelect.selectedIndex;

  var cuisine = cSelect[cIndex].value;
  var neighborhood = nSelect[nIndex].value;

  _dbhelper2.default.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, function (error, restaurants) {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  var ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  markers.forEach(function (m) {
    return m.setMap(null);
  });
  markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  var ul = document.getElementById('restaurants-list');
  restaurants.forEach(function (restaurant) {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
  var li = document.createElement('li');
  li.className = 'restaurants-list__card';

  var image = document.createElement('img');
  image.className = 'restaurants-list__card__img';
  image.src = _dbhelper2.default.imageUrlForRestaurant(restaurant);
  image.srcset = _dbhelper2.default.imageSrcSetForRestaurant(restaurant);
  image.sizes = imageSizesForRestaurant();
  image.alt = _dbhelper2.default.altTextForRestaurant(restaurant);
  li.append(image);

  var name = document.createElement('h3');
  name.className = 'restaurants-list__card__title';
  name.innerHTML = restaurant.name;
  li.append(name);

  var neighborhood = document.createElement('p');
  neighborhood.className = 'restaurants-list__card__address';
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  var address = document.createElement('p');
  address.className = 'restaurants-list__card__address';
  address.innerHTML = restaurant.address;
  li.append(address);

  var more = document.createElement('a');
  more.className = 'restaurants-list__card__link';
  more.innerHTML = 'View Details';
  more.href = _dbhelper2.default.urlForRestaurant(restaurant);
  li.append(more);

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  restaurants.forEach(function (restaurant) {
    // Add marker to the map
    var marker = _dbhelper2.default.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', function () {
      window.location.href = marker.url;
    });
    markers.push(marker);
  });
}

/**
 * Returns restaurant image sizes.
 */
function imageSizesForRestaurant() {
  return '(max-width: 419px) calc(100% - 70px),\n    (min-width: 420px) 250px';
}

},{"./dbhelper":1}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Imports the IndexedDB Promised node package
// Imports the ServiceWorker class from sw/index.js


var _idb = require('idb');

var _idb2 = _interopRequireDefault(_idb);

var _index = require('./sw/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Manages all tasks needed for offline functionality
var OfflineController = function () {
  function OfflineController() {
    _classCallCheck(this, OfflineController);

    // Creates new ServiceWorker on instantiation
    this._serviceWorker = new _index2.default();
    // Creates / opens idb database
    this.IDB_DATABASE_NAME = 'restaurants-app';
    this._dbPromise = this._openDatabase();
  }

  // Opens the idb database and returns the promise


  _createClass(OfflineController, [{
    key: '_openDatabase',
    value: function _openDatabase() {
      // If the browser does not support serviceWorker
      // we do not need a database
      if (!navigator.serviceWorker) {
        return Promise.Resolve();
      }

      // Create / open the database and create / open Object Store
      return _idb2.default.open(this.IDB_DATABASE_NAME, 1, function (upgradeDB) {
        var store = upgradeDB.createObjectStore('restaurants', {
          keyPath: 'id'
        });
        // store.createIndex();
      });
    }

    // Pass restaurants to idb Store

  }, {
    key: 'storeInDatabase',
    value: function storeInDatabase(restaurants) {
      this._dbPromise.then(function (db) {
        // Leaves function if there is no database
        if (!db) return;

        // Creates a new transaction
        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');

        // Loops through restaurants and stores each in database
        restaurants.forEach(function (restaurant) {
          store.put(restaurant);
        });
      });
    }
  }]);

  return OfflineController;
}();

module.exports = OfflineController;

},{"./sw/index":4,"idb":5}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles service worker registration, installing, waiting and updating
 */
var ServiceWorker = function () {
  function ServiceWorker() {
    _classCallCheck(this, ServiceWorker);

    this.registerServiceWorker();
  }

  // Registers service worker and checks to see if any new
  // service workers are waiting


  _createClass(ServiceWorker, [{
    key: 'registerServiceWorker',
    value: function registerServiceWorker() {
      var _this = this;

      // Exits if browser does not support service worker
      if (!navigator.serviceWorker) return;
      var serviceWorker = this;

      // Registers service worker from sw.js
      navigator.serviceWorker.register('/sw.js').then(function (reg) {
        if (!navigator.serviceWorker.controller) {
          return;
        }

        // Handles waiting service worker
        if (reg.waiting) {
          console.log('Service Worker is Waiting');
          _this.updateReady(reg.waiting);
          return;
        }

        // Handles installing service worker
        if (reg.installing) {
          console.log('Service Worker is Installing!');
          _this.trackInstalling(reg.installing);
          return;
        }

        // Listens for updates in service worker
        reg.addEventListener('updatefound', function () {
          console.log('Service Worker is Installing!');
          serviceWorker.trackInstalling(reg.installing);
        });
      }).catch(function (error) {
        console.log('Oops, something went wrong!');
      });
    }
  }, {
    key: 'trackInstalling',
    value: function trackInstalling(worker) {
      worker.addEventListener('statechange', function () {
        if (worker.state === 'installed') {
          console.log('Service Worker is Waiting');
          serviceWorker.updateReady(worker);
        }
      });
    }
  }, {
    key: 'updateReady',
    value: function updateReady(worker) {
      var toastDiv = document.getElementById('toastDiv');
      var swDismissBtn = document.getElementById('swDismiss');
      var swRefreshBtn = document.getElementById('swRefresh');

      toastDiv.removeAttribute('hidden');
      swRefreshBtn.focus();

      toastDiv.addEventListener('keydown', function (e) {
        if (e.keyCode == 27) {
          toastDiv.setAttribute('hidden', 'hidden');
        }
      });

      swDismissBtn.addEventListener('click', function () {
        toastDiv.setAttribute('hidden', 'hidden');
      });

      swRefreshBtn.addEventListener('click', function () {
        toastDiv.setAttribute('hidden', 'hidden');
        worker.postMessage({ action: 'skipWaiting' });
      });
    }
  }]);

  return ServiceWorker;
}();

/**
 * Exports ServiceWorker class to be used in bundle
 * TODO: Figure out the difference between this type of export
 * and the ES6 export (export class ServiceWorker{})
 */


module.exports = ServiceWorker;

},{}],5:[function(require,module,exports){
'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getKey',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
      if (!(funcName in Constructor.prototype)) return;

      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      request.onupgradeneeded = function(event) {
        if (upgradeCallback) {
          upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
        }
      };

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
    module.exports.default = module.exports;
  }
  else {
    self.idb = exp;
  }
}());

},{}]},{},[2]);
