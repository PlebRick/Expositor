/* COMPLETE replacement — tiny file */

import { zipSync, unzipSync, strToU8, Uint8ArrayReader } from 'fflate';

type Msg =
  | { cmd: 'zip';   files: Record<string, string> }
  | { cmd: 'unzip'; buffer: Uint8Array };

self.onmessage = (e: MessageEvent<Msg>) => {
  if (e.data.cmd === 'zip') {
    const buf = zipSync(
      Object.fromEntries(
        Object.entries(e.data.files).map(([k, v]) => [k, strToU8(v)])
      ),
      { level: 9 }
    );
    (self as any).postMessage({ ok: true, buffer: buf }, [buf.buffer]);
  } else {
    try {
      const files: Record<string, string> = {};
      const unz = unzipSync(new Uint8ArrayReader(e.data.buffer));
      for (const [name, data] of Object.entries(unz)) {
        files[name] = new TextDecoder().decode(data as Uint8Array);
      }
      (self as any).postMessage({ ok: true, files });
    } catch {
      (self as any).postMessage({ ok: false });
    }
  }
};
