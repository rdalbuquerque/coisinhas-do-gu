self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Required for Chrome Android installability: a registered fetch handler.
self.addEventListener("fetch", () => {});
