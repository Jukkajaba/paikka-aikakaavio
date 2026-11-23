// Aloita aikataulu -ikkuna: projektin nimi ja aloituspäivä, ei viimeksi avattuja projekteja
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  ok(await p.locator('#welcome.on').count() === 1, 'ikkuna näkyy');
  ok(!/Viimeksi avatut/.test(await p.innerText('#welcome')), 'ei viimeksi avattuja projekteja');
  ok(await p.locator('#wl-name').count() === 1 && await p.locator('#wl-start').count() === 1, 'nimi- ja aloituskentät');
  await p.fill('#wl-name', 'Kerrostalo A'); await p.fill('#wl-start', '2027-03-01');
  await p.click('[data-wl="gen"]'); await p.waitForTimeout(300);
  ok(/Kerrostalo A/.test(await p.innerText('#subline')) && /1\.3\.2027|1\.3\./.test(await p.innerText('#subline')), 'otsikkorivi: ' + await p.innerText('#subline'));
  ok(await p.evaluate(() => __aik().stateObj().cal.start) === '2027-03-01', 'alkupäivä tallentui');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
