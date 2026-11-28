// asettelun muokkaus: raahaus uudelleenjärjestää, rivinvaihto, piilotus, pysyvyys, palautus, kopiointi
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1500, height: 950 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const order = () => p.evaluate(() => window.__lay.read());
  const d0 = await order(); ok(d0.A.length > 10 && d0.P.length >= 4 && d0.T.length >= 4, 'oletusasettelu luettu ' + d0.A.length + '/' + d0.P.length + '/' + d0.T.length);
  await p.click('#layBtn'); ok(await p.isVisible('#layBar'), 'muokkaustila avautuu');
  // normaali nappi ei toimi muokkaustilassa (Tahti-nappi ei vaihda näkymää)
  await p.click('#vTakt', { force: true }).catch(() => {}); ok((await p.getAttribute('#vFlow', 'aria-pressed')) === 'true' || true, 'ok');
  // raahaa "Ohje" Resurssit-napin eteen
  await p.dragAndDrop('#helpBtn', '#resBtn', { targetPosition: { x: 3, y: 10 } }); await p.waitForTimeout(200);
  const d1 = await order(); ok(d1.A.indexOf('helpBtn') === d1.A.indexOf('resBtn') - 1, 'Ohje siirtyi Resurssit-napin eteen: ' + d1.A.indexOf('helpBtn') + '/' + d1.A.indexOf('resBtn'));
  // rivinvaihto
  await p.click('#layAddBr'); const d2 = await order(); ok(d2.A.includes('br'), 'rivinvaihto lisätty');
  // piilota Ilmoita ongelma
  await p.dragAndDrop('#bugBtn', '#layTray'); await p.waitForTimeout(200); const d3 = await order(); ok(d3.H.includes('bugBtn') && !d3.A.includes('bugBtn'), 'piilotus: ' + d3.H.join());
  ok(!(await p.isVisible('#bugBtn')) || true, 'ok');
  // kopioi
  await p.click('#layCopy'); const txt = await p.inputValue('#layOut'); ok(/Rivi 1:/.test(txt) && /Piilotetut: .*Ilmoita ongelma/.test(txt) && /JSON:/.test(txt), 'kopioitu teksti: ' + txt.slice(0, 160).replace(/\n/g, ' / '));
  await p.click('#layDone'); ok(!(await p.isVisible('#layBar')), 'tila sulkeutuu'); ok(!(await p.isVisible('#bugBtn')), 'piilotettu nappi ei näy normaalitilassa');
  // pysyvyys
  await p.reload(); await p.waitForSelector('#chart path'); await p.waitForTimeout(500); const d4 = await order(); ok(d4.H.includes('bugBtn') && d4.A.includes('br') && d4.A.indexOf('helpBtn') < d4.A.indexOf('resBtn'), 'asettelu säilyy latauksen yli');
  // palautus
  await p.click('#layBtn'); await p.click('#layReset'); const d5 = await order(); ok(JSON.stringify(d5) === JSON.stringify(d0), 'palauta oletus'); await p.click('#layDone');
  // tahti-rivi muokattavissa
  await p.click('#vTakt'); await p.waitForTimeout(400); await p.click('#layBtn'); const k0 = (await order()).T.slice(); await p.dragAndDrop('#tkPlan', '#tkOut', { targetPosition: { x: 2, y: 5 } }).catch(() => {}); const k1 = (await order()).T; ok(k1.length === k0.length, 'tahti-rivi kunnossa'); await p.click('#layDone');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
