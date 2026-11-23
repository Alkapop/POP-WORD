# POP-WORD — working notes for every session

POP-WORD is an offline Bible study app. This repo is where development happens.
**Alkapop/POP-WORD-PAGES** is the live GitHub Pages site (served from `master`): it gets a
copy of `app/` after every change here.

## Writing a book
- Follow `MASTER-FORMAT-PROMPT.md` exactly: Master Introduction, **every** chapter, Final
  Masterclass Review. Each introduction bridges from the previous book's Road Ahead.
- Content lives in `content/<book>/` (`master-introduction.json`, `chapter-N.json`,
  `final-review.json`). Chapters are usually drafted compactly and expanded with
  `node build/expand-draft.mjs <bookId> "<Book Name>" <draft.json>`.
- Scripture is the exact WEB text from `sources/bible/<book>-<ch>.json`.

## Quotation rules (the verifier enforces them)
- Double quotes “…” are only for **exact WEB text**, each followed by its own reference
  `(Book C:V)` or `(C:V)` / `(v. N)`. Split combined references (“Ephesians 2:1, 5” → two quotes).
- Paraphrases, glosses and prompts use single quotes ‘…’. No Greek or Hebrew inside “…”.
- Only quote books that exist in `sources/bible/`; otherwise paraphrase in single quotes.

## Word families — always say WHICH original word
English hides several original words behind one word: power (δύναμις, ἐνέργεια, κράτος,
ἰσχύς, ἐξουσία, ἀρχή), time (χρόνος, καιρός, ὥρα, αἰών, ἡμέρα), love (ἀγαπάω, φιλέω…),
signs & wonders, know, word, life, new, another, world, servant, work, sin, evil, pray, good,
see, rise, sleep,
and Hebrew names of God, sin, love, strength, time. The list is `sources/word-families.json`.
- Tag the word with its Strong's id and the exact English it renders (`english`).
- The verse's understanding note names which word it is and how it differs from its siblings.
- A verse with two or more members of one family: tag them all and make the contrast the point.
- Meet a new English word that hides several originals? Add a family to
  `sources/word-families.json` (the build validates ids and anchor verses).
- In the app, tapping a word shows the verse with the word highlighted, its family (with
  anchor verses), and every place it is tagged across the site, with how it was translated.

## Verification gates — run all before publishing
1. **G1** `node build/build-data.mjs` — structure, exact WEB text, Strong's ids, word families.
2. **G2** `node build/verify-content.mjs <bookId> --strict` — lemmas, every referenced quote
   against the WEB (NOT-IN-WEB, WRONG-REF, reference-before-quote, and quotes marked “(v. N)”).
   Check its exit code, not just its last line. It cannot catch a wrong Strong's id (the lemma
   is filled from the id), so look each id up before using it.
3. **G3** `NODE_PATH=$(npm root -g) node build/render-check.cjs app <bookId> [shotDir]` —
   every document renders in Chromium, verse tap + lexicon panel work, no console errors.
4. **G4** copy `app/css`, `app/data`, `app/js`, `app/index.html` into POP-WORD-PAGES, then
   `diff -rq` each — must be identical.
Log each book in `CHECKPOINTS.md`. Known backlog in older books: `FIXES-TODO.md`.

## Git
- Work on a feature branch in both repos; open draft PRs; merge only when the owner asks.
- Never put model names in commits, PRs or files.
