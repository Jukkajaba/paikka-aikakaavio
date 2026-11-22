// Profilointi: node tests/prof.js (NL, NT, VIEW=g) → ylimmät funktiot omalla ajalla
const { chromium } = require('playwright'); const fs = require('fs');
const NL = +process.env.NL || 300, NT = +process.env.NT || 150;
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  const st = await p.evaluate(([NL, NT]) => { const o = __aik().stateObj(), locs = [], lt = [], trades = [], lines = [], deps = [];
    for (let i = 1; i <= NL; i++) { locs.push({ id: 'l' + i, name: 'S' + i, share: 1 }); lt.push({ id: 'l' + i, name: 'S' + i, share: 1, par: null }); }
    for (let t = 0; t < NT; t++) { trades.push({ id: 't' + t, name: 'T' + (t + 1), unit: 'm2', qty: 100, prod: 10, rank: t + 1, maxCrew: 20, col: '--t-runko' }); lines.push({ id: t + 1, trade: 't' + t, from: 'l1', to: 'l' + NL, start: t * 3, dur: 3, gap: 0, qty: 100, prod: 10, ov: {}, ord: (t + 1) * 10 }); if (t) deps.push({ id: t, a: { l: t, loc: 'l1' }, b: { l: t + 1, loc: 'l1' } }); }
    return Object.assign(o, { locs, lt, trades, lines, deps, groups: [], weeks: 120, nextId: NT + 2, nextDepId: NT + 2, baselines: [], drawTrade: null }); }, [NL, NT]);
  fs.writeFileSync('/tmp/prof.json', JSON.stringify({ name: 'p', state: st }));
  await p.click('#projBtn'); await p.setInputFiles('input[data-pjfile]', '/tmp/prof.json'); await p.waitForFunction(n => __aik().lines.length >= n, NT); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('.fp').forEach(e => { e.hidden = true; }));
  if (process.env.VIEW === 'g') { await p.click('#vGantt'); await p.waitForTimeout(500); }
  const c = await p.context().newCDPSession(p); await c.send('Profiler.enable'); await c.send('Profiler.start');
  for (let i = 0; i < 6; i++) { await p.setViewportSize({ width: 1600 - i * 20, height: 900 }); await p.waitForTimeout(300); }
  const { profile } = await c.send('Profiler.stop'); const self = new Map(), byId = new Map(profile.nodes.map(n => [n.id, n])); const dt = profile.timeDeltas;
  profile.samples.forEach((id, i) => { const n = byId.get(id), k = n.callFrame.functionName + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k) || 0) + (dt[i] || 0)); });
  const tot = [...self.values()].reduce((a, b) => a + b, 0); console.log('yhteensä ms', Math.round(tot / 1000));
  [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).forEach(([k, v]) => console.log(String(Math.round(v / 1000)).padStart(6), 'ms ', k));
  await b.close();
})();
