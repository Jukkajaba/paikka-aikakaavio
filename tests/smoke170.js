// ganttin viiva- ja kerrosrivit näyttävät alla olevien sijaintien toteuman
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('[data-ptog=st]'); await p.waitForTimeout(100);
  await p.click('#vGantt'); await p.waitForTimeout(300);
  const n = await p.evaluate(() => { const A = __aik(), l = A.lines[0], ts = A.tasks(l); ts.slice(0, 2).forEach(k => { l.ov[k.locId] = Object.assign(l.ov[k.locId] || {}, { pct: 100, as: k.s, ae: k.e }); }); return ts.length; });
  await p.click('#zIn'); await p.click('#zOut'); await p.waitForTimeout(300);
  const t = await p.evaluate(() => [...document.querySelectorAll('#ganttWrap title')].filter(x => x.textContent === 'Toteuma').length);
  ok(t >= 3, 'toteuma näkyy sijaintirivien lisäksi viivarivillä: ' + t + ' (sijainteja ' + n + ')');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
