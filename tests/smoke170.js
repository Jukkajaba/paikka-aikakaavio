// ganttin viiva- ja kerrosrivit näyttävät alla olevien sijaintien toteuman
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  require('fs').writeFileSync('/tmp/big170.html', require('fs').readFileSync('aikataulun-piirtoprototyyppi.html', 'utf8').replace('stateObj: () => stateObj() });', 'stateObj: () => stateObj(), applyState: st => applyState(st) });'));
  await p.goto('file:///tmp/big170.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('[data-ptog=st]'); await p.waitForTimeout(100);
  await p.click('#vGantt'); await p.waitForTimeout(300);
  const n = await p.evaluate(() => { const A = __aik(), l = A.lines[0], ts = A.tasks(l); ts.slice(0, 2).forEach(k => { l.ov[k.locId] = Object.assign(l.ov[k.locId] || {}, { pct: 100, as: k.s, ae: k.e }); }); return ts.length; });
  await p.click('#zIn'); await p.click('#zOut'); await p.waitForTimeout(300);
  const t = await p.evaluate(() => [...document.querySelectorAll('#ganttWrap title')].filter(x => x.textContent === 'Toteuma').length);
  ok(t >= 3, 'toteuma näkyy sijaintirivien lisäksi viivarivillä: ' + t + ' (sijainteja ' + n + ')');
  await p.selectOption('#gGroup', 'loc'); await p.waitForTimeout(400);
  const tl = await p.evaluate(() => [...document.querySelectorAll('#ganttWrap title')].filter(x => x.textContent === 'Toteuma').length); ok(tl >= 2, 'toteuma näkyy myös Sijainnin mukaan -ryhmittelyssä: ' + tl);
  await p.selectOption('#gGroup', 'trade'); await p.waitForTimeout(300);
  // kerrosrivin määrä = alla olevien asuntojen summa
  await p.evaluate(() => { const A = __aik(), st = JSON.parse(JSON.stringify(A.stateObj())); st.lt = [];
    for (let f = 1; f <= 2; f++) { st.lt.push({ id: 'f' + f, name: 'Kerros ' + f, share: 1, par: null }); for (let i = 1; i <= 4; i++) st.lt.push({ id: 'f' + f + 'a' + i, name: 'Asunto ' + i, share: 1, par: 'f' + f }); }
    const l = st.lines[0]; l.from = 'f1a1'; l.to = 'f2a4'; l.ov = {}; l.total = null; st.lines = [l]; st.groups = []; st.deps = []; st.locs = undefined; A.applyState(st); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { const e = document.getElementById('lvlSel'); e.value = '2'; e.dispatchEvent(new Event('change')); }); await p.waitForTimeout(400);
  const tx = await p.evaluate(() => [...document.querySelectorAll('#ganttWrap text')].map(t => t.textContent));
  const k = tx.indexOf('Kerros 1Kerros 1'), a1 = tx.indexOf('Asunto 1Asunto 1'), qk = tx.slice(k, k + 6).find(x => /m[²³]$/.test(x)), qa = tx.slice(a1, a1 + 6).find(x => /m[²³]$/.test(x));
  ok(qk && qa && parseFloat(qk) === 4 * parseFloat(qa), 'kerros ' + qk + ' = 4 × asunto ' + qa);
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
