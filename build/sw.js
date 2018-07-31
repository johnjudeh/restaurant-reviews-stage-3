!function i(u,s,c){function a(e,t){if(!s[e]){if(!u[e]){var n="function"==typeof require&&require;if(!t&&n)return n(e,!0);if(f)return f(e,!0);var r=new Error("Cannot find module '"+e+"'");throw r.code="MODULE_NOT_FOUND",r}var o=s[e]={exports:{}};u[e][0].call(o.exports,function(t){return a(u[e][1][t]||t)},o,o.exports,i,u,s,c)}return s[e].exports}for(var f="function"==typeof require&&require,t=0;t<c.length;t++)a(c[t]);return a}({1:[function(t,d,e){"use strict";!function(){function u(n){return new Promise(function(t,e){n.onsuccess=function(){t(n.result)},n.onerror=function(){e(n.error)}})}function i(n,r,o){var i,t=new Promise(function(t,e){u(i=n[r].apply(n,o)).then(t,e)});return t.request=i,t}function t(t,n,e){e.forEach(function(e){Object.defineProperty(t.prototype,e,{get:function(){return this[n][e]},set:function(t){this[n][e]=t}})})}function e(e,n,r,t){t.forEach(function(t){t in r.prototype&&(e.prototype[t]=function(){return i(this[n],t,arguments)})})}function n(e,n,r,t){t.forEach(function(t){t in r.prototype&&(e.prototype[t]=function(){return this[n][t].apply(this[n],arguments)})})}function r(t,r,e,n){n.forEach(function(n){n in e.prototype&&(t.prototype[n]=function(){return t=this[r],(e=i(t,n,arguments)).then(function(t){if(t)return new s(t,e.request)});var t,e})})}function o(t){this._index=t}function s(t,e){this._cursor=t,this._request=e}function c(t){this._store=t}function a(n){this._tx=n,this.complete=new Promise(function(t,e){n.oncomplete=function(){t()},n.onerror=function(){e(n.error)},n.onabort=function(){e(n.error)}})}function f(t,e,n){this._db=t,this.oldVersion=e,this.transaction=new a(n)}function l(t){this._db=t}t(o,"_index",["name","keyPath","multiEntry","unique"]),e(o,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),r(o,"_index",IDBIndex,["openCursor","openKeyCursor"]),t(s,"_cursor",["direction","key","primaryKey","value"]),e(s,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(s.prototype[n]=function(){var e=this,t=arguments;return Promise.resolve().then(function(){return e._cursor[n].apply(e._cursor,t),u(e._request).then(function(t){if(t)return new s(t,e._request)})})})}),c.prototype.createIndex=function(){return new o(this._store.createIndex.apply(this._store,arguments))},c.prototype.index=function(){return new o(this._store.index.apply(this._store,arguments))},t(c,"_store",["name","keyPath","indexNames","autoIncrement"]),e(c,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),r(c,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),n(c,"_store",IDBObjectStore,["deleteIndex"]),a.prototype.objectStore=function(){return new c(this._tx.objectStore.apply(this._tx,arguments))},t(a,"_tx",["objectStoreNames","mode"]),n(a,"_tx",IDBTransaction,["abort"]),f.prototype.createObjectStore=function(){return new c(this._db.createObjectStore.apply(this._db,arguments))},t(f,"_db",["name","version","objectStoreNames"]),n(f,"_db",IDBDatabase,["deleteObjectStore","close"]),l.prototype.transaction=function(){return new a(this._db.transaction.apply(this._db,arguments))},t(l,"_db",["name","version","objectStoreNames"]),n(l,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(i){[c,o].forEach(function(t){i in t.prototype&&(t.prototype[i.replace("open","iterate")]=function(){var t,e=(t=arguments,Array.prototype.slice.call(t)),n=e[e.length-1],r=this._store||this._index,o=r[i].apply(r,e.slice(0,-1));o.onsuccess=function(){n(o.result)}})})}),[o,c].forEach(function(t){t.prototype.getAll||(t.prototype.getAll=function(t,n){var r=this,o=[];return new Promise(function(e){r.iterateCursor(t,function(t){t?(o.push(t.value),void 0===n||o.length!=n?t.continue():e(o)):e(o)})})})});var p={open:function(t,e,n){var r=i(indexedDB,"open",[t,e]),o=r.request;return o.onupgradeneeded=function(t){n&&n(new f(o.result,t.oldVersion,o.transaction))},r.then(function(t){return new l(t)})},delete:function(t){return i(indexedDB,"deleteDatabase",[t])}};void 0!==d?(d.exports=p,d.exports.default=d.exports):self.idb=p}()},{}],2:[function(t,e,n){"use strict";var r,o=t("idb"),s=(r=o)&&r.__esModule?r:{default:r};var i="mws-restaurant-v12",u=[i];function c(t,e,n){return t.then(function(t){if(t)return console.log("Opened "+e+" store"),t.transaction(e).objectStore(e).get(n)})}self.addEventListener("install",function(t){t.waitUntil(caches.open(i).then(function(t){return t.addAll(["/","/index.html","/restaurant.html","/js/main-bundle.js","/js/restaurant-bundle.js","/css/styles.css"])}))}),self.addEventListener("activate",function(t){t.waitUntil(caches.keys().then(function(t){return t.filter(function(t){return!u.includes(t)}).map(function(t){return console.log("Deleting:",t),caches.delete(t)})}))}),self.addEventListener("fetch",function(n){var t=n.request;new URL(t.url).origin===location.origin&&"POST"!==t.method&&n.respondWith(caches.open(i).then(function(e){return e.match(n.request).then(function(t){return t||fetch(n.request).then(function(t){return e.put(n.request,t.clone()),t})})}))}),self.addEventListener("message",function(t){"skipWaiting"===t.data.action&&self.skipWaiting()}),self.addEventListener("sync",function(t){var i,u;t.tag==t.tag&&t.waitUntil((i=t.tag,c(u=s.default.open("restaurants-app",2),"reviews-outbox",i).then(function(t){return console.log(t),fetch("http://localhost:1337/reviews",{method:"POST",body:JSON.stringify(t)})}).then(function(t){if(201===t.status)return t.json();var e="Request failed. Returned status of "+t.status;throw e}).then(function(n){var t=Number(n.restaurant_id);return c(u,"reviews",t).then(function(t){console.log("Before update:",t),t=t.map(function(t){return t.hasOwnProperty("outboxKey")&&t.outboxKey===i?n:t}),console.log("After update:",t);var e=Number(n.restaurant_id);return function(t,r,o){var i=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null;return t.then(function(t){if(t){console.log("Opened "+r+" store");var e=t.transaction(r,"readwrite"),n=e.objectStore(r);return i?n.put(o,i):n.put(o),e.complete}})}(u,"reviews",t,e)})}).then(function(){return r="reviews-outbox",o=i,u.then(function(t){if(t){console.log("Opened "+r+" store");var e=t.transaction(r,"readwrite"),n=e.objectStore(r);return n.delete(o)}});var r,o}).catch(function(t){console.error(t)})))})},{idb:1}]},{},[2]);