# POP-WORD — Fixes To Do

**Status 2026-11-23: every item below is done.** `node build/verify-content.mjs --strict` is clean across all books
(3521 referenced quotations, 0 lemma, 0 quote issues) and `node build/build-data.mjs` passes.
The lists are kept as a record of what was fixed. Add new items here if a check finds any.

---

## 1. Re-fetch the one-chapter books (do this before Philemon, 2 John, 3 John, Jude)

**Done 2026-11-23 with a stand-in.** bible-api.com is blocked from the cloud session, so the four files were filled
from the `world-english-bible` npm package 1.0.1 (a newer WEB revision; each file's `source` says so). That edition
has **14** verses in 3 John (it joins the old 14–15). Running `node build/fetch-nt.mjs` anywhere bible-api.com can be
reached replaces these stand-ins with the same edition as the other books — do that before or soon after writing them.

`sources/bible/{philemon,2john,3john,jude}-1.json` each contain **only verse 1**. The fetch
script is already fixed; it just has to be run on a machine with internet access
(the cloud session cannot reach bible-api.com).

```
node build/fetch-nt.mjs
node build/build-data.mjs
```

Check it worked — each should print the full verse count (25, 13, 15, 25):

```
node -e "for (const b of ['philemon','2john','3john','jude']) console.log(b, require('./sources/bible/'+b+'-1.json').verses.length)"
```

- [x] Philemon has 25 verses
- [x] 2 John has 13 verses
- [x] 3 John has 14 verses (npm edition; bible-api has 15)
- [x] Jude has 25 verses

---

## 2. Quotations printed in non-WEB wording (42 items) — real errors

These quotation marks contain words that do not appear anywhere in the WEB text (usually
KJV/NIV wording or a paraphrase written as a quotation). Fix each by replacing the quoted words
with the exact WEB wording, or by removing the quotation marks if it is meant as a paraphrase.

On 2026-11-22 the verifier began checking quotations followed by “(v. N)”, which it had been skipping. That found 14 more; the 5 in 1 Corinthians, Philippians and Colossians were fixed at once, and the rest are listed here.

To see the list again at any time:

```
node build/verify-content.mjs
```

- [x] `2corinthians/chapter-2.json .scripture[v9]` — “forgive him, comfort him” → (v. 7) and
- [x] `2corinthians/chapter-2.json commentary.sections[0].paragraphs[0]` — “fightings outside, fear inside” → 7:5
- [x] `2corinthians/chapter-4.json commentary.sections[0].paragraphs[0]` — “his letters are weighty and strong, but his bodily presence is weak, and his speech is des…” → 10:10
- [x] `2corinthians/chapter-5.json visualMeditations[1].image` — “we must all be revealed before the bēma of Christ,” (reference before quote: Acts 18:12)
- [x] `2corinthians/chapter-5.json storyConnections[2].summary` — “receive him as you would receive me... But if he has wronged you at all, or owes you anyth” (reference before quote: 2 Corinthians 5:21)
- [x] `2corinthians/chapter-6.json commentary.sections[1].paragraphs[0]` — “His letters are weighty and strong, but his bodily presence is weak, and his speech is des…” → 10:10
- [x] `2corinthians/chapter-10.json storyConnections[1].summary` — “Don't look on his face, or on the height of his stature, because I have rejected him; for ” (reference before quote: 2 Corinthians 10:7)
- [x] `2corinthians/chapter-11.json lifeApplication.practices[0].body` — “This is where the power of Christ rests on me” → 12:9
- [x] `acts/chapter-17.json commentary.sections[1].paragraphs[0]` — “they act contrary to the decrees of Caesar, saying that there is another king, Jesus” → (v. 7) — and a
- [x] `ephesians/chapter-4.json lexicon[4].insight` — “he began to be sorrowful and severely troubled” → Matthew 26:37
- [x] `john/chapter-1.json commentary.ntConnection.paragraphs[0]` — “For by him all things were created... all things have been created through him and for him…” → Colossians 1:16-17
- [x] `john/chapter-1.json commentary.ntConnection.paragraphs[0]` — “upholds all things by the word of his power” → Hebrews 1:2-3
- [x] `john/chapter-14.json commentary.ntConnection.paragraphs[1]` — “there is no other name under heaven, given among men, by which we must be saved” → Acts 4:12
- [x] `john/chapter-14.json storyConnections[1].summary` — “teach all things and remind” → (v. 26) turned
- [x] `john/chapter-18.json commentary.sections[0].paragraphs[1]` — “No one takes it from me, but I lay it down of myself,” → 10:18
- [x] `john/chapter-19.json commentary.sections[1].paragraphs[1]` — “No one takes it from me, but I lay it down of myself” → John 10:18
- [x] `john/chapter-19.json commentary.ntConnection.paragraphs[1]` — “wiped out the handwriting in ordinances which was against us... having nailed it to the cr…” → Colossians 2:14
- [x] `luke/chapter-9.json commentary.ntConnection.paragraphs[0]` — “we did not follow cunningly devised fables, when we made known to you the power and coming” (reference before quote: 2 Peter 1:16)
- [x] `malachi/chapter-1.json lexicon[1].insight` — “great beyond the border of Israel” → (v. 5); His na
- [x] `mark/chapter-5.json commentary.ntConnection.paragraphs[1]` — “Christ has been raised from the dead, the first fruits of those who are asleep” → 1 Corinthians 15:20
- [x] `mark/chapter-7.json commentary.ntConnection.paragraphs[0]` — “What God has cleansed, you must not call common” → Acts 10:15
- [x] `mark/chapter-7.json commentary.ntConnection.paragraphs[1]` — “God has shown me that I should not call any man common or unclean” → Acts 10:28
- [x] `matthew/chapter-10.json lexicon[3].insight` — “are not able to kill the psyche” → (v. 28), so th
- [x] `matthew/chapter-10.json holySpiritRevelation.items[2].body` — “Everyone who confesses me before men, him I will also confess… but whoever denies me befor” → (v. 32-33). Th
- [x] `matthew/chapter-16.json commentary.ntConnection.paragraphs[1]` — “take up your cross” → (v. 24) is ans
- [x] `matthew/chapter-24.json commentary.ntConnection.paragraphs[0]` — “the Lord himself will descend from heaven with... the trumpet of God... and... we... will ” (reference before quote: 1 Thessalonians 4:16)
- [x] `matthew/chapter-24.json commentary.ntConnection.paragraphs[1]` — “scoffers will come... saying, ‘Where is the promise of his coming?’... But the day of the …” → 2 Peter 3:3-10
- [x] `matthew/chapter-24.json storyConnections[0].summary` — “dash you to the ground... and not leave in you one stone on another” → Luke 19:44
- [x] `romans/chapter-2.json storyConnections[0].summary` — “You are the man.” → Romans 2:1
- [x] `romans/chapter-2.json storyConnections[0].summary` — “by this deed you have given great occasion to Yahweh's enemies to blaspheme” → 12:14
- [x] `romans/chapter-2.json storyConnections[2].summary` — “I knew that you are a gracious God, and merciful, slow to anger, and abundant in loving ki…” → Romans 2:4
- [x] `romans/chapter-4.json lifeApplication.practices[0].body` — “What was credited,” → Romans 4:8
- [x] `romans/chapter-4.json lifeApplication.practices[0].body` — “Blessed is David, whom the Lord will by no means charge with sin.” (reference before quote: Romans 4:8)
- [x] `romans/chapter-6.json commentary.ntConnection.paragraphs[0]` — “I have been crucified with Christ, and it is no longer I who live, but Christ lives in me.” (reference before quote: Galatians 2:20)
- [x] `romans/chapter-6.json commentary.ntConnection.paragraphs[0]` — “put to death your members which are on the earth” → 3:5
- [x] `romans/chapter-6.json commentary.ntConnection.paragraphs[1]` — “his own self bore our sins in his body on the tree, that we, having died to sins, might li…” → 1 Peter 2:24
- [x] `romans/chapter-8.json lifeApplication.practices[0].body` — “I am a debtor, but not to you” → (v. 12), and t
- [x] `romans/chapter-8.json storyConnections[2].summary` — “As for you, you meant evil against me, but God meant it for good, to save many people aliv…” → Romans 8:28
- [x] `romans/chapter-15.json lexicon[0].insight` — “bear one another’s burdens, and so fulfil the law of Christ” → Galatians 6:2
- [x] `romans/chapter-15.json lexicon[1].insight` — “receive him as you would receive me” → Romans 15:7
- [x] `romans/chapter-15.json lifeApplication.audit[1].body` — “even as Christ also received you” → (v. 7). Which 
- [x] `romans/chapter-16.json lexicon[0].insight` — “diakonos of the assembly that is at Cenchreae” (reference before quote: Romans 15:8)

---

## 3. Greek/Hebrew words not in their dictionary form (32 items) — real errors

The format rule says the printed word must match the Strong's lemma. These print an inflected
form (e.g. `παρέδωκαν` instead of `παραδίδωμι`) or a phrase. Fix by printing the lemma shown,
or by citing each word of a phrase with its own Strong's number.

- [x] `ephesians/chapter-3.json lexicon` — G5228 is “ὑπέρ” but printed “ὑπερεκπερισσοῦ”
- [x] `john/chapter-2.json v4` — G1135 is “γυνή” but printed “γύναι”
- [x] `john/chapter-10.json lexicon` — G5087 is “τίθημι” but printed “τίθημι / ψυχή”
- [x] `john/chapter-18.json v5` — G1510 is “εἰμί” but printed “ἐγώ εἰμί”
- [x] `john/chapter-18.json v6` — G1510 is “εἰμί” but printed “ἐγώ εἰμί”
- [x] `john/chapter-18.json v17` — G1510 is “εἰμί” but printed “οὐκ εἰμί”
- [x] `john/chapter-18.json lexicon` — G1510 is “εἰμί” but printed “ἐγώ εἰμί”
- [x] `john/chapter-20.json v1` — G991 is “βλέπω” but printed “βλέπει”
- [x] `john/chapter-20.json v8` — G4100 is “πιστεύω” but printed “ἐπίστευσεν”
- [x] `john/chapter-20.json v9` — G1492 is “εἴδω” but printed “ᾔδεισαν”
- [x] `john/chapter-20.json v11` — G2799 is “κλαίω” but printed “κλαίουσα”
- [x] `john/chapter-20.json v14` — G1492 is “εἴδω” but printed “ᾔδει”
- [x] `john/chapter-20.json v22` — G1720 is “ἐμφυσάω” but printed “ἐνεφύσησεν”
- [x] `john/chapter-20.json v25` — G4100 is “πιστεύω” but printed “πιστεύσω”
- [x] `john/chapter-20.json v29` — G3107 is “μακάριος” but printed “μακάριοι”
- [x] `john/chapter-20.json v29` — G4100 is “πιστεύω” but printed “πιστεύσαντες”
- [x] `john/chapter-20.json v30` — G4592 is “σημεῖον” but printed “σημεῖα”
- [x] `john/chapter-20.json v31` — G4100 is “πιστεύω” but printed “πιστεύητε”
- [x] `luke/chapter-11.json v3` — G1967 is “ἐπιούσιος” but printed “ἐπιούσιον”
- [x] `luke/chapter-11.json v8` — G335 is “ἀναίδεια” but printed “ἀναίδειαν”
- [x] `luke/chapter-11.json v20` — G1147 is “δάκτυλος” but printed “δακτύλῳ”
- [x] `luke/chapter-11.json v52` — G2807 is “κλείς” but printed “κλεῖδα”
- [x] `matthew/chapter-27.json v2` — G3860 is “παραδίδωμι” but printed “παρέδωκαν”
- [x] `matthew/chapter-27.json v3` — G3338 is “μεταμέλλομαι” but printed “μεταμεληθεὶς”
- [x] `matthew/chapter-27.json v4` — G121 is “ἄθωος” but printed “ἀθῷον”
- [x] `matthew/chapter-27.json v22` — G4717 is “σταυρόω” but printed “σταυρωθήτω”
- [x] `matthew/chapter-27.json v26` — G3860 is “παραδίδωμι” but printed “παρέδωκεν”
- [x] `matthew/chapter-27.json v29` — G1702 is “ἐμπαίζω” but printed “ἐνέπαιξαν”
- [x] `matthew/chapter-27.json v46` — G1459 is “ἐγκαταλείπω” but printed “ἐγκατέλιπες”
- [x] `romans/chapter-5.json lexicon` — G4183 is “πολύς” but printed “πολλῷ μᾶλλον”
- [x] `zechariah/chapter-13.json v1` — H2403 is “חַטָּאָה” but printed “חַטָּאת”
- [x] `zechariah/chapter-13.json lexicon` — H2403 is “חַטָּאָה” but printed “חַטָּאת”

---

## 4. Possibly wrong reference (28 items) — all reworded so each quote sits next to its own reference

The quoted words are genuine WEB text, but the nearest reference after them points somewhere
else. Usually that reference belongs to a *different* quotation in the same sentence, so most of
these need no change. Glance at each; fix only where the reference really is wrong.

- [x] `2corinthians/chapter-1.json visualMeditations[3].meaning` — “Now he who made us for this very thing is God, who also gave to us the down payment of the…” → Ephesians 1:14
- [x] `2corinthians/chapter-1.json commentary.ntConnection.paragraphs[1]` — “Now he who made us for this very thing is God, who also gave to us the down payment of the…” → Ephesians 1:13-14
- [x] `2corinthians/chapter-7.json commentary.ntConnection.paragraphs[2]` — “repentance to life” → Romans 2:4
- [x] `2corinthians/chapter-8.json storyConnections[1].summary` — “she, out of her poverty, gave all that she had to live on.” → 2 Corinthians 8:3
- [x] `2corinthians/chapter-12.json commentary.ntConnection.paragraphs[0]` — “left them again, went away, and prayed a third time, saying the same words” → Matthew 26:39
- [x] `ephesians/chapter-1.json commentary.ntConnection.paragraphs[2]` — “Now he who establishes us with you in Christ, and anointed us, is God; who also sealed us,…” → 2 Corinthians 5:5
- [x] `ephesians/chapter-4.json commentary.sections[3].paragraphs[0]` — “in the likeness of God” → Colossians 3:10
- [x] `galatians/chapter-2.json commentary.ntConnection.paragraphs[1]` — “no flesh will be justified by the works of the law” → Romans 3:20
- [x] `galatians/chapter-2.json commentary.ntConnection.paragraphs[1]` — “by the works of the law, no flesh will be justified in his sight. For through the law come…” → Romans 3:28
- [x] `galatians/chapter-3.json .scripture[v11]` — “For in it is revealed God’s righteousness from faith to faith. As it is written, ‘But the …” → Hebrews 10:38
- [x] `galatians/chapter-3.json commentary.sections[1].paragraphs[1]` — “For in it is revealed God’s righteousness from faith to faith. As it is written, ‘But the …” → Hebrews 10:38
- [x] `galatians/chapter-3.json commentary.ntConnection.paragraphs[2]` — “The righteous will live by faith.” → Romans 1:17
- [x] `galatians/chapter-3.json commentary.ntConnection.paragraphs[2]` — “For in it is revealed God’s righteousness from faith to faith. As it is written, ‘But the …” → Hebrews 10:38
- [x] `galatians/chapter-4.json commentary.ntConnection.paragraphs[1]` — “Abba, Father, all things are possible to you” → Romans 8:15
- [x] `galatians/chapter-4.json commentary.ntConnection.paragraphs[2]` — “to the city of the living God, the heavenly Jerusalem,” → Revelation 21:2
- [x] `galatians/chapter-5.json commentary.ntConnection.paragraphs[2]` — “he who loves his neighbor has fulfilled the law... Love therefore is the fulfillment of th…” → James 2:8
- [x] `galatians/chapter-5.json lexicon[1].insight` — “neither our fathers nor we were able to bear” → Matthew 11:29-30
- [x] `galatians/chapter-6.json commentary.ntConnection.paragraphs[1]` — “Behold, I am making all things new.” → Galatians 6:15
- [x] `galatians/final-review.json map.sections[1].body` — “Now that no man is justified by the law before God is evident, for, ‘The righteous will li…” → Romans 1:17
- [x] `john/chapter-19.json commentary.ntConnection.paragraphs[0]` — “This is he who came by water and blood, Jesus Christ; not with the water only, but with th…” → John 19:3
- [x] `luke/chapter-5.json commentary.ntConnection.paragraphs[0]` — “The saying is faithful and worthy of all acceptance, that Christ Jesus came into the world…” → Luke 5:32
- [x] `malachi/chapter-2.json commentary.ntConnection.paragraphs[0]` — “the two shall become one flesh; so that they are no more two, but one flesh. What therefor…” → Malachi 2:15
- [x] `mark/chapter-3.json commentary.ntConnection.paragraphs[0]` — “the Son of God was revealed, that he might destroy the works of the devil.” → Hebrews 2:14
- [x] `matthew/chapter-10.json commentary.sections[0].paragraphs[1]` — “to the Jew first, and also to the Greek” → Romans 1:16
- [x] `matthew/chapter-20.json commentary.ntConnection.paragraphs[0]` — “in the place of” → Matthew 20:28
- [x] `romans/chapter-8.json commentary.ntConnection.paragraphs[2]` — “in this we groan, longing to be clothed with our habitation which is from heaven” → Revelation 21:4
- [x] `romans/chapter-8.json storyConnections[1].summary` — “Abba, Father, all things are possible to you. Please remove this cup from me. However, not…” → Hebrews 5:7
- [x] `romans/chapter-15.json storyConnections[2].summary` — “Away with him!” → Romans 15:31

---

## Before publishing any book — the four checks

```
node build/build-data.mjs                          # G1: sections, exact WEB verses, Strong's ids
node build/verify-content.mjs <bookId> --strict    # G2: lemmas + quotations
node build/render-check.cjs app <bookId>           # G3: optional, needs Playwright + Chromium
```

G4: copy `app/css`, `app/data`, `app/js`, `app/index.html` into POP-WORD-PAGES and confirm
they are identical before pushing.
