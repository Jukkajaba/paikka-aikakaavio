// tahti: toteumaväritys (vaalea laatikko + tumma täyttö + punainen reuna myöhässä)
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  await p.click('#vTakt'); await p.waitForTimeout(300);
  ok(await p.locator('#taktR .tkf').count() === 0, 'ei täyttöä ennen tilannetta');
  const op0 = await p.locator('#taktR .tkb').first().getAttribute('fill-opacity'); ok(+op0 > .8, 'laatikko täysvärinen ennen tilannetta ' + op0);
  await p.click('[data-ptog=st]'); await p.waitForTimeout(200);
  const day = await p.evaluate(() => { const a = __aik(), l = a.lines[0], k = a.tasks(l)[1]; return { s: k.s, e: k.e }; });
  await p.fill('#st-day', '2027-02-10'); await p.dispatchEvent('#st-day', 'change'); await p.waitForTimeout(250);
  ok(+(await p.locator('#taktR .tkb').first().getAttribute('fill-opacity')) < .5, 'laatikko vaalea tilannenäkymässä');
  // aseta toteuma 1. tehtävän 2. sijaintiin 50 %, 3. sijaintiin 100 %
  await p.evaluate(() => { const a = __aik(), l = a.lines[0], ts = a.tasks(l); l.ov = l.ov || {}; l.ov[ts[1].locId] = Object.assign(l.ov[ts[1].locId] || {}, { pct: 50 }); l.ov[ts[2].locId] = Object.assign(l.ov[ts[2].locId] || {}, { pct: 100 }); });
  await p.click('#vFlow'); await p.click('#vTakt'); await p.waitForTimeout(300);
  const nf = await p.locator('#taktR .tkf').count(); ok(nf >= 2, 'täyttö piirretty ' + nf);
  const w = await p.evaluate(() => { const c = [...document.querySelectorAll('#taktR clipPath rect')].map(r => +r.getAttribute('width')); return c; });
  ok(w.length >= 2 && w.every(x => x > 0), 'täyttöleveydet ' + w);
  const red = await p.locator('#taktR .tkb[stroke="#d62828"]').count(); ok(red >= 1, 'myöhässä punainen reuna ' + red);
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
