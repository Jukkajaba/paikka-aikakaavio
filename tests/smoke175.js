// tahtinäkymässä näkyvät riippuvuudet; klikkaus valitsee, viivettä voi säätää paneelissa, Delete poistaa
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const nd = await p.evaluate(() => __aik().deps.length); ok(nd >= 1, 'esimerkissä on riippuvuuksia');
  await p.click('#vTakt'); await p.waitForTimeout(600);
  const hits = () => p.locator('#taktR [data-td]').count();
  const n1 = await hits(); ok(n1 >= 1, 'riippuvuudet piirtyvät tahtiin: ' + n1);
  await p.click('#depToggle'); await p.waitForTimeout(300); ok(await hits() === 0, 'Riippuvuudet-valinta piilottaa ne');
  await p.click('#depToggle'); await p.waitForTimeout(300); ok(await hits() === n1, 'ja tuo takaisin');
  await p.locator('#taktR [data-td]').first().dispatchEvent('pointerdown', { button: 0 }); await p.waitForTimeout(300);
  const sel = await p.evaluate(() => document.querySelectorAll('#panel .deprow2.sel').length); ok(sel >= 1, 'klikkaus valitsee riippuvuuden, paneelissa viiverivi: ' + sel);
  await p.keyboard.press('Delete'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => __aik().deps.length) === nd - 1, 'Delete poistaa riippuvuuden');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
