# PWA Implementation Plan fuer Gartenzeit

Ziel: Aus der bestehenden statischen Gartenzeit Web-App eine hochwertige, installierbare Progressive Web App machen. Die App soll auf iPhone Safari, Android Chrome und Desktop-Browsern gut funktionieren, nach einem ersten Online-Besuch offline starten koennen und sich wie eine echte App anfuehlen.

Dieser Plan ist so geschrieben, dass ein Junior Developer ihn Schritt fuer Schritt umsetzen kann. Die Review-Findings sind bereits eingearbeitet und gelten als verbindliche Leitplanken.

## Verbindliche Review-Entscheidungen

Diese Punkte duerfen bei der Umsetzung nicht aufgeweicht werden:

- Alle eigenen App-Pfade werden relativ angegeben, also `./`, `styles.css`, `sw.js` oder `assets/...`. Keine fuehrenden Slash-Pfade wie `/sw.js`, `/index.html` oder `/assets/...`, damit die App auch in einem Unterordner deploybar bleibt.
- Der Service Worker cached nur die App Shell und eigene statische Dateien. Open-Meteo Forecast- und Geocoding-Responses werden nicht in Cache Storage gespeichert, weil deren URLs Standortdaten enthalten koennen. Das schuetzt das Privacy-First-Prinzip aus dem PRD.
- Offline-Wetter funktioniert ueber die bestehende saisonale Fallback-Logik in `script.js`, nicht ueber dauerhaft gecachte Wetterdaten.
- Navigationsanfragen werden network-first behandelt und fallen nur offline auf das gecachte `index.html` zurueck. Dadurch bleiben Updates sichtbar, sobald Netzwerk da ist.
- Statische same-origin Assets werden cache-first behandelt. Bei Aenderungen an App-Shell-Dateien muss die Cache-Version in `sw.js` erhoeht werden.
- Nur Dateien, die wirklich von der App genutzt werden, kommen in den Precache. `assets/gartenzeit-comic-hero.png` wird nicht vorab gecached, solange es nicht in `index.html`, CSS oder JS verwendet wird.
- Der Install-Button fuer Android/Desktop ist Teil der Umsetzung. Der iOS-Hinweis ist optional und wird nur eingebaut, wenn er ruhig ins bestehende UI passt.
- `cache.addAll(...)` ist all-or-nothing. Eine einzige fehlende Datei verhindert die Service-Worker-Installation. Deshalb muessen Icons und Manifest vor der Service-Worker-Registrierung existieren.
- Service Worker und Installation funktionieren auf echten Geraeten nur in sicheren Kontexten: HTTPS oder `localhost` fuer lokale Entwicklung.

## Ausgangslage

Aktuelle Projektstruktur:

```text
index.html
styles.css
script.js
assets/
  gartenzeit-hero.png
  gartenzeit-comic-hero.png
todo/
  pwa-implementation-plan.md
```

Die App ist eine statische Web-App ohne Build-Pipeline und ohne Backend. Wetterdaten werden clientseitig per `fetch()` von Open-Meteo geladen. Die App nutzt aktuell:

- `https://api.open-meteo.com/v1/forecast` fuer Wetterdaten.
- `https://geocoding-api.open-meteo.com/v1/search` fuer Stadtsuche.
- `navigator.geolocation` optional fuer den aktuellen Standort.
- `statusLine` und `setStatus(...)` fuer ruhige Statusmeldungen.
- eine bestehende saisonale Fallback-Logik in `fallbackWeather()`.

## Zielzustand

Nach der Umsetzung soll Gartenzeit:

- auf Android, iOS und Desktop installierbar sein.
- ein hochwertiges App Icon haben.
- ein vollstaendiges Web App Manifest haben.
- per Service Worker nach einem ersten Online-Besuch offline starten.
- eigene statische App-Dateien aus dem Cache laden koennen.
- Wetter- und Geocoding-Daten online frisch aus dem Netzwerk laden.
- bei fehlendem Netzwerk ohne harten Fehler auf den saisonalen Fallback wechseln.
- eine klare, ruhige Offline-Meldung anzeigen.
- keine Open-Meteo-Responses mit Standortdaten dauerhaft in Cache Storage speichern.
- alte App-Shell-Cache-Versionen sauber entfernen.
- lokal ueber einen HTTP-Server pruefbar sein.

