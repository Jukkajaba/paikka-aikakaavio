// sijainnin ala (m²) -> osuus
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('[data-ptog=locs]'); await p.waitForTimeout(200);
  const n = await p.locator('[data-field="locarea"]').count(); ok(n >= 3, 'ala-kentät ' + n);
  const set = async (i, v) => { const el = p.locator('[data-field="locarea"]').nth(i); await el.fill(String(v)); await el.dispatchEvent('change'); await p.waitForTimeout(150); };
  await set(0, 50); await set(1, 100); await set(2, 150);
  const sh = await p.evaluate(() => __aik().LOCS.slice(-3).reverse().map(x => Math.round(x.share * 100) / 100));
  ok(sh[0] === 0.5 && sh[1] === 1 && sh[2] === 1.5, 'osuudet alasta (keskiarvo 100): ' + sh);
  ok((await p.textContent('#locCard')).includes('ala yhteensä 300 m²') || (await p.content()).includes('ala yhteensä 300 m²'), 'ala yhteensä näkyy');
  // osuuden käsinmuutos poistaa alan
  const s2 = p.locator('[data-field="locshare"]').nth(0); await s2.fill('80'); await s2.dispatchEvent('change'); await p.waitForTimeout(150);
  const a0 = await p.evaluate(() => { const L = __aik().LT; return L[L.length - 1].area; }); ok(a0 == null, 'käsin muutettu osuus poistaa alan: ' + a0);
  // tallennus: ala säilyy tilassa
  const st = await p.evaluate(() => JSON.stringify(__aik().stateObj().lt || __aik().LT)); ok(/"area":100/.test(st), 'ala tallentuu tilaan');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
