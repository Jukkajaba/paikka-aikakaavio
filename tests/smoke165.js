// "Aika sijainnissa" koskee tehtävän tahtialuetta (lohko = yksi sijainti) + enimmäismiehityksen merkki
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  await p.click('[data-ptog=locs]'); await p.waitForTimeout(200);
  const row = nm => p.locator('.fp[data-p=locs] .locrow').filter({ has: p.locator('input[value="' + nm + '"]') }).first();
  await row('Kerros 1').locator('[data-act="locchild"]').click(); await p.waitForTimeout(150);
  for (let i = 0; i < 5; i++) { await row('Sijainti').locator('[data-act="locsib"]').click(); await p.waitForTimeout(100); }
  await p.fill('.fp[data-p=locs] [data-field="lohkon"]', '3'); await p.dispatchEvent('.fp[data-p=locs] [data-field="lohkon"]', 'change');
  await p.click('.fp[data-p=locs] [data-act="locblocks"]'); await p.waitForTimeout(300);
  await p.click('[data-ptog=locs]'); if (await p.locator('.fp[data-p=panel]').isHidden()) await p.click('[data-ptog=panel]'); await p.waitForTimeout(200);
  const id0 = await p.evaluate(() => { const a = __aik(); a.lines[0].ta = 1; return a.lines[0].id; });
  await p.click('#vTakt'); await p.waitForTimeout(300);
  const bb = await p.locator('#taktR .tkb[data-tl="' + id0 + '"]').first().boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(250);
  const inp = p.locator('#panel [data-field="dur-v"]:visible').first(); ok(await inp.count() === 1, 'kesto-kenttä näkyy');
  await inp.fill('5'); await inp.dispatchEvent('change'); await p.waitForTimeout(250);
  const avg = () => p.evaluate(() => { const a = __aik(), u = a.tasks(a.lines[0]).filter(t => t.gi === 0); return { n: u.length, m: u.reduce((x, t) => x + t.d, 0) / u.length, lohko: u.filter(t => t.gn === 2).map(t => t.d) }; });
  const m1 = await avg(); ok(m1.n === 8 && Math.abs(m1.m - 5) < 0.15, 'tahtialueiden keskikesto 5 pv: ' + JSON.stringify(m1));
  ok(m1.lohko.length === 3 && m1.lohko.every(x => Math.abs(x - m1.lohko[0]) < 0.01), 'lohkot yhtä pitkiä');
  await p.locator('#panel [data-act="dur+"]:visible').first().click(); await p.waitForTimeout(250);
  const m2 = await avg(); ok(Math.abs(m2.m - 6) < 0.15, '+ lisää keskikestoon päivän: ' + JSON.stringify(m2));
  // enimmäismiehityksen merkki: lyhennä kesto reilusti
  await p.evaluate(() => { const a = __aik(); a.lines.forEach(l => { l.dur = 0.5; }); }); await p.click('#vFlow'); await p.click('#vTakt'); await p.waitForTimeout(300);
  ok(await p.locator('#taktR g[pointer-events="none"] circle[fill="#e08a1e"]').count() >= 1, 'ylityksen merkki näkyy laatikossa');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
