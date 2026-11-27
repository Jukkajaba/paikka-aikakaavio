// riippuvuus: seuraajan voi vetää takaisin kiinni edeltäjään, vaikka viive olisi kasvanut
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch();
  for (const mode of ['rigid', 'lag']) {
    const p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { window.__drawOn0 = true; });
    await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
    await p.click('#vTakt'); await p.waitForTimeout(300);
    await p.evaluate(m => { const a = __aik(); a.deps.push({ id: 99, a: { l: 1, loc: a.LOCS[2].id }, b: { l: 2, loc: a.LOCS[2].id }, rigid: m === 'rigid', lag: m === 'lag' ? 4 : undefined }); }, mode);
    await p.click('#vFlow'); await p.click('#vTakt'); await p.waitForTimeout(300);
    const st = () => p.evaluate(() => { const a = __aik(), t = id => a.tasks(a.lines.find(l => l.id === id))[2]; return { Ae: t(1).e, Bs: t(2).s, lag: (a.deps.find(d => d.id === 99) || {}).lag }; });
    const drag = async (sel, dx) => { const bb = await p.locator(sel).first().boundingBox(), x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + dx / 2, y); await p.mouse.move(x + dx, y); await p.mouse.up(); await p.waitForTimeout(250); };
    const A = '#taktR .tkb[data-tl="1"][data-tloc="2"]', B = '#taktR .tkb[data-tl="2"][data-tloc="2"]', px = 14;
    await drag(B, px * 6); const s1 = await st(); ok(s1.Bs > s1.Ae, mode + ': seuraaja myöhempänä ' + JSON.stringify(s1));
    await drag(A, px * 5); await drag(A, -px * 5);
    await drag(B, -px * 40); const s2 = await st();
    ok(s2.Bs === s2.Ae, mode + ': seuraaja kiinni edeltäjässä: ' + JSON.stringify(s2));
    ok(!(s2.lag > 0), mode + ': viive pienentynyt: ' + JSON.stringify(s2));
    ok(errs.length === 0, 'virheet ' + errs.join('|')); await p.close();
  }
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
