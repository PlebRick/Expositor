// File: src/drawer.js
console.log('✅ drawer.js loaded');

import { loadChapter, saveOverride } from './storage.js';
import { renderOutlineTab }          from './renderers/outline.js';
import { renderManuscriptTab }       from './renderers/manuscript.js';
import { renderCommentaryTab }       from './renderers/commentary.js';

/**
 * Wire up the “＋” buttons and close button for the slide-in drawer.
 */
export function initDrawerLogic() {
  const openOutline    = document.getElementById('btn-open-outline');
  const openManuscript = document.getElementById('btn-open-manuscript');
  const openCommentary = document.getElementById('btn-open-commentary');
  const closeBtn       = document.getElementById('btn-close-drawer');

  if (openOutline)    openOutline.addEventListener('click', () => openDrawer('outline'));
  if (openManuscript) openManuscript.addEventListener('click', () => openDrawer('manuscript'));
  if (openCommentary) openCommentary.addEventListener('click', () => openDrawer('commentary'));
  if (closeBtn)       closeBtn.addEventListener('click', closeDrawer);
}

function openDrawer(type) {
  const drawer = document.getElementById('slide-drawer');
  drawer.classList.remove('translate-x-full');

  if (type === 'outline')       renderOutlineForm();
  else if (type === 'manuscript') renderManuscriptForm();
  else                            renderCommentaryForm();
}

function closeDrawer() {
  document.getElementById('slide-drawer').classList.add('translate-x-full');
}

// ─── FORM RENDERERS ─────────────────────────────────────────────────────────

async function renderOutlineForm() {
  const book = window.currentBook, chap = window.currentChap;
  document.getElementById('drawer-title').textContent = 'New Outline';
  const body = document.getElementById('drawer-body');
  body.innerHTML = `
    <p class="text-sm mb-2">
      Book: <strong>${book}</strong> • Chapter: <strong>${chap}</strong>
    </p>
  `;

  const inputCls = 'w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';
  const ti = Object.assign(document.createElement('input'), { type: 'text', placeholder: 'Outline Title…', className: inputCls });
  const ri = Object.assign(document.createElement('input'), { type: 'text', placeholder: 'Verse Range…', className: inputCls });

  const pointsDiv = document.createElement('div');
  pointsDiv.id = 'outline-points';
  pointsDiv.className = 'space-y-4 mb-4';

  const addPt = document.createElement('button');
  addPt.type = 'button';
  addPt.textContent = '＋ Add Main Point';
  addPt.className = 'px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mb-4';
  addPt.addEventListener('click', () => {
    const pd = document.createElement('div');
    pd.className = 'p-3 border rounded bg-gray-50 dark:bg-gray-700 space-y-2';
    const lbl = Object.assign(document.createElement('input'), { type: 'text', placeholder: 'Main point…', className: inputCls });
    const vrs = Object.assign(document.createElement('input'), { type: 'text', placeholder: 'Verse (opt)…', className: inputCls });
    const sc  = document.createElement('div');
    sc.className = 'pl-4 space-y-2';
    const addSc = document.createElement('button');
    addSc.type = 'button';
    addSc.textContent = '＋ Sub-point';
    addSc.className = 'text-sm text-indigo-600';
    addSc.addEventListener('click', () => {
      const si = Object.assign(document.createElement('input'), { type: 'text', placeholder: 'Sub-point…', className: inputCls });
      sc.appendChild(si);
    });
    pd.append(lbl, vrs, addSc, sc);
    pointsDiv.appendChild(pd);
  });

  body.append(ti, ri, pointsDiv, addPt);

  const footer = document.createElement('div');
  footer.className = 'flex justify-end space-x-2';
  footer.append(
    makeButton('Cancel', 'bg-gray-300', 'hover:bg-gray-400', closeDrawer),
    makeButton('Save Outline', 'bg-green-600 text-white', 'hover:bg-green-700', async () => {
      const items = Array.from(pointsDiv.children).map(div => {
        const [tIn, rIn] = div.querySelectorAll('input');
        const subs = Array.from(div.querySelectorAll('.pl-4 input'))
                          .map(i => i.value.trim())
                          .filter(Boolean);
        return { text: tIn.value.trim(), verse: rIn.value.trim(), subpoints: subs };
      });
      const data = await loadChapter(book, chap);
      saveOverride(book, chap, {
        outlines:    [ { title: ti.value.trim(), range: ri.value.trim(), items } ],
        manuscripts: data.manuscripts,
        commentaries:data.commentaries
      });
      closeDrawer();
      renderOutlineTab(book, chap);
    })
  );
  body.appendChild(footer);
}

