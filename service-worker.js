const CACHE_NAME = "vibrar-app-v3";
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

// 👉 Estrategia de cache
self.addEventListener("fetch", event => {
  // Evitar cachear llamadas a extensiones del navegador o Chrome
  if (event.request.url.startsWith("chrome-extension")) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Si está en cache, devolverlo
        return cachedResponse;
      }

      // Si no, buscar en red y cachear para la próxima vez
      return fetch(event.request)
        .then(networkResponse => {
          // Cachear solo si la respuesta es válida
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // ⚠️ Fallback offline (ej: si no hay conexión)
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
