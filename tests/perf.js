// Kuormitustesti: suuri projekti (NL sijaintia × NT työlajia). Käyttö: NL=100 NT=50 node tests/perf.js
const { chromium } = require('playwright');
const NL = +process.env.NL || 100, NT = +process.env.NT || 50, HIER = process.env.HIER ? process.env.HIER.split('x').map(Number) : null; // HIER=5x10x10: rakennukset × kerrokset × lohkot
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1600, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  const st = await p.evaluate(([NL, NT, HIER]) => {
    const o = __aik().stateObj(), locs = [], lt = [];
    if (HIER) { let c = 0; for (let a = 1; a <= HIER[0]; a++) { lt.push({ id: 'b' + a, name: 'Rakennus ' + a, share: 1, par: null }); for (let f = 1; f <= HIER[1]; f++) { lt.push({ id: 'f' + a + '_' + f, name: 'Kerros ' + f, share: 1, par: 'b' + a }); for (let k = 1; k <= HIER[2]; k++) { c++; const n = { id: 'l' + c, name: 'Lohko ' + a + '.' + f + '.' + k, share: 1 }; locs.push(n); lt.push({ id: n.id, name: n.name, share: 1, par: 'f' + a + '_' + f }); } } } }
    else for (let i = 1; i <= NL; i++) { const n = { id: 'l' + i, name: 'Sijainti ' + i, share: 1 }; locs.push(n); lt.push({ id: n.id, name: n.name, share: 1, par: null }); }
    NL = locs.length;
    const trades = [], lines = [], deps = [];
    for (let t = 0; t < NT; t++) { trades.push({ id: 't' + t, name: 'Työlaji ' + (t + 1), unit: 'm2', qty: 100, prod: 10, rank: t + 1, maxCrew: 20, col: '--t-runko' }); lines.push({ id: t + 1, trade: 't' + t, from: 'l1', to: 'l' + NL, start: t * 3, dur: 3, gap: 0, qty: 100, prod: 10, ov: {}, ord: (t + 1) * 10 }); if (t) deps.push({ id: t, a: { l: t, loc: 'l1' }, b: { l: t + 1, loc: 'l1' } }); }
    return Object.assign(o, { locs, lt, trades, lines, deps, groups: [], weeks: Math.min(260, Math.ceil((NT * 3 + NL * 3) / 5) + 20), nextId: NT + 2, nextDepId: NT + 2, baselines: [], drawTrade: null });
  }, [NL, NT, HIER]);
  const NLn = HIER ? HIER[0] * HIER[1] * HIER[2] : NL;
  const file = '/tmp/perf_' + NLn + 'x' + NT + '.json'; require('fs').writeFileSync(file, JSON.stringify({ name: 'perf', state: st }));
  await p.click('#projBtn'); await p.waitForTimeout(200);
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(Math.round(e.duration)))).observe({ entryTypes: ['longtask'] }); } catch (e) { } });
  const t0 = Date.now(); await p.setInputFiles('input[data-pjfile]', file); await p.waitForFunction(n => __aik().lines.length >= n, NT, { timeout: 100000 }); const tImp = Date.now() - t0;
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('.fp').forEach(e => { e.hidden = true; }));
  await p.waitForTimeout(200);
  const info = await p.evaluate(() => ({ lines: __aik().lines.length, tasks: __aik().lines.reduce((s, l) => s + __aik().tasks(l).length, 0), dom: document.querySelectorAll('svg *').length, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null }));
  const timeDrag = async (sel, label, onPath, nth) => {
    let x, y;
    if (onPath) { const pt = await p.evaluate(s => { const el = document.querySelector(s); if (!el) return null; const L = el.getTotalLength(), q = el.getPointAtLength(L * 0.2), m = el.getScreenCTM(); return { x: q.x * m.a + q.y * m.c + m.e, y: q.x * m.b + q.y * m.d + m.f }; }, sel); if (!pt) return label + ': ei löytynyt'; x = pt.x; y = pt.y; if (process.env.DBG) console.log('DBG', x, y, await p.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h && (h.tagName + ' ' + h.getAttribute('data-role') + ' ' + (h.closest('.fp') ? 'PANEL' : '')); }, [x, y])); }
    else { const pt = await p.evaluate(s => { for (const el of document.querySelectorAll(s)) { const r = el.getBoundingClientRect(), x = r.left + r.width * (/bg/.test(s) ? .3 : .5), y = r.top + r.height * (/bg/.test(s) ? .4 : .5); if (r.width < 2 || y < 0 || y > innerHeight) continue; const h = document.elementFromPoint(x, y); if (h === el || (h && h.getAttribute('data-gr') === el.getAttribute('data-gr') && h.getAttribute('data-gi') === el.getAttribute('data-gi'))) return { x, y }; } return null; }, sel); if (!pt) return label + ': ei löytynyt'; x = pt.x; y = pt.y; }
    const ts = [], sig0 = await p.evaluate(() => JSON.stringify(__aik().lines.map(l => l.start + '/' + l.dur + JSON.stringify(l.ov)))); await p.evaluate(() => { window.__lt = []; });
    await p.mouse.move(x, y); await p.mouse.down(); for (let i = 0; i < 12; i++) { const a = Date.now(); await p.mouse.move(x + 6 + i * 4, y + (i % 2 ? 3 : -3)); await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); ts.push(Date.now() - a); }
    await p.mouse.up(); await p.waitForTimeout(100); ts.sort((a, b) => a - b); const sig1 = await p.evaluate(() => JSON.stringify(__aik().lines.map(l => l.start + '/' + l.dur + JSON.stringify(l.ov)))), lt = await p.evaluate(() => window.__lt.slice()); return label + ': kuvaruudun päivitys mediaani ' + ts[6] + ' ms, huonoin ' + ts[11] + ' ms; pisin renderöinti ' + (lt.length ? Math.max.apply(null, lt) : '<50') + ' ms; ' + (sig0 !== sig1 ? 'malli muuttui' : 'malli EI muuttunut');
  };
  const out = [];
  const tr = async fn => { const a = Date.now(); await fn(); return Date.now() - a; };
  out.push('tuonti ' + tImp + ' ms');
  out.push('paikka-aikakaavio: ' + await timeDrag('#chart path[data-role=body]', 'viivan siirto', true));
  out.push('tyhjän alueen veto: ' + await timeDrag('#chart [data-role=bg]', 'pan'));
  await p.click('#cDraw'); out.push('piirto: ' + await timeDrag('#chart [data-role=bg]', 'piirto'));
  out.push('Gantt-näkymään vaihto ' + await tr(async () => { await p.click('#vGantt'); await p.waitForTimeout(50); await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); }) + ' ms');
  out.push('Gantt: ' + await timeDrag('#gantt [data-gr=gmove]', 'palkin siirto', false, 2));
  { const R = async view => { if (view === 'g') await p.click('#vGantt'); else await p.click('#vFlow'); await p.waitForTimeout(150); const a = []; for (let i = 0; i < 5; i++) { await p.setViewportSize({ width: 1600 - i * 20, height: 900 }); await p.waitForTimeout(150); a.push(await p.evaluate(() => window.__rms)); } a.sort((x, y) => x - y); return a[2]; };
    out.push('yhden renderöinnin kesto (mediaani): paikka-aikakaavio ' + await R('f') + ' ms, Gantt ' + await R('g') + ' ms  ← raahauksen viive on tämän suuruinen'); }
  out.push('pitkät tehtävät (>50 ms): ' + JSON.stringify(await p.evaluate(() => window.__lt)));
  out.push('(perustaso tyhjällä sivulla ~50 ms: kaksi kuvaruudunpäivitystä)'); out.push('virheet ' + errs.length);
  console.log(NLn + '×' + NT + ' ' + JSON.stringify(info) + '\n  ' + out.join('\n  ')); await b.close();
})();
