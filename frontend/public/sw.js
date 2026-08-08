const CACHE = "danza-cache-v2";
const STATIC_CACHE = "danza-static-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE && k !== STATIC_CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Estáticos con hash: cache-first para mayor velocidad
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          const clone = response.clone();
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, clone);
        }
        return response;
      })(),
    );
    return;
  }

  // Navegacion: network-first con respaldo en cache (ofrece modo offline minimo)
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          // Error del servidor (5xx): servir ultima pagina buena si existe
          if (response.status >= 500) {
            const cached = await caches.match("/");
            if (cached) return cached;
          }
          // Solo cachear respuestas OK
          if (response.ok) {
            const clone = response.clone();
            const cache = await caches.open(CACHE);
            cache.put("/", clone);
          }
          return response;
        } catch {
          const cached = await caches.match("/");
          if (cached) return cached;
          return Response.error();
        }
      })(),
    );
  }
});