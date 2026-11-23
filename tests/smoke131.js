// tyhjässä projektissa Gantin nimikenttä avautuu itsestään; Enter luo tehtävän ja avaa seuraavan
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(300);
  await p.click('#vGantt'); await p.waitForTimeout(500);
  ok(await p.locator('body > input.gedit').count() === 1, 'nimikenttä avautui itsestään');
  await p.keyboard.type('Pohjatyöt'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  ok(await p.locator('body > input.gedit').count() === 1, 'seuraava nimikenttä avautui Enterillä');
  await p.keyboard.type('Perustukset'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  const names = await p.evaluate(() => __aik().gRows.filter(r => !r.entry).map(r => r.label)); ok(names.join() === 'Pohjatyöt,Perustukset', 'tehtävät: ' + names.join());
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
