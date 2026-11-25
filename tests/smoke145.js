// sijaintirivien maalaus (Shift+vedä) valitsee sijainteja, Delete poistaa ne; oikea klikkaus korostaa rivin
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; window.__resOpen = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(500);
  const pos = lab => p.evaluate(l => { const i = __aik().gRows.findIndex(r => r.label === l); const e = document.querySelector('#gantt [data-gr="gorder"][data-gi]'); const b = e.getBoundingClientRect(), g0 = +e.dataset.gi; return { x: b.x + 40, y: b.y + (i - g0) * b.height + b.height / 2 }; }, lab);
  const n0 = await p.evaluate(() => __aik().lines.length), locs0 = await p.evaluate(() => __aik().gRows.filter(r => /^Ikkunat, Kerros/.test(r.label)).length);
  const a = await pos('Ikkunat, Kerros 2'), z = await pos('Ikkunat, Kerros 4');
  await p.keyboard.down('Shift'); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x, (a.y + z.y) / 2, { steps: 4 }); await p.mouse.move(z.x, z.y, { steps: 4 }); await p.mouse.up(); await p.keyboard.up('Shift'); await p.waitForTimeout(300);
  await p.mouse.click(z.x, z.y, { button: 'right' }); await p.waitForTimeout(300);
  ok(/3 sijaintia/.test(await p.evaluate(() => (document.querySelector('#ctxMenu .ctx-h') || {}).textContent || '')), 'maalaus valitsi 3 sijaintia');
  await p.click('[data-cx=md]'); await p.waitForTimeout(400);

  const locs1 = await p.evaluate(() => __aik().gRows.filter(r => /^Ikkunat, Kerros/.test(r.label)).length);
  ok(locs1 === locs0 - 3, 'sijainnit poistuivat: ' + locs0 + ' -> ' + locs1); ok(await p.evaluate(() => __aik().lines.length) === n0, 'tehtävä säilyi');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => __aik().gRows.filter(r => /^Ikkunat, Kerros/.test(r.label)).length) === locs0, 'yksi kumoaminen palauttaa');
  // oikea klikkaus tehtävärivillä korostaa rivin
  const c = await pos('Ikkunat, Kerros 1'); await p.mouse.click(c.x, c.y, { button: 'right' }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => { const g = __aik().gRows, i = g.findIndex(r => r.label === 'Ikkunat, Kerros 1'); return [...document.querySelectorAll('#gantt rect[opacity=".09"]')].some(e => Math.abs(+e.getAttribute('y') - i * 26) < 3); }), 'oikea klikkaus: rivi harmaaksi');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
