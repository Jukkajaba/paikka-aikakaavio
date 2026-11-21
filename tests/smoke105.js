// määräluettelon tarkastelu tuonnin jälkeen
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#impBtn'); await p.fill('#impTxt', "Littera\tSuorite\tMäärä\tYksikkö\tKerros 1\tKerros 2\n1\tPerustukset\t\t\t\t\n1.1\tAnturamuotti\t200\tm2\t120\t80\n1.2\tSokkeli\t90\tm2\t50\t40"); await p.click('#impParse'); await p.click('#impGo'); await p.waitForTimeout(200);
  await p.click('#qtyBtn'); await p.waitForTimeout(150);
  const txt = await p.locator('#qtyBody').innerText();
  ok(/Perustukset/.test(txt) && /Anturamuotti/.test(txt) && /Sokkeli/.test(txt), 'rows ' + txt.slice(0, 200));
  ok(/200/.test(txt) && /120/.test(txt) && /80/.test(txt), 'numbers');
  await p.click('#qtyBody tr[data-ql]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.getElementById('qtyBox').style.display === 'none'), 'closes on row click');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
