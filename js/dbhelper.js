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
   * All Restaurants URL From Server.
   */
  static get ALL_RESTAURANTS_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Specific Restaurant URL From Server.
   */
   static getSpecificRestaurantUrl(id) {
     const port = 1337 // Change this to your server port
     return `http://localhost:${port}/restaurants/${id}`;
   }

  /**
   * Fetch all restaurants.
   */

   /* TODO: Delete the comments below once you have checked that errors
    are properly handled */
  static fetchRestaurants(callback, id = 0) {

    let searchUrl;

    if (id === 0) {
      searchUrl = DBHelper.ALL_RESTAURANTS_URL;
    } else {
      searchUrl = DBHelper.getSpecificRestaurantUrl(id);
    }

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
        offlineController.storeInDatabase(restaurants);
        callback(null, restaurants);
      })
      .catch(error => {
        callback(error, null);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   * TODO: delete the commented out code if it is not needed
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
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

}
