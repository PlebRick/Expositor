// src/__tests__/markdown.test.ts
import { describe, it, expect } from 'vitest';
import { parseNote, stringifyNote } from '../utils/markdown';
import { OutlineNote } from '../models';

describe('markdown round-trip', () => {
  it('outline ↔ markdown', () => {
    const note: OutlineNote = {
      type: 'outline',
      title: 'Test',
      range: '1-5',
      items: [],
      created: '2025-05-14'
    };
    const md = stringifyNote(note);
    const back = parseNote(md);
    expect(back).toEqual(note);
  });
});
