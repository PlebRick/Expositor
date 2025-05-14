/* -----------------------------------------------------------------------
   Dedicated-worker: ZIP ↔︎ UNZIP helpers using fflate
   -------------------------------------------------------------------- */

/// <reference lib="webworker" />

import { zipSync, unzipSync, strToU8 } from 'fflate';

/* ---------- message contracts -------------------------------------- */
type ZipMsg   = { cmd: 'zip';   files: Record<string, string> };
type UnzipMsg = { cmd: 'unzip'; buffer: Uint8Array };

type OkZip   = { ok: true;  buffer: Uint8Array };
type OkUnzip = { ok: true;  files: Record<string, string> };
type Fail    = { ok: false };

/* ---------- strongly-typed self ------------------------------------ */
declare const self: DedicatedWorkerGlobalScope;

/* ---------- main handler ------------------------------------------- */
self.onmessage = (e: MessageEvent<ZipMsg | UnzipMsg>) => {
  if (e.data.cmd === 'zip') {
    /* turn { path: "string" } → { path: Uint8Array } then zip */
    const u8Map = Object.fromEntries(
      Object.entries(e.data.files).map(([k, v]) => [k, strToU8(v)])
    );
    const buf = zipSync(u8Map, { level: 9 });
    self.postMessage({ ok: true, buffer: buf } as OkZip, [buf.buffer]);
  } else if (e.data.cmd === 'unzip') {
    try {
      const raw  = unzipSync(e.data.buffer);
      const out: Record<string, string> = {};
      for (const [name, arr] of Object.entries(raw))
        out[name] = new TextDecoder().decode(arr as Uint8Array);
      self.postMessage({ ok: true, files: out } as OkUnzip);
    } catch {
      self.postMessage({ ok: false } as Fail);
    }
  }
};
