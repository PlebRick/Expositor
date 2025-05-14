// src/workers/zipWorker.ts
import { unzipSync, zipSync, strToU8, Uint8ArrayReader } from 'fflate';

/* Message schema:
   { type:"export", payload:{ files: Record<filePath, markdownString> } }
   { type:"import", payload: ArrayBuffer }  */

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'export') {
    const u8 = zipSync(payload.files, { level: 9 });
    postMessage({ ok: true, buffer: u8 }, [u8.buffer]);
  }

  if (type === 'import') {
    try {
      const files = unzipSync(new Uint8ArrayReader(new Uint8Array(payload)));
      const out: Record<string, string> = {};
      Object.entries(files).forEach(([name, u8]) => {
        out[name] = new TextDecoder().decode(u8);
      });
      postMessage({ ok: true, files: out });
    } catch (err) {
      postMessage({ ok: false, error: (err as Error).message });
    }
  }
};
export default null as any;
