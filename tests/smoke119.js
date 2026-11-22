// alasijainti: kaavion vasemmassa reunassa näkyy myös yläsijainti
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('[data-ptog=locs]'); await p.waitForTimeout(200);
  await p.locator('[data-act=locchild]').first().click(); await p.waitForTimeout(300);
  const labels = await p.evaluate(() => [...document.querySelectorAll('#chart text.loc')].map(t => t.firstChild.textContent));
  ok(labels.some(l => /^Kerros \d › Sijainti$/.test(l)), 'yläsijainti näkyy: ' + labels.join(' | '));
  ok(labels.some(l => l === 'Kerros 2'), 'muut ennallaan: ' + labels.join(' | '));
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
