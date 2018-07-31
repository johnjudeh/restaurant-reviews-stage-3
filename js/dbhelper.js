/**
 * Imports offline functionality
 */
import OfflineController from './offlineController';

/**
 * Creates instance of OfflineController on page load
 * This registers the service worker and opens IndexedDB db
 */
const offlineController = new OfflineController();

/**
 * Alt text for each restaurant
 */
const RESTARAUNT_ALT_TEXT = [
  'A busy but ambient atmosphere in Mission Chineese Food',
  'A warm margherita pizza on a wooden surface',
  'A modern restaurant with tables with cookers in the middle',
  'A cozy deli on the corner of a Manhattan street',
  'A cafeteria-like Italian restaurant with an open kitchen',
  'A casual indoor barbeque kitchen with a large American flag hanging on the wall',
  'The outside of the small Superiority Burger restaurant in Manhattan',
  'A blue bold sign hangs above the Dutch restaurant',
  'Mu Ramen\'s busy but cozy atmosphere with people eating with chopsticks',
  'An exquisitely designed and well lit modern kitchen in Queens'
];

/**
 * Common database helper functions.
 * Default export from module.
 */
export default class DBHelper {
  /**
   * Server port.
   */
  static get SERVER_PORT() {
    return 1337; // Change this to your server port
  }

