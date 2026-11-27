// tuloste: selite näyttää tavoitteen, toteuman ja ennusteen vain kun ne ovat päällä
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const doc = () => p.evaluate(() => __aik().prtDoc('A4', false));
  let h = await doc(); ok(!/Tavoite \(baseline\)|Toteuma<|Ennuste</.test(h), 'ei ylimääräisiä selitteitä oletuksena');
  await p.click('[data-ptog=bl]'); await p.waitForTimeout(100); await p.fill('#bl-name', 'Sopimus'); await p.click('[data-bl="save"]'); await p.waitForTimeout(200);
  h = await doc(); ok(/Tavoite \(baseline\)/.test(h), 'tavoite selitteessä');
  await p.click('[data-ptog=st]'); await p.waitForTimeout(100); await p.fill('#st-day', '2027-01-15'); await p.dispatchEvent('#st-day', 'change'); await p.waitForTimeout(200);
  h = await doc(); ok(/Toteuma</.test(h), 'toteuma selitteessä');
  await p.click('[data-ptog=fc]'); await p.waitForTimeout(300);
  h = await doc(); ok(/Ennuste</.test(h), 'ennuste selitteessä');
  await p.click('#vGantt'); await p.waitForTimeout(300); h = await doc(); ok(!/class="leg"[^]*?Ennuste</.test(h.split('class="leg"')[1] ? 'class="leg"' + h.split('class="leg"')[1].split('</div>')[0] : ''), 'gantt-selitteessä ei viivatyylejä');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
