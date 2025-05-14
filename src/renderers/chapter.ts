/* src/renderers/chapter.ts */

import { fetchPassageLines } from '../esvApi';
import { store } from '../store';

export async function renderChapterContent(book: string, chap: string) {
  const center = document.getElementById('center-panel')!;
  center.innerHTML = '<p class="italic">Loading…</p>';

  try {
    const lines = await fetchPassageLines(book, chap);
    center.innerHTML = '';

    for (const line of lines) {
      const m = line.match(/^(\d+)\s+(.*)$/);
      if (m) {
        const [, v, t] = m;
        const p = document.createElement('p');
        p.className = 'mb-2';
        p.innerHTML = `<sup class="font-semibold">${v}</sup> ${t}`;
        center.appendChild(p);
      } else {
        const h = document.createElement('h3');
        h.className = 'font-semibold my-2';
        h.textContent = line;
        center.appendChild(h);
      }
    }

    /* update global store */
    store.set('book', book);
    store.set('chapter', chap);

  } catch (err) {
    console.error(err);
    center.textContent = '⚠️ Failed to load passage.';
  }
}
