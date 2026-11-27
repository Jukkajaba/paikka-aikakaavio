// tyhjästä piirretty tehtävä (tahti ja paikka-aika): määrä 0, kesto piirretyn mukaan, ei NaN
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vTakt'); await p.waitForTimeout(500);
  const n0 = await p.evaluate(() => __aik().lines.length);
  const pt = await p.evaluate(() => { const r = document.getElementById('taktR').getBoundingClientRect(); for (let y = r.y + 60; y < r.y + 400; y += 44) for (let x = r.x + 40; x < Math.min(r.x + r.width, 1400) - 150; x += 20) { const e = document.elementFromPoint(x, y); if (e && e.closest && e.closest('#taktR') && !e.classList.contains('tkb') && !e.closest('.tkb') && !(e.dataset && e.dataset.td)) { let free = true; for (let q = 0; q <= 100; q += 20) { const f = document.elementFromPoint(x + q, y); if (!f || (f.classList && f.classList.contains('tkb'))) free = false; } if (free) return { x: x, y: y }; } } return null; });
  ok(!!pt, 'tyhjä kohta löytyi'); await p.mouse.move(pt.x, pt.y); await p.mouse.down(); await p.mouse.move(pt.x + 100, pt.y + 60, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const A = __aik(), l = A.lines[A.lines.length - 1], ts = A.tasks(l); return { n: A.lines.length, qty: A.totalQty(l), dur: l.dur, nloc: ts.length, crew: ts[0].crew, bad: ts.some(t => !isFinite(t.s) || !isFinite(t.e) || t.e <= t.s) }; });
  ok(r.n === n0 + 1, 'tehtävä syntyi'); ok(r.qty === 0, 'määrä 0: ' + r.qty); ok(!r.bad && r.crew >= 1, 'ajoitus kunnossa ' + JSON.stringify(r));
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
