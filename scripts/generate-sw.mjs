import { generateSW } from 'workbox-build';

await generateSW({
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,woff2,png,svg,json}'],
  swDest: 'dist/sw.js',
  navigateFallback: '/index.html',
  runtimeCaching: [{
    urlPattern: /^https:\\/\\/api\\.esv\\.org\\//,
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'esv-cache' }
  }]
});
