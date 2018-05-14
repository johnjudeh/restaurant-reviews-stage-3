class ServiceWorker {
  constructor() {
    this.registerServiceWorker();
  }

  registerServiceWorker() {
    if (!navigator.serviceWorker) return;
    const serviceWorker = this;

    navigator.serviceWorker.register('/sw.js').then(reg => {
      if (!navigator.serviceWorker.controller) {
        return;
      }

      if (reg.waiting) {
        console.log('Service Worker is Waiting');
        this.updateReady(reg.waiting);
        return;
      }

      if (reg.installing) {
        console.log('Service Worker is Installing!');
        this.trackInstalling(reg.installing);
        return;
      }

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

const serviceWorker = new ServiceWorker();
