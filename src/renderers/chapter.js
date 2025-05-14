// File: src/renderers/chapter.js

import { fetchPassageLines } from '../esvApi.js';

/**
 * Renders the Bible text for a given book & chapter
 * into the center-panel element.
 *
 * @param {string} book  – e.g. "Genesis"
 * @param {string} chap  – e.g. "1"
 */
export async function renderChapterContent(book, chap) {
  const center = document.getElementById('center-panel');
  center.innerHTML = '<p class="italic">Loading…</p>';

  try {
    const lines = await fetchPassageLines(book, chap);
    center.innerHTML = ''; // clear loading text

    for (const line of lines) {
      const match = line.match(/^([0-9]+)\s*(.*)$/);
      if (match) {
        const [ , verseNum, verseText ] = match;
        const p = document.createElement('p');
        p.className = 'mb-2';
        p.innerHTML = `<sup class="font-semibold">${verseNum}</sup> ${verseText}`;
        center.appendChild(p);
      } else {
        const h = document.createElement('h3');
        h.className = 'font-semibold my-2';
        h.textContent = line;
        center.appendChild(h);
      }
    }
  } catch (err) {
    console.error(`Error loading passage ${book} ${chap}:`, err);
    center.innerHTML = '⚠️ Failed to load passage.';
  }
}
