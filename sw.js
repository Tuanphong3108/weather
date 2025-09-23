const CACHE_NAME = 'weather-app-cache-v1';
// Danh sách các tệp cần cache để chạy offline
const urlsToCache = [
  './',
  './weather_app.html',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', (event) => {
  // Caching các tệp khi service worker được cài đặt
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Lắng nghe các request và trả về từ cache nếu có
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Trả về từ cache nếu tìm thấy
        if (response) {
          return response;
        }
        // Nếu không có trong cache, fetch từ mạng
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Xóa các cache cũ
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
