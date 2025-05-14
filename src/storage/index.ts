// src/storage/index.ts  (NEW – adapter selector)
import {
  FSStorage,
  listFiles as fsList,
  readNote as fsRead,
  writeNote as fsWrite,
  deleteNote as fsDelete
} from './fs';
import {
  loadNote as idbRead,
  saveNote as idbWrite,
  deleteNote as idbDelete,
  dbPromise
} from './idb';

export type StorageBackend = 'fs' | 'idb';
let backend: StorageBackend = 'idb';

/* Initialise FS mode after folder picker */
export async function initFS(handle: FileSystemDirectoryHandle) {
  FSStorage.init(handle);
  backend = 'fs';
}

/* Unified helpers ---------------------------------------------------------------- */

export async function listFiles(book: string, chap: string) {
  if (backend === 'fs') return fsList(book, chap);

  /* synthesize stub handles from IndexedDB keys */
  const db = await dbPromise;
  const keys = await db.getAllKeys('notes');
  const prefix = `${book}/${chap}/`;
  return keys
    .filter(k => k.startsWith(prefix))
    .map(k => ({ kind: 'file', name: k }));
}

export async function readNote(handleOrStub: any) {
  if (backend === 'fs') return fsRead(handleOrStub);
  return idbRead(handleOrStub.name);
}

export async function writeNote(handleOrStub: any, markdown: string) {
  if (backend === 'fs') return fsWrite(handleOrStub, markdown);
  return idbWrite(handleOrStub.name, markdown);
}

export async function deleteNote(handleOrStub: any) {
  if (backend === 'fs') return fsDelete(handleOrStub);
  return idbDelete(handleOrStub.name);
}
