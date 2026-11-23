// uusi projekti: Suomen pyhät vapaina oletuksena (esimerkki-, tyhjä- ja pohjaprojekti)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const hol = () => p.evaluate(() => __aik().stateObj().cal.hol);
  for (const kind of ['newblank', 'newdefaults']) {
    await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=' + kind + ']'); await p.waitForTimeout(500);
    ok(await hol() === true, kind + ': Suomen pyhät vapaina oletuksena');
  }
  await p.click('#projBtn'); await p.waitForTimeout(200); const ex = p.locator('[data-pj=example]'); if (await ex.count()) { await ex.first().click(); await p.waitForTimeout(500); ok(await hol() === true, 'esimerkkiprojekti: pyhät vapaina'); }
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
