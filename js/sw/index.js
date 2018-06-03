/**
 * Handles service worker registration, installing, waiting and updating
 */
class ServiceWorker {
  constructor() {
    this.registerServiceWorker();
  }

  // Registers service worker and checks to see if any new
  // service workers are waiting
  registerServiceWorker() {
    // Exits if browser does not support service worker
    if (!navigator.serviceWorker) return;
    const serviceWorker = this;

    // Registers service worker from sw.js
    navigator.serviceWorker.register('/sw.js').then(reg => {
      if (!navigator.serviceWorker.controller) {
        return;
      }

      // Handles waiting service worker
      if (reg.waiting) {
        console.log('Service Worker is Waiting');
        this.updateReady(reg.waiting);
        return;
      }

      // Handles installing service worker
      if (reg.installing) {
        console.log('Service Worker is Installing!');
        this.trackInstalling(reg.installing);
        return;
      }

      // Listens for updates in service worker
      reg.addEventListener('updatefound', () => {
        console.log('Service Worker is Installing!');
        serviceWorker.trackInstalling(reg.installing);
      })

    }).catch((error) => {
      console.log('Oops, something went wrong!');
    });
  }

  trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed'){
        console.log('Service Worker is Waiting');
        serviceWorker.updateReady(worker);
      }
    })
  }

  updateReady(worker) {
    const toastDiv = document.getElementById('toastDiv');
    const swDismissBtn = document.getElementById('swDismiss');
    const swRefreshBtn = document.getElementById('swRefresh');

    toastDiv.removeAttribute('hidden');
    swRefreshBtn.focus();

    toastDiv.addEventListener('keydown', e => {
      if (e.keyCode == 27) {
        toastDiv.setAttribute('hidden', 'hidden');
      }
    })

    swDismissBtn.addEventListener('click', () => {
      toastDiv.setAttribute('hidden', 'hidden');
    })

    swRefreshBtn.addEventListener('click', () => {
      toastDiv.setAttribute('hidden', 'hidden');
      worker.postMessage({action: 'skipWaiting'});
    })
  }
}

/**
 * Exports ServiceWorker class to be used in bundle
 * TODO: Figure out the difference between this type of export
 * and the ES6 export (export class ServiceWorker{})
 */
module.exports = ServiceWorker;
