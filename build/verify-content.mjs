/**
 * POP-WORD deep verifier — the checks build-data.mjs does not make.
 *
 *  1. LEMMA   Every Greek/Hebrew word printed beside a Strong's number must match
 *             that entry's lemma in the offline dictionary (accents/points ignored).
 *  2. QUOTES  Every quotation tagged with a chapter:verse reference to a book whose
 *             WEB text is on disk must actually appear in that chapter's WEB text.
 *  3. DEPTH   Reports per-chapter size and section counts against the format spec.
 *
 * Run: node build/verify-content.mjs [book ...]   (default: every book in content/)
 *      add --strict to exit non-zero on any LEMMA or QUOTE problem.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const only = args.filter(a => !a.startsWith('--'));

/* ── Dictionaries ─────────────────────────────────────────────── */
function loadDict(file, varName) {
  const src = readFileSync(join(ROOT, 'sources', 'lexicon', file), 'utf8')
    .replace(/module\.exports\s*=\s*\w+\s*;?/g, '');
  return new Function(`${src}; return ${varName};`)();
}
const DICT = {
  ...loadDict('strongs-greek-dictionary.js', 'strongsGreekDictionary'),
  ...loadDict('strongs-hebrew-dictionary.js', 'strongsHebrewDictionary')
};
const bare = s => String(s ?? '').normalize('NFD')
  .replace(/[̀-֑ͯ-ׇ]/g, '')   // Greek accents, Hebrew points & cantillation
  .replace(/[־־]/g, '').replace(/ς/g, 'σ').replace(/[ἀ-ῼ]/g, c => c.normalize('NFD')[0])
  .replace(/[^\p{L}]/gu, '').toLowerCase();

