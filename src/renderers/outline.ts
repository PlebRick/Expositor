/* src/renderers/outline.ts — COMPLETE REPLACEMENT */

import { listFiles, readNote, deleteNote } from '../storage';
import { OutlineNote, OutlineItem }        from '../models';
import { parseNote }                       from '../utils/markdown';

/** Render all outline notes for the chosen chapter */
export async function renderOutlineTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content')!;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  /* gather & parse files */
  const pairs: { note: OutlineNote; file: any }[] = [];
  for (const f of await listFiles(book, chap)) {
    const raw  = await readNote(f);
    const note = parseNote(raw);
    if (note && note.type === 'outline') pairs.push({ note, file: f });
  }

  /* empty state */
  panel.innerHTML = '';
  if (!pairs.length) {
    panel.textContent = 'No outline items yet…';
    return;
  }

  /* render each outline */
  pairs.forEach(({ note, file }) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-6';

    /* header with delete button */
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
    header.querySelector('button')!.addEventListener('click', async () => {
      if (!confirm(`Delete outline “${note.title}”?`)) return;
      await deleteNote(file);
      renderOutlineTab(book, chap);          // re-render after deletion
    });

    wrapper.appendChild(header);

    /* body points & sub-points */
    note.items.forEach(renderItem(wrapper));

    panel.appendChild(wrapper);
  });
}

/* helper to render a single main point + sub-points */
function renderItem(container: HTMLElement) {
  return (item: OutlineItem): void => {
    const p = document.createElement('p');
    p.className = 'font-medium mb-1';
    p.innerHTML = `${item.text}${
      item.verse ? ` <span class="text-xs text-gray-400">(v. ${item.verse})</span>` : ''
    }`;
    container.appendChild(p);

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
