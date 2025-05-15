// File: src/renderers/outline.ts
// Page Title: Expositor — Outline Tab Renderer (fs-compatible)

import { listFiles, readNote, deleteNote } from '../storage';
import { OutlineNote, OutlineItem, AnyNote } from '../models';
import { parseNote } from '../utils/markdown';

export async function renderOutlineTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content') as HTMLElement;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  const pairs: { note: OutlineNote; file: any }[] = [];

  for (const fileHandle of await listFiles(book, chap)) {
    const raw = (await readNote(fileHandle)) as string;
    const note = parseNote(raw) as AnyNote | null;
    if (note?.type === 'outline') pairs.push({ note: note as OutlineNote, file: fileHandle });
  }

  panel.innerHTML = '';
  if (!pairs.length) {
    panel.textContent = 'No outline items yet…';
    return;
  }

  pairs.forEach(({ note, file }) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-6';

    const header = document.createElement('h2');
    header.className = 'flex justify-between items-center font-semibold mb-2';
    header.innerHTML = `
      <span>${note.title} <small class="text-gray-500">(${note.range})</small></span>
      <button class="text-red-500 hover:text-red-700" title="Delete">🗑</button>
    `;
    header.querySelector('button')!.addEventListener('click', async () => {
      if (!confirm(`Delete outline “${note.title}”?`)) return;
      await deleteNote(file);
      renderOutlineTab(book, chap);
    });
    wrapper.appendChild(header);

    note.items.forEach(renderItem(wrapper));
    panel.appendChild(wrapper);
  });
}

function renderItem(container: HTMLElement) {
  return (item: OutlineItem): void => {
    const p = document.createElement('p');
    p.className = 'font-medium mb-1';
    p.innerHTML =
      `${item.text}` +
      (item.verse ? ` <span class="text-xs text-gray-400">(v. ${item.verse})</span>` : '');
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
