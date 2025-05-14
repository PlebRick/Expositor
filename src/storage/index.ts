// src/storage/index.ts  (FULL REPLACEMENT)
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
import { AnyNote } from '../models';
import { stringifyNote } from '../utils/markdown';

export type StorageBackend = 'fs' | 'idb';
let backend: StorageBackend = 'idb';

/*──────────────────────────────────────────────────────────────────*/
export async function initFS(handle: FileSystemDirectoryHandle) {
  FSStorage.init(handle);
  backend = 'fs';
}

/*──────────── unified read/list/delete for existing files ─────────*/
export async function listFiles(book: string, chap: string) {
  if (backend === 'fs') return fsList(book, chap);

  const db = await dbPromise;
  const keys = await db.getAllKeys('notes');
  const prefix = `${book}/${chap}/`;
  return keys
    .filter(k => k.startsWith(prefix))
    .map(k => ({ kind: 'file', name: k }));
}

export async function readNote(handleOrStub: any) {
  return backend === 'fs'
    ? fsRead(handleOrStub)
    : idbRead(handleOrStub.name);
}

export async function writeNote(handleOrStub: any, note: AnyNote) {
  return backend === 'fs'
    ? fsWrite(handleOrStub, note)
    : idbWrite(handleOrStub.name, stringifyNote(note));
}

export async function deleteNote(handleOrStub: any) {
  return backend === 'fs'
    ? fsDelete(handleOrStub)
    : idbDelete(handleOrStub.name);
}

/*──────────── create brand-new file from a note object ────────────*/
export async function createNote(
  book: string,
  chap: string,
  note: AnyNote
) {
  const fileName = makeFileName(note);
  if (backend === 'fs') {
    /* create empty file then write */
    const root = await (window as any).expositorFS as FileSystemDirectoryHandle;
    const bookDir = await root.getDirectoryHandle(book, { create: true });
    const chapDir = await bookDir.getDirectoryHandle(chap, { create: true });
    const handle = await chapDir.getFileHandle(fileName, { create: true });
    await fsWrite(handle, note);
    return handle;
  } else {
    const key = `${book}/${chap}/${fileName}`;
    return idbWrite(key, stringifyNote(note));
  }
}

function makeFileName(note: AnyNote) {
  const clean = note.range.replace(/\s+/g, '');
  return `${note.type}-${clean}.md`;
}
