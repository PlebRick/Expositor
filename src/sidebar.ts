/* src/sidebar.ts */

import { renderChapterContent } from './renderers/chapter';
import { store } from './store';
import { id } from './utils/dom';

export function renderSidebar(books: string[]) {
  const container = id('sidebar-content');
  container.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'text-sm';

  books.forEach(book => {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = book;
    btn.className = 'w-full text-left px-4 py-1 hover:bg-gray-200 dark:hover:bg-gray-700';
    btn.addEventListener('click', () => toggleChapters(book, li));
    li.append(btn);
    ul.append(li);
  });

  container.append(ul);
}

export function toggleChapters(book: string, li: HTMLElement) {
  let sub = li.querySelector('ul');
  if (sub) { sub.classList.toggle('hidden'); return; }

  sub = document.createElement('ul');
  sub.className = 'pl-6 space-y-1';
  const max = (window as any).manifest?.[book] ?? 0;

  for (let n = 1; n <= max; n++) {
    const liN  = document.createElement('li');
    const btnN = document.createElement('button');
    btnN.textContent = String(n);
    btnN.className = 'text-left w-full hover:bg-gray-200 dark:hover:bg-gray-700';
    btnN.addEventListener('click', () => {
      store.set('book', book);
      store.set('chapter', String(n));
      renderChapterContent(book, String(n));
    });
    liN.append(btnN);
    sub.append(liN);
  }
  li.append(sub);
}
