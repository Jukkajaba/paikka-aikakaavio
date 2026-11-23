// Ganttissa yksittäisen sijaintirivin valinta ei korosta rivin yhteenvetoriviä
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForSelector('#gantt [data-gr]');
  const hl = () => p.evaluate(() => [...document.querySelectorAll('#gantt rect[fill="var(--ink)"][opacity=".09"]')].map(r => Math.round(parseFloat(r.getAttribute('y')) / (__aik().gRows.length ? 1 : 1))).length);
  const gi = await p.evaluate(() => __aik().gRows.findIndex(r => r.g && r.line === 1 && !r.gk));
  await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 300, y: 10 }, force: true }); await p.waitForTimeout(250);
  const nSum = await hl();
  await p.locator('#gantt [data-gi="' + (gi + 1) + '"]').first().click({ position: { x: 300, y: 10 }, force: true }); await p.waitForTimeout(250);
  const nLoc = await hl();
  ok(nSum >= 1, 'yhteenvetorivin valinta korostaa (' + nSum + ')'); ok(nLoc >= 1 && nLoc <= nSum, 'sijaintirivin valinta ei lisää korostuksia (' + nLoc + ' vs ' + nSum + ')');
  const sel = await p.evaluate(() => { const A = __aik(); return { id: A.selId, loc: A.selLoc && A.selLoc.loc }; }); ok(sel.id === 1 && sel.loc, 'sijainti valittu');
  const rowsHl = await p.evaluate(gi => { const rs = [...document.querySelectorAll('#gantt rect[fill="var(--ink)"][opacity=".09"]')]; return rs.map(r => r.getAttribute('y')); }, gi);
  const rowH = await p.evaluate(() => __aik().gRows.length && parseFloat(document.querySelector('#gantt rect[data-gi]').getAttribute('height')));
  const first = await p.evaluate(() => parseFloat(document.querySelector('#gantt rect[data-gi]').getAttribute('data-gi')));
  const idxs = rowsHl.map(y => Math.round(parseFloat(y) / rowH) + first); ok(!idxs.includes(gi), 'yhteenvetorivi ei korostu (korostetut rivit ' + idxs.join(',') + ', yhteenveto ' + gi + ')');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
