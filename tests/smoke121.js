// ylätehtävän (summarivin) kesto, alku ja loppu muokattavissa Ganttissa
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.evaluate(() => { const A = __aik(); A.groups.push({ id: 'KT1', name: 'Runko', ord: 10 }); A.lines[0].grp = 'KT1'; A.lines[1].grp = 'KT1'; window.dispatchEvent(new Event('resize')); });
  await p.click('#vGantt'); await p.waitForTimeout(400);
  const grpInfo = () => p.evaluate(() => { const A = __aik(), ms = A.lines.filter(l => l.grp === 'KT1'); return { s: Math.min(...ms.map(l => l.start)), e: Math.max(...ms.map(l => lineEnd(l))) }; });
  const g0 = await grpInfo();
  const i = await p.evaluate(() => { const A = __aik(), rs = (typeof A.gRows === 'function' ? A.gRows() : A.gRows); return rs.findIndex(r => r.gk && r.grp === 'KT1'); });
  ok(i >= 0, 'ryhmärivi löytyi');
  const clickCell = async ci => { const pos = await p.evaluate(([i, ci]) => { const r = document.querySelector('#gantt rect[data-gi="' + i + '"]').getBoundingClientRect(); const hs = [...document.querySelectorAll('#ganttHead [data-gcm] text:not(:last-child)')]; return { y: r.top + r.height / 2, x: hs[ci].getBoundingClientRect().right - 12 }; }, [i, ci]); await p.mouse.click(pos.x, pos.y); await p.waitForTimeout(150); };
  await clickCell(0); ok(await p.locator('input.gced').count() === 1, 'editori aukeaa ryhmärivillä');
  const target = Math.round((g0.e - g0.s) * 1.5);
  await p.fill('input.gced', String(target)); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  const g1 = await grpInfo(); ok(Math.abs((g1.e - g1.s) - target) < 1.2, 'kesto ' + (g0.e - g0.s) + ' → ' + (g1.e - g1.s) + ' (tavoite ' + target + ')'); ok(Math.abs(g1.s - g0.s) < 0.2, 'alku ennallaan');
  await clickCell(1); await p.fill('input.gced', '1.3.'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  const g2 = await grpInfo(); ok(g2.s > g1.s && Math.abs((g2.e - g2.s) - (g1.e - g1.s)) < 0.5, 'alku siirsi ryhmää: ' + g1.s + ' → ' + g2.s);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
