// src/storage/idb.ts  (FULL REPLACEMENT)
import { openDB, DBSchema } from 'idb';

interface NotesDB extends DBSchema {
  notes: {
    /* key example: "Genesis/01/outline-1-5.md" */
    key: string;
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

/* ── CRUD helpers ─────────────────────────────────────────────── */

export async function saveNote(key: string, markdown: string) {
  const db = await dbPromise;
  await db.put('notes', markdown, key);
}

export async function loadNote(key: string) {
  const db = await dbPromise;
  return db.get('notes', key);
}

export async function deleteNote(key: string) {
  const db = await dbPromise;
  await db.delete('notes', key);
}