## Dateien

### Neu anzulegen

```text
manifest.webmanifest
sw.js
assets/icons/icon-192.png
assets/icons/icon-512.png
assets/icons/icon-maskable-512.png
assets/icons/apple-touch-icon.png
assets/icons/favicon-32.png
assets/icons/favicon-16.png
```

Optional, aber sinnvoll fuer spaetere Icon-Aenderungen:

```text
assets/icons/icon-source.png
```

### Anzupassen

```text
index.html
script.js
styles.css
```

## Phase 0: Preflight

### Ziel

Vor der Umsetzung sicherstellen, dass keine falschen Annahmen in die PWA-Arbeit rutschen.

### Pruefen

- `index.html` wird aus dem Projektroot ausgeliefert.
- `script.js` liegt am Seitenende und kann Service-Worker-Registrierung am Ende oder in `init()` aufnehmen.
- `statusLine` und `setStatus(...)` existieren und werden fuer Offline-/Online-Meldungen genutzt.
- `assets/gartenzeit-hero.png` wird wirklich verwendet.
- `assets/gartenzeit-comic-hero.png` wird aktuell nicht verwendet und bleibt aus dem Precache raus.

### Akzeptanzkriterien

- Es gibt keine fuehrenden Slash-Pfade in neuem Manifest-, HTML-, JS- oder Service-Worker-Code.
- Vor der Service-Worker-Registrierung existieren alle Dateien, die in `APP_SHELL` stehen.

## Phase 1: App Icon erstellen

### Ziel

Ein Icon erstellen, das bei kleinen Groessen klar lesbar ist, hochwertig wirkt und zu Gartenzeit passt.

### Design-Richtung

Das Icon sollte:

- ruhig und hochwertig wirken.
- einen klaren Gartenbezug haben.
- bei `32x32` noch erkennbar sein.
- keinen langen Text enthalten.
- fuer Android Maskable Icons genug Sicherheitsabstand haben.
- zur bestehenden Farbwelt passen: natuerliches Gruen, heller warmer Hintergrund, dunkler Akzent.

Empfohlene Bildidee:

- stilisierte junge Pflanze oder Blatt.
- dezenter Sonnen-/Zeitbezug, z. B. Kreis, Uhrandeutung oder Lichtbogen.
- keine fotorealistische Detailfuelle.

Nicht verwenden:

- kompletter Schriftzug `Gartenzeit`.
- feine Linien, die bei `16x16` verschwinden.
- reine Fotografie.
- wichtige Inhalte direkt am Rand.

### Benoetigte Icon-Groessen

Erzeuge exakt diese Dateien:

```text
assets/icons/icon-192.png
assets/icons/icon-512.png
assets/icons/icon-maskable-512.png
assets/icons/apple-touch-icon.png
assets/icons/favicon-32.png
assets/icons/favicon-16.png
```

Groessen:

- `icon-192.png`: 192x192 px.
- `icon-512.png`: 512x512 px.
- `icon-maskable-512.png`: 512x512 px, wichtige Inhalte innerhalb der zentralen sicheren Zone halten.
- `apple-touch-icon.png`: 180x180 px, ohne Transparenz, mit sauberem Hintergrund.
- `favicon-32.png`: 32x32 px.
- `favicon-16.png`: 16x16 px.

### Akzeptanzkriterien

- Das Icon ist bei `32x32` noch als Gartenzeit-Icon erkennbar.
- Das Favicon bei `16x16` wirkt nicht wie ein undefinierter Fleck.
- Das Maskable Icon hat keine wichtigen Inhalte im aeusseren Randbereich.
- Alle Dateien liegen unter `assets/icons/`.
- Die Dateinamen stimmen exakt mit diesem Plan ueberein.

## Phase 2: Manifest anlegen

### Ziel

`manifest.webmanifest` anlegen, damit Browser die App als installierbare PWA erkennen.

### Inhalt

Die Datei muss gueltiges JSON sein:

