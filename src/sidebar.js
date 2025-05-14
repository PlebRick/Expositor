// In src/sidebar.js
console.log('✅ sidebar.js loaded');

import { renderChapterContent } from './renderers/chapter.js';

/**
 * Renders the book → chapter tree in the sidebar.
 * @param {string[]} books – array of book names (from manifest)
 */
export function renderSidebar(books) {
  const container = document.getElementById('sidebar-content');
  container.innerHTML = '';

  if (!books.length) {
    container.textContent = '📖 No books available…';
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'text-sm';

  books.forEach(book => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = book;
    btn.className = 'w-full text-left px-4 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none';
    btn.addEventListener('click', () => toggleChapters(book, li));
    li.appendChild(btn);
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

/**
 * Expands or collapses the chapter list for a book,
 * updates global state, and renders the selected chapter.
 */
export function toggleChapters(book, li) {
  let sub = li.querySelector('ul');
  if (sub) {
    sub.classList.toggle('hidden');
    return;
  }

  sub = document.createElement('ul');
  sub.className = 'pl-6 space-y-1';

  // window.manifest is loaded by index.js
  const count = window.manifest[book] || 0;
  for (let i = 1; i <= count; i++) {
    const entry = document.createElement('li');
    const wrapper = document.createElement('div');
    wrapper.className = 'px-4 py-1 hover:bg-gray-200 dark:hover:bg-gray-700';

    const chapBtn = document.createElement('button');
    chapBtn.textContent = i;
    chapBtn.className = 'text-left w-full focus:outline-none';
    chapBtn.addEventListener('click', () => {
      // Update global state for tabs and forms
      window.currentBook = book;
      window.currentChap = String(i);
      // Render the chapter content
      renderChapterContent(book, String(i));
    });

    wrapper.appendChild(chapBtn);
    entry.appendChild(wrapper);
    sub.appendChild(entry);
  }

  li.appendChild(sub);
}
