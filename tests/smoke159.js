// liikutuksen tarkkuus projektiasetuksena: päivä / puoli päivää / automaattinen
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const start = () => p.evaluate(() => __aik().lines[0].start);
  const setSnap = async v => { await p.click('#projBtn'); await p.waitForTimeout(150); await p.selectOption('#pj-snap', v); await p.waitForTimeout(100); await p.click('#projBtn'); await p.waitForTimeout(100); };
  const gdrag = async dxPx => { const bb = await p.locator('#chart path[data-role="body"]').first().boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + dxPx / 2, y); await p.mouse.move(x + dxPx, y); await p.mouse.up(); await p.waitForTimeout(250); };
  const sw = await p.evaluate(() => { const l = __aik().lines[0]; return 0; });
  // paikka-aika: oletus (auto) = 1 pv, kokonaisluku
  const s0 = await start(); await gdrag(25); const s1 = await start(); ok(Number.isInteger(s1), 'auto: päivän tarkkuus paikka-ajassa: ' + s1);
  await p.keyboard.press('Control+z'); await p.waitForTimeout(150);
  await setSnap('0.5'); const s2a = await start(); let half = false; for (const px of [4, 7, 11, 14, 18]) { await gdrag(px); const v = await start(); if (Math.abs(v - Math.round(v)) > 1e-9) half = true; if (Math.abs(v * 2 - Math.round(v * 2)) > 1e-9) { ok(false, 'ei puolipäivälukua ' + v); } await p.keyboard.press('Control+z'); await p.waitForTimeout(100); }
  ok(half, '0,5: jokin veto antoi puolen päivän arvon');
  // asetus tallentuu tilaan
  const so = await p.evaluate(() => __aik().stateObj().snap); ok(so === '0.5', 'asetus tilassa: ' + so);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
