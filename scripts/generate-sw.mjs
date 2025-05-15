/* scripts/generate-sw.mjs
   Build-time script to create dist/sw.js via Workbox
   -------------------------------------------------- */

import { generateSW }   from 'workbox-build';
import { join }         from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir   = join(__dirname, '..', 'dist');
const swFile    = join(distDir, 'sw.js');          // final output path

async function buildSW() {
  /* make sure dist/ exists */
  await mkdir(distDir, { recursive: true });

  /* run Workbox */
  const { count, size } = await generateSW({
    globDirectory: distDir,
    globPatterns: [
      '**/*.{js,css,html,ico,png,svg,webmanifest}'
    ],
    swDest: swFile,
    navigateFallback: '/index.html',
    runtimeCaching: [
      {
        /* cache ESV API GETs for 24 h */
        urlPattern: /^https:\/\/api\.esv\.org\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'esv-api-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 }
        }
      }
    ],
    skipWaiting: true,
    clientsClaim: true
  });

  /* prepend a brief summary comment */
  const original = await readFile(swFile, 'utf8');
  const summary  = `/* precache: ${count} files • ${(size / 1024).toFixed(
    1
  )} KiB */\n`;
  await writeFile(swFile, summary + original);

  console.log(`✅  Service-worker generated → ${swFile}`);
}

buildSW().catch((err) => {
  console.error('❌  SW build failed:', err);
  process.exit(1);
});