```json
{
  "id": "./",
  "name": "Gartenzeit",
  "short_name": "Gartenzeit",
  "description": "Sag uns, wie viel Zeit du hast. Gartenzeit sagt dir, was sich heute im Garten lohnt.",
  "lang": "de",
  "dir": "ltr",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#f4f5ed",
  "theme_color": "#235f3a",
  "categories": ["lifestyle", "productivity", "utilities"],
  "icons": [
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### Wichtige Details

- `start_url` und `scope` bleiben `./`, nicht `/`.
- `theme_color` entspricht dem aktuellen starken Gruenton aus `styles.css`.
- `background_color` entspricht dem hellen App-Hintergrund.
- JSON darf keine Kommentare enthalten.

### Akzeptanzkriterien

- `manifest.webmanifest` ist syntaktisch gueltiges JSON.
- Chrome DevTools erkennt das Manifest.
- Name, Icon, Theme-Farbe und Start-URL werden korrekt angezeigt.
- Im Network Tab gibt es keine 404-Fehler fuer Manifest oder Icons.

## Phase 3: HTML Head und Install-Button erweitern

### Ziel

`index.html` so erweitern, dass Browser und Betriebssysteme die PWA korrekt erkennen.

### Head-Anpassungen

Die bestehende Viewport-Zeile ersetzen durch:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Im `<head>` ergaenzen:

```html
<meta name="theme-color" content="#235f3a" />
<meta name="color-scheme" content="light" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="Gartenzeit" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />

<link rel="manifest" href="manifest.webmanifest" />
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="assets/icons/favicon-16.png" />
```

### Install-Button

In `.header-actions` vor oder nach der Datumspille ergaenzen:

```html
<button class="install-action" id="installButton" type="button" hidden>
  <span>Installieren</span>
</button>
```

Der Button bleibt initial `hidden`. Sichtbarkeit und Prompt werden spaeter in `script.js` gesteuert.

### Akzeptanzkriterien

- Manifest wird im Browser geladen.
- iOS kann das Apple Touch Icon nutzen.
- Theme-Farbe ist in unterstuetzten Browsern sichtbar.
- Install-Button ist im DOM vorhanden, aber initial verborgen.
- Es gibt keine 404-Fehler fuer Icon-Dateien.

## Phase 4: Service Worker anlegen

### Ziel

`sw.js` erstellen, damit die App nach einem ersten Online-Besuch offline starten kann und eigene statische Dateien gecached werden.

### Cache-Strategien

Verwende diese Strategien:

1. Navigationsanfragen: network-first, Fallback auf gecachtes `index.html`.
2. Eigene statische Dateien: cache-first.
3. Open-Meteo Forecast und Geocoding: network-only, kein Cache Storage.

### App Shell Dateien

Beim Installieren des Service Workers werden nur diese Dateien vorab gecached:

```js
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.webmanifest',
  './assets/gartenzeit-hero.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png',
  './assets/icons/favicon-16.png'
];
```

Nicht aufnehmen:

```text
assets/gartenzeit-comic-hero.png
```

Diese Datei wird aktuell nicht verwendet und soll den ersten Cache nicht unnoetig vergroessern.

### Service-Worker-Skelett

Die konkrete Umsetzung soll diesem Muster folgen:

```js
const CACHE_PREFIX = 'gartenzeit-';
const APP_CACHE = `${CACHE_PREFIX}app-v1`;

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.webmanifest',
  './assets/gartenzeit-hero.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png',
  './assets/icons/favicon-16.png'
];

