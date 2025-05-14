/* src/storage/fs.ts
 * File-System Access helpers (Chromium only).
 */

import { AnyNote } from '../models';
import { stringifyNote } from '../utils/markdown';

export namespace FSStorage {
  let root: FileSystemDirectoryHandle | null = null;
  export const init = (h: FileSystemDirectoryHandle) => (root = h);

  /* list chapter files */
  export async function listFiles(book: string, chap: string) {
    if (!root) return [];
    try {
      const chapDir = await (await root.getDirectoryHandle(book))
        .getDirectoryHandle(chap);
      const out: { kind: 'file'; name: string; handle: FileSystemFileHandle }[] = [];
      for await (const [name, h] of chapDir.entries()) {
        if (h.kind === 'file') out.push({ kind: 'file', name, handle: h as FileSystemFileHandle });
      }
      return out;
    } catch { return []; }
  }

  /* read / write / delete */
  export const readNote = async (h: FileSystemFileHandle) =>
    (await h.getFile()).text();

  export const writeNote = async (h: FileSystemFileHandle, n: AnyNote) => {
    const w = await h.createWritable();
    await w.write(stringifyNote(n));
    await w.close();
  };

  export const deleteNote = async (h: FileSystemFileHandle) => {
    // @ts-ignore getParent not in libDOM yet
    const dir: FileSystemDirectoryHandle = await h.getParent();
    // @ts-ignore
    await dir.removeEntry(h.name);
  };

  export async function fileExists(book: string, chap: string, file: string) {
    if (!root) return false;
    try {
      await (await (await root.getDirectoryHandle(book))
        .getDirectoryHandle(chap))
        .getFileHandle(file);
      return true;
    } catch { return false; }
  }
}
