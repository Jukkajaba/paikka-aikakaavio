// puuttuva sijainti (skip): viivaan ei piirretä pystyyhdysviivaa pois jätetyn sijainnin läpi
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const id = await p.evaluate(() => __aik().lines[0].id);
  const ms = () => p.evaluate(id => (document.querySelector('#chart [data-role="body"][data-id="' + id + '"]').getAttribute('d').match(/M/g) || []).length, id);
  ok(await ms() === 1, 'ilman puuttuvaa sijaintia yksi yhtenäinen polku');
  await p.evaluate(id => { const l = __aik().lines.find(x => x.id === id); l.skip = ['l3']; }, id);
  await p.click('#vGantt'); await p.waitForTimeout(300); await p.click('#vFlow'); await p.waitForTimeout(500);
  ok(await ms() === 2, 'puuttuvan sijainnin kohdalla polku katkeaa: ' + await ms());
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
