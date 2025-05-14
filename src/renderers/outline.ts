/* ------------------------------------------------------------------
   Outline tab renderer
   ------------------------------------------------------------------ */

import { listFiles, readNote, deleteNote } from '../storage';
import { OutlineNote, OutlineItem, AnyNote } from '../models';
import { parseNote }                         from '../utils/markdown';

/** Render every “Outline” note for the selected chapter */
export async function renderOutlineTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content') as HTMLElement;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  /* ── Collect notes ------------------------------------------------ */
  const pairs: { note: OutlineNote; file: any }[] = [];

  for (const file of await listFiles(book, chap)) {
    const raw  = (await readNote(file)) as string;          // storage always returns string
    const note = parseNote(raw) as AnyNote | null;

    if (note?.type === 'outline') {
      pairs.push({ note: note as OutlineNote, file });
    }
  }

  /* ── Empty state -------------------------------------------------- */
  panel.innerHTML = '';
  if (!pairs.length) {
    panel.textContent = 'No outline items yet…';
    return;
  }

  /* ── Render ------------------------------------------------------- */
  pairs.forEach(({ note, file }) => {
    /* wrapper */
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-6';

    /* header + delete */
    const header = document.createElement('h2');
    header.className =
      'flex justify-between items-center font-semibold mb-2';
    header.innerHTML = `
      <span>
        ${note.title}
        <small class="text-gray-500">(${note.range})</small>
      </span>
      <button class="text-red-500 hover:text-red-700" title="Delete">🗑</button>
    `;
    header
      .querySelector('button')!
      .addEventListener('click', async () => {
        if (!confirm(`Delete outline “${note.title}”?`)) return;
        await deleteNote(file);
        renderOutlineTab(book, chap); /* refresh list */
      });

    wrapper.appendChild(header);

    /* body: main points & sub-points */
    note.items.forEach(renderItem(wrapper));

    panel.appendChild(wrapper);
  });
}

/* helper to render a single main point + sub-points ------------- */
function renderItem(container: HTMLElement) {
  return (item: OutlineItem): void => {
    /* main point */
    const p = document.createElement('p');
    p.className = 'font-medium mb-1';
    p.innerHTML =
      `${item.text}` +
      (item.verse
        ? ` <span class="text-xs text-gray-400">(v. ${item.verse})</span>`
        : '');
    container.appendChild(p);

    /* sub-points */
    if (item.subpoints?.length) {
      const ul = document.createElement('ul');
      ul.className = 'list-disc pl-6 mb-2';
      item.subpoints.forEach((txt) => {
        const li = document.createElement('li');
        li.className = 'text-sm';
        li.textContent = txt;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }
  };
}
