// src/storage/index.ts  (NEW – runtime adapter selector)
import {
  FSStorage,
  listFiles as fsList,
  readNote as fsRead,
  writeNote as fsWrite,
  deleteNote as fsDelete,
} from './fs';
import {
  loadNote as idbRead,
  saveNote as idbWrite,
  deleteNote as idbDelete,
  dbPromise,
} from './idb';

export type StorageBackend = 'fs' | 'idb';

let backend: StorageBackend = 'idb'; // default

export async function initFS(handle: FileSystemDirectoryHandle) {
  FSStorage.init(handle);
  backend = 'fs';
}

/* ------------------------------------------------------------------ */
/*           Unified API the rest of the app will import              */
/* ------------------------------------------------------------------ */

export async function listFiles(book: string, chap: string) {
  if (backend === 'fs') return fsList(book, chap);
  // IndexedDB stores one record per file key – synthesize fake handles:
  const db = await dbPromise;
  const keys = await db.getAllKeys('notes');
  const prefix = `${book}/${chap}/`;
  return keys
    .filter((k) => k.startsWith(prefix))
    .map((k) => ({ kind: 'file', name: k })); // lightweight stub
}

export async function readNote(pathOrHandle: any) {
  if (backend === 'fs') return fsRead(pathOrHandle);
  return idbRead(pathOrHandle.name);
}

export async function writeNote(pathOrHandle: any, markdown: string) {
  if (backend === 'fs') return fsWrite(pathOrHandle, markdown);
  return idbWrite(pathOrHandle.name, markdown);
}

export async function deleteNote(pathOrHandle: any) {
  if (backend === 'fs') return fsDelete(pathOrHandle);
  return idbDelete(pathOrHandle.name);
}
