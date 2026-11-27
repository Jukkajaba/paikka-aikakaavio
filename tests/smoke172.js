// uusi tehtävä (määrä 0): työryhmä asetetaan käsin Gantt-solusta ja paneelin +/-, kesto ei muutu
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(200);
  await p.locator('#ganttScroll').click({ position: { x: 120, y: 39 }, force: true }); await p.keyboard.press('Shift+Enter'); await p.waitForTimeout(300);
  const st = () => p.evaluate(() => { const A = __aik(), l = A.lines.find(x => x.flat && x.qty === 0); return l ? { crew: A.tasks(l)[0].crew, d: A.tasks(l)[0].d, id: l.id } : null; });
  const s0 = await st(); ok(s0 && s0.crew === 1 && s0.d === 5, 'alku ' + JSON.stringify(s0));
  const pos = await p.evaluate(id => { const A = __aik(), i = A.gRows.findIndex(r => r.flat && r.line === id), r = document.querySelector('#gantt rect[data-gi="' + i + '"]').getBoundingClientRect(); const hs = [...document.querySelectorAll('#ganttHead [data-gcm] text:not(:last-child)')]; const h = hs.find(t => /Resurssi/.test(t.textContent)); return { y: r.top + r.height / 2, x: h.getBoundingClientRect().right - 12 }; }, s0.id);
  await p.mouse.click(pos.x, pos.y); await p.waitForTimeout(150);
  ok(await p.locator('input.gced').count() > 0, 'resurssisolu avautuu muokattavaksi');
  await p.fill('input.gced', '3'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  const s1 = await st(); ok(s1 && s1.crew === 3 && s1.d === 5, 'työryhmä 3, kesto pysyy 5: ' + JSON.stringify(s1));
  await p.evaluate(id => { const A = __aik(), l = A.lines.find(x => x.id === id); l.qty = 100; }, s0.id);
  ok((await p.evaluate(id => { const A = __aik(); return A.tasks(A.lines.find(x => x.id === id))[0].crew; }, s0.id)) !== 3, 'kun määrä > 0, työryhmä lasketaan määrästä');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
