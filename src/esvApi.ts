/* src/esvApi.ts */

import { loadSettingKV } from './storage';

/** fetch passage text, strip asterisks, return array of lines */
export async function fetchPassageLines(book: string, chap: string) {
  const key = (await loadSettingKV<string>('esvKey')) ?? '';
  if (!key) throw new Error('No ESV API key set (open Settings)');

  const query = encodeURIComponent(`${book} ${chap}`);
  const url   = `https://api.esv.org/v3/passage/text/?q=${query}`;

  const res = await fetch(url, { headers: { Authorization: `Token ${key}` } });
  if (!res.ok) throw new Error(`ESV API error ${res.status}`);

  const json = await res.json();
  const raw  = (json.passages?.[0] || '').replace(/\*/g, '');
  return raw.split('\n').map((l: string) => l.trim()).filter(Boolean);
}
