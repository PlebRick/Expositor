// src/utils/markdown.ts  (NEW)
import matter from 'gray-matter';
import { AnyNote, NoteType } from '../models';

/* ── Parse Markdown with YAML front-matter → typed note ───────── */
export function parseNote(md: string): AnyNote {
  const { data, content } = matter(md);

  const base = {
    type: data.type as NoteType,
    title: data.title as string,
    range: data.range as string,
    created: data.created as string | undefined,
    updated: data.updated as string | undefined
  };

  if (data.type === 'outline') {
    return { ...base, type: 'outline', items: data.items ?? [] };
  }
  if (data.type === 'manuscript') {
    return { ...base, type: 'manuscript', content };
  }
  return { ...base, type: 'commentary', content };
}

/* ── Serialize note → Markdown with front-matter ──────────────── */
export function stringifyNote(note: AnyNote): string {
  const { type, title, range, created, updated } = note;

  const front: Record<string, unknown> = { type, title, range, created, updated };

  if (type === 'outline') front.items = note.items;

  const body =
    type === 'outline'
      ? '\n' // outlines need no body markdown
      : note.content;

  return matter.stringify(body, front);
}
