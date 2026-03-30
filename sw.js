const CACHE_NAME = "newtab-v3";
const BASE_ASSETS = [
  "/new-tab/",
  "/new-tab/index.html",
  "/new-tab/script.js",
  "/new-tab/styles/output.css",
  "/new-tab/themes/index.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const response = await fetch("/new-tab/themes/index.json");
      const themeFiles = await response.json();
      const themeAssets = themeFiles.map((file) => `/new-tab/themes/${file}`);
      const allAssets = [...BASE_ASSETS, ...themeAssets];
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(allAssets);
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      await clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) return response;

      return fetch(e.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      });
    }),
  );
});
