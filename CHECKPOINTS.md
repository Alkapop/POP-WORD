# POP-WORD — Checkpoint Log

Every milestone is logged here with the verification that proved it. A checkpoint is
only marked ✅ when its checks actually ran and passed.

**Verification gates**

| Gate | Command | What it proves |
|------|---------|----------------|
| G1 Build | `node build/build-data.mjs` | Every section present; every verse present with exact WEB text; every Strong's id exists |
| G2 Deep | `node build/verify-content.mjs <book> --strict` | Every printed Greek/Hebrew word matches its Strong's lemma; every quotation tagged with a reference exists in the WEB text |
| G3 Render | headless Chromium opens the app, every chapter of the book renders with all 9 sections | The app actually displays it |
| G4 Sync | rebuilt `app/` copied to POP-WORD-PAGES and byte-compared | The live site gets exactly what was verified |

---

## 2026-11-21 — Session: learn the site, sync, continue with 1 Corinthians

### CP-01 ✅ Source repo re-synced with the live site
- Found: POP-WORD-PAGES (live) had 13 built books; this repo only had source JSON for 5
  (Matthew stopped at ch. 15). Reconstructed `content/` for Matthew 16–28, Mark, Luke, John,
  Acts, Romans, 2 Corinthians, Galatians, Ephesians from the deployed build; took the live
  (verifier-corrected) Matthew 1–15.
- Fixed: stray space in fetched WEB Matthew 21:30 (`I’ m` → `I’m`); validator now accepts an
  editorial note on verses the WEB omits (Luke 17:36, Acts 15:34, 24:7, Romans 16:25).
- G1 ✅ all validations passed, 13 books. G4 ✅ rebuilt `app/data/books/*.js` byte-identical to live.

### CP-02 ✅ Deep verifier + draft expander added
- `build/verify-content.mjs` — lemma and quotation checks (G2).
- `build/expand-draft.mjs` — fills verse text, lemmas and transliterations from the offline
  sources so they cannot be mistyped.
- Baseline on the 13 existing books (advisory, not yet fixed): 32 LEMMA notes (mostly inflected
  forms printed instead of the dictionary lemma — John 20, Matthew 27, Luke 11) and ~25
  NOT-IN-WEB quotations (paraphrases/KJV wording printed as WEB quotations, e.g. Mark 7 → Acts
  10:15 “call common” where WEB reads “call unclean”). Backlog item: correct these.

### Book queue (canonical order)
| # | Book | Status |
|---|------|--------|
| 36–39 | Zephaniah, Haggai, Zechariah, Malachi | ✅ live |
| 40–45 | Matthew, Mark, Luke, John, Acts, Romans | ✅ live |
| 46 | **1 Corinthians** (16 ch.) | ✅ built & verified this session |
| 47–49 | 2 Corinthians, Galatians, Ephesians | ✅ live |
| 50 | Philippians (4 ch.) | next |

### CP-03 Gate hardening
- Build now validates an in-progress book file by file (was: skipped silently until complete).
- Verifier reports how many quotations it checked; minimum quote length lowered 25 → 14 chars
  after a negative test showed a short misquote slipping through. Three injected misquotes
  (Matthew 9:16, Matthew 11:25, Ephesians 4:3) are all now caught.

