// File: src/renderers/outline.js

import { loadChapter, deleteOverrideEntry } from '../storage.js';

/**
 * Renders the Outline tab for a given book & chapter,
 * injecting a delete button beside each outline entry.
 */
export async function renderOutlineTab(book, chap) {
  const { outlines } = await loadChapter(book, chap);
  const container = document.getElementById('tab-content');
  container.innerHTML = '';

  if (!outlines || outlines.length === 0) {
    container.textContent = 'No outline items yet…';
    return;
  }

  outlines.forEach((o, idx) => {
    // Wrapper for this entry
    const entryDiv = document.createElement('div');
    entryDiv.className = 'mb-6';

    // Header: title + delete button
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-center mb-2';

    const titleEl = document.createElement('h2');
    titleEl.className = 'font-semibold';
    titleEl.innerHTML = `
      ${o.title}
      <span class="text-sm text-gray-500">(${o.range})</span>
    `;

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'text-red-500 hover:text-red-700';
    delBtn.title = `Delete outline “${o.title}”`;
    delBtn.textContent = '🗑';
    delBtn.addEventListener('click', async () => {
      if (!confirm(`Are you sure you want to delete the outline "${o.title}"?`)) return;
      await deleteOverrideEntry(book, chap, 'outlines', idx);
      renderOutlineTab(book, chap);
    });

    headerDiv.append(titleEl, delBtn);
    entryDiv.appendChild(headerDiv);

    // Render each main point and subpoints
    o.items.forEach(item => {
      const p = document.createElement('p');
      p.className = 'font-medium mb-1';
      p.innerHTML = `
        ${item.text}
        ${item.verse ? `<span class="text-xs text-gray-400">(v. ${item.verse})</span>` : ''}
      `;
      entryDiv.appendChild(p);

      if (item.subpoints && item.subpoints.length) {
        const ul = document.createElement('ul');
        ul.className = 'list-disc pl-6 mb-2';
        item.subpoints.forEach(sp => {
          const li = document.createElement('li');
          li.className = 'text-sm';
          li.textContent = sp;
          ul.appendChild(li);
        });
        entryDiv.appendChild(ul);
      }
    });

    container.appendChild(entryDiv);
  });
}
