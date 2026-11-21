/**
 * POP-WORD data build.
 * 1. Prepares the offline Strong's lexicons for the browser.
 * 2. Validates every content JSON (structure, exact WEB scripture, Strong's IDs).
 * 3. Compiles content into app/data/books/<book>.js.
 *
 * Run: node build/build-data.mjs
 * Exits non-zero if any content fails validation.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

/* ── 1. Lexicons ──────────────────────────────────────────────── */
function buildLexicon(srcName, outName, varName) {
  const src = readFileSync(join(ROOT, 'sources', 'lexicon', srcName), 'utf8');
  const cleaned = src.replace(/module\.exports\s*=\s*\w+\s*;?/g, '');
  const out = cleaned + `\nwindow.${varName} = ${varName};\n`;
  writeFileSync(join(ROOT, 'app', 'data', outName), out, 'utf8');
  return out;
}
const hebSrc = buildLexicon('strongs-hebrew-dictionary.js', 'lexicon-hebrew.js', 'strongsHebrewDictionary');
buildLexicon('strongs-greek-dictionary.js', 'lexicon-greek.js', 'strongsGreekDictionary');

const hebIds = new Set([...hebSrc.matchAll(/"(H\d+)"\s*:/g)].map(m => m[1]));
const grkSrc = readFileSync(join(ROOT, 'sources', 'lexicon', 'strongs-greek-dictionary.js'), 'utf8');
const grkIds = new Set([...grkSrc.matchAll(/"(G\d+)"\s*:/g)].map(m => m[1]));
console.log(`Lexicons ready — ${hebIds.size} Hebrew, ${grkIds.size} Greek entries embedded.`);

/* ── 2 + 3. Content validation and compilation ───────────────── */
const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();

function need(obj, path, file) {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || cur[p] == null || cur[p] === '') {
      errors.push(`${file}: missing required field "${path}"`);
      return undefined;
    }
    cur = cur[p];
  }
  if (Array.isArray(cur) && cur.length === 0) errors.push(`${file}: "${path}" is empty`);
  return cur;
}

function checkStrongs(id, where) {
  // An entry may cite a compound idiom ("H7760 / H3824") — every cited ID must exist.
  // Hebrew (H####) checks the Hebrew dictionary, Greek (G####) the Greek one.
  const ids = String(id).match(/[HG]\d+/g);
  if (!ids || !ids.length) { errors.push(`${where}: malformed Strong's id "${id}"`); return; }
  for (const one of ids) {
    const set = one[0] === 'G' ? grkIds : hebIds;
    if (!set.has(one)) errors.push(`${where}: Strong's id "${one}" not in offline dictionary`);
  }
}

function validateIntro(d, file) {
  ['book', 'bigPicture.subtitle', 'bigPicture.paragraphs', 'bridge.fromBook', 'bridge.intro',
    'bridge.points', 'coreTheme.title', 'coreTheme.paragraphs', 'truths.intro', 'truths.items',
    'preparation.intro', 'preparation.items', 'prayerOfActivation'].forEach(p => need(d, p, file));
}

