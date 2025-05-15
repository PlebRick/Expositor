// File: src/index.ts
// Page Title: Expositor — App Bootstrap (FS-restore + tab wiring)

import './style.css';

/* ─────────── UI helpers & widgets ─────────── */
import {
  initToggles,
  initDraggable,
  initSettings,
  needsInitialSetup,
  openSettings,
} from './layout';
import { renderSidebar }          from './sidebar';
import { renderChapterContent }   from './renderers/chapter';
import { initDrawerLogic }        from './drawer';
import { initImportExportButtons } from './importExport';
import { initTabs }               from './tabs';      // ← tab click handlers

/* ─────────── storage bootstrap ─────────── */
import { restoreFSHandle } from './storage';
import { store } from './store';

/* ─────────── load manifest & kick UI ─────────── */
let manifest: Record<string, number> = {};

(async () => {
  /* 1️⃣  re-hydrate previously picked folder (if permission still granted) */
  await restoreFSHandle();

  /* 2️⃣  fetch chapter/verse manifest */
  const res = await fetch('/data/manifest.json');
  manifest  = await res.json();
  (window as any).manifest = manifest;          // dev-helper for import/export

  /* 3️⃣  render sidebar & attach widgets */
  renderSidebar(Object.keys(manifest));
  initToggles();
  initDraggable();
  initSettings();
  initDrawerLogic();
  initImportExportButtons();
  initTabs();                                   // ensure Outline / Manuscript / Commentary tabs work after refresh

  /* 4️⃣  first-run onboarding */
  if (await needsInitialSetup()) openSettings();

  /* 5️⃣  default passage */
  const [firstBook] = Object.keys(manifest);
  store.set('book', firstBook);
  store.set('chapter', '1');
  renderChapterContent(firstBook, '1');
})();
