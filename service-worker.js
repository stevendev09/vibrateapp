

// const CACHE_NAME = "vibrar-app-v11.4";
// const ASSETS_TO_CACHE = [
//   "/",
//   "/index.html",
//   "/manifest.json",
//   "/icons/icon-192.png",
//   "/icons/icon-512.png"
// ];

// // 👉 Instalar y precachear
// self.addEventListener('install', (event) => {
//   console.log('Service Worker instalando...');
  
//   // Saltar inmediatamente a la fase de activación
//   self.skipWaiting();
  
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => {
//         console.log('Almacenando en caché recursos esenciales');
//         return cache.addAll(ASSETS_TO_CACHE);
//       })
//   );
// });

// // 👉 Activar y limpiar caches viejos
// self.addEventListener('activate', (event) => {
//   console.log('Service Worker activando...');
  
//   // Tomar control inmediato de todos los clients
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheName !== CACHE_NAME) {
//             console.log('Eliminando cache antiguo:', cacheName);
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     }).then(() => {
//       console.log('Reclamando clients inmediatamente');
//       return self.clients.claim();
//     }).then(() => {
//       // Notificar a todos los clients sobre la nueva versión
//       self.clients.matchAll().then((clients) => {
//         clients.forEach((client) => {
//           client.postMessage({
//             type: 'VERSION_UPDATE',
//             version: CACHE_NAME.replace('vibrar-app-', '')
//           });
//         });
//       });
//     })
//   );
// });

// // 👉 Estrategia de cache con Network First
// self.addEventListener('fetch', (event) => {
//   // Solo manejar solicitudes HTTP/HTTPS
//   if (!event.request.url.startsWith('http')) return;
  
//   if (event.request.mode === 'navigate') {
//     event.respondWith(
//       fetch(event.request)
//         .then((response) => {
//           const responseClone = response.clone();
//           caches.open(CACHE_NAME)
//             .then((cache) => cache.put(event.request, responseClone));
//           return response;
//         })
//         .catch(() => caches.match(event.request)
//           .then((cachedResponse) => cachedResponse || caches.match('/index.html')))
//     );
//     return;
//   }

//   event.respondWith(
//     caches.match(event.request)
//       .then((cachedResponse) => {
//         // Siempre intentar obtener la versión más reciente de la red primero
//         return fetch(event.request)
//           .then((response) => {
//             // Almacenar en caché para próximas solicitudes
//             const responseToCache = response.clone();
//             caches.open(CACHE_NAME)
//               .then((cache) => cache.put(event.request, responseToCache));
            
//             return response;
//           })
//           .catch(() => {
//             // Fallback al cache si la red falla
//             if (cachedResponse) return cachedResponse;
            
//             // Fallback adicional para documentos
//             if (event.request.destination === 'document') {
//               return caches.match('/index.html');
//             }
//           });
//       })
//   );
// });

// // 👉 Escuchar mensajes desde la app
// self.addEventListener('message', (event) => {
//   if (event.data && event.data.type === 'SKIP_WAITING') {
//     console.log('Saltando fase de espera por mensaje de la app');
//     self.skipWaiting();
//   }
// });


const CACHE_NAME = "vibrar-app-v11.5";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// 👉 Instalar y precachear
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  
  // Saltar inmediatamente a la fase de activación
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Almacenando en caché recursos esenciales');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 👉 Activar y limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log('Service Worker activando...');
  
  // Tomar control inmediato de todos los clients
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Reclamando clients inmediatamente');
      return self.clients.claim();
    }).then(() => {
      // Notificar a todos los clients sobre la nueva versión
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'VERSION_UPDATE',
            version: CACHE_NAME.replace('vibrar-app-', '')
          });
        });
      });
    })
  );
});

// 👉 Estrategia de cache con Network First
self.addEventListener('fetch', (event) => {
  // Solo manejar solicitudes HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;
  
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request)
          .then((cachedResponse) => cachedResponse || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Siempre intentar obtener la versión más reciente de la red primero
        return fetch(event.request)
          .then((response) => {
            // Almacenar en caché para próximas solicitudes
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache));
            
            return response;
          })
          .catch(() => {
            // Fallback al cache si la red falla
            if (cachedResponse) return cachedResponse;
            
            // Fallback adicional para documentos
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// 👉 Escuchar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Saltando fase de espera por mensaje de la app');
    self.skipWaiting();
  }
});