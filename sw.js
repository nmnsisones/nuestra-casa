// Service worker: guarda la pantalla para que abra rápido; los datos siempre se piden a Apps Script.
// Si cambias index.html, sube la versión (casa-v2, casa-v3…) para que los móviles descarguen la nueva.
const CACHE = 'casa-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icono-192.png', 'icono-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la red; si no hay conexión, lo guardado
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(resp => {
      const copia = resp.clone();
      caches.open(CACHE).then(c => c.put(req, copia));
      return resp;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
