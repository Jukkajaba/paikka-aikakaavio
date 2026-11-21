// yksittäisen sijainnin määrän muutos (ov.q), palautus ja kokonaismäärä
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(200);
  await p.locator('#ganttScroll').click({ position: { x: 120, y: 26 * 3 + 13 }, force: true }); await p.waitForTimeout(250); // Runko, Kerros 3
  const st = () => p.evaluate(() => { const A = __aik(), l = A.lines[0], T = A.tasks(l); return { q: T.map(t => t.qty), tot: A.totalQty(l), d: T.map(t => t.d) }; });
  const s0 = await st();
  const inp = p.locator('#panel .task.sel input[data-field="tq-v"]'); await inp.fill('1000'); await inp.dispatchEvent('change'); await p.waitForTimeout(250);
  const s1 = await st();
  ok(s1.q[2] === 1000 && s1.q[0] === s0.q[0], 'only loc 3 changed ' + JSON.stringify([s0.q, s1.q]));
  ok(Math.abs(s1.tot - (s0.tot - s0.q[2] + 1000)) < 0.01, 'total ' + s1.tot);
  ok(await p.locator('#panel .task.sel [data-act="tqreset"]').count() === 1, 'reset button');
  await p.click('#panel .task.sel [data-act="tqreset"]'); await p.waitForTimeout(250);
  const s2 = await st(); ok(Math.abs(s2.q[2] - s0.q[2]) < 0.01 && Math.abs(s2.tot - s0.tot) < 0.01, 'reset ' + JSON.stringify(s2.q));
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
