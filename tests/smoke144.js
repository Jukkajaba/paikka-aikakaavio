// littera: tuonti tallentaa koodin kaksi ensimmäistä numeroa tehtävälle; Littera-sarake (ei oletuksena näkyvissä) ja sen muokkaus
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 950 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#impBtn'); await p.fill('#impTxt', "Littera\tSuorite\tMäärä\tYks\tKerros 1\tKerros 2\n3321\tKevyet väliseinät\t400\tm2\t200\t200"); await p.click('#impParse'); await p.click('#impGo'); await p.waitForTimeout(300);
  const lit = () => p.evaluate(() => { const A = __aik(), l = A.lines[A.lines.length - 1]; return A.trade(l.trade).lit; });
  ok((await lit()) === '33', 'tuonti tallensi kaksi ensimmäistä numeroa: ' + await lit());
  await p.click('#vGantt'); await p.waitForSelector('#gantt [data-gr]'); await p.waitForTimeout(300);
  const head = () => p.evaluate(() => document.getElementById('ganttHead').textContent);
  ok(!/Littera/.test(await head()), 'Littera-sarake ei ole oletuksena näkyvissä');
  await p.click('#ganttHead [data-gcm]'); await p.waitForTimeout(100); await p.check('.gcm [data-gcol=lit]'); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  ok(/Littera/.test(await head()), 'Littera-sarake päällä');
  await p.evaluate(() => { const sc = document.querySelector('#gantt').closest('.gscroll') || document.getElementById('gScroll'); [...document.querySelectorAll('div')].filter(d => d.contains(document.getElementById('gantt')) && d.scrollHeight > d.clientHeight + 5).forEach(d => { d.scrollTop = 1e6; }); }); await p.waitForTimeout(300);
  const txt = await p.evaluate(() => document.getElementById('gantt').textContent); ok(/33/.test(txt), 'koodi näkyy Ganttissa');
  // muokkaus: sarakkeen ensimmäinen muokattava solu
  const last = await p.evaluate(() => { const A = __aik(); return A.gRows.findIndex(r => r.line === A.lines[A.lines.length - 1].id && r.g); });
  const cell = p.locator('#gantt text.gce').filter({ hasText: '33' }).first(); ok(await cell.count() === 1, 'littera-solu muokattavissa');
  await cell.click({ force: true }); await p.waitForTimeout(100); await p.fill('input.gced', '45'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  ok((await lit()) === '45', 'muokkaus tallentui: ' + await lit());
  await p.keyboard.press('Control+z'); await p.waitForTimeout(250); ok((await lit()) === '33', 'kumoa palautti: ' + await lit());
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
