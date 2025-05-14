/* src/index.ts — COMPLETE REPLACEMENT */

import './style.css';

/* UI boot */
import { initToggles, initDraggable, initSettings } from './layout';
import { renderSidebar }        from './sidebar';
import { renderChapterContent } from './renderers/chapter';
import { initDrawerLogic }      from './drawer';
import { initImportExportButtons } from './importExport';

import { store } from './store';

/*──────────────── 1. load manifest ────────────────*/
let manifest: Record<string, number> = {};
(async () => {
  const res = await fetch('/data/manifest.json');
  manifest  = await res.json();
  (window as any).manifest = manifest;           // global for import/export

  /*──────────────── 2. render sidebar ──────────*/
  renderSidebar(Object.keys(manifest));

  /*──────────────── 3. init widgets ────────────*/
  initToggles();
  initDraggable();
  initSettings();
  initDrawerLogic();
  initImportExportButtons();

  /*──────────────── 4. default selection ───────*/
  const [firstBook] = Object.keys(manifest);
  store.set('book', firstBook);
  store.set('chapter', '1');
  renderChapterContent(firstBook, '1');
})();
