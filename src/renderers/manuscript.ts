/* ------------------------------------------------------------------
   Manuscript tab renderer
   ------------------------------------------------------------------ */

import MarkdownIt from 'markdown-it';
import { listFiles, readNote, deleteNote } from '../storage';
import { ManuscriptNote, AnyNote }         from '../models';
import { parseNote }                       from '../utils/markdown';

const md = new MarkdownIt();

/** Render every “Manuscript” note for the selected chapter */
export async function renderManuscriptTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content') as HTMLElement;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  /* ── Collect notes ------------------------------------------------ */
  const pairs: { note: ManuscriptNote; file: any }[] = [];

  for (const file of await listFiles(book, chap)) {
    /* readNote ⇒ raw Markdown string */
    const raw  = (await readNote(file)) as string;
    const note = parseNote(raw) as AnyNote | null;

    if (note?.type === 'manuscript') {
      pairs.push({ note: note as ManuscriptNote, file });
    }
  }

  /* ── Empty state -------------------------------------------------- */
  panel.innerHTML = '';
  if (!pairs.length) {
    panel.textContent = 'No manuscript entry yet…';
    return;
  }

  /* ── Render ------------------------------------------------------- */
  pairs.forEach(({ note, file }) => {
    /* article wrapper */
    const art = document.createElement('article');
    art.className = 'prose dark:prose-invert mb-6';

    /* header + delete */
    const header = document.createElement('h2');
    header.className =
      'flex justify-between items-center font-semibold';
    header.innerHTML = `
      <span>${note.title}
        <small class="text-gray-500">(${note.range})</small>
      </span>
      <button class="text-red-500 hover:text-red-700" title="Delete">🗑</button>
    `;
    header
      .querySelector('button')!
      .addEventListener('click', async () => {
        if (!confirm(`Delete manuscript “${note.title}”?`)) return;
        await deleteNote(file);
        renderManuscriptTab(book, chap); // refresh list
      });

    /* body */
    const body = document.createElement('div');
    body.innerHTML = md.render(note.content);

    art.append(header, body);
    panel.appendChild(art);
  });
}
