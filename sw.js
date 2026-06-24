const CACHE_PREFIX = 'gartenzeit-';
const APP_CACHE = `${CACHE_PREFIX}app-v21`;

const APP_SHELL = [
  './',
  './index.html',
  './src/styles/main.css?v=21',
  './src/main.js',
  './src/app/dom.js',
  './src/app/pwa.js',
  './src/app/ui.js',
  './src/domain/task-engine.js',
  './src/services/weather.js',
  './src/data/tasks.js',
  './manifest.webmanifest',
  './assets/gartenzeit-hero.png',
  './assets/character/plant-pot-mascot-idle-breathe.webp',
  './assets/character/plant-pot-mascot-idle.png',
  './assets/character/plant-pot-mascot-wave-loop.webp',
  './assets/character/plant-pot-mascot-wave.png',
  './assets/character/plant-pot-mascot-watering-loop.webp',
  './assets/character/plant-pot-mascot-watering.png',
  './assets/character/plant-pot-mascot-bounce-loop.webp',
  './assets/character/plant-pot-mascot-bounce.png',
  './assets/character/plant-pot-mascot-wilted-sway.webp',
  './assets/character/plant-pot-mascot-wilted.png',
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
