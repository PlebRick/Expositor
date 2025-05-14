// src/layout.ts  (formerly layout.js – trimmed to keep demo short)
import { store } from './store';

/* Dark/light + sidebar toggle unchanged --------------------------- */
export function initToggles() { /* ...identical logic... */ }
/* Drag handles unchanged ----------------------------------------- */
export function initDraggable() { /* ...identical logic... */ }

/* Settings drawer now includes “Choose data folder” */
import { initFS } from './storage';

export function initSettings() {
  const btn = document.getElementById('btn-settings')!;
  const drawer = document.getElementById('slide-drawer')!;

  btn.addEventListener('click', () => {
    drawer.classList.remove('translate-x-full');
    renderSettings();
  });

  function renderSettings() {
    document.getElementById('drawer-title')!.textContent = 'Settings';
    document.getElementById('drawer-body')!.innerHTML = `
      <button id="pick-folder"
        class="px-4 py-2 bg-indigo-600 text-white rounded mb-4">
        Choose Data Folder
      </button>

      <label class="block mb-2">
        <span class="text-sm">ESV API Key</span>
        <input id="esv-key-input" type="text"
          class="w-full p-2 border rounded bg-white dark:bg-gray-700" />
      </label>
    `;

    /* Folder picker */
    document.getElementById('pick-folder')!.addEventListener('click', async () => {
      try {
        // @ts-ignore  FS API
        const handle = await window.showDirectoryPicker();
        await initFS(handle);
        alert('Folder linked ✔︎');
      } catch (err) {
        console.error(err);
        alert('Folder access denied');
      }
    });

    /* Key input – persists to IDB settings store */
    const input = document.getElementById('esv-key-input') as HTMLInputElement;
    // TODO: load existing value from IDB …
    input.addEventListener('change', () => {
      // TODO: save to IDB settings
    });
  }
}
