// src/index.ts  –  main entry (TypeScript + Vite)
/* eslint-disable no-console */
import './style.css';

import { store } from './store';
import { initToggles, initDraggable, initSettings } from './layout';
import { initTabs } from './tabs';
import { renderSidebar } from './sidebar';
import { renderChapterContent } from './renderers/chapter';
import { setupImportExport } from './importExport';

/* Optional PWA support (disabled in dev if Workbox not present) */
let registerServiceWorker = async () => {};
try {
  // Dynamically import to avoid bundling workbox-window in dev when unused
  const { Workbox } = await import('workbox-window');
  registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js');
      wb.register().catch(console.error);
    }
  };
} catch {
  /* workbox-window not available in dev */
}

console.log('✅ Expositor booting…');

async function bootstrap() {
  /* 1️⃣ Load book→chapter manifest */
  const resp = await fetch('/data/manifest.json');
  if (!resp.ok) throw new Error('manifest.json missing');
  const manifest: Record<string, number> = await resp.json();

  /* 2️⃣ Build sidebar tree */
  renderSidebar(Object.keys(manifest));

  /* 3️⃣ Initialise UI controls */
  initToggles();
  initDraggable();
  initTabs();
  initSettings();        // choose folder, ESV key, etc.
  setupImportExport();   // ZIP import / export

  /* 4️⃣ Default view: first book / chapter 1 */
  const [firstBook] = Object.keys(manifest);
  store.set('book', firstBook);
  store.set('chapter', '1');
  renderChapterContent(firstBook, '1');

  /* 5️⃣ Register service-worker for PWA/offline */
  registerServiceWorker();
}

bootstrap().catch(err => {
  console.error('💥 Bootstrap failed:', err);
  alert('Failed to start Expositor. See console for details.');
});
