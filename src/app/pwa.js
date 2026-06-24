let deferredInstallPrompt = null;

export function setupNetworkStatus({ setStatus }) {
  let wasOffline = !navigator.onLine;

  if (!navigator.onLine) {
    setStatus('Du bist offline. Gartenzeit nutzt den saisonalen Fallback, wenn Wetterdaten nicht erreichbar sind.');
  }

  window.addEventListener('offline', () => {
    wasOffline = true;
    setStatus('Du bist offline. Gartenzeit nutzt den saisonalen Fallback, wenn Wetterdaten nicht erreichbar sind.');
  });

  window.addEventListener('online', () => {
    if (wasOffline) {
      setStatus('Du bist wieder online. Wetterdaten werden bei der nächsten Berechnung frisch geladen.');
    }
    wasOffline = false;
  });
}

export function setupInstallPrompt({ elements, setStatus }) {
  if (!elements.installButton || isStandaloneDisplay()) return;

  if (isIosLikeBrowser()) {
    elements.installButton.dataset.installMode = 'ios-help';
    elements.installButton.hidden = false;
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    elements.installButton.dataset.installMode = 'prompt';
    elements.installButton.hidden = false;
  });

  elements.installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
      if (elements.installButton.dataset.installMode === 'ios-help') {
        setStatus('Auf iPhone oder iPad: Teilen öffnen und "Zum Home-Bildschirm" wählen.');
      }
      return;
    }

    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;

    promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => null);

    if (choice?.outcome === 'accepted') {
      setStatus('Installation gestartet. Gartenzeit ist gleich als PWA verfügbar.');
    } else {
      setStatus('Installation abgebrochen. Der Browser bietet den Button später erneut an.');
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;
    setStatus('Gartenzeit ist installiert und kann vom Startbildschirm geöffnet werden.');
  });
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Service Worker is an enhancement; the app still works without it.
    });
  });
}

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIosLikeBrowser() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isTouchMac = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;

  return /iphone|ipad|ipod/.test(userAgent) || isTouchMac;
}
