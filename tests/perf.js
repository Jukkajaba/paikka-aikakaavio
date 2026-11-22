// Kuormitustesti: suuri projekti (NL sijaintia × NT työlajia). Käyttö: NL=100 NT=50 node tests/perf.js
const { chromium } = require('playwright');
const NL = +process.env.NL || 100, NT = +process.env.NT || 50;
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1600, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  const st = await p.evaluate(([NL, NT]) => {
    const o = __aik().stateObj(), locs = [], lt = [];
    for (let i = 1; i <= NL; i++) { const n = { id: 'l' + i, name: 'Sijainti ' + i, share: 1 }; locs.push(n); lt.push({ id: n.id, name: n.name, share: 1, par: null }); }
    const trades = [], lines = [], deps = [];
    for (let t = 0; t < NT; t++) { trades.push({ id: 't' + t, name: 'Työlaji ' + (t + 1), unit: 'm2', qty: 100, prod: 10, rank: t + 1, maxCrew: 20, col: '--t-runko' }); lines.push({ id: t + 1, trade: 't' + t, from: 'l1', to: 'l' + NL, start: t * 3, dur: 3, gap: 0, qty: 100, prod: 10, ov: {}, ord: (t + 1) * 10 }); if (t) deps.push({ id: t, a: { l: t, loc: 'l1' }, b: { l: t + 1, loc: 'l1' } }); }
    return Object.assign(o, { locs, lt, trades, lines, deps, groups: [], weeks: Math.min(260, Math.ceil((NT * 3 + NL * 3) / 5) + 20), nextId: NT + 2, nextDepId: NT + 2, baselines: [], drawTrade: null });
  }, [NL, NT]);
  const file = '/tmp/perf_' + NL + 'x' + NT + '.json'; require('fs').writeFileSync(file, JSON.stringify({ name: 'perf', state: st }));
  await p.click('#projBtn'); await p.waitForTimeout(200);
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(Math.round(e.duration)))).observe({ entryTypes: ['longtask'] }); } catch (e) { } });
  const t0 = Date.now(); await p.setInputFiles('input[data-pjfile]', file); await p.waitForFunction(n => __aik().lines.length >= n, NT, { timeout: 100000 }); const tImp = Date.now() - t0;
  await p.waitForTimeout(500);
  const info = await p.evaluate(() => ({ lines: __aik().lines.length, tasks: __aik().lines.reduce((s, l) => s + __aik().tasks(l).length, 0), dom: document.querySelectorAll('svg *').length, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null }));
  const timeDrag = async (sel, label) => {
    const bb = await p.locator(sel).boundingBox(); if (!bb) return label + ': ei löytynyt';
    const x = bb.x + bb.width * 0.5, y = bb.y + bb.height * 0.5; const ts = [];
    await p.mouse.move(x, y); await p.mouse.down(); for (let i = 0; i < 12; i++) { const a = Date.now(); await p.mouse.move(x + 6 + i * 4, y + (i % 2 ? 3 : -3)); await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); ts.push(Date.now() - a); }
    await p.mouse.up(); await p.waitForTimeout(100); ts.sort((a, b) => a - b); return label + ': mediaani ' + ts[6] + ' ms, huonoin ' + ts[11] + ' ms';
  };
  const out = [];
  const tr = async fn => { const a = Date.now(); await fn(); return Date.now() - a; };
  out.push('tuonti ' + tImp + ' ms');
  out.push('paikka-aikakaavio: ' + await timeDrag('#chart', 'veto (pan)'));
  await p.click('#cDraw'); out.push('piirto: ' + await timeDrag('#chart', 'piirto'));
  out.push('Gantt-näkymään vaihto ' + await tr(async () => { await p.click('#vGantt'); await p.waitForTimeout(50); await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); }) + ' ms');
  out.push('Gantt: ' + await timeDrag('#gantt', 'veto'));
  out.push('pitkät tehtävät (>50 ms): ' + JSON.stringify(await p.evaluate(() => window.__lt)));
  out.push('virheet ' + errs.length);
  console.log(NL + '×' + NT + ' ' + JSON.stringify(info) + '\n  ' + out.join('\n  ')); await b.close();
})();
