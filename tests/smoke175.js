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
  // Alt-veto laatikosta toiseen luo riippuvuuden
  const nd2 = await p.evaluate(() => __aik().deps.length);
  const pt = (l, loc) => p.evaluate(([l, loc]) => { const e = [...document.querySelectorAll('#taktR .tkb')].find(x => x.dataset.tl === l && (loc == null || x.dataset.tloc === loc)); if (!e) return null; const r = e.getBoundingClientRect(); for (let fx = .5; fx < 1; fx += .1) for (let fy = .3; fy < .8; fy += .1) { const x = r.x + r.width * fx, y = r.y + r.height * fy, h = document.elementFromPoint(x, y); if (h === e) return { x, y, loc: e.dataset.tloc }; } return null; }, [l, loc]);
  const a = await pt('4', null), c = a && await pt('6', a.loc);
  if (a && c) {
    await p.keyboard.down('Alt'); await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move((a.x + c.x) / 2, (a.y + c.y) / 2, { steps: 5 }); await p.mouse.move(c.x, c.y, { steps: 5 });
    ok(await p.locator('#taktR line[stroke="var(--dep)"]').count() >= 1, 'esikatselu piirtyy veto aikana');
    await p.mouse.up(); await p.keyboard.up('Alt'); await p.waitForTimeout(300);
    const nd3 = await p.evaluate(() => __aik().deps.length); ok(nd3 === nd2 + 1, 'Alt-veto loi riippuvuuden: ' + nd2 + ' → ' + nd3);
    ok(await p.evaluate(() => { const d = __aik().deps.slice(-1)[0]; return d && d.rigid === true && d.a.l === 4 && d.b.l === 6; }), 'uusi riippuvuus 4→6 ja seuraa edeltäjää');
  } else ok(false, 'osuvia laatikoita ei löytynyt');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
