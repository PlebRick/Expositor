// src/models.ts
export type NoteType = 'outline' | 'manuscript' | 'commentary';

export interface FrontMatterBase {
  type: NoteType;
  title: string;
  range: string;         // e.g. "1-5"
  created?: string;      // ISO-8601
  updated?: string;      // ISO-8601
}

export interface OutlineItem {
  text: string;
  verse?: string;
  subpoints: string[];
}

/** ── Note variants ──────────────────────────────────────────── */
export interface OutlineNote extends FrontMatterBase {
  type: 'outline';
  items: OutlineItem[];
}

export interface ManuscriptNote extends FrontMatterBase {
  type: 'manuscript';
  content: string;
}

export interface CommentaryNote extends FrontMatterBase {
  type: 'commentary';
  content: string;
}

export type AnyNote = OutlineNote | ManuscriptNote | CommentaryNote;
