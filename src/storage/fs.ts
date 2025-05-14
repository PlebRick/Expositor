// src/storage/fs.ts  (replace previous skeleton)
import { AnyNote } from '../models';
import { parseNote, stringifyNote } from '../utils/markdown';

export namespace FSStorage {
  let rootHandle: FileSystemDirectoryHandle | null = null;

  export function init(handle: FileSystemDirectoryHandle) {
    rootHandle = handle;
  }

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

  export async function readNote(
    handle: FileSystemFileHandle
  ): Promise<AnyNote> {
    const file = await handle.getFile();
    return parseNote(await file.text());
  }

  export async function writeNote(
    handle: FileSystemFileHandle,
    note: AnyNote
  ) {
    const md = stringifyNote(note);
    const w = await handle.createWritable();
    await w.write(md);
    await w.close();
  }

  export async function deleteNote(handle: FileSystemFileHandle) {
    await handle.remove();
  }
}
