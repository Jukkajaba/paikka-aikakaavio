// määrän pienennys ei saa nostaa työryhmää (pyöristys): tavallinen tila, kokonaiskestotila ja sijaintikohtainen kesto
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForSelector('#gantt [data-gr]');
  const st = () => p.evaluate(() => { const A = __aik(), l = A.lines.find(x => x.id === A.selId); return { q: A.totalQty(l), crew: A.tasks(l).reduce((m, t) => Math.max(m, t.crew), 1) }; });
  for (const line of [1, 2, 3]) for (const mode of ['plain', 'total']) {
    await p.evaluate(([line, mode]) => { const A = __aik(), l = A.lines.find(x => x.id === line); if (mode === 'total') { l.tctl = true; l.total = 56.8; } }, [line, mode]);
    const gi = await p.evaluate(l => __aik().gRows.findIndex(r => r.g && r.line === l && !r.gk), line);
    await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 300, y: 10 }, force: true }); await p.waitForTimeout(250);
    for (const f of [0.9, 0.8, 0.7, 0.6, 0.45, 0.33, 0.9, 0.9]) {
      const s0 = await st(), inp = p.locator('#f-tqty'); await p.click('[data-act=qedit]'); await inp.fill(String(Math.round(s0.q * f * 100) / 100)); await inp.dispatchEvent('change'); await p.waitForTimeout(120);
      const s1 = await st(); ok(s1.crew <= s0.crew, 'rivi ' + line + ' ' + mode + ' ×' + f + ': työryhmä ' + s0.crew + ' → ' + s1.crew);
    }
  }
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
