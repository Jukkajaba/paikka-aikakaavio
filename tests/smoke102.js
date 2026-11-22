// uusi tehtävä perii valitun tehtävän värin
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(200);
  await p.locator('#ganttScroll').click({ position: { x: 120, y: 26 * 1 + 13 }, force: true }); await p.waitForTimeout(150);
  const before = await p.evaluate(() => __aik().lines.length);
  await p.click('#gAddTask'); await p.waitForTimeout(200);
  const r = await p.evaluate(() => { const A = __aik(), L = A.lines[A.lines.length - 1] , first = A.lines[0]; return { n: A.lines.length, flat: !!L.flat, same: A.trade(L.trade).col === A.trade(first.trade).col, other: A.trade(L.trade).id !== first.trade }; });
  ok(r.n === before + 1 && r.flat, 'added'); ok(r.same && r.other, 'colour inherited ' + JSON.stringify(r));
  // sijaintirivin valinta + "+" lisää viivalle seuraavan sijainnin
  await p.reload(); await p.waitForTimeout(400); await p.click('#vGantt'); await p.waitForTimeout(200);
  await p.locator('#ganttScroll').click({ position: { x: 120, y: 26 * 1 + 13 }, force: true }); await p.waitForTimeout(150);
  await p.evaluate(() => { const A = __aik(); A.lines[0].to = A.LOCS[2].id; }); await p.click('#zIn'); await p.click('#zOut'); await p.waitForTimeout(150);
  await p.locator('#ganttScroll').click({ position: { x: 120, y: 26 * 1 + 13 }, force: true }); await p.waitForTimeout(150);
  const s0 = await p.evaluate(() => { const A = __aik(), l = A.lines[0]; return { n: A.lines.length, locs: A.tasks(l).length }; });
  await p.click('#gAddTask'); await p.waitForTimeout(200);
  const s1 = await p.evaluate(() => { const A = __aik(), l = A.lines[0]; return { n: A.lines.length, locs: A.tasks(l).length }; });
  ok(s1.n === s0.n && s1.locs === s0.locs + 1, 'next location ' + JSON.stringify([s0, s1]));
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
