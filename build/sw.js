!function i(u,s,c){function a(t,e){if(!s[t]){if(!u[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(f)return f(t,!0);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}var o=s[t]={exports:{}};u[t][0].call(o.exports,function(e){return a(u[t][1][e]||e)},o,o.exports,i,u,s,c)}return s[t].exports}for(var f="function"==typeof require&&require,e=0;e<c.length;e++)a(c[e]);return a}({1:[function(e,d,t){"use strict";!function(){function u(n){return new Promise(function(e,t){n.onsuccess=function(){e(n.result)},n.onerror=function(){t(n.error)}})}function i(n,r,o){var i,e=new Promise(function(e,t){u(i=n[r].apply(n,o)).then(e,t)});return e.request=i,e}function e(e,n,t){t.forEach(function(t){Object.defineProperty(e.prototype,t,{get:function(){return this[n][t]},set:function(e){this[n][t]=e}})})}function t(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return i(this[n],e,arguments)})})}function n(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return this[n][e].apply(this[n],arguments)})})}function r(e,r,t,n){n.forEach(function(n){n in t.prototype&&(e.prototype[n]=function(){return e=this[r],(t=i(e,n,arguments)).then(function(e){if(e)return new s(e,t.request)});var e,t})})}function o(e){this._index=e}function s(e,t){this._cursor=e,this._request=t}function c(e){this._store=e}function a(n){this._tx=n,this.complete=new Promise(function(e,t){n.oncomplete=function(){e()},n.onerror=function(){t(n.error)},n.onabort=function(){t(n.error)}})}function f(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new a(n)}function p(e){this._db=e}e(o,"_index",["name","keyPath","multiEntry","unique"]),t(o,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),r(o,"_index",IDBIndex,["openCursor","openKeyCursor"]),e(s,"_cursor",["direction","key","primaryKey","value"]),t(s,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(s.prototype[n]=function(){var t=this,e=arguments;return Promise.resolve().then(function(){return t._cursor[n].apply(t._cursor,e),u(t._request).then(function(e){if(e)return new s(e,t._request)})})})}),c.prototype.createIndex=function(){return new o(this._store.createIndex.apply(this._store,arguments))},c.prototype.index=function(){return new o(this._store.index.apply(this._store,arguments))},e(c,"_store",["name","keyPath","indexNames","autoIncrement"]),t(c,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),r(c,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),n(c,"_store",IDBObjectStore,["deleteIndex"]),a.prototype.objectStore=function(){return new c(this._tx.objectStore.apply(this._tx,arguments))},e(a,"_tx",["objectStoreNames","mode"]),n(a,"_tx",IDBTransaction,["abort"]),f.prototype.createObjectStore=function(){return new c(this._db.createObjectStore.apply(this._db,arguments))},e(f,"_db",["name","version","objectStoreNames"]),n(f,"_db",IDBDatabase,["deleteObjectStore","close"]),p.prototype.transaction=function(){return new a(this._db.transaction.apply(this._db,arguments))},e(p,"_db",["name","version","objectStoreNames"]),n(p,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(i){[c,o].forEach(function(e){i in e.prototype&&(e.prototype[i.replace("open","iterate")]=function(){var e,t=(e=arguments,Array.prototype.slice.call(e)),n=t[t.length-1],r=this._store||this._index,o=r[i].apply(r,t.slice(0,-1));o.onsuccess=function(){n(o.result)}})})}),[o,c].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,n){var r=this,o=[];return new Promise(function(t){r.iterateCursor(e,function(e){e?(o.push(e.value),void 0===n||o.length!=n?e.continue():t(o)):t(o)})})})});var l={open:function(e,t,n){var r=i(indexedDB,"open",[e,t]),o=r.request;return o.onupgradeneeded=function(e){n&&n(new f(o.result,e.oldVersion,o.transaction))},r.then(function(e){return new p(e)})},delete:function(e){return i(indexedDB,"deleteDatabase",[e])}};void 0!==d?(d.exports=l,d.exports.default=d.exports):self.idb=l}()},{}],2:[function(e,t,n){"use strict";var r,o=e("idb"),i=(r=o)&&r.__esModule?r:{default:r};var u="mws-restaurant-v12",s=[u];self.addEventListener("install",function(e){e.waitUntil(caches.open(u).then(function(e){return e.addAll(["/","/index.html","/restaurant.html","/js/main-bundle.js","/js/restaurant-bundle.js","/css/styles.css"])}))}),self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(e){return e.filter(function(e){return!s.includes(e)}).map(function(e){return console.log("Deleting:",e),caches.delete(e)})}))}),self.addEventListener("fetch",function(n){var e=n.request;new URL(e.url).origin===location.origin&&"POST"!==e.method&&n.respondWith(caches.open(u).then(function(t){return t.match(n.request).then(function(e){return e||fetch(n.request).then(function(e){return t.put(n.request,e.clone()),e})})}))}),self.addEventListener("message",function(e){"skipWaiting"===e.data.action&&self.skipWaiting()}),self.addEventListener("sync",function(e){var r;e.tag==e.tag&&e.waitUntil((r=e.tag,i.default.open("restaurants-app",2).then(function(e){if(e){console.log("opened database");var t=e.transaction("reviews-outbox","readwrite"),n=t.objectStore("reviews-outbox");return n.get(r)}}).then(function(e){console.log(e)})))})},{idb:1}]},{},[2]);