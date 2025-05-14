// File: src/importExport.js

import { saveOverride } from './storage.js';

/**
 * Sets up the “Export” button to download the full manualAnnotations.json bundle.
 */
export function setupExport() {
  const btn = document.getElementById('btn-export');
  if (!btn) return;

  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  newBtn.addEventListener('click', () => {
    const annotations = getAllAnnotations();
    const blob = new Blob([JSON.stringify(annotations, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'manualAnnotations.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

/**
 * Gather all per-chapter overrides from localStorage and package them
 * under outline/manuscript/commentary → book → chapters.
 */
function getAllAnnotations() {
  const annotations = {
    outline:    {},
    manuscript: {},
    commentary: {}
  };

  Object.keys(localStorage).forEach(key => {
    if (!key.startsWith('annotations_override:')) return;
    const [ , book, chap ] = key.split(':');
    const data = JSON.parse(localStorage.getItem(key));
    if (!data) return;

    if (Array.isArray(data.outlines) && data.outlines.length) {
      annotations.outline[book] = annotations.outline[book] || { chapters: {} };
      annotations.outline[book].chapters[chap] = data.outlines;
    }
    if (Array.isArray(data.manuscripts) && data.manuscripts.length) {
      annotations.manuscript[book] = annotations.manuscript[book] || { chapters: {} };
      annotations.manuscript[book].chapters[chap] = data.manuscripts;
    }
    if (Array.isArray(data.commentaries) && data.commentaries.length) {
      annotations.commentary[book] = annotations.commentary[book] || { chapters: {} };
      annotations.commentary[book].chapters[chap] = data.commentaries;
    }
  });

  return annotations;
}

/**
 * Sets up the “Import” button & file input to read a manualAnnotations.json bundle,
 * merge its contents into localStorage overrides, and reload the UI.
 */
export function setupImport() {
  const btn = document.getElementById('btn-import');
  const inp = document.getElementById('input-import');
  if (!btn || !inp) return;

  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  newBtn.addEventListener('click', () => inp.click());

  inp.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let bundle;
      try {
        bundle = JSON.parse(reader.result);
      } catch {
        alert('Invalid JSON import');
        return;
      }

      // Build overrides map: "Book:Chap" → { outlines, manuscripts, commentaries }
      const overrides = {};
      ['outline', 'manuscript', 'commentary'].forEach(branch => {
        const books = bundle[branch] || {};
        Object.entries(books).forEach(([book, { chapters }]) => {
          Object.entries(chapters || {}).forEach(([chap, raw]) => {
            const key = `${book}:${chap}`;
            overrides[key] = overrides[key] || { outlines: [], manuscripts: [], commentaries: [] };

            let items = [];
            // raw may be an array (from our export), or an object with _outline/_manuscript/_commentary
            if (branch === 'outline') {
              if (Array.isArray(raw)) items = raw;
              else if (raw._outline)   items = [ raw._outline ];
              overrides[key].outlines.push(...items);
            }
            if (branch === 'manuscript') {
              if (Array.isArray(raw)) items = raw;
              else if (raw._manuscript) items = [ raw._manuscript ];
              overrides[key].manuscripts.push(...items);
            }
            if (branch === 'commentary') {
              if (Array.isArray(raw)) items = raw;
              else if (raw._commentary) items = [ raw._commentary ];
              overrides[key].commentaries.push(...items);
            }
          });
        });
      });

      // Merge into localStorage
      Object.entries(overrides).forEach(([key, newData]) => {
        const [book, chap] = key.split(':');
        const storageKey   = `annotations_override:${book}:${chap}`;
        // load existing or default
        const existing = JSON.parse(localStorage.getItem(storageKey)) || {
          outlines: [], manuscripts: [], commentaries: []
        };
        const merged = {
          outlines:    [...existing.outlines, ...newData.outlines],
          manuscripts: [...existing.manuscripts, ...newData.manuscripts],
          commentaries:[...existing.commentaries, ...newData.commentaries]
        };
        saveOverride(book, chap, merged);
      });

      alert('Import successful. Reloading…');
      location.reload();
    };
    reader.readAsText(file);
  });
}
