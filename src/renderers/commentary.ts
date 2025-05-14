/* ------------------------------------------------------------------
   Commentary tab renderer
   ------------------------------------------------------------------ */

import MarkdownIt from 'markdown-it';
import { listFiles, readNote, deleteNote } from '../storage';
import { CommentaryNote, AnyNote } from '../models';
import { parseNote }               from '../utils/markdown';

const md = new MarkdownIt();

/** Render all “Commentary” notes for the current chapter */
export async function renderCommentaryTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content') as HTMLElement;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  /* ── Collect notes ------------------------------------------------ */
  const pairs: { note: CommentaryNote; file: any }[] = [];

  for (const file of await listFiles(book, chap)) {
    /* readNote ⇒ raw Markdown string */
    const raw = (await readNote(file)) as string;
    const maybe = parseNote(raw) as AnyNote | null;

    if (maybe?.type === 'commentary') {
      pairs.push({ note: maybe as CommentaryNote, file });
    }
  }

  /* ── Empty state -------------------------------------------------- */
  panel.innerHTML = '';
  if (!pairs.length) {
    panel.textContent = 'No commentary yet…';
    return;
  }

  /* ── Render each commentary -------------------------------------- */
  pairs.forEach(({ note, file }) => {
    /* wrapper */
    const wrap = document.createElement('section');
    wrap.className = 'mb-6';

    /* header with delete */
    const header = document.createElement('h2');
    header.className =
      'flex justify-between items-center font-semibold mb-2';
    header.innerHTML = `
      <span>${note.title}
        <small class="text-gray-500">(${note.range})</small>
      </span>
      <button class="text-red-500 hover:text-red-700" title="Delete">🗑</button>
    `;
    header
      .querySelector('button')!
      .addEventListener('click', async () => {
        if (!confirm(`Delete commentary “${note.title}”?`)) return;
        await deleteNote(file);
        renderCommentaryTab(book, chap); // refresh
      });

    /* body */
    const body = document.createElement('div');
    body.className = 'prose dark:prose-invert';
    body.innerHTML = md.render(note.content);

    wrap.append(header, body);
    panel.appendChild(wrap);
  });
}