### CP-04 1 Corinthians — per-document log
| Doc | Size | Verses | G1 Build | G2 Deep (quotes checked) | Notes |
|-----|------|--------|----------|--------------------------|-------|
| Master Introduction | 18KB | — | ✅ | ✅ (0 issues) | Bridge from Romans; core theme 1:23–24 |
| Chapter 1 | 53KB | 31/31 | ✅ | ✅ (38) | Caught & fixed: “mending their nets” is Matthew 4:21, not Mark 1:19 |
| Chapter 2 | 41KB | 16/16 | ✅ | ✅ (48 total) | Caught & fixed: Colossians 2:15 wording (“stripped”, not “disarmed”); 1 Peter 1:10 ref
| Chapter 3 | 46KB | 23/23 | ✅ | ✅ (59 total) | Purgatory reading of 3:15 addressed honestly |
| Chapter 4 | 46KB | 21/21 | ✅ | ✅ (68 total) | |
| Chapter 5 | 39KB | 13/13 | ✅ | ✅ (79 total) | |
| Chapter 6 | 47KB | 20/20 | ✅ | ✅ (91 total) | Paraphrase in quote marks flagged & reworded (v. 4); 6:9 terms handled per the strongest textual reading |
| Chapter 7 | 60KB | 40/40 | ✅ | ✅ (104 total) | Debated texts (7:15, 7:21, 7:36) given one honest sentence each |
| Chapter 8 | 37KB | 13/13 | ✅ | ✅ (116 total) | Ambiguous quote/ref order flagged & reworded |
| Chapter 9 | 49KB | 27/27 | ✅ | ✅ (131 total) | |
| Chapter 10 | 53KB | 33/33 | ✅ | ✅ (145 total) | Bracketed edit inside James 1:14 quote flagged & restored to exact WEB |
| Chapter 11 | 55KB | 34/34 | ✅ | ✅ (157 total) | Caught & fixed: Galatians 3:28 paraphrase in quote marks; Exodus 13:8 set to WEB wording |
| Chapter 12 | 50KB | 31/31 | ✅ | ✅ (166 total) | Clean first pass |
| Chapter 13 | 40KB | 13/13 | ✅ | ✅ (179 total) | “The perfect” (v. 10) read from v. 12 (Christ’s return), per strongest textual reading |
| Chapter 14 | 61KB | 40/40 | ✅ | ✅ (193 total) | 14:34–35 handled with the reading consistent with 11:5; two quote fixes |
| Chapter 15 | 72KB | 58/58 | ✅ | ✅ (208 total) | Firstfruits-day claim softened to match the calendar dispute; 15:29 handled honestly |
| Chapter 16 | 46KB | 24/24 | ✅ | ✅ (231 total) | Caught & fixed: 2 Corinthians 8:21 was in non-WEB wording |
| Final Masterclass Review | 25KB | — | ✅ | ✅ (272 total) | Road Ahead → 2 Corinthians, Galatians (consistent with their existing bridges) |

