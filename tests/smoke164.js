// tahtialue: lohkot, tehtäväkohtainen taso, korkea laatikko, jako ei muuta aikataulua
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  // rakennetaan: kerros 1 -> 6 asuntoa (lapsia), muut kerrokset ennallaan
  await p.click('[data-ptog=locs]'); await p.waitForTimeout(200);
  const snap = () => p.evaluate(() => { const a = __aik(); return { n: a.LOCS.length, lines: a.lines.map(l => ({ s: Math.min(...a.tasks(l).map(t => t.s)), e: Math.max(...a.tasks(l).map(t => t.e)), ta: l.ta })) }; });
  const s0 = await snap();
  // lisää alasijainnit kerrokselle 1 (6 kpl): ↳+ ensin, sitten sisarukset
  const row = nm => p.locator('.fp[data-p=locs] .locrow').filter({ has: p.locator('input[value="' + nm + '"]') }).first();
  await row('Kerros 1').locator('[data-act="locchild"]').click(); await p.waitForTimeout(150);
  for (let i = 0; i < 5; i++) { await row('Sijainti').locator('[data-act="locsib"]').click(); await p.waitForTimeout(100); }
  const s1 = await snap(); ok(s1.n === s0.n + 5, 'lehtiä lisäyksen jälkeen ' + s0.n + '→' + s1.n);
  ok(s1.lines.every(l => l.ta === 0 || l.ta == null) && s1.lines.some(l => l.ta === 0), 'tehtävät pinnattu kerrostasolle: ' + JSON.stringify(s1.lines.map(l => l.ta)));
  // lohkot: 3 per kerros
  await p.fill('.fp[data-p=locs] [data-field="lohkon"]', '3'); await p.dispatchEvent('.fp[data-p=locs] [data-field="lohkon"]', 'change');
  await p.click('.fp[data-p=locs] [data-act="locblocks"]'); await p.waitForTimeout(300);
  const tr = await p.evaluate(() => { const a = __aik(); return a.LT.map(n => n.name + ':' + (n.par || '')).join('|'); }); ok(/Lohko A/.test(tr) && /Lohko C/.test(tr), 'lohkot luotu: ' + tr.slice(0, 200));
  const s2 = await snap(); ok(s2.n === s1.n, 'lehdet ennallaan lohkoinnin jälkeen');
  ok(JSON.stringify(s2.lines.map(l => [l.s, l.e])) === JSON.stringify(s1.lines.map(l => [l.s, l.e])), 'aikataulu ennallaan lohkoinnin jälkeen');
  // tahtialue: tehtävä 1 lohkotasolle (ta=1)
  await p.evaluate(() => { const a = __aik(); a.lines[0].ta = 1; }); await p.click('#vFlow'); await p.click('#vTakt'); await p.waitForTimeout(300);
  const g = await p.evaluate(() => { const a = __aik(), ts = a.tasks(a.lines[0]); return ts.map(t => [t.gk, t.gn, t.gi, t.s, t.e]); });
  const grp = g.filter(x => x[1] > 1); ok(grp.length >= 3, 'ryhmiä lohkotasolla ' + JSON.stringify(g.slice(0, 8)));
  const first3 = g.filter(x => x[0] === g[0][0]); ok(first3.every(x => x[3] === first3[0][3] && x[4] === first3[0][4]), 'ryhmän jäsenillä sama aika');
  const tall = await p.evaluate(() => { const l = __aik().lines[0].id; const bs = [...document.querySelectorAll('#taktR .tkb[data-tl="' + l + '"]')].map(e => e.getBoundingClientRect().height); return bs; });
  ok(tall.some(h => h > 60), 'korkea laatikko näkyy: ' + tall.map(Math.round));
  // veto: korkeaa laatikkoa voi siirtää
  const sel = '#taktR .tkb[data-tl="' + (await p.evaluate(() => __aik().lines[0].id)) + '"]';
  const idxTall = tall.findIndex(h => h > 60); const bb = await p.locator(sel).nth(idxTall).boundingBox(); const e0 = await p.evaluate(() => Math.max(...__aik().tasks(__aik().lines[0]).map(t => t.e)));
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2 + 25, bb.y + bb.height / 2); await p.mouse.move(bb.x + bb.width / 2 + 50, bb.y + bb.height / 2); await p.mouse.up(); await p.waitForTimeout(250);
  const e1 = await p.evaluate(() => Math.max(...__aik().tasks(__aik().lines[0]).map(t => t.e))); ok(e1 > e0, 'veto siirsi tehtävää ' + e0 + '→' + e1);
  // flow-näkymä toimii
  await p.click('#vFlow'); await p.waitForTimeout(250); ok(await p.locator('#chart path').count() > 0, 'paikka-aikakaavio piirtyy');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
