// viimeisen rivin poisto ei avaa Aloita aikataulu -ikkunaa (myös sivun uudelleenlatauksen jälkeen)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('#vGantt'); await p.waitForTimeout(500);
  const pos = await p.evaluate(() => { const r = document.querySelector('#gantt rect[data-gi="0"]').getBoundingClientRect(); return { x: r.left + 60, y: r.top + r.height / 2 }; });
  await p.mouse.click(pos.x, pos.y); await p.waitForTimeout(250);
  await p.keyboard.type('Yksi'); await p.keyboard.press('Enter'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => __aik().lines.length) === 1, 'rivi luotu');
  const gi = await p.evaluate(() => __aik().gRows.findIndex(r => !r.entry));
  await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200);
  await p.keyboard.press('Delete'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => __aik().lines.length) === 0, 'rivi poistettu');
  ok(await p.locator('#welcome.on').count() === 0, 'aloitusikkuna ei avautunut');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
