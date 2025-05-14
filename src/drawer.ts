// src/drawer.ts  (FULL REPLACEMENT)
import { createNote } from './storage';
import { store } from './store';
import { OutlineNote, ManuscriptNote, CommentaryNote } from './models';
import { renderOutlineTab } from './renderers/outline';
import { renderManuscriptTab } from './renderers/manuscript';
import { renderCommentaryTab } from './renderers/commentary';

/* wire buttons --------------------------------------------------- */
export function initDrawerLogic() {
  id('btn-open-outline')   ?.addEventListener('click', () => openDrawer('outline'));
  id('btn-open-manuscript')?.addEventListener('click', () => openDrawer('manuscript'));
  id('btn-open-commentary')?.addEventListener('click', () => openDrawer('commentary'));
  id('btn-close-drawer')   ?.addEventListener('click', closeDrawer);
}

type Mode = 'outline' | 'manuscript' | 'commentary';

function openDrawer(mode: Mode) {
  id('slide-drawer')!.classList.remove('translate-x-full');
  const { book, chapter } = store.snapshot;

  if (mode === 'outline')      renderOutlineForm(book, chapter);
  else if (mode === 'manuscript') renderManuscriptForm(book, chapter);
  else                           renderCommentaryForm(book, chapter);
}

function closeDrawer() {
  id('slide-drawer')!.classList.add('translate-x-full');
}

/*─────────────── OUTLINE FORM ───────────────────────────────────*/
function renderOutlineForm(book: string, chap: string) {
  id('drawer-title')!.textContent = 'New Outline';
  const body = id('drawer-body')!;
  body.innerHTML = formHeader(book, chap);

  const ti = input('Outline Title…');
  const ri = input('Verse Range…');

  const pointsDiv = div('space-y-4 mb-4');
  const addPt = button('＋ Add Main Point', 'bg-indigo-600 text-white', () => {
    pointsDiv.appendChild(pointBlock());
  });

  body.append(ti, ri, pointsDiv, addPt, formFooter(async () => {
    const items = Array.from(pointsDiv.children).map(parsePoint);
    const note: OutlineNote = {
      type: 'outline',
      title: ti.value.trim(),
      range: ri.value.trim(),
      items
    };
    await createNote(book, chap, note);
    closeDrawer();
    renderOutlineTab(book, chap);
  }));
}

/*─────────────── MANUSCRIPT FORM ────────────────────────────────*/
function renderManuscriptForm(book: string, chap: string) {
  id('drawer-title')!.textContent = 'New Manuscript';
  const body = id('drawer-body')!;
  body.innerHTML = formHeader(book, chap);

  const ti = input('Manuscript Title…');
  const ri = input('Verse Range…');
  const ta = textarea('Content…');

  body.append(ti, ri, ta, formFooter(async () => {
    const note: ManuscriptNote = {
      type: 'manuscript',
      title: ti.value.trim(),
      range: ri.value.trim(),
      content: ta.value.trim()
    };
    await createNote(book, chap, note);
    closeDrawer();
    renderManuscriptTab(book, chap);
  }));
}

/*─────────────── COMMENTARY FORM ────────────────────────────────*/
function renderCommentaryForm(book: string, chap: string) {
  id('drawer-title')!.textContent = 'New Commentary';
  const body = id('drawer-body')!;
  body.innerHTML = formHeader(book, chap);

  const ti = input('Commentary Title…');
  const ri = input('Verse Range…');
  const ta = textarea('Commentary…');

  body.append(ti, ri, ta, formFooter(async () => {
    const note: CommentaryNote = {
      type: 'commentary',
      title: ti.value.trim(),
      range: ri.value.trim(),
      content: ta.value.trim()
    };
    await createNote(book, chap, note);
    closeDrawer();
    renderCommentaryTab(book, chap);
  }));
}

/*──────── helpers ───────────────────────────────────────────────*/
const inputCls = 'w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';

function id(id: string) { return document.getElementById(id)!; }
const input = (ph: string) => Object.assign(document.createElement('input'), { className: inputCls, placeholder: ph });
const textarea = (ph: string) => Object.assign(document.createElement('textarea'), { rows: 8, className: inputCls, placeholder: ph });
const div = (cls='') => Object.assign(document.createElement('div'), { className: cls });
const button = (txt: string, cls: string, cb: () => void) =>
  Object.assign(document.createElement('button'), {
    type: 'button', textContent: txt,
    className: `px-4 py-2 rounded hover:opacity-90 ${cls}`,
    onclick: cb
  });

function formHeader(book: string, chap: string) {
  return `<p class="text-sm mb-2">Book: <strong>${book}</strong> • Chapter: <strong>${chap}</strong></p>`;
}
function formFooter(saveCb: () => void) {
  const box = div('flex justify-end space-x-2 mt-4');
  box.append(button('Cancel', 'bg-gray-300', closeDrawer),
             button('Save',   'bg-green-600 text-white', saveCb));
  return box;
}

/* main-point block with sub-points UI */
function pointBlock() {
  const wrap = div('p-3 border rounded bg-gray-50 dark:bg-gray-700 space-y-2');
  const lbl = input('Main point…');
  const vrs = input('Verse (opt)…');

  const sc = div('pl-4 space-y-2');
  sc.appendChild(button('＋ Sub-point', 'text-sm text-indigo-600', () => {
    sc.appendChild(input('Sub-point…'));
  }));

  wrap.append(lbl, vrs, sc);
  return wrap;
}
function parsePoint(div: Element) {
  const [txtInp, vrsInp] = div.querySelectorAll<HTMLInputElement>('input');
  const subs = Array.from(div.querySelectorAll('.pl-4 input'))
    .map(i => i.value.trim())
    .filter(Boolean);
  return { text: txtInp.value.trim(), verse: vrsInp.value.trim(), subpoints: subs };
}
