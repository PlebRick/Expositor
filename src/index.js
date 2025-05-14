// In src/index.js
console.log('✅ index.js loaded');

import { initToggles, initDraggable, initSettings } from './layout.js';
import { initTabs }   from './tabs.js';
import { renderSidebar, toggleChapters } from './sidebar.js';
import { renderChapterContent }         from './renderers/chapter.js';
import { setupImport, setupExport }     from './importExport.js';
import { initDrawerLogic } from './drawer.js';  // <-- Import initDrawerLogic

// Expose for sidebar & tabs
window.currentBook   = '';
window.currentChap   = '';
window.toggleChapters = toggleChapters;

window.addEventListener('DOMContentLoaded', async () => {
  // 1️⃣ Load manifest (book → chapter counts)
  let manifest = {};
  try {
    const resp = await fetch('data/manifest.json');
    manifest = await resp.json();
    window.manifest = manifest;
  } catch (err) {
    console.error('Failed to load manifest.json', err);
    return;
  }

  // 2️⃣ Render the sidebar tree
  renderSidebar(Object.keys(manifest));

  // 3️⃣ Initialize UI controls
  initToggles();
  initDraggable();
  initTabs();
  initSettings();
  setupImport();
  setupExport();

  // 4️⃣ Initialize Drawer Logic (this was missing previously)
  initDrawerLogic();  // <-- Call initDrawerLogic to wire up the + buttons

  // 5️⃣ Default selection: first book, chapter 1
  const books = Object.keys(manifest);
  if (books.length === 0) return;
  const firstBook = books[0];
  const firstChap = '1';
  window.currentBook = firstBook;
  window.currentChap = firstChap;

  // 6️⃣ Render chapter text and default tab
  renderChapterContent(firstBook, firstChap);

  // Optionally, render the default annotation tab:
  // import { renderOutlineTab } from './renderers/outline.js';
  // renderOutlineTab(firstBook, firstChap);
});
