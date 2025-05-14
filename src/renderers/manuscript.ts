/* src/renderers/manuscript.ts — COMPLETE REPLACEMENT */

import { listFiles, readNote, deleteNote } from '../storage';
import { ManuscriptNote }                  from '../models';
import { parseNote }                       from '../utils/markdown';
import MarkdownIt                          from 'markdown-it';

const md = new MarkdownIt();

/** Render all manuscript notes for the active chapter */
export async function renderManuscriptTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content')!;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  /* gather & parse */
  const pairs: { note: ManuscriptNote; file: any }[] = [];
  for (const f of await listFiles(book, chap)) {
    const raw  = await readNote(f);
    const note = parseNote(raw);
    if (note && note.type === 'manuscript')
      pairs.push({ note, file: f });
  }

  /* empty state */
  panel.innerHTML = '';
  if (!pairs.length) {
    panel.textContent = 'No manuscript entry yet…';
    return;
  }

  /* render each manuscript */
  for (const { note, file } of pairs) {
    const art = document.createElement('article');
    art.className = 'prose dark:prose-invert mb-6';

    /* header with delete button */
    const header = document.createElement('h2');
    header.className =
      'flex justify-between items-center font-semibold';
    header.innerHTML = `
      <span>${note.title}
        <small class="text-gray-500">(${note.range})</small>
      </span>
      <button class="text-red-500 hover:text-red-700" title="Delete">🗑</button>
    `;
    header.querySelector('button')!.addEventListener('click', async () => {
      if (!confirm(`Delete manuscript “${note.title}”?`)) return;
      await deleteNote(file);
      renderManuscriptTab(book, chap);          // re-render after deletion
    });

    /* body */
    const body = document.createElement('div');
    body.innerHTML = md.render(note.content);

    art.append(header, body);
    panel.appendChild(art);
  }
}
