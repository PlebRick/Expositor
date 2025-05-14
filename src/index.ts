// src/index.ts  (REPLACES index.js – now TypeScript + central store)
import './style.css';
import { store } from './store';
import { initToggles, initDraggable, initSettings } from './layout';
import { initTabs } from './tabs';
import { renderSidebar } from './sidebar';
import { renderChapterContent } from './renderers/chapter';
import { setupImportExport } from './importExport';

console.log('✅ index.ts booting');

async function bootstrap() {
  /* 1️⃣ Load manifest */
  const manifestResp = await fetch('/data/manifest.json');
  if (!manifestResp.ok) throw new Error('manifest.json missing');
  const manifest = await manifestResp.json() as Record<string, number>;

  /* 2️⃣ Sidebar */
  renderSidebar(Object.keys(manifest));

  /* 3️⃣ UI chrome */
  initToggles();
  initDraggable();
  initTabs();
  initSettings(); // includes “Choose folder” + ESV key input
  setupImportExport();

  /* 4️⃣ Default selection: first book/chap */
  const [firstBook] = Object.keys(manifest);
  store.set('book', firstBook);
  store.set('chapter', '1');
  renderChapterContent(firstBook, '1');
}

bootstrap().catch((e) => {
  console.error(e);
  alert('Failed to start app – see console');
});
