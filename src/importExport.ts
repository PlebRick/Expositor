// src/importExport.ts  (FULL REPLACEMENT)
import { listFiles, readNote, writeNote } from './storage';
import { stringifyNote, parseNote } from './utils/markdown';
import { store } from './store';

/* worker setup */
const zipWorker = new Worker(
  new URL('./workers/zipWorker.ts', import.meta.url),
  { type: 'module' }
);

export function setupImportExport() {
  document.getElementById('btn-export')?.addEventListener('click', doExport);
  document.getElementById('btn-import')?.addEventListener('click', () => {
    const inp = Object.assign(document.createElement('input'), {
      type: 'file', accept: '.zip'
    });
    inp.addEventListener('change', () => {
      if (inp.files?.[0]) doImport(inp.files[0]);
    });
    inp.click();
  });
}

async function doExport() {
  const manifestResp = await fetch('/data/manifest.json');
  const manifest = await manifestResp.json() as Record<string, number>;
  const files: Record<string, string> = {};

  for (const [book, count] of Object.entries(manifest)) {
    for (let c = 1; c <= count; c++) {
      for (const f of await listFiles(book, String(c))) {
        const note = await readNote(f);
        files[`${book}/${c}/${f.name}`] = stringifyNote(note);
      }
    }
  }

  zipWorker.postMessage({ type: 'export', payload: { files } });
  zipWorker.onmessage = ({ data }) => {
    const blob = new Blob([data.buffer], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'expositor-notes.zip';
    a.click();
    URL.revokeObjectURL(url);
  };
}

async function doImport(file: File) {
  const buf = await file.arrayBuffer();
  zipWorker.postMessage({ type: 'import', payload: buf }, [buf]);
  zipWorker.onmessage = async ({ data }) => {
    if (!data.ok) {
      alert(`Import failed: ${data.error}`); return;
    }
    for (const [path, md] of Object.entries(data.files as Record<string, string>)) {
      const [book, chap, filename] = path.split('/');
      await writeNote({ kind: 'file', name: path }, parseNote(md)); // stub handle
    }
    alert('Import complete – refresh chapter to see changes 🔄');
  };
}
