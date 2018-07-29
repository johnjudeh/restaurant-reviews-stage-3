/**
 * Import DBHelper which contains idb and sw methods
 * as well as all functionality for fetch data
 */
import DBHelper from './dbhelper';

/**
 * Define variables used by the map
 */
let restaurant;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      google.maps.event.addListener(self.map, 'tilesloaded', removeIframeFocusability);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL(callback) {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantReviewsFromURL(callback) {
  if (self.reviews) { // restaurant already fetched!
    callback(null, self.reviews)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantReviews(id, (error, reviews) => {
      self.reviews = reviews;
      if (!reviews) {
        console.error(error);
        return;
      }
      callback(null, reviews)
    });
  }
}

/**
 * Ensures that only elements that should be focussable are
 */
function removeIframeFocusability() {
  // Ensures that iframe is not focussable outside of javascript and has a title
  const iframe = document.querySelector('iframe');
  iframe.title = 'Restaurants map';
  iframe.setAttribute('tabindex', '-1');

}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant = self.restaurant) {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const favouriteIcon = document.querySelector('.restaurant__fav-restaurant');
  favouriteIcon.classList.toggle('starred', JSON.parse(restaurant.is_favorite));
  favouriteIcon.addEventListener('click', () => {
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
        favouriteIcon.classList.toggle('starred', isFavourite);
      }
    });
  });

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcSetForRestaurant(restaurant);
  image.sizes = imageSizesForRestaurant();
  image.alt = DBHelper.altTextForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fetchRestaurantReviewsFromURL((error, reviews) => {
    if (!reviews) {
      console.error(error);
    } else {
      fillReviewsHTML();
    }
  })
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHTML(operatingHours = self.restaurant.operating_hours) {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.className = 'hours-table__row';

    const day = document.createElement('td');
    day.innerHTML = key;
    day.className = 'hours-table__row__data';
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.className = 'hours-table__row__data';
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = self.reviews) {
  const container = document.getElementById('reviews-container');
  const formReviewsSeperator = document.querySelector('.form-reviews-seperator');
  const newReviewSubmit = document.querySelector('.reviews-form__submit');
  const form = document.querySelector('.reviews-form');

  // Adds review to databases and updates page with new review
  form.addEventListener('submit', sendNewReviewToDB);

  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.className = 'reviews-title';
  container.prepend(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    formReviewsSeperator.after(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  ul.className = 'reviews-list';
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });

  formReviewsSeperator.after(ul);
}

/**
 * Sends review to databse after submit button is clicked
 */
function sendNewReviewToDB(event) {
  // Prevents form submission from sending a Request
  event.preventDefault();

  const form = this;
  const formData = new FormData(form);
  let requestBody = {
    restaurant_id: getParameterByName('id')
  };

  // Loop through form data and store in object
  formData.forEach((value, key) => {
    requestBody[key] = value;
  });

  // Adds new review to IDB database and server database
  DBHelper.addNewReview(self.restaurant, requestBody, (error, review) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      // Add review to reviews list
      const ul = document.getElementById('reviews-list');
      ul.appendChild(createReviewHTML(review));
    }
  });

}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) {
  const li = document.createElement('li');
  const name = document.createElement('p');
  li.className = 'reviews-list__review';
  name.innerHTML = review.name;
  name.className = 'reviews-list__review__name';
  li.appendChild(name);

  const date = document.createElement('p');
  const dateString = new Date(review.updatedAt);
  date.innerHTML = dateString.toLocaleString();
  date.className = 'reviews-list__review__date';
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'reviews-list__review__rating';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'reviews-list__review__comment';
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb(restaurant=self.restaurant) {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.className = 'breadcrumb__item';
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url) {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Returns restaurant image sizes attribute content.
 */
function imageSizesForRestaurant() {
  return (
    `(max-width: 807px) calc(100% - 70px),
    (min-width: 808px) 740px`
  );
};
