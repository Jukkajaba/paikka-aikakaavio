// sijaintivalikko: valitse haluamasi sijainnit (myös epäjatkuvat), Ei sijaintia, ryhmävalinta
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 950 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(200); await p.click('#gAddTask'); await p.waitForTimeout(300);
  const info = () => p.evaluate(() => { const A = __aik(), l = A.lines[A.lines.length - 1]; return { flat: !!l.flat, locs: A.tasks(l).map(t => A.LOCS[t.loc].name), skip: l.skip || null, tot: A.totalQty(l) }; });
  await p.click('[data-act="locopen"]'); await p.waitForTimeout(150);
  for (const n of ['Kerros 1', 'Kerros 3', 'Kerros 5']) { await p.locator('.locpick label:has-text("' + n + '") input').check(); await p.waitForTimeout(150); }
  let r = await info(); ok(!r.flat && r.locs.join() === 'Kerros 1,Kerros 3,Kerros 5', 'non-contiguous selection ' + JSON.stringify(r));
  ok(r.skip && r.skip.length === 2, 'skip list');
  await p.locator('.locpick label:has-text("Kerros 3") input').uncheck(); await p.waitForTimeout(150);
  r = await info(); ok(r.locs.join() === 'Kerros 1,Kerros 5', 'uncheck middle ' + r.locs);
  await p.click('[data-act="locall"]'); await p.waitForTimeout(150); r = await info(); ok(r.locs.length === 6 && !r.skip, 'all');
  await p.locator('.locpick label:has-text("Ei sijaintia") input').check(); await p.waitForTimeout(150); r = await info(); ok(r.flat, 'flat');
  // Paikka-aika-näkymä piirtyy epäjatkuvalla viivalla
  await p.locator('.locpick label:has-text("Ei sijaintia") input').uncheck(); await p.waitForTimeout(150);
  await p.locator('.locpick label:has-text("Kerros 2") input').check(); await p.locator('.locpick label:has-text("Kerros 6") input').check(); await p.waitForTimeout(150);
  await p.click('#vFlow'); await p.waitForTimeout(250); ok(await p.locator('#chart path').count() > 0, 'flow renders');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