**Book total:** 16 chapters, 437/437 verses, 1,590 Greek word tags (every lemma from Strong's), 80 lexicon entries, 272 referenced quotations verified against the WEB. Compiled `app/data/books/1corinthians.js` = 888KB.

### CP-05 ⚠️ Data bug found: single-chapter books fetched as one verse
- `sources/bible/{philemon,2john,3john,jude}-1.json` each hold only verse 1 (bible-api read
  “jude 1” as Jude 1:1). Not yet affecting the site (none of these books is written), but the
  build would have accepted a one-verse chapter.
- Fixed `build/fetch-nt.mjs` to request the full verse range and to re-fetch these four files.
- **Blocked here:** bible-api.com is not allowed by this cloud environment's network policy.
  Run `node build/fetch-nt.mjs` on a machine with internet (or allow bible-api.com) before
  writing Philemon, 2 John, 3 John or Jude.

### CP-06 ✅ G3 render gate — 1 Corinthians in a real browser
- Headless Chromium opened all 18 documents: every section present (6/9/5), all 437 verses and
  1,590 word chips rendered, verse tap + Greek lexicon panel work, zero page/console errors.
  Saved as `build/render-check.cjs`.

### CP-07 ✅ Renderer fix — doubled quotation marks (affected the live site)
- The app wraps theme titles and prayers in quotation marks; most content already included
  them, so 122 of 197 live chapters showed ““…””. `render.js` now strips existing outer quotes
  (`unq`). Verified on all 239 pages of all 14 books: zero doubled quotes, zero errors.

### CP-08 ✅ G4 sync
- `app/` copied to POP-WORD-PAGES; `diff -rq` byte-identical; G3 re-run against the Pages
  folder itself: PASSED.

### Next session
1. Philippians (book 50, 4 ch.). Bridge from Ephesians; Road Ahead → Colossians, 1 Thessalonians.
2. Re-fetch single-chapter books (CP-05) before Philemon / 2–3 John / Jude.
3. Backlog: correct the ~25 NOT-IN-WEB quotations and 32 inflected-lemma tags in older books
   (`node build/verify-content.mjs` lists every one).

---

## 2026-11-21 — Philippians

| Doc | Size | Verses | G1 Build | G2 Deep | Notes |
|-----|------|--------|----------|---------|-------|
| Master Introduction | 18KB | — | ✅ | ✅ | Bridge from Ephesians (matches its Road Ahead) |
| Chapter 1 | 50KB | 30/30 | ✅ | ✅ | |
| Chapter 2 | 52KB | 30/30 | ✅ | ✅ | John 1:1 and 1:14 split into separate references |
| Chapter 3 | 47KB | 21/21 | ✅ | ✅ | Four reference placements corrected |
| Chapter 4 | 49KB | 23/23 | ✅ | ✅ | Caught & fixed: 1 Timothy 1:12 word order; 1 Peter 1:5 misquote |
| Final Masterclass Review | 21KB | — | ✅ | ✅ (119 quotes) | Road Ahead → Colossians, 1 Thessalonians |

- **G3** ✅ all 6 documents render; verse tap + lexicon panel work; no errors.
  Whole site: 246 pages, 15 books, no errors, no doubled quotes.
- **Verifier improved:** a quotation whose reference is written *before* it is now checked too
  (the 1 Peter 1:5 slip had passed the old check). It also found two non-Scripture phrases in
  quotation marks in 1 Corinthians (9:20 note, ch. 14 meditation), now in single quotes.
- `build/render-check.cjs` now works for any book (the interaction step was tied to 1 Cor 13).
- `FIXES-TODO.md` regenerated: 33 / 32 / 29 open items, all in older books.

### Book queue
| # | Book | Status |
|---|------|--------|
| 46 | 1 Corinthians | ✅ live |
| 50 | Philippians | ✅ live |
| 51 | Colossians | ✅ built & verified |

---

## 2026-11-21 — Colossians

| Doc | Size | Verses | G1 Build | G2 Deep | Notes |
|-----|------|--------|----------|---------|-------|
| Master Introduction | 16KB | — | ✅ | ✅ | Bridge from Philippians (matches its Road Ahead) |
| Chapter 1 | 53KB | 29/29 | ✅ | ✅ | |
| Chapter 2 | 50KB | 23/23 | ✅ | ✅ | Caught & fixed: 1 Timothy 4:3 (“commanding to abstain”); Ephesians 2:1 and 2:5 split |
| Chapter 3 | 49KB | 25/25 | ✅ | ✅ | Caught & fixed: Colossians 2:23 (“aren’t of any value against…”) |
| Chapter 4 | 40KB | 18/18 | ✅ | ✅ | Caught & fixed: Philippians 1:13 (“palace guard”). Philemon quoted only in paraphrase (local source still 1 verse, see FIXES-TODO) |
| Final Masterclass Review | 18KB | — | ✅ | ✅ (138 quotes) | Road Ahead → 1 Thessalonians, 2 Thessalonians |

- **Book total:** 4 chapters, 95/95 verses, 498 Greek word tags, 20 lexicon entries,
  138 referenced quotations checked against the WEB. Compiled `app/data/books/colossians.js` = 241KB.
- **G3** ✅ all 6 documents render (intro, ch. 1–4, review); verse tap + lexicon panel work; no errors.
- Backlog in older books unchanged: 33 NOT-IN-WEB / 32 LEMMA / 29 WRONG-REF (`FIXES-TODO.md`).

### Book queue
| # | Book | Status |
|---|------|--------|
| 51 | Colossians | ✅ live |
| 52 | 1 Thessalonians | ✅ built & verified |

---

## 2026-11-21 — CP-09 Word study: verse context, word families, site concordance

Why: one English word often hides several original words (Ephesians 1:19 uses four Greek
words for ‘power’). Tapping a word now shows exactly which one it is and how it is used.

- **Data:** `sources/word-families.json` — 19 families (14 Greek, 5 Hebrew), 77 words. Every
  Strong's id checked against the dictionary; 74 anchor verses embedded from the WEB, and the
  build fails if an anchor verse does not contain the English word it is meant to show.
  (Genesis 17:1, Psalm 32:5 and Psalm 46:1 show as references until those books are on disk.)
  Negative test: changing Acts 1:8's word to ‘authority’ is rejected by the build.
- **Panel:** In this verse (rendering highlighted, other family words in the same verse) ·
  Strong's entry · Word family (sense + anchor verse for each member) · Across POP·WORD
  (how often it is tagged, every English rendering with counts, every reference — tap to
  open that verse). Deep links `#/read/<book>/<ch>/<verse>` open the verse unfolded.
- **Fix found while testing:** the panel stayed open over a new page after Back; it now closes
  on every page change.
- **Rule recorded:** `MASTER-FORMAT-PROMPT.md` grounding rule 6 and the new `CLAUDE.md` — every
  future chapter names which original word stands behind power/time/love/word/sin etc.
- **Gates:** G1 ✅ · G2 ✅ (backlog unchanged 33/32/29) · G3 ✅ all 16 books · feature test
  20/20 (Ephesians 1:19 siblings, family, concordance, show-all, sibling tap, jump to Acts 19:20,
  Zechariah 4:6 Hebrew family, phone width with no overflow, no console errors).

---

## 2026-11-22 — 1 Thessalonians (first book under the word-family rule)

| Doc | Size | Verses | G1 Build | G2 Deep | Notes |
|-----|------|--------|----------|---------|-------|
| Master Introduction | 12KB | — | ✅ | ✅ (20 quotes) | Bridge from Colossians (matches its Road Ahead) |
| Chapter 1 | 32KB | 10/10 | ✅ | ✅ | 1:3 ἔργον / κόπος; 1:5 λόγος / δύναμις. New **work** family |
| Chapter 2 | 41KB | 20/20 | ✅ | ✅ | 2:9 three work words; 2:13 ἐνεργέω added to **power**; 2:7 ἤπιοι/νήπιοι and 2:14–16 handled honestly |
| Chapter 3 | 33KB | 13/13 | ✅ | ✅ | 3:10 δέομαι added to **pray**; ‘exceedingly’ left untagged (no single Strong's entry) |
| Chapter 4 | 39KB | 18/18 | ✅ | ✅ | 4:9 φιλαδελφία / ἀγαπάω; new **rise** and **sleep** families. Caught & fixed: Greek inside a quote (v. 17) |
| Chapter 5 | 45KB | 28/28 | ✅ | ✅ | 5:1 χρόνος / καιρός; 5:6 καθεύδω / γρηγορέω; 5:15 ἀγαθός vs 5:21 καλός; new **evil** family |
| Final Masterclass Review | 16KB | — | ✅ | ✅ (251 quotes) | Road Ahead → 2 Thessalonians, 1 Timothy |

- **Book total:** 5 chapters, 89/89 verses, 25 lexicon entries, 251 referenced quotations checked.
- **Word families:** 19 → 23 families, 77 → 93 words (work, rise, sleep, evil; ἐνεργέω, δέομαι, κοπιάω).
- **Verifier improved:** quotations followed by “(v. N)” were being skipped or paired with a later
  reference. They are now checked against the WEB. This found 14 more misquotes site-wide; the 5 in
  1 Corinthians, Philippians and Colossians were fixed, the rest are in `FIXES-TODO.md`
  (now 42 NOT-IN-WEB / 32 LEMMA / 28 WRONG-REF).
- **G3** ✅ all 7 documents render; 1 Corinthians, Philippians and Colossians re-rendered after fixes.
  Word-panel spot checks 7/7 (5:1, 4:9, 2:9, 5:6, 4:14, 5:22); word-study regression test 20/20.

### Book queue
| # | Book | Status |
|---|------|--------|
| 52 | 1 Thessalonians | ✅ live |
| 53 | 2 Thessalonians | ✅ built & verified |

---

## 2026-11-23 — 2 Thessalonians

| Doc | Size | Verses | G1 Build | G2 Deep | Notes |
|-----|------|--------|----------|---------|-------|
| Master Introduction | 10KB | — | ✅ | ✅ (19 quotes) | Bridge from 1 Thessalonians (matches its Road Ahead) |
| Chapter 1 | 33KB | 12/12 | ✅ | ✅ | 1:9 judgment stated plainly; new **signs & wonders** family. Caught & fixed: a Strong's quote paired with the next reference. Caught by hand: G1460 (ἐγκατοικέω) → G2744 καυχάομαι |
| Chapter 2 | 42KB | 17/17 | ✅ | ✅ | 2:3 ἁμαρτία / ἀνομία variant; the restrainer's main views given without speculation; 2:9 δύναμις + σημεῖον + τέρας; ἀδικία added to **sin** |
| Chapter 3 | 36KB | 18/18 | ✅ | ✅ | 3:8 work triple; 3:11 ἐργάζομαι / περιεργάζομαι (added to **work**); 3:9 ἐξουσία ‘right’; 3:17 σημεῖον |
| Final Masterclass Review | 14KB | — | ✅ | ✅ (168 quotes) | Road Ahead → 1 Timothy, 2 Timothy |

- **Book total:** 3 chapters, 47/47 verses, 15 lexicon entries, 168 referenced quotations checked (exit 0).
- **Word families:** 23 → 24 families, 93 → 98 words.
- **G3** ✅ all 5 documents; word-panel spot checks 8/8 (2:9 ×2, 2:7, 3:8, 3:11, 3:9, 3:3).
  Word-study regression 21/21 (now checks that δύναμις shows both of its families).
- Backlog unchanged: 42 NOT-IN-WEB / 32 LEMMA / 28 WRONG-REF.

### Book queue
| # | Book | Status |
|---|------|--------|
| 53 | 2 Thessalonians | ✅ live |
| 54 | 1 Timothy | ✅ built & verified |

---

## 2026-11-23 — 1 Timothy

| Doc | Size | Verses | G1 Build | G2 Deep | Notes |
|-----|------|--------|----------|---------|-------|
| Master Introduction | 11KB | — | ✅ | ✅ (22 quotes) | Bridge from 2 Thessalonians (matches its Road Ahead) |
| Chapter 1 | 42KB | 20/20 | ✅ | ✅ | New **godliness** family; ἐνδυναμόω (power), ἑτεροδιδασκαλέω (another); 1:10 ἀρσενοκοίτης stated plainly, with 1:15 |
| Chapter 2 | 36KB | 15/15 | ✅ | ✅ | 2:1 four prayer words (pray family +3); 2:11–15 strongest reading + one honest sentence; 2:15 readings set out. **Verifier fix:** WEB text with parentheses (2:10) no longer flagged; negative test still catches a bracketed misquote |
| Chapter 3 | 37KB | 16/16 | ✅ | ✅ | ‘one-woman man’; 3:11 wives / women deacons; 3:16 θεός / ὅς variant; διάβολος = devil & slanderers |
| Chapter 4 | 37KB | 16/16 | ✅ | ✅ | γυμνασία vs εὐσέβεια; ἔντευξις as ‘prayer’. Caught & fixed: Mark 7:19 wording; a self-quote without its (v. N) |
| Chapter 5 | 45KB | 25/25 | ✅ | ✅ | 5:10 καλός + ἀγαθός; 5:18 Luke 10:7 called Scripture; εὐσεβέω, ἐργάτης, περίεργος added |
| Chapter 6 | 47KB | 21/21 | ✅ | ✅ | 6:1–2 slavery read honestly (1:10; 1 Cor 7:21); 6:10 ‘a root of all kinds of’ κακά; δυνάστης, κράτος, αἰών, ἀγαθοεργέω |
| Final Masterclass Review | 14KB | — | ✅ | ✅ (261 quotes) | Road Ahead → 2 Timothy, Titus |

- **Book total:** 6 chapters, 113/113 verses, 30 lexicon entries, 261 referenced quotations checked (exit 0).
  Every quoted Strong's definition compared with the dictionary text (two corrected: G5179 truncation, G4306 comma).
- **Word families:** 24 → 25 families, 98 → 111 words.
- **G3** ✅ all 8 documents; word-panel spot checks 9/9. Word-study regression 21/21 — it now reads the
  expected family size from the data instead of a hard-coded number.
- Backlog unchanged: 42 NOT-IN-WEB / 32 LEMMA / 28 WRONG-REF.

### Book queue
| # | Book | Status |
|---|------|--------|
| 54 | 1 Timothy | ✅ built & verified |
| 55 | 2 Timothy (4 ch.) | ✅ built & verified (below) |

## 2026-11-23 — 2 Timothy

| Doc | Size | Verses | G1 Build | G2 Deep | Notes |
|-----|------|--------|----------|---------|-------|
| Master Introduction | 10KB | — | ✅ | ✅ (22 quotes) | Bridge from 1 Timothy (matches its Road Ahead) |
| Chapter 1 | 38KB | 18/18 | ✅ | ✅ | 1:7 δύναμις + ἀγάπη + σωφρονισμός; 1:10 ἐπιφάνεια of the first coming. Caught by hand: G3093 (Magdala) → G3090 Λωΐς |
| Chapter 2 | 47KB | 26/26 | ✅ | ✅ | Soldier, athlete, farmer, workman; 2:12 ‘deny’ kept out of “…”. Caught & fixed: a Strong's quote paired with the next reference; G2689 → G2675 |
| Chapter 3 | 39KB | 17/17 | ✅ | ✅ | 3:2–4 five φιλ- ‘lover’ words added to the **love** family; 3:5 form of εὐσέβεια, denied δύναμις; εὐσεβῶς added to **godliness**; 3:6 and 3:8 (Jannes, Jambres) read honestly; 3:16 θεόπνευστος and its two readings. Caught & fixed: 3 quote/reference pairings |
| Chapter 4 | 44KB | 22/22 | ✅ | ✅ | 4:2 εὐκαίρως / ἀκαίρως added to the **time** family; 4:8 and 4:10 ἀγαπάω — ‘loved his appearing’ vs ‘loved this present’ αἰών; 4:8 / 4:14 ἀποδίδωμι ‘give’ and ‘repay’; 4:14 κακός vs 4:18 πονηρός |
| Final Masterclass Review | 14KB | — | ✅ | ✅ (26 quotes) | Road Ahead → Titus, Philemon. Philemon is quoted only from 1:1, the one verse on disk. Caught & fixed: 1:6 wording |

- **Book total:** 4 chapters, 83/83 verses, 20 lexicon entries, 198 referenced quotations checked (exit 0).
  Every quoted Strong's definition compared with the dictionary text.
- **Word families:** 25 families, 111 → 120 words (love +5 φιλ- compounds; godliness +2, ἀσέβεια and εὐσεβῶς; time +2, εὐκαίρως and ἀκαίρως). Every anchor verse checked by G1 against the WEB.
- **G3** ✅ all 6 documents; word-panel spot checks 9/9. Word-study regression 21/21. Cyrillic scan: 0.
- Backlog unchanged: 42 NOT-IN-WEB / 32 LEMMA / 28 WRONG-REF.

### Book queue
| # | Book | Status |
|---|------|--------|
| 55 | 2 Timothy | ✅ built & verified |
| 56 | Titus (3 ch.) | ✅ built & verified (below) |
| 57 | Philemon (1 ch.) | needs the FIXES-TODO §1 re-fetch first (only 1:1 is on disk) |

## 2026-11-23 — Titus

| Doc | Size | Verses | G1 Build | G2 Deep | Notes |
|-----|------|--------|----------|---------|-------|
| Master Introduction | 10KB | — | ✅ | ✅ | Bridge from 2 Timothy (matches its Road Ahead); notes that Titus was probably written before 2 Timothy |
| Chapter 1 | 39KB | 16/16 | ✅ | ✅ | 1:2 χρόνος vs 1:3 καιρός; ἀψευδής vs the Cretans' ψεῦσται; 1:8 φιλόξενος + φιλάγαθος (love) and σώφρων + ἐγκρατής (new **self-control** family); 1:6 ‘children who believe’ and 1:12 Epimenides read honestly. Caught & fixed before G2: two nested-quote forms (Acts 17:28, 1 John 2:4) |
| Chapter 2 | 36KB | 15/15 | ✅ | ✅ | Every age group called to the σώφρων life; φίλανδρος / φιλότεκνος; 2:8 φαῦλος added to **evil**; 2:11 / 2:13 ἐπιφαίνω / ἐπιφάνεια (new **appear** family); 2:12 ἀσέβεια + εὐσεβῶς; 2:13 ‘our great God and Savior’ (Granville Sharp, 2 Peter 1:1); 2:15 ἐπιταγή added to **power** (WEB ‘authority’, not ἐξουσία) |
| Chapter 3 | 37KB | 15/15 | ✅ | ✅ | 3:1 ἀρχή + ἐξουσία; 3:2 ‘speak evil’ = βλασφημέω; 3:4 φιλανθρωπία; 3:5 not by works / 3:8 for works; λουτρόν, παλιγγενεσία, ἀνακαίνωσις (added to **new**); 3:15 φιλέω. Caught & fixed: a combined Ephesians 2:8–9 quote split in two; a self-quote paired with (v. 5) |
| Final Masterclass Review | 13KB | — | ✅ | ✅ | Road Ahead → Philemon (quoted only from 1:1, the one verse on disk), Hebrews |

- **Book total:** 3 chapters, 46/46 verses, 15 lexicon entries, 183 referenced quotations checked (exit 0).
  Every quoted Strong's definition compared with the dictionary text.
- **Word families:** 25 → 27 families, 120 → 145 words. New: **self-control** (νήφω, νηφάλιος, σώφρων, σωφρονέω,
  σωφρόνως, σωφροσύνη, σωφρονισμός, σωφρονίζω, ἐγκράτεια, ἐγκρατής) and **appear** (ἐπιφαίνω, ἐπιφάνεια, φανερόω,
  φαίνω, ὁράω/ὀπτάνομαι, ἀποκαλύπτω). Love +5 (φιλάγαθος, φιλόξενος, φίλανδρος, φιλότεκνος, φιλανθρωπία),
  good +1 (καλοδιδάσκαλος), evil +1 (φαῦλος), power +1 (ἐπιταγή), new +1 (ἀνακαίνωσις). `CLAUDE.md` list updated.
- **G3** ✅ all 5 documents; word-panel spot checks 15/15. Word-study regression 21/21. Cyrillic scan: 0.
- Backlog unchanged: 42 NOT-IN-WEB / 32 LEMMA / 28 WRONG-REF.

### Book queue
| # | Book | Status |
|---|------|--------|
| 56 | Titus | ✅ built & verified |
| 57 | Philemon (1 ch.) | blocked — only 1:1 is on disk; needs the FIXES-TODO §1 re-fetch |
| 58 | Hebrews (13 ch.) | ✅ built & verified (below) |

## 2026-11-23 — Hebrews

| Doc | Size | Verses | G1 Build | G2 Deep | Notes |
|-----|------|--------|----------|---------|-------|
| Master Introduction | 10KB | — | ✅ | ✅ | Bridge from Titus (its Road Ahead); authorship stated as unknown; Philemon noted as pending |
| Chapter 1 | 34KB | 14/14 | ✅ | ✅ | ῥῆμα (1:3) vs λόγος; χαρακτήρ vs εἰκών (new **image** family); αἰών / οἰκουμένη; LXX of Deut 32:43 stated honestly |
| Chapter 2 | 38KB | 18/18 | ✅ | ✅ | παράβασις + παρακοή; σημεῖα, τέρατα, δυνάμεις together; ὁράω vs βλέπω (2:8–9); 2:9 variant; κράτος of death; τελειόω (new **perfect** family) |
| Chapter 3 | 35KB | 19/19 | ✅ | ✅ | θεράπων (servant); σήμερον; κατέχω (new **hold** family); ἀπιστία = ἀπείθεια. Caught & fixed: G570 definition wording |
| Chapter 4 | 36KB | 16/16 | ✅ | ✅ | κατάπαυσις / καταπαύω / σαββατισμός (new **rest** family); λόγος living and ἐνεργής; κρατέω; εὔκαιρος help |
| Chapter 5 | 32KB | 14/14 | ✅ | ✅ | δέησις + ἱκετηρία; εὐλάβεια; αἴτιος vs ἀρχηγός (new **author** family); τέλειος; new **offering** family. Caught & fixed: a nested-quote paraphrase |
| Chapter 6 | 42KB | 20/20 | ✅ | ✅ | 6:4–6 warning: text's force plus the main readings named; two ‘impossibles’; ἄγκυρα, πρόδρομος. **Audit fix:** 6:1 ‘teaching’ re-tagged λόγος (was διδαχή) |
| Chapter 7 | 47KB | 28/28 | ✅ | ✅ | ἕτερος ‘another priest’ ×3; τελείωσις / τελειόω ×3; ἐντυγχάνω; ἐφάπαξ; ἀναφέρω (offering). Caught & fixed: a Strong's quote paired with the next reference |
| Chapter 8 | 33KB | 13/13 | ✅ | ✅ | ὑπόδειγμα / σκιά / τύπος (new **pattern** family); λατρεύω; γινώσκω vs οἶδα (8:11); ἀδικία / ἁμαρτία / ἀνομία (8:12) |
| Chapter 9 | 54KB | 28/28 | ✅ | ✅ | καιρός ‘present age’ vs αἰών ‘end of the ages’; three appearings: φανερόω, ἐμφανίζω (added), ὁράω; ἀγνόημα (sin); διαθήκη covenant / will |
| Chapter 10 | 59KB | 39/39 | ✅ | ✅ | θυσία, προσφορά, ὁλοκαύτωμα (10:5–8); σκιά vs εἰκών; πρόσφατος (new); 10:26–31 stated plainly; LXX ‘a body’ noted |
| Chapter 11 | 66KB | 40/40 | ✅ | ✅ | ὑπόστασις; ῥῆμα; ἐπίσταμαι (know); πρόσκαιρος (time); δυναμόω, ἰσχυρός (power); 11:11 and 11:21 readings. Caught & fixed: G3406 quoted exactly as the dictionary spells it |
| Chapter 12 | 53KB | 29/29 | ✅ | ✅ | ἀρχηγὸς καὶ τελειωτής; παιδεία (new **discipline** family); νέος vs καινός; Haggai 2:6 quoted directly; 12:28 reading noted. Caught & fixed: two Strong's quotes, the Greek of 12:28 |
| Chapter 13 | 44KB | 25/25 | ✅ | ✅ | φιλαδελφία, φιλοξενία, ἀφιλάργυρος; σήμερον + αἰών (13:8); ἀγρυπνέω (sleep); εὐποιΐα (good); καταρτίζω |
| Final Masterclass Review | 13KB | — | ✅ | ✅ | Road Ahead → James, 1 Peter |

- **Book total:** 13 chapters, 303/303 verses, 65 lexicon entries, 588 referenced quotations checked (exit 0).
- **Word families:** 27 → 35 families, 145 → 223 words. New: image, pattern, rest, perfect, hold, offering, author, discipline.
  Additions across see, sin, servant, power, time, pray, godliness, appear, new, know, love, sleep, good, life.
- **Family-claim audit (new):** every ‘from the X family’ in 2 Timothy, Titus and Hebrews verse notes now matches a tagged
  member, except five deliberate root references (e.g. ἄκακος ‘κακός negated’). The audit found that σήμερον, δύναμαι,
  ζάω, ἁμαρτάνω and several servant-family verbs were described as family words but were not members — added (with
  ἄνομος and ἐπιγινώσκω for 1 Timothy).
- **G3** ✅ all 15 documents (and 2 Timothy, Titus re-checked); word-panel spot checks 20/20; word-study regression 21/21; Cyrillic scan 0.
- Backlog unchanged: 42 NOT-IN-WEB / 32 LEMMA / 28 WRONG-REF.

### Book queue
| # | Book | Status |
|---|------|--------|
| 57 | Philemon (1 ch.) | blocked — only 1:1 is on disk; needs the FIXES-TODO §1 re-fetch |
| 58 | Hebrews | ✅ built & verified |
| 59 | James (5 ch.) | next — bridge from Hebrews; Road Ahead → 1 Peter, 2 Peter |

## 2026-11-23 — Backlog cleared; one-chapter books filled

- **FIXES-TODO §1 (stand-in):** `sources/bible/{philemon,2john,3john,jude}-1.json` filled from the WEB in the
  `world-english-bible` npm package 1.0.1 (25 / 13 / 14 / 25 verses), because bible-api.com is blocked from the cloud
  session. That is a newer WEB revision: about 70–85% of verses match the bible-api text word for word and the rest
  differ by small edits, and it has 14 verses in 3 John (bible-api has 15). Each file's `source` field says
  `npm:world-english-bible@1.0.1`, and `build/fetch-nt.mjs` now re-fetches any such stand-in from bible-api when it can.
- **§3 LEMMA (32):** each printed Greek/Hebrew word set to its Strong's dictionary lemma (John 2/10/18/20, Luke 11,
  Matthew 27, Romans 5, Ephesians 3, Zechariah 13).
- **§2 NOT-IN-WEB (42) and §4 WRONG-REF (28):** every quotation set to the exact WEB wording and placed directly before its
  own reference; combined references split; Old Testament books not on disk (2 Samuel, Jonah, Genesis, Isaiah)
  changed to single-quote paraphrase. Books touched: 2 Corinthians, Acts, Ephesians, Luke, Malachi, Galatians, Mark,
  John, Matthew, Romans.
- **G2 all books `--strict`:** exit 0 — 3521 referenced quotations, 0 lemma, 0 quote issues. **G1** exit 0.
- Backlog now: 0 NOT-IN-WEB / 0 LEMMA / 0 WRONG-REF.

### Book queue
| # | Book | Status |
|---|------|--------|
| 57 | Philemon (1 ch.) | next — text now on disk (npm WEB stand-in); bridge from Titus; Road Ahead → Hebrews, James |
| 58 | Hebrews | ✅ built & verified |
| 59 | James (5 ch.) | after Philemon |
