// File: src/utils/markdown.ts
// Page Title: Markdown helpers (front-matter parse / stringify)

import matter from 'gray-matter';
import { AnyNote, NoteType } from '../models';

/* ─────────────────── Buffer polyfill for browser ─────────────────── */
// gray-matter uses Buffer internally; the Node-core polyfill works fine
import { Buffer } from 'buffer';
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

/* ───────────────── Parse Markdown → typed note ───────────────────── */
export function parseNote(md: string): AnyNote {
  const { data, content } = matter(md);

  const base = {
    type   : data.type  as NoteType,
    title  : data.title as string,
    range  : data.range as string,
    created: data.created as string | undefined,
    updated: data.updated as string | undefined,
  };

  if (data.type === 'outline') {
    return { ...base, type: 'outline', items: data.items ?? [] };
  }
  if (data.type === 'manuscript') {
    return { ...base, type: 'manuscript', content };
  }
  /* commentary fallback */
  return { ...base, type: 'commentary', content };
}

/* ───────────────── Note → Markdown (front-matter) ────────────────── */
export function stringifyNote(note: AnyNote): string {
  const { type, title, range, created, updated } = note;

  /* front-matter object */
  const front: Record<string, unknown> = { type, title, range, created, updated };
  if (type === 'outline') front.items = note.items;

  /* body */
  const body =
    type === 'outline'
      ? '\n'                              // outlines have no body markdown
      : (note.content || '').trimEnd() + '\n';

  return matter.stringify(body, front);
}
