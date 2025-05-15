// File: src/layout.ts
// Page Title: Expositor — Layout, Settings Drawer & Toast

import { $, id, button } from './utils/dom';
import {
  initFS,
  saveSettingKV,
  loadSettingKV,
  getBackend,
} from './storage';

/* ─────────────────────── Theme & sidebar toggles ─────────────────────── */
export function initToggles() {
  id('btn-toggle-theme').addEventListener('click', () =>
    document.documentElement.classList.toggle('dark'),
  );

  id('btn-toggle-sidebar').addEventListener('click', () =>
    id('sidebar').classList.toggle('hidden'),
  );
}

/* ─────────────────────── Column drag handles ─────────────────────────── */
export function initDraggable() {
  const h1 = id('drag-handle-1');
  const h2 = id('drag-handle-2');
  const cont = id('content');
  const sb = id('sidebar');
  const rp = id('right-panel');
  let drag: 'sidebar' | 'right' | null = null;

  const onMove = (e: MouseEvent) => {
    if (drag === 'sidebar') {
      sb.style.width =
        Math.min(Math.max(e.clientX, 150), cont.clientWidth - 200) + 'px';
    }
    if (drag === 'right') {
      const rect = cont.getBoundingClientRect();
      rp.style.width =
        Math.min(Math.max(rect.right - e.clientX, 200), rect.width - 150) + 'px';
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

/* ───────────────────────── Settings drawer ───────────────────────────── */
export function openSettings() {
  id('slide-drawer').classList.remove('translate-x-full');
  renderSettings();
}

export function initSettings() {
  id('btn-settings').addEventListener('click', openSettings);
}

/* ---------------------------------------------------------------------- */
/*                               DRAWER UI                                */
/* ---------------------------------------------------------------------- */

async function renderSettings() {
  id('drawer-title').textContent = 'Settings';
  const body = id('drawer-body');
  body.innerHTML = '';

  /* ────────────── Folder picker (robust) ────────────── */
  const folderBtn = button(
    'Choose Data Folder',
    'px-4 py-2 bg-indigo-600 text-white rounded mb-4',
    pickFolder,
  );

  /* Disable if File-System Access API unsupported */
  if (!('showDirectoryPicker' in window)) {
    folderBtn.disabled = true;
    folderBtn.classList.add('opacity-40', 'cursor-not-allowed');
    folderBtn.textContent = 'Folder picker unsupported (use Chromium)';
  }
  body.appendChild(folderBtn);

  /* ──────────────  ESV API key input + Save  ────────────── */
  const storedKey = (await loadSettingKV<string>('esvKey')) ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'mb-4';

  const label = document.createElement('label');
  label.className = 'block mb-2 text-sm';
  label.textContent = 'ESV API Key';
  wrapper.appendChild(label);

  const inp = document.createElement('input');
  inp.className = 'w-full p-2 border rounded bg-white dark:bg-gray-700';
  inp.placeholder = 'Paste ESV API key here';
  inp.value = storedKey;
  wrapper.appendChild(inp);

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.className =
    'mt-2 px-4 py-2 rounded ' +
    'bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed';
  wrapper.appendChild(saveBtn);

  /* Enable button only when value changed */
  const checkDirty = () =>
    (saveBtn.disabled = inp.value.trim() === storedKey.trim());
  inp.addEventListener('input', checkDirty);
  checkDirty();

  saveBtn.addEventListener('click', () => {
    const key = inp.value.trim();
    if (!key) {
      toast('Key cannot be empty', true);
      return;
    }
    saveSettingKV('esvKey', key);
    toast('ESV API key saved ✔︎');
    saveBtn.disabled = true;
  });

  body.appendChild(wrapper);
}

/* ---------------------------------------------------------------------- */
/*                          Folder-pick  handler                          */
/* ---------------------------------------------------------------------- */
async function pickFolder() {
  try {
    // @ts-ignore  File-System Access API
    const dir: FileSystemDirectoryHandle = await window.showDirectoryPicker();

    /* request read-write permission explicitly */
    const perm = await dir.requestPermission({ mode: 'readwrite' });
    if (perm !== 'granted') {
      toast('Folder permission denied', true);
      return;
    }

    await initFS(dir);
    toast('Folder linked ✔︎');
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      toast('No folder selected');
    } else if (err?.name === 'NotAllowedError') {
      toast('Folder permission denied', true);
    } else {
      console.error(err);
      toast('Unexpected error picking folder', true);
    }
  }
}

/* ─────────────────────────── Helpers ─────────────────────────────── */
export async function needsInitialSetup(): Promise<boolean> {
  const esvKey = (await loadSettingKV<string>('esvKey')) ?? '';
  return getBackend() === 'idb' || !esvKey;
}

function toast(msg: string, err = false) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.className =
    'fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow ' +
    (err ? 'bg-red-600 text-white' : 'bg-gray-800 text-white');
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
