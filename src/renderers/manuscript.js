// File: src/renderers/manuscript.js

import { loadChapter, deleteOverrideEntry } from '../storage.js';

/**
 * Renders the Manuscript tab for a given book & chapter,
 * injecting a delete button beside each manuscript entry.
 */
export async function renderManuscriptTab(book, chap) {
  const { manuscripts } = await loadChapter(book, chap);
  const container = document.getElementById('tab-content');
  container.innerHTML = '';

  if (!manuscripts || manuscripts.length === 0) {
    container.textContent = 'No manuscript entry yet…';
    return;
  }

  manuscripts.forEach((m, idx) => {
    // Wrapper for this entry
    const entryDiv = document.createElement('div');
    entryDiv.className = 'mb-6';

    // Header: title + delete button
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-center mb-2';

    const titleEl = document.createElement('h2');
    titleEl.className = 'font-semibold';
    titleEl.innerHTML = `
      ${m.title}
      <span class="text-sm text-gray-500">(${m.range})</span>
    `;

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'text-red-500 hover:text-red-700';
    delBtn.title = `Delete manuscript “${m.title}”`;
    delBtn.textContent = '🗑';
    delBtn.addEventListener('click', async () => {
      if (!confirm(`Are you sure you want to delete the manuscript "${m.title}"?`)) {
        return;
      }
      await deleteOverrideEntry(book, chap, 'manuscripts', idx);
      renderManuscriptTab(book, chap);
    });

    headerDiv.append(titleEl, delBtn);
    entryDiv.appendChild(headerDiv);

    // The disabled textarea for the content
    const ta = document.createElement('textarea');
    ta.disabled = true;
    ta.rows = 8;
    ta.className = 'w-full p-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600';
    ta.textContent = m.content;
    entryDiv.appendChild(ta);

    container.appendChild(entryDiv);
  });
}
