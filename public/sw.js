/* basic Workbox generated precache – handcrafted for brevity */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');
self.skipWaiting();
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

/* cache ESV API responses for offline revisit */
workbox.routing.registerRoute(
  ({ url }) => url.hostname === 'api.esv.org',
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'esv-cache' })
);
