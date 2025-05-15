//src/renderers/chapter.ts

/* UI-shell logic: theme toggle, sidebar drag, Settings drawer & helpers */

import { $, id, button } from './utils/dom';
import { initFS, saveSettingKV, loadSettingKV } from './storage';

/* ────────────────────────── Theme & sidebar toggle ───────────────────────── */

export function initToggles() {
  /* dark / light */
  id('btn-toggle-theme').addEventListener('click', () =>
    document.documentElement.classList.toggle('dark')
  );

  /* sidebar show / hide */
  id('btn-toggle-sidebar').addEventListener('click', () =>
    id('sidebar').classList.toggle('hidden')
  );
}

/* ───────────────────────────── Column drag handles ───────────────────────── */

export function initDraggable() {
  const h1 = id('drag-handle-1');
  const h2 = id('drag-handle-2');
  const cont = id('content');
  const sb   = id('sidebar');
  const rp   = id('right-panel');
  let drag: 'sidebar' | 'right' | null = null;

  const onMove = (e: MouseEvent) => {
    if (drag === 'sidebar') {
      sb.style.width = Math.min(Math.max(e.clientX, 150), cont.clientWidth - 200) + 'px';
    }
    if (drag === 'right') {
      const rect = cont.getBoundingClientRect();
      rp.style.width = Math.min(Math.max(rect.right - e.clientX, 200), rect.width - 150) + 'px';
    }
  };
  const onUp = () => {
    drag = null;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  const onDown = (area: 'sidebar' | 'right') => {
    drag = area;
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  h1.addEventListener('mousedown', () => onDown('sidebar'));
  h2.addEventListener('mousedown', () => onDown('right'));
}

/* ───────────────────────────── Settings drawer ───────────────────────────── */

/** Public helper so other modules (e.g. chapter renderer) can open Settings */
export function openSettings() {
  id('slide-drawer').classList.remove('translate-x-full');
  renderSettings();             // internal fn below
}

export function initSettings() {
  id('btn-settings').addEventListener('click', openSettings);
}

/* Main render-function for the Settings drawer */
async function renderSettings() {
  id('drawer-title').textContent = 'Settings';
  const body = id('drawer-body');
  body.innerHTML = '';

  /* data-folder picker button */
  body.appendChild(
    button('Choose Data Folder', 'px-4 py-2 bg-indigo-600 text-white rounded mb-4', async () => {
      try {
        // @ts-ignore  File-System Access API
        const dir = await window.showDirectoryPicker();
        await initFS(dir);
        toast('Folder linked ✔︎  (data will now save as Markdown files)');
      } catch { toast('Folder access was denied', 'error'); }
    })
  );

  /* ─────────── ESV API key input + Save button ─────────── */

  const current = (await loadSettingKV<string>('esvKey')) ?? '';
  let dirty = false;

  const wrapper = document.createElement('div');
  wrapper.className = 'mb-4';

  const label = document.createElement('label');
  label.className = 'block text-sm mb-1';
  label.textContent = 'ESV API Key';
  wrapper.appendChild(label);

  const inp = document.createElement('input');
  inp.className =
    'w-full p-2 border rounded bg-white dark:bg-gray-700 mb-2 focus:outline-none focus:ring';
  inp.placeholder = 'Paste ESV API key here';
  inp.value = current;
  wrapper.appendChild(inp);

  const saveBtn = button(
    'Save key',
    'px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-40',
    () => {
      saveSettingKV('esvKey', inp.value.trim());
      toast('ESV API key saved');
      dirty = false;
      saveBtn.disabled = true;
    }
  );
  saveBtn.disabled = true;                // disabled until the user edits
  wrapper.appendChild(saveBtn);
  body.appendChild(wrapper);

  inp.addEventListener('input', () => {
    dirty = true;
    saveBtn.disabled = false;
  });
}

/* ──────────────────────────── Toast utilities ────────────────────────────── */

function toast(msg: string, type: 'info' | 'error' = 'info') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.className =
    'fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow ' +
    (type === 'error'
      ? 'bg-red-600 text-white'
      : 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
