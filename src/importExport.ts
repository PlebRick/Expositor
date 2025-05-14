/* src/importExport.ts */

import { listFiles, readNote, writeNote } from './storage';
import { parseNote, stringifyNote }       from './utils/markdown';
import { AnyNote }                        from './models';
import { toast }                          from './utils/toast';

/*───────────────── Web-worker boot ─────────────────────────────*/
const zipWorker = new Worker(
  new URL('./workers/zipWorker.ts', import.meta.url),
  { type: 'module' }
);

type ZipOk   = { ok: true;  buffer: Uint8Array };
type UnzipOk = { ok: true;  files: Record<string, string> };
type Fail    = { ok: false };

function zip(files: Record<string, string>): Promise<Uint8Array> {
  return new Promise((res, rej) => {
    zipWorker.onmessage = (e: MessageEvent<ZipOk | Fail>) =>
      e.data.ok ? res(e.data.buffer) : rej(new Error('zip failed'));
    zipWorker.postMessage({ cmd: 'zip', files });
  });
}

function unzip(buf: Uint8Array): Promise<Record<string, string>> {
  return new Promise((res, rej) => {
    zipWorker.onmessage = (e: MessageEvent<UnzipOk | Fail>) =>
      e.data.ok ? res(e.data.files) : rej(new Error('unzip failed'));
    zipWorker.postMessage({ cmd: 'unzip', buffer: buf });
  });
}

/*───────────────── Public init (hook buttons) ─────────────────*/
export function initImportExportButtons() {
  const impBtn = document.getElementById('btn-import');
  const expBtn = document.getElementById('btn-export');
  if (!impBtn || !expBtn) return;

  /* hidden file picker */
  const pickZip = Object.assign(document.createElement('input'), {
    type: 'file',
    accept: '.zip',
    className: 'hidden',
  });
  document.body.appendChild(pickZip);

  /* EXPORT ----------------------------------------------------*/
  expBtn.addEventListener('click', async () => {
    try {
      toast('Building ZIP…');
      const files = await collectAllNotes();
      const buf   = await zip(files);
      const blob  = new Blob([buf], { type: 'application/zip' });
      const url   = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), {
        href: url,
        download: 'expositor-notes.zip',
      }).click();
      URL.revokeObjectURL(url);
      toast('✅ ZIP downloaded');
    } catch (err) {
      console.error(err);
      toast('❌ Export failed');
    }
  });

  /* IMPORT ----------------------------------------------------*/
  impBtn.addEventListener('click', () => pickZip.click());
  pickZip.addEventListener('change', async () => {
    const file = pickZip.files?.[0];
    if (!file) return;

    try {
      toast('Importing…');
      const files = await unzip(new Uint8Array(await file.arrayBuffer()));
      let count   = 0;
      for (const [path, md] of Object.entries(files)) {
        const note = parseNote(md);
        if (!note) continue;                     // skip malformed
        await writeNote({ name: path } as any, note);
        count++;
      }
      toast(`✅ Imported ${count} notes`);
    } catch (err) {
      console.error(err);
      toast('❌ Import failed');
    } finally {
      pickZip.value = '';
    }
  });
}

/*───────────────── Helpers ────────────────────────────────────*/
async function collectAllNotes() {
  const manifest = (window as any).manifest as Record<string, number>;
  const out: Record<string, string> = {};

  for (const [book, total] of Object.entries(manifest)) {
    for (let c = 1; c <= total; c++) {
      const chap = c.toString();
      for (const f of await listFiles(book, chap)) {
        const raw    = await readNote(f);
        const parsed = parseNote(raw ?? '');
        if (!parsed) continue;                   // skip if unparsable
        const key    = `${book}/${chap}/${f.name}`;
        out[key]     = stringifyNote(parsed as AnyNote);
      }
    }
  }
  return out;
}
