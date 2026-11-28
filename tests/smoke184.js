// limitys: riippuvuus Kerros 1 → Kerros 2 samassa viivassa, viive -2 pv + kiinteä: seuraaja alkaa 2 pv aiemmin (limittyy)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(300);
  await p.evaluate(() => { const A = __aik(), l = A.lines[0], ts = A.tasks(l), a0 = ts[0].e, b0 = ts[1].s;
    A.deps.length = 0; A.deps.push({ id: 900, a: { l: l.id, loc: ts[0].locId }, b: { l: l.id, loc: ts[1].locId }, rigid: true, lag: -2 }); window.__tt = { l: l.id, ts: ts.map(t => t.s) }; return null; });
  await p.click('#vFlow'); await p.waitForTimeout(300); await p.click('#vGantt'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const A = __aik(), l = A.lines[0], t2 = A.tasks(l), tt = window.__tt, a0 = 0, b0 = tt.ts[1], ts = tt.ts.map(x => ({ s: x }));
    return { a0, b0, b1: t2[1].s, a1: t2[0].e, k2e: t2[1].e, k3s: t2[2].s, k3e0: ts[2].s }; });

  ok(Math.abs(r.b1 - (r.a1 - 2)) < 1e-6, 'seuraaja alkaa 2 pv ennen edeltäjän loppua: ' + JSON.stringify(r));
  ok(r.k3s <= r.k3e0 && r.k3s >= r.k2e - 0.001 - 100, 'kolmas ei mene sekaisin: ' + JSON.stringify(r));
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
