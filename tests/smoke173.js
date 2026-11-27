// tuottavuuden muutos (nuolet) ei hypäytä paneelin vieritystä eikä vie tarkennusta
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(200);
  await p.locator('#ganttScroll').click({ position: { x: 120, y: 39 }, force: true }); await p.waitForTimeout(250);
  await p.locator('#f-prod').scrollIntoViewIfNeeded(); await p.locator('#f-prod').focus();
  const st = () => p.evaluate(() => ({ st: document.getElementById('panel').scrollTop, top: Math.round(document.getElementById('f-prod').getBoundingClientRect().top), act: document.activeElement.id }));
  const s0 = await st(); ok(s0.st > 0, 'paneeli vieritetty: ' + JSON.stringify(s0));
  for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowUp'); await p.waitForTimeout(300);
  const s1 = await st(); ok(s1.st === s0.st && s1.top === s0.top, 'vieritys pysyy: ' + JSON.stringify([s0, s1])); ok(s1.act === 'f-prod', 'tarkennus säilyy: ' + s1.act);
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
