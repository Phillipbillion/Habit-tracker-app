const CACHE_NAME = "habit-tracker-v1";
const ASSETS = [
  "/habit-tracker-app/",
  "/habit-tracker-app/index.html",
  "/habit-tracker-app/style.css",
  "/habit-tracker-app/app.js",
  "/habit-tracker-app/manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
