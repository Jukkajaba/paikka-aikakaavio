// rajattu sijaintinäkymä: viivan pään veto (kulmakertoimen muutos) toimii myös kun sijainteja on piilotettu
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; window.__resOpen = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#fltBtn'); await p.waitForTimeout(200);
  await p.locator('#fltList .flr', { hasText: 'Kerros 3' }).locator('input').click(); await p.waitForTimeout(300);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(/5 \/ 6/.test(await p.textContent('#fltBtn')), 'rajaus päällä: ' + await p.textContent('#fltBtn'));
  const id = await p.evaluate(() => __aik().lines[0].id), before = await p.evaluate(() => { const l = __aik().lines[0]; return [l.from, l.to, l.start, l.dur].join(); });
  await p.locator('#chart [data-role="body"][data-id="' + id + '"]').first().click({ force: true }); await p.waitForTimeout(300);
  const h = await p.locator('#chart [data-role="he"]').first().boundingBox();
  await p.mouse.move(h.x + h.width / 2, h.y + h.height / 2); await p.mouse.down(); await p.mouse.move(h.x + h.width / 2 - 30, h.y - 60, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(400);
  const after = await p.evaluate(() => { const l = __aik().lines[0]; return [l.from, l.to, l.start, l.dur].join(); });
  ok(before !== after, 'päätä voi vetää rajatussa näkymässä: ' + before + ' -> ' + after);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
