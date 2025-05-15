// File: src/storage/index.ts
// Page Title: Expositor — Storage Facade (FS ↔ IDB, handle-restore)

import { FSStorage } from './fs';
import {
  loadNote   as idbRead,
  saveNote   as idbWrite,
  deleteNote as idbDelete,
  noteExists as idbExists,
  dbPromise,
  saveSetting as saveSettingKV,
  loadSetting as loadSettingKV,
} from './idb';

import { AnyNote } from '../models';
import { stringifyNote } from '../utils/markdown';

/* ───────────────────────── state & helpers ───────────────────────── */
export type StorageBackend = 'fs' | 'idb';
let backend: StorageBackend = 'idb';
export const getBackend = () => backend;

/** key used to persist the chosen FileSystemDirectoryHandle */
const HANDLE_SETTING = 'fsHandle';

/* ───────────────────── init / persist FS mode ───────────────────── */
export async function initFS(
  handle: FileSystemDirectoryHandle,
  persist: boolean = true,
) {
  FSStorage.init(handle);
  backend = 'fs';
  (window as any).expositorFS = handle;            // dev-tools helper

  if (persist) {
    try {
      await saveSettingKV(HANDLE_SETTING, handle); // structured-clone
    } catch {/* ignore (e.g. private mode) */}
  }
}

/** Call once at boot to re-hydrate a previously stored folder handle */
export async function restoreFSHandle() {
  try {
    const handle =
      (await loadSettingKV<FileSystemDirectoryHandle>(HANDLE_SETTING)) ?? null;
    if (!handle) return;

    let perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm === 'prompt') {
      perm = await handle.requestPermission({ mode: 'readwrite' });
    }
    if (perm === 'granted') initFS(handle, /*persist*/ false);
  } catch {/* corrupt handle or user denied – fall back to IDB */}
}

/* ─────────────────────── listFiles (uniform) ─────────────────────── */
export async function listFiles(book: string, chap: string) {
  if (backend === 'fs') return FSStorage.listFiles(book, chap);

  const db      = await dbPromise;
  const prefix  = `${book}/${chap}/`;
  return (await db.getAllKeys('notes'))
    .filter((k: string) => k.startsWith(prefix)) as string[];
}

/* ───────────── read / write / delete wrapper ───────────── */
export const readNote = async (h: string | FileSystemFileHandle) =>
  backend === 'fs'
    ? FSStorage.readNote(h as FileSystemFileHandle)
    : idbRead(h as string);

export const deleteNote = async (h: string | FileSystemFileHandle) =>
  backend === 'fs'
    ? FSStorage.deleteNote(h as FileSystemFileHandle)
    : idbDelete(h as string);

export const writeNote = async (
  h: string | FileSystemFileHandle,
  note: AnyNote,
) =>
  backend === 'fs'
    ? FSStorage.writeNote(h as FileSystemFileHandle, note)
    : idbWrite(h as string, stringifyNote(note));

/* ───────────────────────── create note ───────────────────────────── */
export async function createNote(
  book: string,
  chap: string,
  note: AnyNote,
): Promise<string | FileSystemFileHandle> {
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
  return key;
}

/* ───────────── ensure unique slug per chapter ───────────── */
async function nextSlug(book: string, chap: string, note: AnyNote) {
  const base = `${note.type}-${note.range.replace(/\s+/g, '')}`;
  let   file = `${base}.md`;
  let   idx  = 1;

  const exists = async (f: string) =>
    backend === 'fs'
      ? FSStorage.fileExists(book, chap, f)
      : idbExists(`${book}/${chap}/${f}`);

  while (await exists(file)) file = `${base}-${idx++}.md`;
  return file;
}

/* settings helpers re-export */
export { saveSettingKV, loadSettingKV };
