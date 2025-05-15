// File: src/storage/index.ts
// Page Title: Expositor — Storage Facade (FS & IndexedDB)

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

/* ───────────────────────── Types & state ───────────────────────── */
export type StorageBackend = 'fs' | 'idb';
let backend: StorageBackend = 'idb';

/** Public getter so UI can know which backend is active */
export const getBackend = (): StorageBackend => backend;

/* ───────────── Switch to File-System mode after folder pick ────── */
export function initFS(handle: FileSystemDirectoryHandle) {
  FSStorage.init(handle);
  backend = 'fs';
  (window as any).expositorFS = handle; // dev-tools helper
}

/* ─────────────────────── list chapter files ────────────────────── */
export async function listFiles(book: string, chap: string) {
  if (backend === 'fs') return FSStorage.listFiles(book, chap);

  const db      = await dbPromise;
  const allKeys = (await db.getAllKeys('notes')) as string[];
  const prefix  = `${book}/${chap}/`;

  return allKeys
    .filter((k) => k.startsWith(prefix))
    .map((k) => ({ kind: 'file' as const, name: k }));
}

/* ─────────────────── read / write / delete note ────────────────── */
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
  note: AnyNote,
) =>
  backend === 'fs'
    ? FSStorage.writeNote(h as FileSystemFileHandle, note)
    : idbWrite((h as { name: string }).name, stringifyNote(note));

/* ─────────────────────── create new note ───────────────────────── */
export async function createNote(book: string, chap: string, note: AnyNote) {
  const fileName = await nextSlug(book, chap, note);

  /* FS backend */
  if (backend === 'fs') {
    const root    = (window as any).expositorFS as FileSystemDirectoryHandle;
    const bookDir = await root.getDirectoryHandle(book, { create: true });
    const chapDir = await bookDir.getDirectoryHandle(chap, { create: true });
    const handle  = await chapDir.getFileHandle(fileName, { create: true });
    await FSStorage.writeNote(handle, note);
    return handle;
  }

  /* IDB backend */
  const key = `${book}/${chap}/${fileName}`;
  await idbWrite(key, stringifyNote(note));
  return { name: key };
}

/* ── ensure unique slug if duplicate range/title already exists ─── */
async function nextSlug(book: string, chap: string, note: AnyNote) {
  const base  = `${note.type}-${note.range.replace(/\\s+/g, '')}`;
  let   file  = `${base}.md`;
  let   index = 1;

  const exists = async (f: string) =>
    backend === 'fs'
      ? FSStorage.fileExists(book, chap, f)
      : idbExists(`${book}/${chap}/${f}`);

  while (await exists(file)) file = `${base}-${index++}.md`;
  return file;
}

/* ───────────────────── settings helpers re-export ──────────────── */
export { saveSettingKV, loadSettingKV };
