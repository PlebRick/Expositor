// src/storage/index.ts   (FINAL, complete replacement)
import { FSStorage } from './fs';
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

/*────────────────────── switch to FS mode ───────────────────────*/
export function initFS(handle: FileSystemDirectoryHandle) {
  FSStorage.init(handle);
  backend = 'fs';
}

/*────────────────────── list chapter files ──────────────────────*/
export async function listFiles(book: string, chap: string) {
  if (backend === 'fs') return FSStorage.listFiles(book, chap);

  const db = await dbPromise;
  const keys = await db.getAllKeys('notes');
  const prefix = `${book}/${chap}/`;
  return keys
    .filter(k => k.startsWith(prefix))
    .map(k => ({ kind: 'file', name: k }));
}

/*────────────────────── read / write / delete ───────────────────*/
export async function readNote(handleOrStub: any) {
  return backend === 'fs'
    ? FSStorage.readNote(handleOrStub)
    : idbRead(handleOrStub.name);
}

export async function writeNote(handleOrStub: any, note: AnyNote) {
  return backend === 'fs'
    ? FSStorage.writeNote(handleOrStub, note)
    : idbWrite(handleOrStub.name, stringifyNote(note));
}

export async function deleteNote(handleOrStub: any) {
  return backend === 'fs'
    ? FSStorage.deleteNote(handleOrStub)
    : idbDelete(handleOrStub.name);
}

/*────────────────────── create new note file ────────────────────*/
export async function createNote(
  book: string,
  chap: string,
  note: AnyNote
) {
  const fileName = makeFileName(note);

  if (backend === 'fs') {
    const root = (window as any).expositorFS as FileSystemDirectoryHandle;
    if (!root) throw new Error('No folder chosen (open Settings → Choose Data Folder)');
    const bookDir = await root.getDirectoryHandle(book, { create: true });
    const chapDir = await bookDir.getDirectoryHandle(chap, { create: true });
    const handle  = await chapDir.getFileHandle(fileName, { create: true });
    await FSStorage.writeNote(handle, note);
    return handle;
  }

  const key = `${book}/${chap}/${fileName}`;
  return idbWrite(key, stringifyNote(note));
}

function makeFileName(note: AnyNote) {
  const clean = note.range.replace(/\s+/g, '');
  return `${note.type}-${clean}.md`;
}
