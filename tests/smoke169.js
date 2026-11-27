// uusi tehtävä valitun yläpuolelle (Shift+Enter ja valikko)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(200);
  const order = () => p.evaluate(() => { const A = __aik(); return A.lines.slice().sort((a, b) => (a.ord || 0) - (b.ord || 0)).map(l => l.id + ':' + (l.flat ? 'F' : 'L')); });
  await p.locator('#ganttScroll').click({ position: { x: 120, y: 26 * 1 + 13 }, force: true }); await p.waitForTimeout(150);
  const selB = await p.evaluate(() => __aik().lines.find(l => l.id === (window.__aik().selId != null ? window.__aik().selId : -1)));
  const o0 = await order(); const selNow = await p.evaluate(() => { try { return __aik().stateObj().selId; } catch (e) { return null; } });
  const before = await p.evaluate(() => { const A = __aik(); return A.lines.map(l => l.id); });
  await p.keyboard.press('Shift+Enter'); await p.waitForTimeout(250);
  const o1 = await order(); ok(o1.length === o0.length + 1, 'tehtävä lisättiin ' + o1.join());
  const ix = o1.findIndex(x => /:F$/.test(x) && !o0.includes(x)); ok(ix >= 0, 'uusi litteä tehtävä löytyy');
  // uusi on heti sen rivin edellä, joka oli aiemmin valittuna: seuraava rivi on jokin vanha
  ok(ix >= 0 && o0.includes(o1[ix + 1]), 'uusi tehtävä on vanhan rivin yläpuolella');
  ok(selB && o1[ix + 1].split(':')[0] == String(selB.id), 'heti valitun rivin yläpuolella: ' + (selB && selB.id) + ' / ' + o1.join());
  // verrokki: tavallinen + lisää alapuolelle
  await p.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