  /**
   * All Restaurants URL From Server.
   */
  static get ALL_RESTAURANTS_URL() {
    const port = DBHelper.SERVER_PORT;
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Add Review URL to Server
   */
  static get REVIEWS_URL() {
    const port = DBHelper.SERVER_PORT;
    return `http://localhost:${port}/reviews`;
    // return 'http://localhost:9999';
  }

  /**
   * Specific Restaurant URL From Server.
   */
   static getSpecificRestaurantUrl(id) {
     const port = DBHelper.SERVER_PORT;
     return `http://localhost:${port}/restaurants/${id}`;
   }

   /**
    * Specific Restaurant Reviews URL From Server.
    */
   static getReviewsForRestuarantURL(id) {
     const port = DBHelper.SERVER_PORT;
     return `http://localhost:${port}/reviews/?restaurant_id=${id}`;
   }

   /**
    * Update favorite restaurants in database.
    */
    // TODO: Add callback to this so it works in the same way as other functions
    // Currently it puts the new information in the database regardless of if the
    // Server request is successful
   static updateFavoriteRestaurants(restaurant, isFavourite, callback) {
     // Updates server database with new is_favorite value
     fetch(DBHelper.getSpecificRestaurantUrl(restaurant.id) + '?is_favorite=' + isFavourite, {
       method: 'PUT'
     }).then(response => {
       if (response.status === 200) { // Got a success response from the server!
         return response.json();
       } else { // Oops!. Got an error from server.
         const error = (`Request failed. Returned status of ${response.status}`);
         throw error;
       }
     })
     .then(restaurantResponse => {
       // Updates IDB database with updated restaurant (with new is_fav value)
       offlineController.storeInRestaurantDB(restaurantResponse);
       // offlineController.updateRestaurantDBRecord(restaurant.id, 'is_favorite', isFavourite);
       callback(null, restaurantResponse);
     })
     .catch(error => {
       console.log(error);
       callback(error, null);
     });

   }

   /**
    * Update reviews in database with new review.
    */
   static addNewReview(restaurant, requestBody, callback) {
     // Updates server database with new is_favorite value
     const reviewKey = DBHelper.generateRandomKey('rev');

     offlineController.storeInReviewsOutboxDB(reviewKey, requestBody)
      .then(() => {
        // Add prelimenary creation time for display
        // and outbox key to retrieve it later and update with server response
        const now = new Date();
        requestBody['outboxKey'] = reviewKey;
        requestBody['updatedAt'] = now.getTime();
        // Add to idb for next page load to show data
        return offlineController.updateReviewsDBRecord(restaurant.id, requestBody);
      })
      .then(() => {
        // Adds background-sync event with servic worker
        callback(null, requestBody);
        return offlineController.createBackgroundSync(reviewKey);
      })
      .catch(error => {
        callback(error, null);
      });

     //
     //
     // fetch(DBHelper.REVIEWS_URL, {
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

   }

  /**
   * Fetch restaurants by id or returns all restaurants.
   * Checks idb before fetching from server.
   */
  static fetchRestaurants(callback, getAllRestaurants = true, id = 0) {
    // Checks if result is in database before going to server
    return offlineController.pullFromRestaurantDB(id).then(restaurant => {
      // Checks if the restaurants have already been fetched or not
      if ( (getAllRestaurants && Object.keys(restaurant).length === 10) ||
        (!getAllRestaurants && Object.keys(restaurant).length !== 0) ) {
        callback(null, restaurant);

      // Throws error otherwise
      } else {
        throw 'No match found for id specified or no restaurants in database';
      }
    // If error is thrown will go to network for restaurant data
    }).catch(error => {

      console.error(error);
      console.log('Going to network for results!');

      // Fetches results from network
      DBHelper.networkFetchRestaurants(callback, id);
    });
  }

  /**
   * Fetch restaurants by its ID from network.
   */
  static networkFetchRestaurants(callback, id) {

    let searchUrl;

    if (id === 0) {
      searchUrl = DBHelper.ALL_RESTAURANTS_URL;
    } else {
      searchUrl = DBHelper.getSpecificRestaurantUrl(id);
    }

    // Fetches restaurant results from server
    fetch(searchUrl)
      .then(response => {
        if (response.status === 200) { // Got a success response from the server!
          return response.json();
        } else { // Oops!. Got an error from server.
          const error = (`Request failed. Returned status of ${response.status}`);
          throw error;
        }
      })
      .then(restaurants => {
        offlineController.storeInRestaurantDB(restaurants);
        callback(null, restaurants);
      })
      .catch(error => {
        callback(error, null);
      });

  }

  /**
   * Fetch reviews by restaurant id.
   * Checks idb before fetching from server.
   */
  static fetchRestaurantReviews(id, callback) {
    // Checks if result is in database before going to server
    return offlineController.pullFromReviewsDB(id).then(reviews => {
      // Checks if the restaurants have already been fetched or not
      if (reviews) {
        callback(null, reviews);

      // Throws error otherwise
      } else {
        throw 'No match found for id specified or no reviews in database';
      }
    // If error is thrown will go to network for reviews data
    }).catch(error => {

      console.error(error);
      console.log('Going to network for results!');

      // Fetches results from network
      DBHelper.networkFetchRestaurantReviews(callback, id);
    });
  }

  /**
   * Fetch reviews by restaurant ID from network.
   */
  static networkFetchRestaurantReviews(callback, id) {

    let searchUrl = DBHelper.getReviewsForRestuarantURL(id);

    // Fetches restaurant results from server
    fetch(searchUrl)
      .then(response => {
        if (response.status === 200) { // Got a success response from the server!
          return response.json();
        } else { // Oops!. Got an error from server.
          const error = (`Request failed. Returned status of ${response.status}`);
          throw error;
        }
      })
      .then(reviews => {
        offlineController.storeInReviewsDB(reviews, id);
        callback(null, reviews);
      })
      .catch(error => {
        callback(error, null);
      });

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback('Restaurant does not exist', null);
        // callback(error, null);
      } else {
        callback(null, restaurants);
      }
    }, false, id);
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}-large.jpg`);
  }

  /**
   * Restaurant image URLs for srcset.
   */
  static imageSrcSetForRestaurant(restaurant) {
    return (
      `/img/${restaurant.id}-small.jpg 330w,
      /img/${restaurant.id}-small-medium.jpg 660w,
      /img/${restaurant.id}-medium.jpg 740w,
      /img/${restaurant.id}-large.jpg 1480w`
    );
  }

  /**
   * Alt text for restaurant image.
   */
 static altTextForRestaurant(restaurant) {
   return RESTARAUNT_ALT_TEXT[restaurant.id - 1];
 }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /**
   * Generates random number given prefix
   */
  static generateRandomKey(prefix) {
    return prefix + '_' + Math.random().toString(36).substr(2, 9);
  }

}
