// tahti: toteuman pikasyöttö (kaksoisklikkaus, nuppi, monivalinta, suunnitelman mukaan)
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  await p.click('#vTakt'); await p.waitForTimeout(250);
  await p.click('[data-ptog=st]'); await p.fill('#st-day', '2027-02-10'); await p.dispatchEvent('#st-day', 'change'); await p.waitForTimeout(250);
  await p.click('#tkFit'); await p.waitForTimeout(200);
  { const bar = await p.locator('.fp[data-p=st] .fp-bar').boundingBox(); await p.mouse.move(bar.x + 40, bar.y + 10); await p.mouse.down(); await p.mouse.move(bar.x + 40, bar.y + 300); await p.mouse.move(bar.x + 40, bar.y + 420); await p.mouse.up(); await p.waitForTimeout(200); }
  { const bar = await p.locator('.fp[data-p=panel] .fp-bar, .fp[data-p=task] .fp-bar').first().boundingBox().catch(() => null); if (bar) { await p.mouse.move(bar.x + 40, bar.y + 10); await p.mouse.down(); await p.mouse.move(bar.x + 40, bar.y + 300); await p.mouse.move(bar.x + 40, bar.y + 420); await p.mouse.up(); } }
  const pctOf = (li, loc) => p.evaluate(([li, loc]) => { const a = __aik(), l = a.lines[li], k = a.tasks(l)[loc], o = (l.ov || {})[k.locId]; return o && o.pct != null ? o.pct : null; }, [li, loc]);
  const box = (l, loc) => p.locator('#taktR .tkb[data-tl="' + l + '"][data-tloc="' + loc + '"]').first();
  const id0 = await p.evaluate(() => __aik().lines[0].id);
  // kaksoisklikkaus -> 100 %
  let bb = await box(id0, 1).boundingBox(); await p.mouse.dblclick(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(250);
  ok(await pctOf(0, 1) === 100, 'kaksoisklikkaus 100 %: ' + await pctOf(0, 1));
  bb = await box(id0, 1).boundingBox(); await p.mouse.dblclick(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(250);
  ok(await pctOf(0, 1) === 0, 'toinen kaksoisklikkaus takaisin 0: ' + await pctOf(0, 1));
  // valitse laatikko ja vedä nuppia
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(200);
  const kn = p.locator('#taktR .tkp'); ok(await kn.count() === 1, 'nuppi näkyy valitulle');
  const kb = await kn.boundingBox(), x1 = +(await kn.getAttribute('data-x1')), x0 = +(await kn.getAttribute('data-x0')), r = await p.locator('#taktR').boundingBox();
  await p.mouse.move(kb.x + kb.width / 2, kb.y + kb.height / 2); await p.mouse.down(); await p.mouse.move(r.x + x0 + (x1 - x0) * 0.52, kb.y + 3); await p.mouse.move(r.x + x0 + (x1 - x0) * 0.52, kb.y + 3); await p.mouse.up(); await p.waitForTimeout(250);
  ok(await pctOf(0, 1) === 50, 'nuppi 50 %: ' + await pctOf(0, 1));
  // monivalinta: ctrl-klikkaus kahteen laatikkoon, kaksoisklikkaus asettaa molemmat
  const bb2 = await box(id0, 2).boundingBox(); await p.keyboard.down('Control'); await p.mouse.click(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2); await p.waitForTimeout(150); await p.keyboard.up('Control');
  ok(await p.locator('#taktR .tkb[stroke-dasharray="5 2"]').count() >= 1, 'monivalinta korostettu');
  // suunnitelman mukaan
  const before = await p.evaluate(() => { const a = __aik(); let n = 0; a.lines.forEach(l => a.tasks(l).forEach(k => { const o = (l.ov || {})[k.locId]; if (o && o.pct != null) n++; })); return n; });
  await p.click('#tkPlan'); await p.waitForTimeout(300);
  const after = await p.evaluate(() => { const a = __aik(); let n = 0; a.lines.forEach(l => a.tasks(l).forEach(k => { const o = (l.ov || {})[k.locId]; if (o && o.pct != null) n++; })); return n; });
  ok(after > before, 'suunnitelman mukaan kirjasi: ' + before + '→' + after);
  ok(await pctOf(0, 1) === 50, 'jo kirjattu ei ylikirjoitu');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
