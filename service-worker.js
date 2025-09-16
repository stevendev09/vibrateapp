const CACHE_NAME = "vibrar-app-v11";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// 👉 Instalar y precachear
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 👉 Activar y limpiar caches viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 👉 Estrategia de cache con Network First para index.html
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    // Network First para documentos (index.html y rutas internas)
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // ✅ Clonar antes de cachear y devolver
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => cached || caches.match("/index.html"));
        })
    );
    return;
  }

  // Cache First para otros assets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then(networkResponse => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // ✅ Clonar antes de cachear
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // fallback solo para documentos
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// 👉 Escuchar mensajes desde la app para saltar el waiting
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
