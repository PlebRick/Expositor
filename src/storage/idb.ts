/* src/storage/idb.ts — COMPLETE REPLACEMENT */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

/*────────────────────── schema ──────────────────────*/
interface NotesDB extends DBSchema {
  notes: {
    /* key example: "Genesis/01/outline-1-5.md" */
    key: string;
    value: string;            // raw Markdown
  };
  settings: {
    key: string;              // arbitrary setting key
    value: unknown;
  };
}

/*────────────────────── DB handle ───────────────────*/
export const dbPromise: Promise<IDBPDatabase<NotesDB>> = openDB<NotesDB>(
  'ExpositorNotes',
  1,
  {
    upgrade(db) {
      db.createObjectStore('notes');
      db.createObjectStore('settings');
    }
  }
);

/*────────────────────── NOTE CRUD ───────────────────*/
export const saveNote = (key: string, md: string) =>
  dbPromise.then(db => db.put('notes', md, key));

export const loadNote = (key: string) =>
  dbPromise.then(db => db.get('notes', key));

export const deleteNote = (key: string) =>
  dbPromise.then(db => db.delete('notes', key));

export const noteExists = (key: string) =>
  dbPromise.then(db => db.count('notes', key).then(c => c > 0));

/*────────────────────── SETTINGS KV ─────────────────*/
export const saveSetting = (key: string, value: unknown) =>
  dbPromise.then(db => db.put('settings', value, key));

export const loadSetting = <T = unknown>(key: string) =>
  dbPromise.then(db => db.get('settings', key) as Promise<T>);
