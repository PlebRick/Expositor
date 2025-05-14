// src/renderers/manuscript.ts  (FULL REPLACEMENT)
import MarkdownIt from 'markdown-it';
import { listFiles, readNote, deleteNote } from '../storage';
import { ManuscriptNote } from '../models';

const md = MarkdownIt({ html: false });

export async function renderManuscriptTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content')!;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  const files = await listFiles(book, chap);
  const notes: ManuscriptNote[] = [];
  for (const f of files) {
    const n = await readNote(f);
    if (n.type === 'manuscript') notes.push(n);
  }

  panel.innerHTML = '';
  if (!notes.length) {
    panel.textContent = 'No manuscript entry yet…';
    return;
  }

  notes.forEach((note, idx) => {
    const art = document.createElement('article');
    art.className = 'prose dark:prose-invert mb-6';

    const h = document.createElement('h2');
    h.className = 'flex justify-between items-center';
    h.innerHTML = `
      <span>${note.title} <small class="text-gray-500">(${note.range})</small></span>
      <button class="text-red-500 hover:text-red-700" title="Delete">🗑</button>
    `;
    h.querySelector('button')!.addEventListener('click', async () => {
      if (!confirm(`Delete manuscript “${note.title}”?`)) return;
      await deleteNote(files[idx]);
      renderManuscriptTab(book, chap);
    });

    const bodyDiv = document.createElement('div');
    bodyDiv.innerHTML = md.render(note.content);

    art.append(h, bodyDiv);
    panel.appendChild(art);
  });
}