const API_HOSTS = new Set([
  'api.open-meteo.com',
  'geocoding-api.open-meteo.com'
]);

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith(CACHE_PREFIX) && cacheName !== APP_CACHE)
          .map(cacheName => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (API_HOSTS.has(url.hostname)) {
    event.respondWith(fetch(request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(APP_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      await cache.put(new URL('./index.html', self.registration.scope), response.clone());
    }
    return response;
  } catch (error) {
    return (
      await cache.match(new URL('./index.html', self.registration.scope)) ||
      await cache.match(new URL('./', self.registration.scope)) ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  if (response.ok && response.type === 'basic') {
    const cache = await caches.open(APP_CACHE);
    await cache.put(request, response.clone());
  }

  return response;
}
```

### Wichtige Details

- Bei jeder Aenderung an `index.html`, `styles.css`, `script.js`, Manifest oder Icons die Cache-Version erhoehen, z. B. von `gartenzeit-app-v1` auf `gartenzeit-app-v2`.
- Beim Aktivieren nur eigene Caches mit dem Prefix `gartenzeit-` loeschen.
- Keine Open-Meteo-Responses in `caches.open(...)` speichern.
- Keine `POST`-, Geolocation- oder fremden Cross-Origin-Requests behandeln.
- Wenn `cache.addAll(APP_SHELL)` fehlschlaegt, zuerst fehlende Dateien oder falsche Pfade beheben.

### Akzeptanzkriterien

- Die App startet nach einmaligem Online-Laden auch ohne Netzwerk.
- Statische eigene Dateien werden aus Cache Storage geladen.
- Navigationsreload offline liefert die App statt eines Browser-Fehlers.
- Open-Meteo Forecast- und Geocoding-URLs tauchen nicht in Cache Storage auf.
- Alte `gartenzeit-app-v*` Cache-Versionen werden entfernt.

## Phase 5: Service Worker in `script.js` registrieren

### Ziel

Der Browser soll `sw.js` registrieren, sobald die App geladen ist.

### Umsetzung

Am Ende von `script.js` oder sauber aus `init()` heraus ergaenzen:

```js
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Service Worker ist eine Verbesserung, kein harter App-Fehler.
    });
  });
}
```

Danach `registerServiceWorker();` einmal aufrufen.

### Wichtige Details

- Der Registrierungspfad bleibt relativ: `sw.js`, nicht `/sw.js`.
- Fehler bei der Registrierung werden abgefangen und blockieren die App nicht.
- Bei lokaler Pruefung die Seite nach der ersten Registrierung einmal neu laden, damit klar ist, ob der Service Worker kontrolliert.

### Akzeptanzkriterien

- Chrome DevTools zeigt einen registrierten Service Worker.
- Die App bleibt in Browsern ohne Service Worker nutzbar.
- Es gibt keine ungefangenen Promise-Fehler in der Console.

## Phase 6: Offline-Status integrieren

### Ziel

Nutzer sollen verstehen, ob die App gerade offline arbeitet, ohne dass die Bedienung blockiert wird.

### Umsetzung in `script.js`

Die vorhandene Funktion `setStatus(...)` und `statusLine` verwenden. Kein neues grosses UI-Element bauen.

Empfohlenes Muster:

```js
function setupNetworkStatus() {
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
      setStatus('Du bist wieder online. Wetterdaten werden bei der naechsten Berechnung frisch geladen.');
    }
    wasOffline = false;
  });
}
```

`setupNetworkStatus();` in `init()` aufrufen.

### Wichtige Details

- `navigator.onLine` ist nur ein Signal, kein Beweis, dass Open-Meteo erreichbar ist.
- Die bestehende `generateRecommendations()`-Fehlerbehandlung bleibt massgeblich: Wenn `fetchWeather(...)` scheitert, wird `fallbackWeather()` verwendet.
- Geocoding darf offline sauber scheitern und eine ruhige Meldung zeigen.

### Akzeptanzkriterien

- Beim Wechsel in den Offline-Modus erscheint eine ruhige Meldung.
- Beim Rueckwechsel online erscheint eine ruhige Meldung.
- Offline kann weiterhin eine Aufgabe berechnet werden, dann mit saisonalem Fallback.
- Die Meldung passt visuell zum bestehenden UI.

## Phase 7: Install-UX integrieren

### Ziel

Android und Desktop bekommen einen sauberen Install-Flow. iOS bleibt nutzbar ueber "Zum Home-Bildschirm"; ein iOS-Hinweis ist optional.

### Umsetzung in `script.js`

`elements` erweitern:

```js
installButton: document.getElementById('installButton')
```

Danach Install-Flow ergaenzen:

```js
let deferredInstallPrompt = null;

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function setupInstallPrompt() {
  if (!elements.installButton || isStandaloneDisplay()) return;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    elements.installButton.hidden = false;
  });

  elements.installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;

    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;

    promptEvent.prompt();
    await promptEvent.userChoice.catch(() => null);
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;
  });
}
```

`setupInstallPrompt();` in `init()` aufrufen.

### iOS-Hinweis

iOS Safari unterstuetzt `beforeinstallprompt` nicht. Fuer die erste Version gilt:

- Kein aggressives Pop-up.
- Kein Hinweis, wenn die App bereits im Standalone-Modus laeuft.
- Optionaler Hinweis nur, wenn er in Header oder Statuszeile ruhig wirkt.

Moeglicher Text:

```text
Auf iPhone: Teilen-Menue oeffnen und "Zum Home-Bildschirm" waehlen.
```

Wenn der Hinweis das UI ueberlaedt, wird er in dieser Phase bewusst weggelassen.

### Akzeptanzkriterien

- Install-Button erscheint nur, wenn `beforeinstallprompt` verfuegbar ist.
- Der Install-Prompt erscheint nur nach Nutzerklick.
- Button verschwindet nach Prompt oder Installation.
- Im Standalone-Modus ist kein Install-Button sichtbar.
- iOS wird nicht mit einem nicht funktionierenden Button konfrontiert.

## Phase 8: CSS fuer PWA-Details

### Ziel

PWA-spezifische UI-Elemente sollen zum bestehenden Design passen und auf kleinen Screens nicht kollidieren.

### Anpassungen in `styles.css`

Install-Button in die bestehende Button-Systematik aufnehmen:

- `.install-action` in die bestehenden Button-Basis-Selektoren aufnehmen, soweit sinnvoll.
- sichtbaren Fokuszustand ueber `:focus-visible` beibehalten.
- kleine Screens pruefen, weil `.date-pill` unter `780px` bereits ausgeblendet wird.

Beispielrichtung:

```css
.install-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--leaf-strong);
  font-weight: 850;
}
```

In der Swiss-Design-Variante muss `.install-action` ebenfalls die eckige Form bekommen, entweder ueber den bestehenden Sammel-Selektor oder explizit:

```css
body[data-design="swiss"] .install-action {
  border-radius: 0;
}
```

Fuer Safe Area keine pauschale Layout-Verschlechterung einbauen. Falls noetig:

```css
.app-header {
  margin-top: max(10px, env(safe-area-inset-top));
}
```

### Akzeptanzkriterien

- Install-Button passt in den Header.
- Kein Text ueberlappt auf ca. `390px` Breite.
- Fokuszustand ist sichtbar.
- iPhone Safe Area schneidet den Header nicht ab.
- Swiss-Design-Variante bleibt konsistent.

## Phase 9: Lokale Pruefung

### Ziel

Die PWA lokal testen. Service Worker funktionieren nicht sinnvoll ueber `file://`, deshalb muss ein lokaler Server genutzt werden.

