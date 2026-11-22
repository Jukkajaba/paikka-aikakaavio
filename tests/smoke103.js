// sijaintirivin valinta päivittää Tehtävä-paneelin (valitun sijainnin tiedot ja korostus)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(200);
  const sel = async y => { await p.locator('#ganttScroll').click({ position: { x: 120, y: y }, force: true }); await p.waitForTimeout(200); return p.evaluate(() => ({ m: (document.querySelector('#panel .meta b') || {}).textContent || '', n: document.querySelectorAll('#panel .task.sel').length, open: !!document.querySelector('#panel details[open]') })); };
  const selX = async (x, y) => { await p.locator('#ganttScroll').click({ position: { x: x, y: y }, force: true }); await p.waitForTimeout(200); return p.evaluate(() => ({ m: (document.querySelector('#panel .meta b') || {}).textContent || '', n: document.querySelectorAll('#panel .task.sel').length })); };
  const a = await sel(26 * 1 + 13), c = await sel(26 * 3 + 13), h = await selX(240, 13);
  ok(/Kerros 1/.test(a.m) && a.n === 1 && a.open, 'row1 ' + JSON.stringify(a));
  ok(/Kerros 3/.test(c.m) && c.n === 1, 'row3 ' + JSON.stringify(c));
  ok(h.m === '' && h.n === 0, 'header ' + JSON.stringify(h));
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
