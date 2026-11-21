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
| 46 | **1 Corinthians** (16 ch.) | ⏳ in progress — was skipped |
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

### CP-05 ⚠️ Data bug found: single-chapter books fetched as one verse
- `sources/bible/{philemon,2john,3john,jude}-1.json` each hold only verse 1 (bible-api read
  “jude 1” as Jude 1:1). Not yet affecting the site (none of these books is written), but the
  build would have accepted a one-verse chapter.
- Fixed `build/fetch-nt.mjs` to request the full verse range and to re-fetch these four files.
- **Blocked here:** bible-api.com is not allowed by this cloud environment's network policy.
  Run `node build/fetch-nt.mjs` on a machine with internet (or allow bible-api.com) before
  writing Philemon, 2 John, 3 John or Jude.
