// tahtinäkymä: ruudukko, laatikot, jaettu rivi
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vTakt'); await p.waitForTimeout(400);
  ok(await p.locator('#taktWrap').isVisible() && !(await p.locator('#chartWrap').isVisible()), 'tahtinäkymä näkyy, paikka-aika piilossa');
  const nb = await p.locator('#taktR .tkb').count(), exp = await p.evaluate(() => { const a = __aik(); return a.lines.filter(l => !l.flat).reduce((s, l) => s + a.tasks(l).length, 0); });
  ok(nb >= exp * 0.5 && nb > 0, 'laatikoita ' + nb + ' (tehtäviä ' + exp + ')');
  ok(await p.locator('#taktL text').count() === await p.evaluate(() => __aik().LOCS.length), 'sijaintirivit');
  await p.screenshot({ path: '/tmp/takt1.png' });
  // valinta klikkaamalla
  await p.locator('#taktR .tkb').first().click(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => __aik().selId != null), 'klikkaus valitsee tehtävän');
  // näkymä säilyy ja vaihtuu takaisin
  await p.click('#vFlow'); await p.waitForTimeout(300); ok(await p.locator('#chartWrap').isVisible() && !(await p.locator('#taktWrap').isVisible()), 'paluu paikka-aikaan');
  await p.click('#vGantt'); await p.waitForTimeout(300); ok(await p.locator('#ganttWrap').isVisible(), 'gantt toimii');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