### Lokalen Server starten

Im Projektordner:

```bash
python3 -m http.server 4173
```

Dann oeffnen:

```text
http://localhost:4173
```

### Vor dem Test

Falls bereits ein alter Service Worker existiert:

1. Chrome DevTools oeffnen.
2. `Application > Service Workers`.
3. Alten Service Worker unregisteren.
4. `Application > Storage`.
5. Site data und Cache Storage fuer `localhost:4173` leeren.
6. Seite neu laden.

### Manuelle Tests

Im Browser pruefen:

- App laedt normal.
- Keine blockierenden Console Errors.
- Keine 404-Fehler im Network Tab.
- Manifest wird geladen.
- Icons werden geladen.
- Service Worker ist registriert.
- Service Worker kontrolliert die Seite nach Reload.
- Cache Storage enthaelt `gartenzeit-app-v1`.
- Cache Storage enthaelt nur eigene App-Shell-Dateien.
- Cache Storage enthaelt keine Open-Meteo Forecast- oder Geocoding-URLs.
- App ist auf Android/Desktop installierbar, sobald Browser-Kriterien erfuellt sind.
- Offline-Modus: Seite laedt nach Reload weiterhin.
- Offline-Modus: Aufgabe berechnen nutzt saisonalen Fallback.
- Offline-Modus: Stadtsuche scheitert ruhig ohne JavaScript-Fehler.
- Online nach Offline: App reagiert wieder normal.

### Chrome DevTools Checks

In Chrome:

1. DevTools oeffnen.
2. Tab `Application` oeffnen.
3. `Manifest` pruefen.
4. `Service Workers` pruefen.
5. `Cache Storage` pruefen.
6. Unter `Network` Offline-Modus aktivieren und neu laden.

### Viewport-Checks

Pruefen:

- ca. `390px` Breite fuer iPhone-typische mobile Ansicht.
- ca. `360px` Breite fuer sehr kleine Android-Ansichten.
- ca. `768px` Breite fuer Tablet/kleines Desktop-Fenster.
- ca. `1440px` Breite fuer Desktop.

### Akzeptanzkriterien

