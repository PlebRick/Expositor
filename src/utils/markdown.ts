// src/utils/markdown.ts
import matter from 'gray-matter';
import { AnyNote, NoteType } from '../models';

/**
 * Parse a Markdown file and return its typed note.
 */
export function parseNote(md: string): AnyNote {
  const { data, content } = matter(md);

  const base = {
    type: data.type as NoteType,
    title: data.title as string,
    range: data.range as string,
    created: data.created as string | undefined,
    updated: data.updated as string | undefined,
  };

  if (data.type === 'outline') {
    return { ...base, type: 'outline', items: data.items ?? [] };
  }
  if (data.type === 'manuscript') {
    return { ...base, type: 'manuscript', content };
  }
  return { ...base, type: 'commentary', content };
}

/**
 * Convert a note back into Markdown for disk.
 */
export function stringifyNote(note: AnyNote): string {
  const { type, title, range, created, updated } = note;

  const front: Record<string, unknown> = { type, title, range, created, updated };

  if (type === 'outline') front.items = note.items;
  const body =
    type === 'outline'
      ? '\n' // outlines don’t need body
      : note.content;

  return matter.stringify(body, front);
}
