// File: src/storage/fs.ts
// Page Title: Expositor — File-System helpers

import { AnyNote } from '../models';
import { stringifyNote } from '../utils/markdown';

export namespace FSStorage {
  let root: FileSystemDirectoryHandle | null = null;
  export const init = (h: FileSystemDirectoryHandle) => (root = h);

  /*────────────────────── list chapter files ──────────────────────*/
  export async function listFiles(
    book: string,
    chap: string,
  ): Promise<FileSystemFileHandle[]> {
    if (!root) return [];
    try {
      const bookDir = await root.getDirectoryHandle(book);
      const chapDir = await bookDir.getDirectoryHandle(chap);
      const out: FileSystemFileHandle[] = [];

      // Use .entries() or .values() depending on browser types
      const iter: AsyncIterable<any> =
        // @ts-ignore – not yet in all lib.dom.d.ts versions
        chapDir.entries ? (chapDir as any).entries() : (chapDir as any).values();

      for await (const entry of iter) {
        const handle: FileSystemFileHandle =
          Array.isArray(entry) ? entry[1] : entry;
        if (handle.kind === 'file') out.push(handle);
      }
      return out;
    } catch {
      return [];
    }
  }

  /*──────────────────── read / write / delete ─────────────────────*/
  export const readNote = async (h: FileSystemFileHandle) =>
    (await h.getFile()).text();

  export const writeNote = async (h: FileSystemFileHandle, n: AnyNote) => {
    const w = await h.createWritable();
    await w.write(stringifyNote(n));
    await w.close();
  };

  export const deleteNote = async (h: FileSystemFileHandle) => {
    // @ts-ignore  getParent not standard yet
    const dir: FileSystemDirectoryHandle = await h.getParent();
    // @ts-ignore
    await dir.removeEntry(h.name);
  };

  export async function fileExists(
    book: string,
    chap: string,
    file: string,
  ): Promise<boolean> {
    if (!root) return false;
    try {
      await (
        await (await root.getDirectoryHandle(book)).getDirectoryHandle(chap)
      ).getFileHandle(file);
      return true;
    } catch {
      return false;
    }
  }
}
