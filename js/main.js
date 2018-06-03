/**
 * Import DBHelper which contains idb and sw methods
 * as well as all functionality for fetch data
 */
import DBHelper from './dbhelper';

/**
 * Define variables used by the map
 */
let restaurants,
    neighborhoods,
    cuisines,
    markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  setEventsForFilters();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods() {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
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
function fillNeighborhoodsHTML(neighborhoods = self.neighborhoods) {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
function fetchCuisines() {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
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
function fillCuisinesHTML(cuisines = self.cuisines) {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Adds event listeners to neighborhood and
 * cuisine filters.
 */
function setEventsForFilters() {
  const neighborhoodFilter = document.getElementById('neighborhoods-select');
  const cuisineFilter = document.getElementById('cuisines-select');

  neighborhoodFilter.addEventListener('change', updateRestaurants);
  cuisineFilter.addEventListener('change', updateRestaurants);
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
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
  const iframe = document.querySelector('iframe');
  const mapDiv = document.querySelectorAll('div[tabindex="0"]')[1];

  // Ensures that iframe is not focussable outside of javascript and has a title
  iframe.title = 'Restaurants map';
  iframe.setAttribute('tabindex', '-1');

  // Removes tabindex from mapDiv created by Google Maps
  setTimeout(() => {
    mapDiv.setAttribute('tabindex', '-1');
  }, 1000);
}

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  markers.forEach(m => m.setMap(null));
  markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML(restaurants = self.restaurants) {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
  const li = document.createElement('li');
  li.className = 'restaurants-list__card';

  const image = document.createElement('img');
  image.className = 'restaurants-list__card__img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcSetForRestaurant(restaurant);
  image.sizes = imageSizesForRestaurant();
  image.alt = DBHelper.altTextForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement('h3');
  name.className = 'restaurants-list__card__title';
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.className = 'restaurants-list__card__address';
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.className = 'restaurants-list__card__address';
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.className = 'restaurants-list__card__link';
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap(restaurants = self.restaurants) {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    markers.push(marker);
  });
}

/**
 * Returns restaurant image sizes.
 */
function imageSizesForRestaurant() {
  return (
    `(max-width: 419px) calc(100% - 70px),
    (min-width: 420px) 250px`
  );
}
