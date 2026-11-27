// resurssityypin lisäys ei vaihda kuvaajaa uuteen tyhjään tyyppiin (vanhat resurssit pysyvät näkyvissä)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  if (!(await p.locator('#rp-new').isVisible().catch(() => false))) { await p.click('#resBtn'); await p.waitForTimeout(300); }
  const bars = () => p.evaluate(() => document.querySelectorAll('#chart rect').length);
  const before = await bars(); const unitBefore = await p.evaluate(() => (document.getElementById('summary') || {}).textContent || '');
  await p.fill('#rp-new', 'Nosturi'); await p.fill('#rp-unit', 'kpl'); await p.click('[data-ract=add]'); await p.waitForTimeout(400);
  const sel = await p.evaluate(() => { const s = document.querySelector('select[data-ract=show]'); return s ? s.options[s.selectedIndex].textContent : null; });
  ok(sel === 'Työntekijät', 'kuvaaja pysyy Työntekijät-tyypissä: ' + sel);
  ok(await bars() >= before - 2, 'resurssikuvaaja ei tyhjene: ' + before + ' → ' + await bars());
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
