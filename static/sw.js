// This is the "Offline copy of pages" service worker

const CACHE = "pwabuilder-offline";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

workbox.precaching.precacheAndRoute([
   // Páginas principales
   '/index.html',
   '/about.html',
   '/contact.html',

   // Hojas de estilo
   '/styles/main.css',

   // Scripts
   '/scripts/main.js',

   // Imágenes
   '/static/img/laesquinagris.png',
   '/static/img/profile.jpeg',
   '/static/favicon.ico',
   '/static/apple-touch-icon.png',
]);

// Estrategia Cache First para imágenes
workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new workbox.expiration.Plugin({
        // Solo guarda las 60 imágenes más recientes
        maxEntries: 60,
        // Limpia la caché después de 30 días
        maxAgeSeconds: 30 * 24 * 60 * 60,
      })
    ],
  })
);

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);
