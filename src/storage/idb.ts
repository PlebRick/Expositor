// src/storage/idb.ts  (IndexedDB fallback)
import { openDB, DBSchema } from 'idb';

interface NotesDB extends DBSchema {
  notes: {
    key: string;   // "Genesis/01/outline-1-5.md"
    value: string; // raw Markdown
  };
  settings: {
    key: string;
    value: unknown;
  };
}

export const dbPromise = openDB<NotesDB>('ExpositorNotes', 1, {
  upgrade(db) {
    db.createObjectStore('notes');
    db.createObjectStore('settings');
  }
});

export async function saveNote(key: string, md: string) {
  const db = await dbPromise;
  await db.put('notes', md, key);
}

export async function loadNote(key: string) {
  const db = await dbPromise;
  return db.get('notes', key);
}

export async function deleteNote(key: string) {
  const db = await dbPromise;
  await db.delete('notes', key);
}
