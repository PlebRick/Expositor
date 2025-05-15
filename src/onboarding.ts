// File: src/onboarding.ts
// Page Title: Expositor — File-System Onboarding Banner

import { getBackend, initFS } from './storage';

/** Shows a banner prompting for a data folder if still on IndexedDB. */
export function initOnboarding() {
  if (getBackend() === 'fs') return;                      // already good
  if (localStorage.getItem('skipFolderPrompt') === 'yes') return;

  const banner = document.createElement('div');
  banner.id = 'folder-banner';
  banner.className =
    'fixed bottom-4 left-1/2 -translate-x-1/2 ' +
    'bg-indigo-600 text-white px-4 py-2 rounded shadow flex gap-3 items-center';
  banner.innerHTML = `
    <span>Choose a folder to save notes as Markdown files.</span>
    <button id="btn-pick-folder"
            class="bg-white text-indigo-600 px-3 py-1 rounded">Pick Folder</button>
    <button id="btn-skip-folder"
            class="opacity-70 hover:opacity-100 text-sm underline">Skip for now</button>`;

  document.body.appendChild(banner);

  const toast = (msg: string, err = false) => {
    const t = document.createElement('div');
    t.textContent = msg;
    t.className =
      'fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow ' +
      (err ? 'bg-red-600 text-white' : 'bg-gray-800 text-white');
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  };

  /* Folder picker */
  document.getElementById('btn-pick-folder')?.addEventListener('click', async () => {
    try {
      // @ts-ignore  File-System Access API
      const dir = await window.showDirectoryPicker();
      await initFS(dir);
      toast('Folder linked ✔︎');
      banner.remove();
    } catch {
      toast('Folder access was denied', true);
    }
  });

  /* Skip button */
  document.getElementById('btn-skip-folder')?.addEventListener('click', () => {
    localStorage.setItem('skipFolderPrompt', 'yes');
    banner.remove();
  });
}
