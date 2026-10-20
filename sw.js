/* Descomprimir AFC: guarda la app para usarla sin internet.
   La página principal se pide primero a internet (para recibir actualizaciones)
   y solo si no hay conexión se usa la copia guardada. */
const CACHE = "afc-v1.0.2";
const FILES = ["./", "index.html", "manifest.webmanifest", "lib/libarchive.js", "lib/worker-bundle.js", "lib/libarchive.wasm", "lib/fflate.min.js", "fonts/Raleway-Variable.woff2", "img/icono.svg", "img/icono-180.png", "img/icono-512.png", "img/logo-blanco.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === "navigate" || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (isPage) {
    e.respondWith(fetch(req, { cache: "no-cache" }).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); }
      return r;
    }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
