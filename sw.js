/* Descomprimir AFC: guarda la app para usarla sin internet */
const CACHE = "afc-v1.0.1";
const FILES = ["./", "index.html", "manifest.webmanifest", "lib/libarchive.js", "lib/worker-bundle.js", "lib/libarchive.wasm", "lib/fflate.min.js", "fonts/Raleway-Variable.woff2", "img/icono.svg", "img/icono-180.png", "img/icono-512.png", "img/logo-blanco.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