- App kann offline neu geladen werden.
- Manifest zeigt Name, Icons und Farben korrekt.
- Service Worker kontrolliert die Seite.
- Install-Button funktioniert auf unterstuetzten Browsern.
- Keine Open-Meteo-URL wird dauerhaft in Cache Storage gespeichert.
- Keine blockierenden Console Errors.

## Phase 10: Abschluss-Checkliste

Vor Abschluss diese Liste abarbeiten:

- [ ] `manifest.webmanifest` existiert und ist gueltiges JSON.
- [ ] Manifest nutzt `start_url: "./"` und `scope: "./"`.
- [ ] `sw.js` existiert.
- [ ] `sw.js` nutzt relative App-Shell-Pfade.
- [ ] `sw.js` cached keine Open-Meteo-Responses.
- [ ] Alle Icon-Dateien existieren.
- [ ] `index.html` verlinkt Manifest und Icons.
- [ ] Viewport nutzt `viewport-fit=cover`.
- [ ] `index.html` enthaelt den initial verborgenen Install-Button.
- [ ] `script.js` registriert den Service Worker mit relativem Pfad.
- [ ] Offline-/Online-Status wird angezeigt.
- [ ] Install-Button-Logik ist integriert.
- [ ] App startet offline nach erstem Online-Besuch.
- [ ] Wetter-Fallback funktioniert offline.
- [ ] Stadtsuche scheitert offline ruhig.
- [ ] Keine 404-Fehler fuer PWA-Dateien.
- [ ] Keine blockierenden JavaScript-Fehler.
- [ ] Cache Storage enthaelt keine Forecast- oder Geocoding-URLs.
- [ ] Mobile Layout wurde bei ca. `390px` Breite geprueft.
- [ ] Mobile Layout wurde bei ca. `360px` Breite geprueft.
- [ ] Desktop Layout wurde bei ca. `1440px` Breite geprueft.

## Empfohlene Reihenfolge fuer den Junior Developer

1. `assets/icons/` anlegen und Icon-Dateien erzeugen.
2. `manifest.webmanifest` anlegen und JSON validieren.
3. Manifest, Icons und Install-Button in `index.html` integrieren.
4. `sw.js` mit App-Shell-Cache und API-network-only-Regel erstellen.
5. Service Worker in `script.js` registrieren.
6. Offline-/Online-Status in `script.js` integrieren.
7. Install-Button-Logik in `script.js` integrieren.
8. `.install-action` und ggf. Safe-Area-Details in `styles.css` stylen.
9. Lokalen Server starten.
10. Browser- und Offline-Tests durchfuehren.
11. Gefundene Fehler beheben.
12. Abschluss-Checkliste abhaken.

## Risiken und Gegenmassnahmen

- Service Worker koennen beim Entwickeln alte Dateien aus dem Cache liefern. Gegenmassnahme: Cache-Version erhoehen oder in DevTools Service Worker unregisteren und Cache Storage leeren.
- `cache.addAll(...)` scheitert komplett bei einer fehlenden Datei. Gegenmassnahme: Alle Precache-Pfade im Network Tab pruefen.
- Absolute Pfade brechen Unterordner-Deployments. Gegenmassnahme: Alle neuen App-Pfade relativ halten.
- Open-Meteo-URLs koennen Standortdaten enthalten. Gegenmassnahme: API-Responses nicht in Cache Storage speichern.
- iOS unterstuetzt `beforeinstallprompt` nicht. Gegenmassnahme: Install-Button nur nach echtem `beforeinstallprompt` anzeigen; optional ruhigen iOS-Hinweis nutzen.
- PWA-Funktionen brauchen sichere Kontexte. Gegenmassnahme: lokal `localhost`, produktiv HTTPS.
- `navigator.onLine` ist ungenau. Gegenmassnahme: Fetch-Fehler weiterhin in `generateRecommendations()` behandeln.

## Definition of Done

Die Aufgabe gilt als fertig, wenn Gartenzeit nach einem ersten Online-Besuch offline erneut geladen werden kann, ein korrektes App Icon nutzt, ein gueltiges Manifest hat, ein aktiver Service Worker eigene App-Dateien cached, keine Open-Meteo-Responses dauerhaft speichert, der Install-Button auf unterstuetzten Browsern funktioniert und Nutzer bei Offline-Betrieb eine verstaendliche Meldung sowie den saisonalen Fallback bekommen.
