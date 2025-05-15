// File: src/drawer.ts
// Page Title: Expositor — Drawer Forms (timestamps, robust save, feedback)

import { createNote } from './storage';
import { store } from './store';
import { OutlineNote, ManuscriptNote, CommentaryNote } from './models';
import { renderOutlineTab } from './renderers/outline';
import { renderManuscriptTab } from './renderers/manuscript';
import { renderCommentaryTab } from './renderers/commentary';
import { id } from './utils/dom';

/* ───────────────────── mini-toast helper ───────────────────── */
const toast = (msg: string, err = false) => {
  const t = document.createElement('div');
  t.textContent = msg;
  t.className =
    'fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow ' +
    (err ? 'bg-red-600 text-white' : 'bg-gray-800 text-white');
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
};

/* ─────────────────── wire drawer buttons ─────────────────── */
export function initDrawerLogic() {
  id('btn-open-outline')?.addEventListener('click', () => open('outline'));
  id('btn-open-manuscript')?.addEventListener('click', () => open('manuscript'));
  id('btn-open-commentary')?.addEventListener('click', () => open('commentary'));
  id('btn-close-drawer')?.addEventListener('click', close);
}

type Mode = 'outline' | 'manuscript' | 'commentary';

function open(mode: Mode) {
  id('slide-drawer').classList.remove('translate-x-full');
  const { book, chapter } = store.snapshot;
  if (mode === 'outline')         renderOutlineForm(book, chapter);
  else if (mode === 'manuscript') renderManuscriptForm(book, chapter);
  else                            renderCommentaryForm(book, chapter);
}
function close() {
  id('slide-drawer').classList.add('translate-x-full');
}

/* ────────────────────── OUTLINE FORM ─────────────────────── */
function renderOutlineForm(book: string, chap: string) {
  id('drawer-title').textContent = 'New Outline';
  const body = id('drawer-body');
  body.innerHTML = header(book, chap);

  const titleInp = input('Outline Title…');
  const rangeInp = input('Verse Range…');

  const pointsDiv = div('space-y-4 mb-4');
  const addMain = button('＋ Add Main Point', 'bg-indigo-600 text-white', () =>
    pointsDiv.appendChild(pointBlock()),
  );

  body.append(titleInp, rangeInp, pointsDiv, addMain, footer(async () => {
    try {
      if (!titleInp.value.trim()) throw new Error('Title required');
      if (!rangeInp.value.trim()) throw new Error('Range required');

      const items = Array.from(pointsDiv.children).map(parsePoint);
      const now = new Date().toISOString();
      const note: OutlineNote = {
        type   : 'outline',
        title  : titleInp.value.trim(),
        range  : rangeInp.value.trim(),
        items,
        created: now,
        updated: now,
      };

      await createNote(book, chap, note);
      toast('Saved ✔︎');
      close();
      renderOutlineTab(book, chap);
    } catch (err) {
      console.error('Outline save failed', err);
      toast((err as Error).message || 'Save failed', true);
    }
  }));
}

/* ──────────────────── MANUSCRIPT FORM ────────────────────── */
function renderManuscriptForm(book: string, chap: string) {
  id('drawer-title').textContent = 'New Manuscript';
  const body = id('drawer-body');
  body.innerHTML = header(book, chap);

  const titleInp = input('Manuscript Title…');
  const rangeInp = input('Verse Range…');
  const ta       = textarea('Content…');

  body.append(titleInp, rangeInp, ta, footer(async () => {
    try {
      if (!titleInp.value.trim()) throw new Error('Title required');

      const now = new Date().toISOString();
      const note: ManuscriptNote = {
        type   : 'manuscript',
        title  : titleInp.value.trim(),
        range  : rangeInp.value.trim(),
        content: ta.value.trim(),
        created: now,
        updated: now,
      };

      await createNote(book, chap, note);
      toast('Saved ✔︎');
      close();
      renderManuscriptTab(book, chap);
    } catch (err) {
      console.error('Manuscript save failed', err);
      toast((err as Error).message || 'Save failed', true);
    }
  }));
}

/* ──────────────────── COMMENTARY FORM ───────────────────── */
function renderCommentaryForm(book: string, chap: string) {
  id('drawer-title').textContent = 'New Commentary';
  const body = id('drawer-body');
  body.innerHTML = header(book, chap);

  const titleInp = input('Commentary Title…');
  const rangeInp = input('Verse Range…');
  const ta       = textarea('Commentary…');

  body.append(titleInp, rangeInp, ta, footer(async () => {
    try {
      if (!titleInp.value.trim()) throw new Error('Title required');

      const now = new Date().toISOString();
      const note: CommentaryNote = {
        type   : 'commentary',
        title  : titleInp.value.trim(),
        range  : rangeInp.value.trim(),
        content: ta.value.trim(),
        created: now,
        updated: now,
      };

      await createNote(book, chap, note);
      toast('Saved ✔︎');
      close();
      renderCommentaryTab(book, chap);
    } catch (err) {
      console.error('Commentary save failed', err);
      toast((err as Error).message || 'Save failed', true);
    }
  }));
}

/* ───────────────────────── helpers ───────────────────────── */
const inputCls =
  'w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';

const input = (ph: string) =>
  Object.assign(document.createElement('input'), {
    className : inputCls,
    placeholder: ph,
  });

const textarea = (ph: string) =>
  Object.assign(document.createElement('textarea'), {
    className : inputCls,
    rows      : 8,
    placeholder: ph,
  });

const div = (cls = '') =>
  Object.assign(document.createElement('div'), { className: cls });

const button = (txt: string, cls: string, cb: () => void) =>
  Object.assign(document.createElement('button'), {
    type      : 'button',
    textContent: txt,
    className : `px-4 py-2 rounded hover:opacity-90 ${cls}`,
    onclick   : cb,
  });

const header = (b: string, c: string) =>
  `<p class="text-sm mb-2">Book <strong>${b}</strong> • Chapter <strong>${c}</strong></p>`;

const footer = (save: () => void) => {
  const wrap = div('flex justify-end space-x-2 mt-4');
  wrap.append(
    button('Cancel', 'bg-gray-300', close),
    button('Save',   'bg-green-600 text-white', save),
  );
  return wrap;
};

/* ─── outline point builder ─── */
function pointBlock() {
  const wrap = div('p-3 border rounded bg-gray-50 dark:bg-gray-700 space-y-2');
  const lbl  = input('Main point…');
  const vrs  = input('Verse (opt)…');

  const sub = div('pl-4 space-y-2');
  sub.appendChild(
    button('＋ Sub-point', 'text-sm text-indigo-600', () =>
      sub.appendChild(input('Sub-point…')),
    ),
  );

  wrap.append(lbl, vrs, sub);
  return wrap;
}

/* safer parsePoint: avoids unsupported :scope selectors */
function parsePoint(el: Element) {
  /* direct children inputs */
  const directInputs = Array.from(el.children).filter(
    (n) => n.tagName === 'INPUT',
  ) as HTMLInputElement[];

  const txt  = directInputs[0]?.value.trim() ?? '';
  const verse = directInputs[1]?.value.trim() ?? '';

  const subs = Array.from(
    el.querySelectorAll<HTMLInputElement>('.pl-4 input'),
  )
    .map((s) => s.value.trim())
    .filter(Boolean);

  return { text: txt, verse, subpoints: subs };
}
