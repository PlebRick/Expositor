// src/renderers/commentary.ts  (FULL REPLACEMENT)
import MarkdownIt from 'markdown-it';
import { listFiles, readNote, deleteNote } from '../storage';
import { CommentaryNote } from '../models';

const md = MarkdownIt({ html: false });

export async function renderCommentaryTab(book: string, chap: string) {
  const panel = document.getElementById('tab-content')!;
  panel.innerHTML = '<p class="italic">Loading…</p>';

  /* load notes for this chapter ---------------------------------- */
  const files = await listFiles(book, chap);
  const notes: CommentaryNote[] = [];
  for (const f of files) {
    const n = await readNote(f);
    if (n.type === 'commentary') notes.push(n);
  }

  panel.innerHTML = '';
  if (notes.length === 0) {
    panel.textContent = 'No commentary yet…';
    return;
  }

  notes.forEach((note, idx) => {
    const article = document.createElement('article');
    article.className = 'prose dark:prose-invert mb-6';

    /* header ----------------------------------------------------- */
    const header = document.createElement('h2');
    header.className = 'flex justify-between items-center';
    header.innerHTML = `
      <span>${note.title} <small class="text-gray-500">(${note.range})</small></span>
      <button class="text-red-500 hover:text-red-700" title="Delete">🗑</button>
    `;

    header.querySelector('button')!.addEventListener('click', async () => {
      if (!confirm(`Delete commentary “${note.title}”?`)) return;
      await deleteNote(files[idx]);
      renderCommentaryTab(book, chap);
    });

    /* body ------------------------------------------------------- */
    const bodyHTML = md.render(note.content);
    const bodyDiv = document.createElement('div');
    bodyDiv.innerHTML = bodyHTML;

    article.append(header, bodyDiv);
    panel.appendChild(article);
  });
}