async function renderManuscriptForm() {
  const book = window.currentBook, chap = window.currentChap;
  document.getElementById('drawer-title').textContent = 'New Manuscript';
  const body = document.getElementById('drawer-body');
  body.innerHTML = `
    <p class="text-sm mb-2">
      Book: <strong>${book}</strong> • Chapter: <strong>${chap}</strong>
    </p>
  `;

  const inputCls = 'w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';
  const ti = Object.assign(document.createElement('input'), { type: 'text', placeholder: 'Manuscript Title…', className: inputCls });
  const ri = Object.assign(document.createElement('input'), { type: 'text', placeholder: 'Verse Range…', className: inputCls });
  const ta = Object.assign(document.createElement('textarea'), { rows: 8, placeholder: 'Content…', className: inputCls });

  body.append(ti, ri, ta);

  const footer = document.createElement('div');
  footer.className = 'flex justify-end space-x-2';
  footer.append(
    makeButton('Cancel', 'bg-gray-300', 'hover:bg-gray-400', closeDrawer),
    makeButton('Save Manuscript', 'bg-green-600 text-white', 'hover:bg-green-700', async () => {
      const data = await loadChapter(book, chap);
      saveOverride(book, chap, {
        outlines:    data.outlines,
        manuscripts: [ { title: ti.value.trim(), range: ri.value.trim(), content: ta.value.trim() } ],
        commentaries:data.commentaries
      });
      closeDrawer();
      renderManuscriptTab(book, chap);
    })
  );
  body.appendChild(footer);
}

async function renderCommentaryForm() {
  const book = window.currentBook, chap = window.currentChap;
  document.getElementById('drawer-title').textContent = 'New Commentary';
  const body = document.getElementById('drawer-body');
  body.innerHTML = `
    <p class="text-sm mb-2">
      Book: <strong>${book}</strong> • Chapter: <strong>${chap}</strong>
    </p>
  `;

  const inputCls = 'w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';
  const ti = Object.assign(document.createElement('input'), { type: 'text', placeholder: 'Commentary Title…', className: inputCls });
  const ri = Object.assign(document.createElement('input'), { type: 'text', placeholder: 'Verse Range…', className: inputCls });
  const ta = Object.assign(document.createElement('textarea'), { rows: 8, placeholder: 'Commentary…', className: inputCls });

  body.append(ti, ri, ta);

  const footer = document.createElement('div');
  footer.className = 'flex justify-end space-x-2';
  footer.append(
    makeButton('Cancel', 'bg-gray-300', 'hover:bg-gray-400', closeDrawer),
    makeButton('Save Commentary', 'bg-green-600 text-white', 'hover:bg-green-700', async () => {
      const data = await loadChapter(book, chap);
      saveOverride(book, chap, {
        outlines:    data.outlines,
        manuscripts: data.manuscripts,
        commentaries:[ { title: ti.value.trim(), range: ri.value.trim(), content: ta.value.trim() } ]
      });
      closeDrawer();
      renderCommentaryTab(book, chap);
    })
  );
  body.appendChild(footer);
}

/**
 * Utility to create a styled button.
 */
function makeButton(text, bgClass, hoverClass, handler) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = text;
  btn.className = `px-4 py-2 ${bgClass} rounded ${hoverClass}`;
  btn.addEventListener('click', handler);
  return btn;
}