function validateChapter(d, file, bookId) {
  ['book', 'chapter', 'chapterTitle', 'themeTitle', 'scripture', 'visualMeditations',
    'commentary.structure', 'commentary.sections', 'commentary.ntConnection.paragraphs',
    'lexicon', 'holySpiritRevelation.intro', 'holySpiritRevelation.items',
    'lifeApplication.audit', 'lifeApplication.practices', 'prayerReflection',
    'storyConnections'].forEach(p => need(d, p, file));
  if (!d.lifeApplication) return;
  d.lifeApplication.auditIntro ??= 'Ask yourself deeply and honestly:';
  d.lifeApplication.practicesIntro ??= 'Live this chapter by:';

  // Scripture fidelity against the fetched WEB source
  const srcPath = join(ROOT, 'sources', 'bible', `${bookId}-${d.chapter}.json`);
  if (existsSync(srcPath)) {
    const src = JSON.parse(readFileSync(srcPath, 'utf8'));
    const srcVerses = new Map(src.verses.map(v => [v.verse, norm(v.text)]));
    const gotVerses = new Map((d.scripture ?? []).map(v => [v.v, norm(v.text)]));
    for (const [vn, txt] of srcVerses) {
      if (!gotVerses.has(vn)) errors.push(`${file}: verse ${vn} missing from scripture array`);
      // A verse the WEB omits (empty in the source) may carry an editorial note instead.
      else if (txt === '') warnings.push(`${file}: verse ${vn} omitted by WEB — editorial note shown`);
      else if (gotVerses.get(vn) !== txt) errors.push(`${file}: verse ${vn} text differs from WEB source`);
    }
    for (const vn of gotVerses.keys()) {
      if (!srcVerses.has(vn)) errors.push(`${file}: verse ${vn} not in WEB source (extra verse?)`);
    }
    for (const v of d.scripture ?? []) {
      if (!norm(v.understanding)) errors.push(`${file}: verse ${v.v} has no understanding note`);
      for (const w of v.words ?? []) checkStrongs(w.strongs, `${file} v${v.v}`);
    }
  } else {
    warnings.push(`${file}: no WEB source at ${srcPath} — scripture fidelity unchecked`);
  }
  for (const w of d.lexicon ?? []) checkStrongs(w.strongs, `${file} lexicon "${w.english}"`);
}

function validateReview(d, file) {
  ['book', 'titleEmojis', 'bigPicture.subtitle', 'bigPicture.thesis', 'bigPicture.paragraphs',
    'map.intro', 'map.sections', 'map.roadAhead.intro', 'map.roadAhead.books',
    'themesMastered', 'experientialLesson.intro', 'experientialLesson.steps',
    'finalDeclaration'].forEach(p => need(d, p, file));
  if (d.map?.roadAhead?.books && d.map.roadAhead.books.length < 2)
    errors.push(`${file}: roadAhead must cover the NEXT TWO books`);
}

const contentDir = join(ROOT, 'content');
const bookDirs = readdirSync(contentDir, { withFileTypes: true })
  .filter(e => e.isDirectory() && e.name !== 'schemas').map(e => e.name);

mkdirSync(join(ROOT, 'app', 'data', 'books'), { recursive: true });
const built = [];

for (const bookId of bookDirs) {
  const dir = join(contentDir, bookId);
  const read = f => {
    const p = join(dir, f);
    if (!existsSync(p)) return null;
    try { return JSON.parse(readFileSync(p, 'utf8')); }
    catch (e) { errors.push(`${bookId}/${f}: INVALID JSON — ${e.message}`); return null; }
  };

  const intro = read('master-introduction.json');
  const review = read('final-review.json');
  const chapters = [];
  for (let n = 1; existsSync(join(dir, `chapter-${n}.json`)); n++) chapters.push(read(`chapter-${n}.json`));

  if (!intro || !review || chapters.length === 0 || chapters.some(c => !c)) {
    warnings.push(`${bookId}: incomplete (intro:${!!intro} chapters:${chapters.length} review:${!!review}) — skipped`);
    continue;
  }

  validateIntro(intro, `${bookId}/master-introduction.json`);
  chapters.forEach((c, i) => validateChapter(c, `${bookId}/chapter-${i + 1}.json`, bookId));
  validateReview(review, `${bookId}/final-review.json`);

  const payload = { intro, chapters, review };
  const js = `/* Generated by build/build-data.mjs — do not edit by hand. */\nwindow.POP_REGISTER_CONTENT(${JSON.stringify(bookId)}, ${JSON.stringify(payload)});\n`;
  writeFileSync(join(ROOT, 'app', 'data', 'books', `${bookId}.js`), js, 'utf8');
  built.push(`${bookId} (${chapters.length} chapters)`);
}

/* ── Report ──────────────────────────────────────────────────── */
console.log(`\nBuilt: ${built.length ? built.join(', ') : '(nothing complete yet)'}`);
if (warnings.length) console.log(`\nWarnings:\n  - ${warnings.join('\n  - ')}`);
if (errors.length) {
  console.error(`\nERRORS (${errors.length}):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log('\nAll validations passed.');
