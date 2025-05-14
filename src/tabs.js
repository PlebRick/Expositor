// In src/tabs.js
console.log('✅ tabs.js loaded');

import { renderOutlineTab } from './renderers/outline.js';
import { renderManuscriptTab } from './renderers/manuscript.js';
import { renderCommentaryTab } from './renderers/commentary.js';

/**
 * Wire up the top‐nav “Outline / Manuscript / Commentary” buttons.
 */
export function initTabs() {
  const tabs = document.querySelectorAll('nav button[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Highlight active tab
      tabs.forEach(t => t.classList.replace('border-indigo-500','border-transparent'));
      tab.classList.replace('border-transparent','border-indigo-500');

      // Render the correct panel
      const book = window.currentBook;
      const chap = window.currentChap;
      if (tab.dataset.tab === 'outline') {
        renderOutlineTab(book, chap);
      } else if (tab.dataset.tab === 'manuscript') {
        renderManuscriptTab(book, chap);
      } else {
        renderCommentaryTab(book, chap);
      }
    });
  });
}
