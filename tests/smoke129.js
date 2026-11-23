// Aloita aikataulu -ikkuna: sijaintien generointi
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  ok(await p.locator('#welcome.on [data-wl="gen"]').count() === 1, 'generointi-vaihtoehto näkyy');
  await p.click('[data-wl="gen"]'); await p.waitForTimeout(200);
  ok(await p.locator('#wg-f').count() === 1, 'lomake aukeaa');
  await p.fill('#wg-b', '2'); await p.fill('#wg-f', '4'); await p.check('#wg-k'); await p.fill('#wg-u', '3');
  ok(/Syntyy 30 sijaintia/.test(await p.innerText('#wg-msg')), 'esikatselu: ' + await p.innerText('#wg-msg'));
  await p.fill('#wg-b', '3'); await p.fill('#wg-u', '30'); ok(/Liian monta/.test(await p.innerText('#wg-msg')), 'raja varoittaa');
  await p.click('[data-wl="gendo"]'); await p.waitForTimeout(300); ok(await p.locator('#wg-f').count() === 1, 'liian suurta ei luoda');
  await p.fill('#wg-b', '2'); await p.fill('#wg-u', '3'); await p.click('[data-wl="gendo"]'); await p.waitForTimeout(500);
  const L = await p.evaluate(() => __aik().LOCS.map(x => x.name));
  ok(L.length === 30, 'sijainteja 30: ' + L.length); ok(L[0].includes('Rakennus A') && L[0].includes('Kellari'), 'ensimmäinen: ' + L[0]); ok(L[L.length - 1].includes('Rakennus B') && L[L.length - 1].includes('Kerros 4'), 'viimeinen: ' + L[L.length - 1]);
  ok(await p.locator('#welcome.on').count() === 0, 'ikkuna sulkeutuu');
  // yksinkertainen: 1 rakennus, 6 kerrosta, ei huoneistoja
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="gen"]'); await p.click('[data-wl="gendo"]'); await p.waitForTimeout(400);
  const L2 = await p.evaluate(() => __aik().LOCS.map(x => x.name)); ok(L2.length === 6 && L2[0] === 'Kerros 1' && L2[5] === 'Kerros 6', 'oletus: ' + L2.join(','));
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
