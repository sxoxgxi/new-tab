const CACHE_NAME = "newtab-v2";

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
});

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
