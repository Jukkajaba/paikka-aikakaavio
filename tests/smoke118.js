// Sovita näyttöön: leveä asettelu, ei pystyvieritystä
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1700, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const w0 = await p.evaluate(() => document.querySelector('.wrap').offsetWidth);
  await p.click('#fitBtn'); await p.waitForTimeout(300);
  ok(await p.getAttribute('#fitBtn', 'aria-pressed') === 'true', 'päällä');
  const w1 = await p.evaluate(() => document.querySelector('.wrap').offsetWidth); ok(w1 > w0 + 200, 'leveämpi ' + w0 + ' → ' + w1);
  ok(await p.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2), 'paikka-aikakaavio mahtuu korkeuteen');
  await p.click('#vGantt'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 2), 'Gantt mahtuu korkeuteen');
  await p.reload(); await p.waitForTimeout(500); ok(await p.getAttribute('#fitBtn', 'aria-pressed') === 'true', 'muistetaan');
  await p.click('#fitBtn'); await p.waitForTimeout(200); ok(await p.evaluate(() => document.querySelector('.wrap').offsetWidth) === w0, 'pois päältä');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
