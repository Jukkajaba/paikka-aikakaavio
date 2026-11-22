// kokonaiskesto muokattavissa aina (kytkee "ohjaa" päälle ja vapauttaa työryhmälukon)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 950 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  // tuo määrät (lockC asetettu) ja muokkaa kokonaiskestoa
  await p.click('#impBtn'); await p.fill('#impTxt', "Suorite\tMäärä\tYks\tKerros 1\tKerros 2\nX\t400\tm2\t200\t200"); await p.click('#impParse'); await p.click('#impGo'); await p.waitForTimeout(300);
  await p.click('#vGantt'); await p.waitForSelector('#gantt [data-gr]');
  await p.evaluate(() => { const A = __aik(); const l = A.lines[A.lines.length - 1]; const g = [...document.querySelectorAll('#gantt [data-gi]')]; });
  const last = await p.evaluate(() => __aik().lines.length - 1);
  await p.locator('#gantt [data-gi="' + (await p.evaluate(() => { const r = [...document.querySelectorAll('#gantt [data-gi]')]; return r.length ? r[r.length - 1].dataset.gi : 0; })) + '"]').first().click({ position: { x: 300, y: 10 }, force: true }); await p.waitForTimeout(300);
  const f = p.locator('#f-total'); ok(await f.count() === 1, 'total field exists');
  if (await f.count()) {
    ok(await f.isEnabled(), 'total enabled');
    await f.fill('30'); await f.dispatchEvent('change'); await p.waitForTimeout(250);
    const sp = await p.evaluate(() => { const A = __aik(), l = A.lines.find(q => q.id === A.selId), ts = A.tasks(l); return ts[ts.length - 1].e - ts[0].s; });
    ok(Math.abs(sp - 30) < 1.01, 'span ' + sp);
  }
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
