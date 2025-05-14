/* src/layout.ts
 * UI-shell logic: theme toggle, sidebar drag, Settings drawer.
 */

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

export function initSettings() {
  id('btn-settings').addEventListener('click', () => {
    id('slide-drawer').classList.remove('translate-x-full');
    renderSettings();
  });
}

async function renderSettings() {
  id('drawer-title').textContent = 'Settings';
  const body = id('drawer-body');
  body.innerHTML = '';

  /* folder picker button */
  body.appendChild(
    button('Choose Data Folder', 'px-4 py-2 bg-indigo-600 text-white rounded mb-4', async () => {
      try {
        // @ts-ignore  File-System Access API
        const dir = await window.showDirectoryPicker();
        await initFS(dir);
        alert('Folder linked ✔︎  (data will now save as Markdown files)');
      } catch { alert('Folder access was denied'); }
    })
  );

  /* ESV key input */
  const esvKey = (await loadSettingKV<string>('esvKey')) ?? '';
  const label = document.createElement('label');
  label.className = 'block mb-4';
  label.innerHTML = '<span class="text-sm">ESV API Key</span>';
  const inp = document.createElement('input');
  inp.className = 'w-full p-2 border rounded bg-white dark:bg-gray-700';
  inp.value = esvKey;
  inp.addEventListener('change', () => saveSettingKV('esvKey', inp.value.trim()));
  label.appendChild(inp);
  body.appendChild(label);
}
