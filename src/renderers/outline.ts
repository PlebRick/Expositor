// src/renderers/outline.ts  (FULL REPLACEMENT)
import { listFiles, readNote, deleteNote } from '../storage';
import { OutlineNote, OutlineItem } from '../models';

export async function renderOutlineTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content')!;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  const files = await listFiles(book, chap);
  const notes: OutlineNote[] = [];
  for (const f of files) {
    const n = await readNote(f);
    if (n.type === 'outline') notes.push(n);
  }

  panel.innerHTML = '';
  if (!notes.length) {
    panel.textContent = 'No outline items yet…';
    return;
  }

  notes.forEach((note, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-6';

    /* header */
    const h = document.createElement('h2');
    h.className = 'flex justify-between items-center font-semibold mb-2';
    h.innerHTML = `
      <span>${note.title} <small class="text-gray-500">(${note.range})</small></span>
      <button class="text-red-500 hover:text-red-700" title="Delete">🗑</button>
    `;
    h.querySelector('button')!.addEventListener('click', async () => {
      if (!confirm(`Delete outline “${note.title}”?`)) return;
      await deleteNote(files[idx]);
      renderOutlineTab(book, chap);
    });

    wrapper.appendChild(h);

    /* body */
    note.items.forEach(renderItem(wrapper));
    panel.appendChild(wrapper);
  });
}

function renderItem(container: HTMLElement) {
  return (item: OutlineItem) => {
    const p = document.createElement('p');
    p.className = 'font-medium mb-1';
    p.innerHTML = `${item.text}${item.verse ? ` <span class="text-xs text-gray-400">(v. ${item.verse})</span>` : ''}`;
    container.appendChild(p);

    if (item.subpoints?.length) {
      const ul = document.createElement('ul');
      ul.className = 'list-disc pl-6 mb-2';
      item.subpoints.forEach(t => {
        const li = document.createElement('li');
        li.className = 'text-sm';
        li.textContent = t;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }
  };
}
