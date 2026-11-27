// kokonaismäärä on oletuksena suojattu (paneeli + gantt); Muokkaa avaa, muutos lukitsee takaisin
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(300);
  await p.locator('#ganttScroll').click({ position: { x: 120, y: 26 * 1 + 13 }, force: true }); await p.waitForTimeout(200);
  const tot = () => p.evaluate(() => { const A = __aik(); return A.totalQty(A.lines[0]); });
  const q0 = await tot();
  ok(await p.locator('#f-tqty').evaluate(e => e.readOnly), 'kenttä on oletuksena vain luettava');
  await p.locator('#f-tqty').evaluate(e => { e.value = String(+e.value * 2); e.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(150);
  ok(await tot() === q0, 'suojattu kenttä ei muuta määrää: ' + q0 + ' → ' + await tot());
  await p.click('[data-act=qedit]'); await p.waitForTimeout(150);
  ok(!(await p.locator('#f-tqty').evaluate(e => e.readOnly)), 'Muokkaa avaa kentän');
  await p.fill('#f-tqty', String(q0 * 2)); await p.dispatchEvent('#f-tqty', 'change'); await p.waitForTimeout(200);
  ok(Math.abs(await tot() - q0 * 2) < 0.01, 'avattuna määrä muuttuu');
  ok(await p.locator('#f-tqty').evaluate(e => e.readOnly), 'muutoksen jälkeen suojaus palaa');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
