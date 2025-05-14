/* src/renderers/commentary.ts — FULL REPLACEMENT */

import { listFiles, readNote, deleteNote } from '../storage';
import { CommentaryNote }        from '../models';
import { parseNote }             from '../utils/markdown';
import MarkdownIt                from 'markdown-it';

const md = new MarkdownIt();

/** Render Commentary notes for the active chapter */
export async function renderCommentaryTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content')!;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  /* gather & parse */
  const pairs: { note: CommentaryNote; file: any }[] = [];
  for (const f of await listFiles(book, chap)) {
    const raw  = await readNote(f);
    const note = parseNote(raw);
    if (note && note.type === 'commentary') pairs.push({ note, file: f });
  }

  /* empty state */
  panel.innerHTML = '';
  if (!pairs.length) {
    panel.textContent = 'No commentary yet…';
    return;
  }

  /* render each commentary */
  for (const { note, file } of pairs) {
    const wrap = document.createElement('div');
    wrap.className = 'mb-6';

    /* header */
    const header = document.createElement('h2');
    header.className =
      'flex justify-between items-center font-semibold mb-2';
    header.innerHTML = `
      <span>${note.title}
        <small class="text-gray-500">(${note.range})</small>
      </span>
      <button class="text-red-500 hover:text-red-700" title="Delete">🗑</button>
    `;
    header.querySelector('button')!.addEventListener('click', async () => {
      if (!confirm(`Delete commentary “${note.title}”?`)) return;
      await deleteNote(file);
      renderCommentaryTab(book, chap);
    });

    wrap.appendChild(header);

    /* content */
    const div = document.createElement('div');
    div.className = 'prose dark:prose-invert';
    div.innerHTML = md.render(note.content);
    wrap.appendChild(div);

    panel.appendChild(wrap);
  }
}
