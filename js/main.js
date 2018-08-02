/**
 * Import DBHelper which contains idb and sw methods
 * as well as all functionality for fetch data
 */
import DBHelper from './dbhelper';

/**
 * Define variables used by the map
 */
const TWO_RESTAURANT_VW = 808;
const THREE_RESTAURANT_VW = 1177;
const viewportWidth = document.documentElement.clientWidth;
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
 * Load all other restaurants when user scrolls.
 */
window.addEventListener('scroll', lazyLoadRestaurants, { once: true });

/**
 * Lazy loads any restaurants that were not loaded initially.
 */
function lazyLoadRestaurants() {
  if (viewportWidth < TWO_RESTAURANT_VW) {
    fillRestaurantsHTML(false, 1);
  } else if (viewportWidth >= TWO_RESTAURANT_VW && viewportWidth < THREE_RESTAURANT_VW) {
    fillRestaurantsHTML(false, 2);
  } else {
    fillRestaurantsHTML(false, 3);
  }
}

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
  }, 20);
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

      // Initially loads number of restaurants based on viewport width
      if (viewportWidth < TWO_RESTAURANT_VW) {
        fillRestaurantsHTML(true, 1, 1);
      } else if (viewportWidth >= TWO_RESTAURANT_VW && viewportWidth < THREE_RESTAURANT_VW) {
        fillRestaurantsHTML(true, 1, 2);
      } else {
        fillRestaurantsHTML(true, 1, 3);
      }
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
 * Create HTML for specified number of restaurants and add them to the webpage.
 */
function fillRestaurantsHTML(addMarkers = true, startRest = 1, endRest = 10, restaurants = self.restaurants) {
  const ul = document.getElementById('restaurants-list');
  let restaurantCount = 0;

  // Adds restaurants to page based on parameters passed
  for (let i = startRest - 1; i < endRest; i++) {
    ul.append(createRestaurantHTML(restaurants[i]));
  }

  // Adds markers if addMarkers is true
  if (addMarkers) addMarkersToMap();

}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
  const li = document.createElement('li');
  li.className = 'restaurants-list__card';

  const favouriteIcon = document.createElement('i');
  const favChecked = JSON.parse(restaurant.is_favorite);
  favouriteIcon.tabIndex = '0';
  favouriteIcon.setAttribute('role', 'button');
  favouriteIcon.setAttribute('aria-label', 'favourite restaurant');
  favouriteIcon.setAttribute('aria-pressed', favChecked);
  favouriteIcon.className = 'far fa-star restaurants-list__card__fav-restaurant';
  favouriteIcon.classList.toggle('starred', favChecked);
  // Adds event listener for clicks
  favouriteIcon.addEventListener('click', function() {
    toggleFavouriteRestaurant(this, restaurant);
  });
  // Adds event listener for pressing enter or space on the keyboard - a11y
  favouriteIcon.addEventListener('keydown', function(event) {
    // Define values for keycodes
    const VK_ENTER = 13;
    const VK_SPACE = 32;

    if (event.keyCode === VK_ENTER || event.keyCode === VK_SPACE) {
      event.preventDefault();
      toggleFavouriteRestaurant(this, restaurant);
    }
  });
  li.append(favouriteIcon);

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
 * Updates is_favorite in databases and toggles starred class
 */
function toggleFavouriteRestaurant(favouriteIcon, restaurant) {
  let isFavourite;

  // Checks if restaurant is already starred
  if (favouriteIcon.classList.contains('starred')) {
    isFavourite = false;

  } else {
    isFavourite = true;
  }

  DBHelper.updateFavoriteRestaurants(restaurant, isFavourite, (error, restaurant) => {
    if (error) {
      console.error(error);
    } else {
      favouriteIcon.setAttribute('aria-pressed', isFavourite);
      favouriteIcon.classList.toggle('starred', isFavourite);
    }
  });
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
