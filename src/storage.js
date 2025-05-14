// File: src/storage.js

import { ANNOTATIONS_BASE } from './config.js';

/**
 * Fetches the static JSON for a given book/chapter,
 * then applies any localStorage overrides.
 *
 * @param {string} book   – e.g. "Genesis"
 * @param {string} chap   – e.g. "1"
 * @returns {Promise<object>} chapterData
 *   {
 *     book,
 *     chapter,
 *     outlines:    Array,
 *     manuscripts: Array,
 *     commentaries:Array
 *   }
 */
export async function loadChapter(book, chap) {
  const url = `${ANNOTATIONS_BASE}/${encodeURIComponent(book)}/${encodeURIComponent(chap)}.json`;
  let staticData = { outlines: [], manuscripts: [], commentaries: [] };

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    staticData = await res.json();
  } catch (err) {
    console.warn(`Could not load static chapter data from ${url}:`, err);
  }

  // Merge in any saved overrides
  const key = `annotations_override:${book}:${chap}`;
  let override = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) override = JSON.parse(raw);
  } catch {
    console.warn(`Failed to parse override for ${book} ${chap}`);
  }

  return {
    book,
    chapter: chap,
    outlines:     override?.outlines    ? mergeUnique(staticData.outlines,     override.outlines)    : staticData.outlines,
    manuscripts:  override?.manuscripts ? mergeUnique(staticData.manuscripts,  override.manuscripts) : staticData.manuscripts,
    commentaries: override?.commentaries? mergeUnique(staticData.commentaries, override.commentaries): staticData.commentaries
  };
}

/**
 * Saves a per-chapter override back to localStorage by merging new data with existing overrides.
 *
 * @param {string} book
 * @param {string} chap
 * @param {object} data – { outlines, manuscripts, commentaries }
 */
export function saveOverride(book, chap, data) {
  const key = `annotations_override:${book}:${chap}`;

  loadChapter(book, chap)
    .then(existingData => {
      const mergedData = {
        outlines:     mergeUnique(existingData.outlines,     data.outlines),
        manuscripts:  mergeUnique(existingData.manuscripts,  data.manuscripts),
        commentaries: mergeUnique(existingData.commentaries, data.commentaries)
      };
      localStorage.setItem(key, JSON.stringify(mergedData));
    })
    .catch(err => {
      console.error(`Failed to save override for ${book} ${chap}:`, err);
    });
}

/**
 * Merges two arrays of items and removes duplicates based on the 'range' field.
 * @param {Array} existing - The existing array of items.
 * @param {Array} newItems - The new array of items to merge.
 * @returns {Array} The merged array with duplicates removed and sorted.
 */
function mergeUnique(existing, newItems) {
  const combined = [...existing, ...newItems];
  const uniqueItems = combined.filter((item, index, self) =>
    index === self.findIndex(t => t.range === item.range)
  );
  return sortByVerseRange(uniqueItems);
}

/**
 * Sorts items by their verse range (ascending).
 */
function sortByVerseRange(items) {
  return items.sort((a, b) => {
    const verseA = parseInt(a.range.split('-')[0], 10);
    const verseB = parseInt(b.range.split('-')[0], 10);
    return verseA - verseB;
  });
}

/**
 * Clears any override for a given chapter.
 *
 * @param {string} book
 * @param {string} chap
 */
export function clearOverride(book, chap) {
  const key = `annotations_override:${book}:${chap}`;
  localStorage.removeItem(key);
}

/**
 * Deletes a single override entry of the given type at the given index.
 * If no entries of any type remain, the entire override is cleared.
 *
 * @param {string} book
 * @param {string} chap
 * @param {'outlines'|'manuscripts'|'commentaries'} type
 * @param {number} index
 */
export function deleteOverrideEntry(book, chap, type, index) {
  const key = `annotations_override:${book}:${chap}`;
  let override;
  try {
    override = JSON.parse(localStorage.getItem(key));
  } catch (err) {
    console.error(`Failed to parse override for ${book} ${chap}:`, err);
    return;
  }
  if (!override || !Array.isArray(override[type])) {
    return;
  }

  // Remove the specified entry
  override[type].splice(index, 1);

  // If no override items remain, clear the override entirely
  const empty =
    override.outlines.length === 0 &&
    override.manuscripts.length === 0 &&
    override.commentaries.length === 0;

  if (empty) {
    localStorage.removeItem(key);
  } else {
    // Save the trimmed override back
    localStorage.setItem(key, JSON.stringify(override));
  }
}
