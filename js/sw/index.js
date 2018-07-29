/**
 * Handles service worker registration, installing, waiting and updating
 * Default export from module
 */
export default class ServiceWorker {
  constructor() {
    this._registerServiceWorker();
  }

  // Registers service worker and checks to see if any new
  // service workers are waiting
  _registerServiceWorker() {
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
        this._updateReady(reg.waiting);
        return;
      }

      // Handles installing service worker
      if (reg.installing) {
        console.log('Service Worker is Installing!');
        this._trackInstalling(reg.installing);
        return;
      }

      // Listens for updates in service worker
      reg.addEventListener('updatefound', () => {
        console.log('Service Worker is Installing!');
        serviceWorker._trackInstalling(reg.installing);
      })

    }).catch((error) => {
      console.log('Oops, something went wrong!');
    });
  }

  _trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed'){
        console.log('Service Worker is Waiting');
        serviceWorker._updateReady(worker);
      }
    })
  }

  _updateReady(worker) {
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

  createBackgroundSync(outboxKey) {
    // Exits if browser does not support service worker or background sync
    if (!navigator.serviceWorker || !window.SyncManager) return;

    return navigator.serviceWorker.ready.then(reg => {
      return reg.sync.register(outboxKey);
    });

  }

}
