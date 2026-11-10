/*
 * Governmint's service worker: it keeps a copy of the site on the device, so Governmint opens
 * and works without signal after the first visit. The build (vite.config.ts) fills in VERSION,
 * from the files' contents, and APP, the files the app needs. Flags are kept as they're shown.
 */
const VERSION = '__VERSION__';
const APP = __APP__;
const CACHE = `governmint-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP))
      .then(() => self.skipWaiting()),
  );
});

// A new version clears out the old copies.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('governmint-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // The page: fresh from the network when there's signal, the kept copy when there isn't.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/', { ignoreSearch: true })));
    return;
  }

  // Everything else: the kept copy first. Files not kept yet (flags) are kept once fetched.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(
      (kept) =>
        kept ||
        fetch(request).then((response) => {
          if (response.ok && url.pathname.startsWith('/flags/')) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
