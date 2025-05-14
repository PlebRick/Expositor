// File: src/esvApi.js

import { ESV_API_KEY } from './config.js';

/**
 * Fetches the raw passage text for a given book & chapter.
 * Strips out asterisks and returns an array of lines.
 *
 * @param {string} book  – e.g. "Romans"
 * @param {string} chap  – e.g. "1"
 * @returns {Promise<string[]>} array of lines (verses & headings)
 */
export async function fetchPassageLines(book, chap) {
  const query = encodeURIComponent(`${book} ${chap}`);
  const url   = `https://api.esv.org/v3/passage/text/?q=${query}`;

  const res = await fetch(url, {
    headers: { Authorization: `Token ${ESV_API_KEY}` }
  });

  if (!res.ok) {
    throw new Error(`ESV API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const raw  = (json.passages?.[0] || '').replace(/\*/g, '');
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}
