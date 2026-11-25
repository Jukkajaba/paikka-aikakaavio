// Delete valitulla sijaintirivillä poistaa vain sijainnin, ei koko tehtävää
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(500);
  const info = () => p.evaluate(() => { const A = __aik(), l = A.lines[0]; return { n: A.lines.length, locs: A.tasks(l).map(t => t.locId).join(), name: A.trade(l.trade).name }; });
  const i0 = await info();
  const gi = await p.evaluate(() => __aik().gRows.findIndex(r => r.label === 'Runko, Kerros 3'));
  await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200);
  await p.keyboard.press('Delete'); await p.waitForTimeout(300);
  const i1 = await info(); ok(i1.n === i0.n, 'tehtävä säilyi'); ok(i1.locs.split(',').length === i0.locs.split(',').length - 1, 'yksi sijainti vähemmän: ' + i0.locs + ' → ' + i1.locs);
  ok(!/l3/.test(i1.locs), 'Kerros 3 poistui: ' + i1.locs);
  await p.keyboard.press('Control+z'); await p.waitForTimeout(300); const i2 = await info(); ok(i2.locs === i0.locs, 'kumoa palautti sijainnin: ' + i2.locs);
  // ylärivi + Delete poistaa koko tehtävän
  const g0 = await p.evaluate(() => __aik().gRows.findIndex(r => r.label === 'Runko'));
  await p.locator('#gantt [data-gi="' + g0 + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200);
  await p.keyboard.press('Delete'); await p.waitForTimeout(300); const i3 = await info(); ok(i3.n === i0.n - 1, 'ylärivin Delete poisti tehtävän');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
