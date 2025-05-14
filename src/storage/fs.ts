// src/storage/fs.ts  (FULL REPLACEMENT)
import { AnyNote } from '../models';
import { parseNote, stringifyNote } from '../utils/markdown';

export namespace FSStorage {
  let rootHandle: FileSystemDirectoryHandle | null = null;

  /** Called once after user picks the top-level `data/` folder */
  export function init(handle: FileSystemDirectoryHandle) {
    rootHandle = handle;
  }

  /** List Markdown files for a chapter */
  export async function listFiles(
    book: string,
    chap: string
  ): Promise<FileSystemFileHandle[]> {
    if (!rootHandle) throw new Error('FS not initialised');
    const bookDir = await rootHandle.getDirectoryHandle(book);
    const chapDir = await bookDir.getDirectoryHandle(chap);
    const out: FileSystemFileHandle[] = [];
    for await (const entry of chapDir.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.md')) out.push(entry);
    }
    return out;
  }

  /** Read & parse a note */
  export async function readNote(handle: FileSystemFileHandle): Promise<AnyNote> {
    const file = await handle.getFile();
    return parseNote(await file.text());
  }

  /** Overwrite a note file */
  export async function writeNote(
    handle: FileSystemFileHandle,
    note: AnyNote
  ) {
    const md = stringifyNote(note);
    const w = await handle.createWritable();
    await w.write(md);
    await w.close();
  }

  /** Delete a note file */
  export async function deleteNote(handle: FileSystemFileHandle) {
    await handle.remove();
  }
}