/* ── WEB text index ───────────────────────────────────────────── */
const BOOK_IDS = {
  'zephaniah': 'zephaniah', 'haggai': 'haggai', 'zechariah': 'zechariah', 'malachi': 'malachi',
  'matthew': 'matthew', 'mark': 'mark', 'luke': 'luke', 'john': 'john', 'acts': 'acts',
  'romans': 'romans', '1 corinthians': '1corinthians', '2 corinthians': '2corinthians',
  'galatians': 'galatians', 'ephesians': 'ephesians', 'philippians': 'philippians',
  'colossians': 'colossians', '1 thessalonians': '1thessalonians', '2 thessalonians': '2thessalonians',
  '1 timothy': '1timothy', '2 timothy': '2timothy', 'titus': 'titus', 'philemon': 'philemon',
  'hebrews': 'hebrews', 'james': 'james', '1 peter': '1peter', '2 peter': '2peter',
  '1 john': '1john', '2 john': '2john', '3 john': '3john', 'jude': 'jude', 'revelation': 'revelation'
};
const webCache = new Map();
function webChapter(bookId, ch) {
  const key = `${bookId}-${ch}`;
  if (!webCache.has(key)) {
    const p = join(ROOT, 'sources', 'bible', `${key}.json`);
    webCache.set(key, existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).verses : null);
  }
  return webCache.get(key);
}
const words = s => String(s).toLowerCase()
  .replace(/([a-z])[’'‘]([a-z])/g, "$1'$2")          // keep apostrophes inside words only
  .replace(/[^a-z0-9']+|'(?![a-z])|(?<![a-z])'/g, ' ').replace(/\s+/g, ' ').trim();

/* Whole local corpus, normalized, for "does this quotation exist anywhere in the WEB?" */
let CORPUS = null;
function corpus() {
  if (CORPUS) return CORPUS;
  const dir = join(ROOT, 'sources', 'bible');
  CORPUS = readdirSync(dir).filter(f => f.endsWith('.json'))
    .map(f => words(JSON.parse(readFileSync(join(dir, f), 'utf8')).verses.map(v => v.text).join(' ')))
    .join(' | ');
  return CORPUS;
}

/* A quote is “…” followed within a short window by a reference "(Book C:V)" or "(C:V)".
   NOT-IN-WEB  the quoted words occur nowhere in the local WEB text (a misquote or paraphrase
               printed as a quotation) — only checked when the cited book's WEB text is on disk.
   WRONG-REF   the reference names a book explicitly and the words exist, but not near that verse. */
const REF = /\(?\s*((?:[123] )?[A-Z][a-z]+)?\s?(\d{1,3}):(\d{1,3})(?:[-–](\d{1,3}))?/;
// A quotation's checkable fragments. Brackets usually hold an editorial aside — “(arkei)”, “[sic]”
// — so they are dropped; but the WEB itself contains parentheses (1 Timothy 2:10), so the
// version that keeps their contents is tried too. Returns the fragments of whichever version
// is found in the WEB (or the bracket-free version, for reporting, when neither is).
function quoteFrags(q) {
  const split = t => t.split(/…|\.\.\./).map(words).filter(f => f.split(' ').length >= 3);
  const dropped = split(q.replace(/\([^)]*\)|\[[^\]]*\]/g, ' '));
  const kept = split(q.replace(/[()[\]]/g, ' '));
  const ok = fs => fs.length && fs.every(f => corpus().includes(f));
  return ok(dropped) ? dropped : ok(kept) ? kept : dropped;
}
function checkQuotes(text, defaultBook, where, out) {
  const re = /“([^“”]{14,}?)”([^“]{0,40})/g;
  let m;
  while ((m = re.exec(text))) {
    // “…” (v. 5) / (vv. 9–10): a quotation of the chapter being studied. The chapter is not
    // known here, so check the words exist in the WEB, and never pair the quote with a later
    // reference that merely follows it in the same sentence.
    if (/^\s*\(vv?\.\s*\d/.test(m[2])) {
      const frags = quoteFrags(m[1]);
      if (!frags.length || /[Ͱ-Ͽἀ-῿]/.test(m[1])) continue;
      checkedQuotes++;
      if (frags.some(f => !corpus().includes(f))) out.push(`${where}: NOT-IN-WEB “${m[1].slice(0, 90)}” → ${m[2].trim().slice(0, 14)}`);
      continue;
    }
    let r = m[2].match(REF);
    if (!r) {
      // Reference written BEFORE the quotation: “…in 1 Peter 1:5 believers are “…””.
      const before = text.slice(Math.max(0, m.index - 60), m.index);
      const pre = [...before.matchAll(/((?:[123] )?[A-Z][a-z]+) (\d{1,3}):(\d{1,3})/g)].pop();
      if (!pre || !BOOK_IDS[pre[1].toLowerCase()]) continue;
      // A preceding reference often belongs to an earlier sentence, so only test whether the
      // words exist at all, and only for an English quotation of five or more words.
      if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(m[1]) || words(m[1]).split(' ').length < 5) continue;
      const preFrags = quoteFrags(m[1]);
      if (preFrags.some(f => !corpus().includes(f))) {
        checkedQuotes++;
        out.push(`${where}: NOT-IN-WEB “${m[1].slice(0, 90)}” (reference before quote: ${pre[0]})`);
      }
      continue;
    }
    const bookName = (r[1] || '').toLowerCase();
    const bookId = bookName ? BOOK_IDS[bookName] : defaultBook;
    if (bookName && !bookId) continue;                    // e.g. Genesis — no WEB text on disk
    const verses = webChapter(bookId, +r[2]);
    if (!verses && bookName) continue;
    // Split on ellipses (and handle brackets, see quoteFrags); each fragment must exist.
    const frags = quoteFrags(m[1]);
    if (!frags.length) continue;
    const missing = frags.filter(f => !corpus().includes(f));
    checkedQuotes++;
    const show = `“${m[1].slice(0, 90)}${m[1].length > 90 ? '…' : ''}” → ${r[0].replace(/^\(/, '').trim()}`;
    if (missing.length) { out.push(`${where}: NOT-IN-WEB ${show}`); continue; }
    if (bookName && verses) {
      const v1 = +r[3], v2 = r[4] ? +r[4] : v1;
      const near = words(verses.filter(v => v.verse >= v1 - 2 && v.verse <= v2 + 2).map(v => v.text).join(' '));
      if (frags.some(f => !near.includes(f))) out.push(`${where}: WRONG-REF ${show}`);
    }
  }
}

function walkStrings(obj, fn, path = '') {
  if (typeof obj === 'string') return fn(obj, path);
  if (Array.isArray(obj)) return obj.forEach((x, i) => walkStrings(x, fn, `${path}[${i}]`));
  if (obj && typeof obj === 'object') for (const k of Object.keys(obj)) {
    if (k === 'scripture') {           // skip verse text itself, but check the notes
      obj[k].forEach((v, i) => walkStrings(v.understanding, fn, `${path}.scripture[v${v.v}]`));
      continue;
    }
    walkStrings(obj[k], fn, path ? `${path}.${k}` : k);
  }
}

function checkLemma(entry, where, out) {
  const ids = String(entry.strongs ?? '').match(/[HG]\d+/g);
  if (!ids) return;
  const printed = bare(entry.hebrew);
  if (!printed) return;
  // The printed word must match the lemma of at least one cited id (compound idioms cite several).
  const lemmas = ids.map(id => DICT[id]?.lemma).filter(Boolean);
  if (!lemmas.length) return; // missing ids are build-data.mjs's job
  if (lemmas.some(l => bare(l) === printed)) return;
  // allow a compound entry printed with spaces/hyphens ("ἐν Χριστῷ")
  if (bare(lemmas.join('')) === printed) return;
  out.push(`${where}: LEMMA ${ids[0]} is “${lemmas[0]}” but printed “${entry.hebrew}”`);
}

/* ── Run ─────────────────────────────────────────────────────── */
const contentDir = join(ROOT, 'content');
const books = readdirSync(contentDir, { withFileTypes: true })
  .filter(e => e.isDirectory() && e.name !== 'schemas').map(e => e.name)
  .filter(b => !only.length || only.includes(b));

let totalProblems = 0, checkedQuotes = 0;
for (const bookId of books.sort()) {
  const dir = join(contentDir, bookId);
  const files = readdirSync(dir).filter(f => f.endsWith('.json'))
    .sort((a, b) => (parseInt(a.match(/\d+/)?.[0] ?? (a.startsWith('master') ? 0 : 999)) -
                     parseInt(b.match(/\d+/)?.[0] ?? (b.startsWith('master') ? 0 : 999))));
  const lemmaIssues = [], quoteIssues = [], depth = [];
  for (const f of files) {
    const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const tag = `${bookId}/${f}`;
    for (const v of d.scripture ?? []) for (const w of v.words ?? []) checkLemma(w, `${tag} v${v.v}`, lemmaIssues);
    for (const w of d.lexicon ?? []) checkLemma(w, `${tag} lexicon`, lemmaIssues);
    walkStrings(d, (s, p) => checkQuotes(s, bookId, `${tag} ${p}`, quoteIssues));
    if (d.type === 'chapterStudy') {
      const kb = Math.round(JSON.stringify(d).length / 1024);
      const n = d.scripture.length;
      const tagged = d.scripture.filter(v => (v.words ?? []).length).length;
      depth.push(`ch${d.chapter}: ${kb}KB, ${n}v (${tagged} tagged), VM ${d.visualMeditations.length}, ` +
        `comm ${d.commentary.sections.length}, lex ${d.lexicon.length}, HSR ${d.holySpiritRevelation.items.length}, ` +
        `audit ${d.lifeApplication.audit.length}/${d.lifeApplication.practices.length}, stories ${d.storyConnections.length}`);
    }
  }
  totalProblems += lemmaIssues.length + quoteIssues.length;
  console.log(`\n■ ${bookId} — ${lemmaIssues.length} lemma, ${quoteIssues.length} quote issue(s)`);
  if (only.length) depth.forEach(x => console.log('   ' + x));
  [...lemmaIssues, ...quoteIssues].forEach(x => console.log('   - ' + x));
}
console.log(`\nChecked ${checkedQuotes} referenced quotation(s).`);
console.log(`${totalProblems ? totalProblems + ' issue(s) found.' : 'Deep verification clean.'}`);
if (strict && totalProblems) process.exit(1);
