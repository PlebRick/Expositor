// src/sidebar.ts  (only part that touched globals)
import { store } from './store';
import { renderChapterContent } from './renderers/chapter';

export function renderSidebar(books: string[]) {
  /* identical DOM code … */
}

/* replace window globals with store.set */
export function toggleChapters(book: string, li: HTMLLIElement) {
  /* unchanged expansion logic … */

  chapBtn.addEventListener('click', () => {
    store.set('book', book);
    store.set('chapter', String(i));
    renderChapterContent(book, String(i));
  });
}
