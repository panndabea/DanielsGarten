let deferredInstallPrompt = null;

const IOS_INSTALL_STATUS = 'Auf dem iPhone: Teilen öffnen und "Zum Home-Bildschirm" wählen.';

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
    setInstallButtonMode(elements.installButton, 'ios-help');
    elements.installButton.hidden = false;
    bindInstallHelpDismissal(elements);
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    closeInstallHelp(elements);
    setInstallButtonMode(elements.installButton, 'prompt');
    elements.installButton.hidden = false;
  });

  elements.installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
      if (elements.installButton.dataset.installMode === 'ios-help') {
        const isOpen = toggleInstallHelp(elements);
        if (isOpen) {
          setStatus(IOS_INSTALL_STATUS);
        }
      }
      return;
    }

    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    closeInstallHelp(elements);
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
    closeInstallHelp(elements);
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

function bindInstallHelpDismissal(elements) {
  if (!elements.installHelp) return;

  document.addEventListener('click', event => {
    if (elements.installHelp?.hidden) return;
    if (elements.installButton.contains(event.target) || elements.installHelp.contains(event.target)) return;

    closeInstallHelp(elements);
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeInstallHelp(elements);
    }
  });
}

function toggleInstallHelp(elements) {
  return setInstallHelpExpanded(elements, elements.installHelp?.hidden !== false);
}

function closeInstallHelp(elements) {
  setInstallHelpExpanded(elements, false);
}

function setInstallHelpExpanded(elements, isExpanded) {
  if (!elements.installHelp) {
    if (elements.installButton?.dataset.installMode === 'ios-help') {
      elements.installButton.setAttribute('aria-expanded', 'false');
    }
    return false;
  }

  elements.installHelp.hidden = !isExpanded;
  elements.installButton?.classList.toggle('is-help-open', isExpanded);
  if (elements.installButton?.dataset.installMode === 'ios-help') {
    elements.installButton.setAttribute('aria-expanded', String(isExpanded));
  }
  return isExpanded;
}

function setInstallButtonMode(button, mode) {
  const copy = installButtonCopy(mode);
  const kicker = button.querySelector('.install-action-kicker');
  const label = button.querySelector('.install-action-label');

  button.dataset.installMode = mode;
  button.setAttribute('aria-label', copy.ariaLabel);

  if (mode === 'ios-help') {
    button.setAttribute('aria-controls', 'installHelp');
    button.setAttribute('aria-expanded', 'false');
  } else {
    button.removeAttribute('aria-controls');
    button.removeAttribute('aria-expanded');
  }

  if (kicker) kicker.textContent = copy.kicker;
  if (label) label.textContent = copy.label;
}

export function installButtonCopy(mode) {
  if (mode === 'ios-help') {
    return {
      kicker: 'iPhone',
      label: 'Zum Home',
      ariaLabel: 'Gartenzeit zum Home-Bildschirm hinzufügen'
    };
  }

  return {
    kicker: 'Als PWA',
    label: 'Installieren',
    ariaLabel: 'Gartenzeit als PWA installieren'
  };
}
