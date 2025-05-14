// src/storage/fs.ts  (File-System Access adapter – skeleton)
import { AnyNote } from '../models';

export namespace FSStorage {
  let rootHandle: FileSystemDirectoryHandle | null = null;

  /** Called once after user picks the data/ folder */
  export function init(handle: FileSystemDirectoryHandle) {
    rootHandle = handle;
  }

  /** List all Markdown files for a given book/chapter */
  export async function listFiles(
    book: string,
    chapter: string
  ): Promise<FileSystemFileHandle[]> {
    if (!rootHandle) throw new Error('FS not initialised');
    const bookHandle = await rootHandle.getDirectoryHandle(book);
    const chapHandle = await bookHandle.getDirectoryHandle(chapter);
    const out: FileSystemFileHandle[] = [];
    for await (const entry of chapHandle.values()) {
      if (entry.kind === 'file') out.push(entry);
    }
    return out;
  }

  /** Read & parse one note */
  export async function readNote(
    handle: FileSystemFileHandle
  ): Promise<AnyNote> {
    const file = await handle.getFile();
    const text = await file.text();
    // TODO: parse YAML front-matter + body → AnyNote
    return JSON.parse('{}');
  }

  /** Write a note’s Markdown body to disk */
  export async function writeNote(
    handle: FileSystemFileHandle,
    markdown: string
  ) {
    const w = await handle.createWritable();
    await w.write(markdown);
    await w.close();
  }

  export async function deleteNote(handle: FileSystemFileHandle) {
    await handle.remove();
  }
}
