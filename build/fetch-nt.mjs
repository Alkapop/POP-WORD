/* Fetch the World English Bible text for every New Testament chapter into
   sources/bible/<book>-<n>.json. Polite, rate-limit-aware, resumable
   (skips chapters already on disk). Run: node build/fetch-nt.mjs */
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'sources', 'bible');
mkdirSync(OUT, { recursive: true });

const BOOKS = [
  ['matthew', 28], ['mark', 16], ['luke', 24], ['john', 21], ['acts', 28],
  ['romans', 16], ['1corinthians', 16], ['2corinthians', 13], ['galatians', 6],
  ['ephesians', 6], ['philippians', 4], ['colossians', 4], ['1thessalonians', 5],
  ['2thessalonians', 3], ['1timothy', 6], ['2timothy', 4], ['titus', 3],
  ['philemon', 1], ['hebrews', 13], ['james', 5], ['1peter', 5], ['2peter', 3],
  ['1john', 5], ['2john', 1], ['3john', 1], ['jude', 1], ['revelation', 22]
];
// bible-api slugs use spaces/words; map our file ids to its query form.
const API = {
  '1corinthians': '1 corinthians', '2corinthians': '2 corinthians',
  '1thessalonians': '1 thessalonians', '2thessalonians': '2 thessalonians',
  '1timothy': '1 timothy', '2timothy': '2 timothy',
  '1peter': '1 peter', '2peter': '2 peter',
  '1john': '1 john', '2john': '2 john', '3john': '3 john'
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Single-chapter books: bible-api reads "jude 1" as Jude 1:1 (one verse), so ask for the full range.
const SINGLE = { philemon: 25, '2john': 13, '3john': 15, jude: 25 };

async function fetchChapter(id, ch) {
  const ref = SINGLE[id] ? `${ch}:1-${SINGLE[id]}` : String(ch);
  const q = encodeURIComponent((API[id] || id) + ' ' + ref);
  const url = `https://bible-api.com/${q}?translation=web`;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) { await sleep(4000 * attempt); continue; }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data.verses || !data.verses.length) throw new Error('no verses');
      return data;
    } catch (e) {
      if (attempt === 6) throw e;
      await sleep(2500 * attempt);
    }
  }
}

let done = 0, skipped = 0, failed = [];
for (const [id, chapters] of BOOKS) {
  for (let ch = 1; ch <= chapters; ch++) {
    const path = join(OUT, `${id}-${ch}.json`);
    if (existsSync(path)) {
      // Re-fetch single-chapter books saved by the old one-verse bug.
      const have = JSON.parse(readFileSync(path, 'utf8')).verses?.length ?? 0;
      if (!(SINGLE[id] && have < SINGLE[id])) { skipped++; continue; }
    }
    try {
      const data = await fetchChapter(id, ch);
      writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
      done++;
      if (done % 20 === 0) console.log(`fetched ${done} (last: ${id} ${ch})`);
      await sleep(900);
    } catch (e) {
      failed.push(`${id} ${ch}: ${e.message}`);
    }
  }
}
console.log(`\nDone. fetched=${done} skipped=${skipped} failed=${failed.length}`);
if (failed.length) console.log('FAILED:\n  ' + failed.join('\n  '));
