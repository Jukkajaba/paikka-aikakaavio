// riippuvuuden valinta ja poisto pelkällä klikkauksella + Delete (paikka-aika ja Gantt)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 950 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const nd = () => p.evaluate(() => __aik().deps.length);
  const clickDep = async sel => { const pt = await p.evaluate(sel => { const els = [...document.querySelectorAll(sel)]; for (const e of els) { const L = e.getTotalLength ? e.getTotalLength() : 0; for (const f of [0.5, 0.3, 0.7, 0.15, 0.85]) { const q = e.getPointAtLength ? e.getPointAtLength(L * f) : null; let x, y; if (q) { const m = e.getScreenCTM(); x = q.x * m.a + q.y * m.c + m.e; y = q.x * m.b + q.y * m.d + m.f; } else { const x1 = +e.getAttribute('x1'), x2 = +e.getAttribute('x2'), y1 = +e.getAttribute('y1'), y2 = +e.getAttribute('y2'), m = e.getScreenCTM(); const px = x1 + (x2 - x1) * f, py = y1 + (y2 - y1) * f; x = px * m.a + py * m.c + m.e; y = px * m.b + py * m.d + m.f; } if (document.elementFromPoint(x, y) === e) return { x: x, y: y }; } } return null; }, sel); if (!pt) return false; await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(250); return true; };
  // paikka-aika
  const n0 = await nd(); ok(n0 > 0, 'esimerkissä riippuvuuksia: ' + n0);
  ok(await clickDep('#chart [data-role="dep"]'), 'paikka-aika: riippuvuus klikattavissa ilman Ctrliä');
  await p.keyboard.press('Delete'); await p.waitForTimeout(250); ok((await nd()) === n0 - 1, 'paikka-aika: Delete poisti riippuvuuden ' + n0 + '→' + (await nd()));
  // Gantt
  await p.click('#vGantt'); await p.waitForTimeout(400); const n1 = await nd();
  if (n1 > 0) { ok(await clickDep('#gantt [data-gr="gdeppick"]'), 'gantt: riippuvuus klikattavissa ilman Ctrliä'); await p.keyboard.press('Delete'); await p.waitForTimeout(250); ok((await nd()) === n1 - 1, 'gantt: Delete poisti ' + n1 + '→' + (await nd())); }
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
