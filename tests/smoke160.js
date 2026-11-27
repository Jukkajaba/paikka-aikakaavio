// tahtinäkymän zoomaus: + / − / Koko / Ctrl+rullaus
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  await p.click('#vTakt'); await p.waitForTimeout(300);
  const w = () => p.evaluate(() => +document.getElementById('taktR').getBoundingClientRect().width);
  const w0 = await w(); await p.click('#tkIn'); await p.waitForTimeout(100); const w1 = await w(); ok(w1 > w0 * 1.2, 'lähennys ' + w0 + '→' + w1);
  await p.click('#tkOut'); await p.click('#tkOut'); await p.waitForTimeout(100); const w2 = await w(); ok(w2 < w0, 'loitonnus ' + w2);
  await p.click('#tkFit'); await p.waitForTimeout(150); const bw = await p.evaluate(() => document.getElementById('taktBox').clientWidth), w3 = await w(); ok(w3 <= bw && w3 > bw - 250, 'Koko sovittaa ' + w3 + '/' + bw);
  await p.mouse.move(700, 500); await p.keyboard.down('Control'); await p.mouse.wheel(0, -200); await p.keyboard.up('Control'); await p.waitForTimeout(150); const w4 = await w(); ok(w4 > w3, 'Ctrl+rullaus lähentää ' + w4);
  // veto päivittyy livenä (ei vasta vapautettaessa)
  await p.click('#tkFit'); await p.waitForTimeout(150);
  { const sel = '#taktR .tkb[data-tl="1"]'; const bb = await p.locator(sel).first().boundingBox(), x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 20, y); await p.mouse.move(x + 60, y); await p.waitForTimeout(120);
    const bb2 = await p.locator(sel).first().boundingBox(); ok(bb2.x > bb.x + 20, 'laatikko liikkuu kesken vedon ' + bb.x + '→' + bb2.x); await p.mouse.up(); }
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
