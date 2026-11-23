// janatekstit: oikea klikkaus Ganttissa → "Näytä janatekstit"
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(400);
  const cnt = () => p.evaluate(() => [...document.querySelectorAll('#gantt text')].filter(t => t.getAttribute('pointer-events') === 'none' && /font:500 11px/.test(t.getAttribute('style') || '')).length);
  ok(await cnt() === 0, 'ei tekstejä oletuksena');
  const pos = await p.evaluate(() => { const r = document.querySelector('#gantt rect[data-gr="gmove"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.click(pos.x, pos.y, { button: 'right' }); await p.waitForTimeout(200);
  const btn = p.locator('button[data-cx="gtxt"]'); ok(await btn.count() === 1 && /Näytä janatekstit/.test(await btn.innerText()), 'valikkokohta');
  await btn.click(); await p.waitForTimeout(300);
  ok(await cnt() > 0, 'tekstit näkyvät (' + await cnt() + ')');
  await p.mouse.click(pos.x, pos.y, { button: 'right' }); await p.waitForTimeout(200);
  ok(/Piilota/.test(await p.locator('button[data-cx="gtxt"]').innerText()), 'piilotus-vaihtoehto'); await p.locator('button[data-cx="gtxt"]').click(); await p.waitForTimeout(300);
  ok(await cnt() === 0, 'piilotettu');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
