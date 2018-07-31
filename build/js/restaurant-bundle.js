!function i(a,u,s){function c(t,e){if(!u[t]){if(!a[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(l)return l(t,!0);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}var o=u[t]={exports:{}};a[t][0].call(o.exports,function(e){return c(a[t][1][e]||e)},o,o.exports,i,a,u,s)}return u[t].exports}for(var l="function"==typeof require&&require,e=0;e<s.length;e++)c(s[e]);return c}({1:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r,o=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}(),i=e("./offlineController");var u=new((r=i)&&r.__esModule?r:{default:r}).default,s=["A busy but ambient atmosphere in Mission Chineese Food","A warm margherita pizza on a wooden surface","A modern restaurant with tables with cookers in the middle","A cozy deli on the corner of a Manhattan street","A cafeteria-like Italian restaurant with an open kitchen","A casual indoor barbeque kitchen with a large American flag hanging on the wall","The outside of the small Superiority Burger restaurant in Manhattan","A blue bold sign hangs above the Dutch restaurant","Mu Ramen's busy but cozy atmosphere with people eating with chopsticks","An exquisitely designed and well lit modern kitchen in Queens"],a=function(){function a(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,a)}return o(a,null,[{key:"getSpecificRestaurantUrl",value:function(e){return"http://localhost:"+a.SERVER_PORT+"/restaurants/"+e}},{key:"getReviewsForRestuarantURL",value:function(e){return"http://localhost:"+a.SERVER_PORT+"/reviews/?restaurant_id="+e}},{key:"updateFavoriteRestaurants",value:function(e,t,n){var r=a.generateRandomKey("fav");e.is_favorite=t,u.storeInOutboxDB("fav-rest-outbox",r,e).then(function(){return u.storeInRestaurantDB(e)}).then(function(){return n(null,e),u.createBackgroundSync(r)}).catch(function(e){n(e,null)})}},{key:"addNewReview",value:function(t,n,r){var o=a.generateRandomKey("rev");u.storeInOutboxDB("reviews-outbox",o,n).then(function(){var e=new Date;return n.outboxKey=o,n.updatedAt=e.getTime(),u.updateReviewsDBRecord(t.id,n)}).then(function(){return r(null,n),u.createBackgroundSync(o)}).catch(function(e){r(e,null)})}},{key:"fetchRestaurants",value:function(t){var n=!(1<arguments.length&&void 0!==arguments[1])||arguments[1],r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:0;return u.pullFromRestaurantDB(r).then(function(e){if(!(n&&10===Object.keys(e).length||!n&&0!==Object.keys(e).length))throw"No match found for id specified or no restaurants in database";t(null,e)}).catch(function(e){console.error(e),console.log("Going to network for results!"),a.networkFetchRestaurants(t,r)})}},{key:"networkFetchRestaurants",value:function(t,e){var n=void 0;n=0===e?a.ALL_RESTAURANTS_URL:a.getSpecificRestaurantUrl(e),fetch(n).then(function(e){if(200===e.status)return e.json();throw"Request failed. Returned status of "+e.status}).then(function(e){u.storeInRestaurantDB(e),t(null,e)}).catch(function(e){t(e,null)})}},{key:"fetchRestaurantReviews",value:function(t,n){return u.pullFromReviewsDB(t).then(function(e){if(!e)throw"No match found for id specified or no reviews in database";n(null,e)}).catch(function(e){console.error(e),console.log("Going to network for results!"),a.networkFetchRestaurantReviews(n,t)})}},{key:"networkFetchRestaurantReviews",value:function(t,n){var e=a.getReviewsForRestuarantURL(n);fetch(e).then(function(e){if(200===e.status)return e.json();throw"Request failed. Returned status of "+e.status}).then(function(e){u.storeInReviewsDB(e,n),t(null,e)}).catch(function(e){t(e,null)})}},{key:"fetchRestaurantById",value:function(e,n){a.fetchRestaurants(function(e,t){e?n("Restaurant does not exist",null):n(null,t)},!1,e)}},{key:"fetchRestaurantByCuisine",value:function(r,o){a.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.cuisine_type==r});o(null,n)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,o){a.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.neighborhood==r});o(null,n)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,o,i){a.fetchRestaurants(function(e,t){if(e)i(e,null);else{var n=t;"all"!=r&&(n=n.filter(function(e){return e.cuisine_type==r})),"all"!=o&&(n=n.filter(function(e){return e.neighborhood==o})),i(null,n)}})}},{key:"fetchNeighborhoods",value:function(o){a.fetchRestaurants(function(e,n){if(e)o(e,null);else{var r=n.map(function(e,t){return n[t].neighborhood}),t=r.filter(function(e,t){return r.indexOf(e)==t});o(null,t)}})}},{key:"fetchCuisines",value:function(o){a.fetchRestaurants(function(e,n){if(e)o(e,null);else{var r=n.map(function(e,t){return n[t].cuisine_type}),t=r.filter(function(e,t){return r.indexOf(e)==t});o(null,t)}})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurant",value:function(e){return"/img/"+e.id+"-large.jpg"}},{key:"imageSrcSetForRestaurant",value:function(e){return"/img/"+e.id+"-small.jpg 330w,\n      /img/"+e.id+"-small-medium.jpg 660w,\n      /img/"+e.id+"-medium.jpg 740w,\n      /img/"+e.id+"-large.jpg 1480w"}},{key:"altTextForRestaurant",value:function(e){return s[e.id-1]}},{key:"mapMarkerForRestaurant",value:function(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:a.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}},{key:"generateRandomKey",value:function(e){return e+"_"+Math.random().toString(36).substr(2,9)}},{key:"SERVER_PORT",get:function(){return 1337}},{key:"ALL_RESTAURANTS_URL",get:function(){return"http://localhost:"+a.SERVER_PORT+"/restaurants"}},{key:"REVIEWS_URL",get:function(){return"http://localhost:"+a.SERVER_PORT+"/reviews"}}]),a}();n.default=a},{"./offlineController":2}],2:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}(),o=a(e("idb")),i=a(e("./sw/index"));function a(e){return e&&e.__esModule?e:{default:e}}var u=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._serviceWorker=new i.default,this.IDB_DATABASE_NAME="restaurants-app",this._dbPromise=this._openDatabase()}return r(e,[{key:"createBackgroundSync",value:function(e){return this._serviceWorker.createBackgroundSync(e)}},{key:"_openDatabase",value:function(){return navigator.serviceWorker?o.default.open(this.IDB_DATABASE_NAME,2,function(e){switch(e.oldVersion){case 0:e.createObjectStore("restaurants",{keyPath:"id"});case 1:e.createObjectStore("reviews"),e.createObjectStore("reviews-outbox"),e.createObjectStore("fav-rest-outbox")}}):Promise.Resolve()}},{key:"storeInRestaurantDB",value:function(r){return this._dbPromise.then(function(e){if(e){var t=e.transaction("restaurants","readwrite"),n=t.objectStore("restaurants");return Array.isArray(r)?r.forEach(function(e){n.put(e)}):n.put(r),t.complete}})}},{key:"pullFromRestaurantDB",value:function(n){return this._dbPromise.then(function(e){if(e){n=Number(n);var t=e.transaction("restaurants").objectStore("restaurants");return 0===n?t.getAll().then(function(e){return e}):t.get(n).then(function(e){return e})}})}},{key:"updateRestaurantDBRecord",value:function(r,o,i){return this._dbPromise.then(function(e){if(e){r=Number(r);var t=e.transaction("restaurants","readwrite"),n=t.objectStore("restaurants");return n.get(r).then(function(e){e[o]=i,n.put(e)}),t.complete}})}},{key:"storeInReviewsDB",value:function(n,r){return this._dbPromise.then(function(e){if(e){var t=e.transaction("reviews","readwrite");return t.objectStore("reviews").put(n,Number(r)),t.complete}})}},{key:"pullFromReviewsDB",value:function(t){return this._dbPromise.then(function(e){if(e)return t=Number(t),e.transaction("reviews").objectStore("reviews").get(t).then(function(e){return e})})}},{key:"updateReviewsDBRecord",value:function(r,o){!(2<arguments.length&&void 0!==arguments[2])||arguments[2];return this._dbPromise.then(function(e){if(e){r=Number(r);var t=e.transaction("reviews","readwrite"),n=t.objectStore("reviews");return n.get(r).then(function(e){e.push(o),n.put(e,r)}),t.complete}})}},{key:"storeInOutboxDB",value:function(n,r,o){return this._dbPromise.then(function(e){if(e){var t=e.transaction(n,"readwrite");return t.objectStore(n).put(o,r),t.complete}})}}]),e}();n.default=u},{"./sw/index":4,idb:5}],3:[function(e,t,n){"use strict";var r,o=e("./dbhelper"),i=(r=o)&&r.__esModule?r:{default:r};function a(){var e=document.querySelector("iframe");e.title="Restaurants map",e.setAttribute("tabindex","-1")}function u(e){e.preventDefault();var n=this,t=new FormData(n),r={restaurant_id:c("id")};t.forEach(function(e,t){r[t]=e}),i.default.addNewReview(self.restaurant,r,function(e,t){e?console.error(e):(n.reset(),document.getElementById("reviews-list").appendChild(s(t)))})}function s(e){var t=document.createElement("li"),n=document.createElement("p");t.className="reviews-list__review",n.innerHTML=e.name,n.className="reviews-list__review__name",t.appendChild(n);var r=document.createElement("p"),o=new Date(e.updatedAt);r.innerHTML=o.toLocaleString(),r.className="reviews-list__review__date",t.appendChild(r);var i=document.createElement("p");i.innerHTML="Rating: "+e.rating,i.className="reviews-list__review__rating",t.appendChild(i);var a=document.createElement("p");return a.innerHTML=e.comments,a.className="reviews-list__review__comment",t.appendChild(a),t}function c(e,t){t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}window.initMap=function(){!function(n){if(self.restaurant)return n(null,self.restaurant);var e=c("id");e?i.default.fetchRestaurantById(e,function(e,t){(self.restaurant=t)?(!function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant;document.getElementById("restaurant-name").innerHTML=e.name;var r=document.querySelector(".restaurant__fav-restaurant");r.classList.toggle("starred",JSON.parse(e.is_favorite)),r.addEventListener("click",function(){var n=void 0;n=!r.classList.contains("starred"),i.default.updateFavoriteRestaurants(e,n,function(e,t){e?console.error(e):r.classList.toggle("starred",n)})}),document.getElementById("restaurant-address").innerHTML=e.address;var t=document.getElementById("restaurant-img");t.src=i.default.imageUrlForRestaurant(e),t.srcset=i.default.imageSrcSetForRestaurant(e),t.sizes="(max-width: 807px) calc(100% - 70px),\n    (min-width: 808px) 740px",t.alt=i.default.altTextForRestaurant(e),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.operating_hours,t=document.getElementById("restaurant-hours");for(var n in e){var r=document.createElement("tr");r.className="hours-table__row";var o=document.createElement("td");o.innerHTML=n,o.className="hours-table__row__data",r.appendChild(o);var i=document.createElement("td");i.innerHTML=e[n],i.className="hours-table__row__data",r.appendChild(i),t.appendChild(r)}}();!function(n){if(self.reviews)return n(null,self.reviews);var e=c("id");e?i.default.fetchRestaurantReviews(e,function(e,t){(self.reviews=t)?n(null,t):console.error(e)}):(error="No restaurant id in URL",n(error,null))}(function(e,t){t?function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.reviews,t=document.getElementById("reviews-container"),n=document.querySelector(".form-reviews-seperator");document.querySelector(".reviews-form__submit");document.querySelector(".reviews-form").addEventListener("submit",u);var r=document.createElement("h3");if(r.innerHTML="Reviews",r.className="reviews-title",t.prepend(r),!e){var o=document.createElement("p");return o.innerHTML="No reviews yet!",n.after(o)}var i=document.getElementById("reviews-list");i.className="reviews-list",e.forEach(function(e){i.appendChild(s(e))}),n.after(i)}():console.error(e)})}(),n(null,t)):console.error(e)}):(error="No restaurant id in URL",n(error,null))}(function(e,t){e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),google.maps.event.addListener(self.map,"tilesloaded",a),function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant,t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,n.className="breadcrumb__item",t.appendChild(n)}(),i.default.mapMarkerForRestaurant(self.restaurant,self.map))})}},{"./dbhelper":1}],4:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}();var o=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._registerServiceWorker()}return r(e,[{key:"_registerServiceWorker",value:function(){var t=this;if(navigator.serviceWorker){var n=this;navigator.serviceWorker.register("/sw.js").then(function(e){if(navigator.serviceWorker.controller)return e.waiting?(console.log("Service Worker is Waiting"),void t._updateReady(e.waiting)):e.installing?(console.log("Service Worker is Installing!"),void t._trackInstalling(e.installing)):void e.addEventListener("updatefound",function(){console.log("Service Worker is Installing!"),n._trackInstalling(e.installing)})}).catch(function(e){console.log("Oops, something went wrong!")})}}},{key:"_trackInstalling",value:function(e){e.addEventListener("statechange",function(){"installed"===e.state&&(console.log("Service Worker is Waiting"),serviceWorker._updateReady(e))})}},{key:"_updateReady",value:function(e){var t=document.getElementById("toastDiv"),n=document.getElementById("swDismiss"),r=document.getElementById("swRefresh");t.removeAttribute("hidden"),r.focus(),t.addEventListener("keydown",function(e){27==e.keyCode&&t.setAttribute("hidden","hidden")}),n.addEventListener("click",function(){t.setAttribute("hidden","hidden")}),r.addEventListener("click",function(){t.setAttribute("hidden","hidden"),e.postMessage({action:"skipWaiting"})})}},{key:"createBackgroundSync",value:function(t){if(navigator.serviceWorker&&window.SyncManager)return navigator.serviceWorker.ready.then(function(e){return e.sync.register(t)})}}]),e}();n.default=o},{}],5:[function(e,h,t){"use strict";!function(){function a(n){return new Promise(function(e,t){n.onsuccess=function(){e(n.result)},n.onerror=function(){t(n.error)}})}function i(n,r,o){var i,e=new Promise(function(e,t){a(i=n[r].apply(n,o)).then(e,t)});return e.request=i,e}function e(e,n,t){t.forEach(function(t){Object.defineProperty(e.prototype,t,{get:function(){return this[n][t]},set:function(e){this[n][t]=e}})})}function t(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return i(this[n],e,arguments)})})}function n(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return this[n][e].apply(this[n],arguments)})})}function r(e,r,t,n){n.forEach(function(n){n in t.prototype&&(e.prototype[n]=function(){return e=this[r],(t=i(e,n,arguments)).then(function(e){if(e)return new u(e,t.request)});var e,t})})}function o(e){this._index=e}function u(e,t){this._cursor=e,this._request=t}function s(e){this._store=e}function c(n){this._tx=n,this.complete=new Promise(function(e,t){n.oncomplete=function(){e()},n.onerror=function(){t(n.error)},n.onabort=function(){t(n.error)}})}function l(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new c(n)}function f(e){this._db=e}e(o,"_index",["name","keyPath","multiEntry","unique"]),t(o,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),r(o,"_index",IDBIndex,["openCursor","openKeyCursor"]),e(u,"_cursor",["direction","key","primaryKey","value"]),t(u,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(u.prototype[n]=function(){var t=this,e=arguments;return Promise.resolve().then(function(){return t._cursor[n].apply(t._cursor,e),a(t._request).then(function(e){if(e)return new u(e,t._request)})})})}),s.prototype.createIndex=function(){return new o(this._store.createIndex.apply(this._store,arguments))},s.prototype.index=function(){return new o(this._store.index.apply(this._store,arguments))},e(s,"_store",["name","keyPath","indexNames","autoIncrement"]),t(s,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),r(s,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),n(s,"_store",IDBObjectStore,["deleteIndex"]),c.prototype.objectStore=function(){return new s(this._tx.objectStore.apply(this._tx,arguments))},e(c,"_tx",["objectStoreNames","mode"]),n(c,"_tx",IDBTransaction,["abort"]),l.prototype.createObjectStore=function(){return new s(this._db.createObjectStore.apply(this._db,arguments))},e(l,"_db",["name","version","objectStoreNames"]),n(l,"_db",IDBDatabase,["deleteObjectStore","close"]),f.prototype.transaction=function(){return new c(this._db.transaction.apply(this._db,arguments))},e(f,"_db",["name","version","objectStoreNames"]),n(f,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(i){[s,o].forEach(function(e){i in e.prototype&&(e.prototype[i.replace("open","iterate")]=function(){var e,t=(e=arguments,Array.prototype.slice.call(e)),n=t[t.length-1],r=this._store||this._index,o=r[i].apply(r,t.slice(0,-1));o.onsuccess=function(){n(o.result)}})})}),[o,s].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,n){var r=this,o=[];return new Promise(function(t){r.iterateCursor(e,function(e){e?(o.push(e.value),void 0===n||o.length!=n?e.continue():t(o)):t(o)})})})});var d={open:function(e,t,n){var r=i(indexedDB,"open",[e,t]),o=r.request;return o.onupgradeneeded=function(e){n&&n(new l(o.result,e.oldVersion,o.transaction))},r.then(function(e){return new f(e)})},delete:function(e){return i(indexedDB,"deleteDatabase",[e])}};void 0!==h?(h.exports=d,h.exports.default=h.exports):self.idb=d}()},{}]},{},[3]);