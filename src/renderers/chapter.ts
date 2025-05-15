//src/renderers/chapter.ts

import { fetchPassageLines } from '../esvApi';
import { store } from '../store';
import { openSettings } from '../layout';      // ⬅ gives us the drawer helper

/** Render the Bible text for given book + chapter. */
export async function renderChapterContent(book: string, chap: string) {
  const center = document.getElementById('center-panel')!;
  center.innerHTML = '<p class="italic">Loading…</p>';

  try {
    const lines = await fetchPassageLines(book, chap);
    center.innerHTML = '';

    /* build the passage HTML */
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
  } catch (err: any) {
    /* Handle known “no key” error with a nice prompt */
    if (err instanceof Error && err.message.startsWith('No ESV API key')) {
      center.innerHTML = `
        <div class="bg-yellow-100 text-yellow-900 p-4 rounded">
          An <strong>ESV API key</strong> is required to load passages.
          <button id="btn-add-esv" class="ml-2 px-3 py-1 bg-indigo-600 text-white rounded">
            Enter key
          </button>
        </div>
      `;
      document.getElementById('btn-add-esv')?.addEventListener('click', openSettings);
    } else {
      console.error(err);
      center.innerHTML = '<p class="text-red-600">⚠️ Failed to load passage.</p>';
    }
  }
}
