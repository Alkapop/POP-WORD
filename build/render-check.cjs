/* Optional G3 gate — needs Playwright + Chromium.
   Run: node build/render-check.cjs app <bookId> [screenshotDir] */
// G3 render gate: open every document of a book in the real app and check it renders fully.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [appDir, bookId, shotDir] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const url = 'file://' + path.resolve(appDir, 'index.html');
  await page.goto(url);
  await page.waitForTimeout(600);
  const meta = await page.evaluate(id => {
    const b = window.POP.books.find(x => x.id === id); const c = window.POP.content[id];
    return { available: b && b.available, chapters: b && b.chapters,
      verses: c.chapters.map(ch => ch.scripture.length), chips: c.chapters.map(ch => ch.scripture.reduce((n, v) => n + (v.words || []).length, 0)) };
  }, bookId);
  if (!meta.available) { console.log('FAIL: book not available in app'); process.exit(1); }
  const keys = ['intro', ...Array.from({ length: meta.chapters }, (_, i) => String(i + 1)), 'review'];
  const expectSecs = k => k === 'intro' ? 6 : k === 'review' ? 5 : 9;
  let fails = 0;
  for (const k of keys) {
    await page.goto(url + '#/read/' + bookId + '/' + k);
    await page.waitForTimeout(450);
    const r = await page.evaluate(() => ({
      title: (document.querySelector('.doc-title') || {}).textContent || '',
      secs: document.querySelectorAll('h2.sec-head').length,
      verses: document.querySelectorAll('button.verse').length,
      chips: document.querySelectorAll('button.chip').length,
      textLen: document.body.innerText.length
    }));
    let ok = r.secs === expectSecs(k) && r.title.length > 5;
    if (/^\d+$/.test(k)) ok = ok && r.verses === meta.verses[+k - 1] && r.chips === meta.chips[+k - 1];
    if (!ok) fails++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${k.padEnd(6)} secs=${r.secs}/${expectSecs(k)} verses=${r.verses} chips=${r.chips} chars=${r.textLen}  ${r.title.slice(0, 70)}`);
  }
  // Interaction: open a verse, then a Greek word chip -> lexicon panel must show the Strong's entry
  await page.goto(url + '#/read/' + bookId + '/13'); await page.waitForTimeout(500);
  await page.click('button.verse[data-verse="4"]'); await page.waitForTimeout(300);
  await page.click('[data-verse-x="4"] button.chip'); await page.waitForTimeout(500);
  const panel = await page.evaluate(() => document.body.innerText.includes('G26') || document.body.innerText.includes('ἀγάπη'));
  console.log(`${panel ? 'PASS' : 'FAIL'} interaction: verse tap + Greek lexicon chip`); if (!panel) fails++;
  if (shotDir) {
    await page.screenshot({ path: path.join(shotDir, `${bookId}-ch13.png`) });
    await page.goto(url + '#/book/' + bookId); await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(shotDir, `${bookId}-journey.png`) });
  }
  console.log(errors.length ? 'ERRORS:\n  ' + errors.join('\n  ') : 'No page/console errors.');
  console.log(fails || errors.length ? `G3 FAILED (${fails} doc failures)` : 'G3 PASSED');
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})();
