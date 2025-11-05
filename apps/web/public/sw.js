self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("hardonia-shell").then((c) => c.addAll(["/", "/offline"]))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).catch(() => caches.match("/offline")))
  );
});
