// sw.js
const CACHE_NAME = "weather-cache-v1";
const ASSETS = [
  "/", // trang gốc
  "/index.html",
  "/offline.html",
  "/weather_desktop.html",
  "/weather_mobile.html",
  "/icon.png",
];

// Cài đặt SW và cache asset
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate và dọn cache cũ
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch: dùng cache trước, nếu fail thì fallback offline.html
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Lưu bản copy vào cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Nếu offline thì fallback
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          return caches.match("/weather/offline.html");
        });
      })
  );
});
