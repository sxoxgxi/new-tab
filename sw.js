const CACHE_NAME = "newtab-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/script.js",
  "/styles/output.css",
  "/themes/catppuccin.css",
  "/themes/rosepine.css",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
