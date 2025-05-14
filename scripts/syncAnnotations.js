// File: scripts/syncAnnotations.js

import fs from 'fs';
import path from 'path';

// Path to the exported bundle
const BUNDLE_FILE = path.resolve(process.cwd(), 'manualAnnotations.json');

// Directory where per-chapter JSON files will be written
const OUTPUT_DIR = path.resolve(process.cwd(), 'src/data/annotations');

function loadBundle() {
  if (!fs.existsSync(BUNDLE_FILE)) {
    console.error(`❌ ${path.basename(BUNDLE_FILE)} not found. Run the export first.`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(BUNDLE_FILE, 'utf-8'));
  } catch (err) {
    console.error('❌ Error parsing manualAnnotations.json:', err.message);
    process.exit(1);
  }
}

function collectChapters(bundle) {
  const chaptersMap = {};
  ['outline', 'manuscript', 'commentary'].forEach(sectionKey => {
    const section = bundle[sectionKey] || {};
    for (const [book, data] of Object.entries(section)) {
      const bookChapters = Object.keys(data.chapters || {});
      if (!chaptersMap[book]) chaptersMap[book] = new Set();
      bookChapters.forEach(chap => chaptersMap[book].add(chap));
    }
  });
  return chaptersMap;
}

function writeChapterFiles(bundle, chaptersMap) {
  // Ensure the base annotations directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const [book, chapSet] of Object.entries(chaptersMap)) {
    const bookDir = path.join(OUTPUT_DIR, book);
    fs.mkdirSync(bookDir, { recursive: true });

    for (const chap of chapSet) {
      const outlines     = [];
      const manuscripts  = [];
      const commentaries = [];

      const o = bundle.outline?.[book]?.chapters?.[chap]?._outline;
      if (o) outlines.push(o);

      const m = bundle.manuscript?.[book]?.chapters?.[chap]?._manuscript;
      if (m) manuscripts.push(m);

      const c = bundle.commentary?.[book]?.chapters?.[chap]?._commentary;
      if (c) commentaries.push(c);

      const chapterData = {
        book,
        chapter: chap,
        outlines,
        manuscripts,
        commentaries
      };

      const outPath = path.join(bookDir, `${chap}.json`);
      fs.writeFileSync(outPath, JSON.stringify(chapterData, null, 2));
      console.log(`✔️  Wrote ${path.relative(process.cwd(), outPath)}`);
    }
  }
}

function main() {
  const bundle      = loadBundle();
  const chaptersMap = collectChapters(bundle);

  writeChapterFiles(bundle, chaptersMap);
  console.log('✅ All chapter-based annotation files generated.');
}

main();
