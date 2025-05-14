/* src/drawer.ts — complete */

import { createNote } from './storage';
import { store } from './store';
import { OutlineNote, ManuscriptNote, CommentaryNote } from './models';
import { renderOutlineTab } from './renderers/outline';
import { renderManuscriptTab } from './renderers/manuscript';
import { renderCommentaryTab } from './renderers/commentary';
import { id } from './utils/dom';

/* button wiring */
export function initDrawerLogic() {
  id('btn-open-outline')   ?.addEventListener('click', () => open('outline'));
  id('btn-open-manuscript')?.addEventListener('click', () => open('manuscript'));
  id('btn-open-commentary')?.addEventListener('click', () => open('commentary'));
  id('btn-close-drawer')   ?.addEventListener('click', close);
}

type Mode = 'outline' | 'manuscript' | 'commentary';

function open(mode: Mode) {
  id('slide-drawer').classList.remove('translate-x-full');
  const { book, chapter } = store.snapshot;
  if (mode === 'outline')        renderOutlineForm(book, chapter);
  else if (mode === 'manuscript') renderManuscriptForm(book, chapter);
  else                            renderCommentaryForm(book, chapter);
}
function close() { id('slide-drawer').classList.add('translate-x-full'); }

/* ─────────────── OUTLINE FORM ─────────────── */

function renderOutlineForm(book: string, chap: string) {
  id('drawer-title').textContent = 'New Outline';
  const body = id('drawer-body');
  body.innerHTML = header(book, chap);

  const titleInp = input('Outline Title…');
  const rangeInp = input('Verse Range…');

  const pointsDiv = div('space-y-4 mb-4');
  const addMain = button('＋ Add Main Point', 'bg-indigo-600 text-white',
    () => pointsDiv.appendChild(pointBlock())
  );

  body.append(titleInp, rangeInp, pointsDiv, addMain, footer(async () => {
    const items = Array.from(pointsDiv.children).map(parsePoint);
    const note: OutlineNote = {
      type: 'outline',
      title: titleInp.value.trim(),
      range: rangeInp.value.trim(),
      items
    };
    await createNote(book, chap, note);
    close(); renderOutlineTab(book, chap);
  }));
}

/* ─────────────── MANUSCRIPT FORM ───────────── */

function renderManuscriptForm(book: string, chap: string) {
  id('drawer-title').textContent = 'New Manuscript';
  const body = id('drawer-body');
  body.innerHTML = header(book, chap);

  const titleInp = input('Manuscript Title…');
  const rangeInp = input('Verse Range…');
  const ta       = textarea('Content…');

  body.append(titleInp, rangeInp, ta, footer(async () => {
    const note: ManuscriptNote = {
      type: 'manuscript',
      title: titleInp.value.trim(),
      range: rangeInp.value.trim(),
      content: ta.value.trim()
    };
    await createNote(book, chap, note);
    close(); renderManuscriptTab(book, chap);
  }));
}

/* ─────────────── COMMENTARY FORM ───────────── */

function renderCommentaryForm(book: string, chap: string) {
  id('drawer-title').textContent = 'New Commentary';
  const body = id('drawer-body');
  body.innerHTML = header(book, chap);

  const titleInp = input('Commentary Title…');
  const rangeInp = input('Verse Range…');
  const ta       = textarea('Commentary…');

  body.append(titleInp, rangeInp, ta, footer(async () => {
    const note: CommentaryNote = {
      type: 'commentary',
      title: titleInp.value.trim(),
      range: rangeInp.value.trim(),
      content: ta.value.trim()
    };
    await createNote(book, chap, note);
    close(); renderCommentaryTab(book, chap);
  }));
}

/* ─────────────── helpers ─────────────── */

const inputCls =
  'w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';

const input    = (ph: string) => Object.assign(document.createElement('input'),    { className: inputCls, placeholder: ph });
const textarea = (ph: string) => Object.assign(document.createElement('textarea'), { className: inputCls, rows: 8, placeholder: ph });
const div      = (cls = '') => Object.assign(document.createElement('div'), { className: cls });
const button   = (txt: string, cls: string, cb: () => void) =>
  Object.assign(document.createElement('button'), {
    type: 'button', textContent: txt,
    className: `px-4 py-2 rounded hover:opacity-90 ${cls}`,
    onclick: cb
  });

const header = (b: string, c: string) =>
  `<p class="text-sm mb-2">Book <strong>${b}</strong> • Chapter <strong>${c}</strong></p>`;

const footer = (save: () => void) => {
  const wrap = div('flex justify-end space-x-2 mt-4');
  wrap.append(
    button('Cancel', 'bg-gray-300', close),
    button('Save',   'bg-green-600 text-white', save)
  );
  return wrap;
};

function pointBlock() {
  const wrap = div('p-3 border rounded bg-gray-50 dark:bg-gray-700 space-y-2');
  const lbl  = input('Main point…');
  const vrs  = input('Verse (opt)…');

  const sub = div('pl-4 space-y-2');
  sub.appendChild(button('＋ Sub-point', 'text-sm text-indigo-600',
    () => sub.appendChild(input('Sub-point…'))
  ));

  wrap.append(lbl, vrs, sub);
  return wrap;
}
function parsePoint(el: Element) {
  const [txt, vrs] = el.querySelectorAll<HTMLInputElement>('> input');
  const subs = Array.from(el.querySelectorAll<HTMLInputElement>('.pl-4 input'))
                    .map(s => s.value.trim()).filter(Boolean);
  return { text: txt.value.trim(), verse: vrs.value.trim(), subpoints: subs };
}
