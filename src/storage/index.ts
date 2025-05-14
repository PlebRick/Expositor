/* src/storage/index.ts — COMPLETE REPLACEMENT
 * Facade over File-System and IndexedDB back-ends.
 */

import { FSStorage } from './fs';
import {
  loadNote   as idbRead,
  saveNote   as idbWrite,
  deleteNote as idbDelete,
  noteExists as idbExists,
  dbPromise,                         // exported in idb.ts
  saveSetting as saveSettingKV,
  loadSetting as loadSettingKV
} from './idb';

import { AnyNote }        from '../models';
import { stringifyNote }  from '../utils/markdown';

export type StorageBackend = 'fs' | 'idb';
let backend: StorageBackend = 'idb';

/*───────────────────────────────────────────────────────────────────
  Switch to File-System Access API mode after the user picks a folder
  ───────────────────────────────────────────────────────────────────*/
export function initFS(handle: FileSystemDirectoryHandle) {
  FSStorage.init(handle);
  backend = 'fs';
  (window as any).expositorFS = handle;         // devtools convenience
}

/*──────────────────────── list chapter files ──────────────────────*/
export async function listFiles(book: string, chap: string) {
  if (backend === 'fs') return FSStorage.listFiles(book, chap);

  const db      = await dbPromise;
  const allKeys = (await db.getAllKeys('notes')) as string[];
  const prefix  = `${book}/${chap}/`;

  return allKeys
    .filter((k: string) => k.startsWith(prefix))
    .map((k: string) => ({ kind: 'file' as const, name: k }));
}

/*──────────────────────── read / write / delete ───────────────────*/
export const readNote = async (h: { name: string } | FileSystemFileHandle) =>
  backend === 'fs'
    ? FSStorage.readNote(h as FileSystemFileHandle)
    : idbRead((h as { name: string }).name);

export const deleteNote = async (h: { name: string } | FileSystemFileHandle) =>
  backend === 'fs'
    ? FSStorage.deleteNote(h as FileSystemFileHandle)
    : idbDelete((h as { name: string }).name);

export const writeNote = async (
  h: { name: string } | FileSystemFileHandle,
  note: AnyNote
) =>
  backend === 'fs'
    ? FSStorage.writeNote(h as FileSystemFileHandle, note)
    : idbWrite((h as { name: string }).name, stringifyNote(note));

/*────────────────────────── create new note ───────────────────────*/
export async function createNote(
  book: string,
  chap: string,
  note: AnyNote
) {
  const fileName = await nextSlug(book, chap, note);

  if (backend === 'fs') {
    const root    = (window as any).expositorFS as FileSystemDirectoryHandle;
    const bookDir = await root.getDirectoryHandle(book, { create: true });
    const chapDir = await bookDir.getDirectoryHandle(chap, { create: true });
    const handle  = await chapDir.getFileHandle(fileName, { create: true });
    await FSStorage.writeNote(handle, note);
    return handle;
  }

  const key = `${book}/${chap}/${fileName}`;
  await idbWrite(key, stringifyNote(note));
  return { name: key };
}

/*──────── ensure unique slug when duplicate ranges exist ─────────*/
async function nextSlug(book: string, chap: string, note: AnyNote) {
  const base   = `${note.type}-${note.range.replace(/\s+/g, '')}`;
  let   file   = `${base}.md`;
  let   index  = 1;

  const exists = async (f: string) =>
    backend === 'fs'
      ? FSStorage.fileExists(book, chap, f)
      : idbExists(`${book}/${chap}/${f}`);

  while (await exists(file)) file = `${base}-${index++}.md`;
  return file;
}

/*────────────────────── settings helpers ─────────────────────────*/
export { saveSettingKV, loadSettingKV };
