/**
 *filename: src/chapter.ts
 * Renders the Bible text for the active book & chapter
 * into the center panel.
 *
 * Compat-note: This is a 1-for-1 rewrite of the old `chapter.js`
 *   – same verse/heading parsing logic.
 */

import { fetchPassageLines } from '../esvApi';   // TS module
import { store } from '../store';

const center = () => document.getElementById('center-panel')!;

/**
 * Render a chapter’s verses.
 * @param book   e.g. "Genesis"
 * @param chap   e.g. "1"
 */
export async function renderChapterContent(book: string, chap: string) {
  center().innerHTML = '<p class="italic">Loading…</p>';

  try {
    const lines = await fetchPassageLines(book, chap);
    center().innerHTML = '';

    for (const line of lines) {
      const verseMatch = line.match(/^(\d+)\s+(.*)$/);

      /* verse line → <p><sup>n</sup> text</p> */
      if (verseMatch) {
        const [, vNum, vText] = verseMatch;
        const p = document.createElement('p');
        p.className = 'mb-2';
        p.innerHTML = `<sup class="font-semibold">${vNum}</sup> ${vText}`;
        center().appendChild(p);
        continue;
      }

      /* heading line → <h3> */
      const h = document.createElement('h3');
      h.className = 'font-semibold my-2';
      h.textContent = line;
      center().appendChild(h);
    }

    /* keep global reactive state in sync */
    store.set({ book, chapter: chap });

  } catch (err) {
    console.error(`Error loading ${book} ${chap}:`, err);
    center().textContent = '⚠️ Failed to load passage.';
  }
}
