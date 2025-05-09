// File: scripts/syncAnnotations.js

import fs from 'fs';
import path from 'path';

// Path to the exported bundle (you’ll move manualAnnotations.json here)
const BUNDLE_FILE = path.resolve(process.cwd(), 'manualAnnotations.json');

// Target data files
const TARGETS = {
  outline:    path.resolve(process.cwd(), 'src/data/outline.json'),
  manuscript: path.resolve(process.cwd(), 'src/data/manuscript.json'),
  commentary: path.resolve(process.cwd(), 'src/data/commentary.json'),
};

function main() {
  if (!fs.existsSync(BUNDLE_FILE)) {
    console.error(`Error: ${BUNDLE_FILE} not found. Run Export first.`);
    process.exit(1);
  }

  const bundleRaw = fs.readFileSync(BUNDLE_FILE, 'utf-8');
  let bundle;
  try {
    bundle = JSON.parse(bundleRaw);
  } catch (err) {
    console.error('Error parsing manualAnnotations.json:', err.message);
    process.exit(1);
  }

  for (const [key, targetPath] of Object.entries(TARGETS)) {
    const data = bundle[key] || {};
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
    console.log(`✔️  Updated ${path.relative(process.cwd(), targetPath)}`);
  }

  console.log('✅ All annotation JSON files sync’d.');
}

main();
