// tahtinäkymä: laatikoiden siirto ja keston muutos
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vTakt'); await p.waitForTimeout(400);
  const st = () => p.evaluate(() => { const a = __aik(), l = a.lines[0]; return { start: l.start, ends: a.tasks(l).map(k => [k.s, k.e]) }; });
  const box = async (li, mode) => { const sel = mode ? '#taktR .tkh[data-tm="' + mode + '"][data-tl="' + 1 + '"][data-tloc="' + li + '"]' : '#taktR .tkb[data-tl="1"][data-tloc="' + li + '"]'; const bb = await p.locator(sel).first().boundingBox(); return bb; };
  const drag = async (bb, dx, shift) => { const x = bb.x + (bb.width > 12 ? bb.width / 2 : bb.width / 2), y = bb.y + bb.height / 2; if (shift) await p.keyboard.down('Shift'); await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + dx / 2, y); await p.mouse.move(x + dx, y); await p.mouse.up(); if (shift) await p.keyboard.up('Shift'); await p.waitForTimeout(250); };
  const s0 = await st(), dayPx = 70 / 5;
  // oletus: koko tehtävä siirtyy
  await drag(await box(0), dayPx * 3); const s1 = await st();
  ok(s1.start === s0.start + 3 && s1.ends.every((q, i) => q[0] === s0.ends[i][0] + 3), 'koko tehtävä siirtyi 3 pv: ' + JSON.stringify(s1) + ' vs ' + JSON.stringify(s0));
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  const s2 = await st(); ok(s2.start === s0.start, 'kumoa palauttaa');
  // Shift: vain yksi laatikko (toinen sijainti), muut pysyvät
  await drag(await box(1), dayPx * 2, true); const s3 = await st();
  ok(s3.ends[1][0] === s0.ends[1][0] + 2 && s3.ends[0][0] === s0.ends[0][0] && (s3.ends[2] ? s3.ends[2][0] === s0.ends[2][0] : true), 'vain yksi laatikko siirtyi: ' + JSON.stringify(s3) + ' vs ' + JSON.stringify(s0));
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  // oikea reuna: kesto
  const hb = await box(0, 'he'); await drag({ x: hb.x, y: hb.y, width: hb.width, height: hb.height }, dayPx * 1);
  const s4 = await st(); ok(s4.ends[0][1] > s0.ends[0][1], 'kesto kasvoi: ' + JSON.stringify(s4.ends[0]) + ' vs ' + JSON.stringify(s0.ends[0]));
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  // vasen reuna: alku siirtyy, loppu pysyy
  const hl = await box(0, 'hs'); await drag(hl, dayPx * 1);
  const s5 = await st(); ok(s5.ends[0][0] === s0.ends[0][0] + 1 && s5.ends[0][1] === s0.ends[0][1], 'vasen reuna: alku +1, loppu sama: ' + JSON.stringify(s5.ends[0]) + ' vs ' + JSON.stringify(s0.ends[0]));
  await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  await drag(await box(0), dayPx * 1.5); const s6 = await st();
  ok(Math.abs(s6.start - (s0.start + 1.5)) < 0.01 || Math.abs(s6.start - (s0.start + 1)) < 0.01 && false, 'puolen päivän tarkkuus: ' + s6.start + ' vs ' + s0.start);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
