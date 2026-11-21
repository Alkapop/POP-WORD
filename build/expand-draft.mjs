/**
 * Expand a chapter DRAFT into a full content/<book>/chapter-N.json.
 *
 * The draft carries only what a writer must author. Everything that must be copied
 * exactly is filled from the offline sources, so it cannot be mistyped:
 *   - every verse's text           ← sources/bible/<book>-<n>.json (WEB)
 *   - every Greek/Hebrew lemma     ← Strong's dictionary entry for the cited number
 *   - every transliteration        ← the same entry
 *
 * Draft shape (JSON):
 * {
 *   "chapter": 1, "chapterTitle": "...", "themeTitle": "...",
 *   "verses": { "1": ["understanding note", [["G652","apostle"], ["G1577","assembly"]]], ... },
 *   "visualMeditations": [...], "commentary": {...}, "holySpiritRevelation": {...},
 *   "lifeApplication": {...}, "prayerReflection": "...", "storyConnections": [...],
 *   "lexicon": [ { "strongs": "G3874", "also": [["G3870","verb"]], "english": "...",
 *                  "verses": "...", "insight": "..." } ]
 * }
 *
 * Run: node build/expand-draft.mjs <bookId> "<Book Name>" <draft.json> [more drafts...]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [bookId, bookName, ...drafts] = process.argv.slice(2);
if (!bookId || !bookName || !drafts.length) {
  console.error('usage: node build/expand-draft.mjs <bookId> "<Book Name>" <draft.json>...');
  process.exit(2);
}

function loadDict(file, varName) {
  const src = readFileSync(join(ROOT, 'sources', 'lexicon', file), 'utf8')
    .replace(/module\.exports\s*=\s*\w+\s*;?/g, '');
  return new Function(`${src}; return ${varName};`)();
}
const DICT = {
  ...loadDict('strongs-greek-dictionary.js', 'strongsGreekDictionary'),
  ...loadDict('strongs-hebrew-dictionary.js', 'strongsHebrewDictionary')
};
const entry = (id, where) => {
  const e = DICT[id];
  if (!e) throw new Error(`${where}: Strong's ${id} not in the offline dictionary`);
  return e;
};

let failed = false;
for (const draftPath of drafts) {
  try {
    const d = JSON.parse(readFileSync(draftPath, 'utf8'));
    const where = `${bookId} ${d.chapter}`;
    const src = JSON.parse(readFileSync(join(ROOT, 'sources', 'bible', `${bookId}-${d.chapter}.json`), 'utf8'));

    const missing = src.verses.filter(v => !d.verses[String(v.verse)]).map(v => v.verse);
    if (missing.length) throw new Error(`${where}: no draft note for verse(s) ${missing.join(', ')}`);
    const extra = Object.keys(d.verses).filter(k => !src.verses.some(v => String(v.verse) === k));
    if (extra.length) throw new Error(`${where}: draft has verse(s) not in WEB: ${extra.join(', ')}`);

    const scripture = src.verses.map(v => {
      const [understanding, ws = []] = d.verses[String(v.verse)];
      const out = { v: v.verse, text: v.text.replace(/\s+/g, ' ').trim(), understanding };
      if (ws.length) out.words = ws.map(([id, english]) => {
        const e = entry(id, `${where}:${v.verse}`);
        return { strongs: id, hebrew: e.lemma, translit: e.translit ?? e.xlit, english };
      });
      return out;
    });

    const lexicon = d.lexicon.map(l => {
      const e = entry(l.strongs, `${where} lexicon`);
      const also = (l.also ?? []).map(([id, label]) => {
        const a = entry(id, `${where} lexicon`);
        return `${label} ${a.lemma}, ${a.translit ?? a.xlit}, ${id}`;
      });
      return {
        english: l.english, hebrew: e.lemma, translit: e.translit ?? e.xlit,
        strongs: also.length ? `${l.strongs} (${also.join('; ')})` : l.strongs,
        verses: l.verses, insight: l.insight
      };
    });

    const out = {
      type: 'chapterStudy', book: bookName, chapter: d.chapter,
      chapterTitle: d.chapterTitle, themeTitle: d.themeTitle, scripture,
      visualMeditations: d.visualMeditations, commentary: d.commentary, lexicon,
      holySpiritRevelation: d.holySpiritRevelation,
      lifeApplication: {
        auditIntro: 'Ask yourself deeply and honestly:', audit: d.lifeApplication.audit,
        practicesIntro: 'Live this chapter by:', practices: d.lifeApplication.practices
      },
      prayerReflection: d.prayerReflection, storyConnections: d.storyConnections
    };
    if (!out.commentary.ntConnection.heading) out.commentary.ntConnection = { heading: 'New Testament Connection', ...out.commentary.ntConnection };

    mkdirSync(join(ROOT, 'content', bookId), { recursive: true });
    const dest = join(ROOT, 'content', bookId, `chapter-${d.chapter}.json`);
    writeFileSync(dest, JSON.stringify(out, null, 2) + '\n', 'utf8');
    const tagged = scripture.filter(v => v.words).length;
    console.log(`✓ ${where}: ${scripture.length} verses (${tagged} tagged), ${lexicon.length} lexicon → ${dest.replace(ROOT + '/', '')} (${Math.round(JSON.stringify(out).length / 1024)}KB)`);
  } catch (e) {
    failed = true;
    console.error(`✗ ${draftPath}: ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);
