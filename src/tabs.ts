// src/tabs.ts  (FULL REPLACEMENT)
import { store } from './store';
import { renderOutlineTab } from './renderers/outline';
import { renderManuscriptTab } from './renderers/manuscript';
import { renderCommentaryTab } from './renderers/commentary';

export function initTabs() {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>('nav button[data-tab]');
  tabButtons.forEach(btn =>
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.replace('border-indigo-500', 'border-transparent'));
      btn.classList.replace('border-transparent', 'border-indigo-500');

      const { book, chapter } = store.snapshot;
      const which = btn.dataset.tab as 'outline' | 'manuscript' | 'commentary';
      store.set('tab', which);

      if (which === 'outline')      renderOutlineTab(book, chapter);
      else if (which === 'manuscript') renderManuscriptTab(book, chapter);
      else                           renderCommentaryTab(book, chapter);
    })
  );
}
