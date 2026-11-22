// paikka-aikakaavio: veto siirtää aikajanaa, piirtotila luo tehtävän
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = false; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.evaluate(() => { const i = document.querySelector('input[type=number]'); });
  // zoomaa sisään, jotta aikajanaa voi siirtää
  await p.locator('input[type=number]:visible').first().fill('8'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  const box = await p.locator('#chart').boundingBox(), n0 = await p.evaluate(() => __aik().lines.length);
  const off = () => p.evaluate(() => document.getElementById('chartH').scrollLeft);
  ok(await p.getAttribute('#cDraw', 'aria-pressed') === 'false', 'piirtotila oletuksena pois');
  const x = box.x + 600, y = box.y + 150, o0 = await off();
  await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x - 200, y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => __aik().lines.length) === n0, 'veto ei luo tehtävää');
  ok(await off() > o0, 'veto siirsi aikajanaa ' + o0 + ' → ' + await off());
  await p.click('#cDraw'); ok(await p.getAttribute('#cDraw', 'aria-pressed') === 'true', 'piirtotila päälle');
  await p.mouse.move(x + 380, y + 120); await p.mouse.down(); await p.mouse.move(x + 480, y + 60, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => __aik().lines.length) === n0 + 1, 'piirtotilassa veto luo tehtävän');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
