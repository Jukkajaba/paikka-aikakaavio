// Tasaa: kaikille tehtäville sama aika sijainnissa, viive 0; vain valitut jos valinta on; kumoa palauttaa
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vTakt'); await p.waitForTimeout(400);
  const ds = () => p.evaluate(() => __aik().lines.map(l => { const t = __aik().tasks(l); return t.map(x => Math.round(x.d * 100) / 100).join('/') + ' g' + l.gap; }));
  const d0 = await ds(); ok(new Set(d0).size > 1, 'alussa eri kestoja: ' + d0.join(' | '));
  await p.fill('#tkEqN', '5'); await p.click('#tkEq'); await p.waitForTimeout(300);
  const d1 = await ds(); ok(d1.every(x => x === '5/5/5/5/5/5 g0'), 'kaikki 5 pv, viive 0: ' + d1.join(' | '));
  await p.keyboard.press('Control+z'); await p.waitForTimeout(300); ok(JSON.stringify(await ds()) === JSON.stringify(d0), 'kumoa palauttaa');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
