const CACHE_VERSION = "v2"; // đổi số version mỗi lần update
const CACHE_NAME = `weather-cache-${CACHE_VERSION}`;
const OFFLINE_URL = "offline.html";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "icon.png",
  "weather_desktop.html",
  "weather_mobile.html",
  "index.html"
];

// Cài đặt SW -> cache trước mấy file quan trọng
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Kích hoạt -> xóa cache cũ
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑 Xóa cache cũ:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch -> online first, fallback cache/offline
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          return cachedResponse || cache.match(OFFLINE_URL);
        }
      })()
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cacheRes) => {
        return (
          cacheRes ||
          fetch(event.request)
            .then((networkRes) => {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkRes.clone());
                return networkRes;
              });
            })
            .catch(() => {
              if (event.request.destination === "image") {
                return caches.match("icon.png");
              }
            })
        );
      })
    );
  }
});
