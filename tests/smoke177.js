// Tuo määrät: Excel-tiedosto (demo-määräluettelo) tyhjään projektiin: sijaintihierarkia polkunimistä, suoritteet, tuottavuus ja työryhmä sarakkeista
const { chromium } = require('playwright');
(async () => {
  require('fs').writeFileSync('/tmp/big177.html', require('fs').readFileSync('aikataulun-piirtoprototyyppi.html', 'utf8').replace('stateObj: () => stateObj() });', 'stateObj: () => stateObj(), applyState: st => applyState(st) });'));
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file:///tmp/big177.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.evaluate(() => { const a = __aik(), st = JSON.parse(JSON.stringify(a.stateObj())); st.lt = []; st.lines = []; st.groups = []; st.deps = []; st.locs = undefined; st.trades = st.trades.slice(0, 1); a.applyState(st); });
  await p.waitForTimeout(300);
  await p.click('#impBtn'); await p.waitForTimeout(200);
  await p.setInputFiles('#impFile', 'demo/demo-maaraluettelo.xlsx'); await p.waitForTimeout(600);
  const roles = await p.evaluate(() => [...document.querySelectorAll('#impBody select[data-ir]')].map(s => s.value));
  ok(roles.slice(0, 6).join() === 'code,name,qty,unit,prod,crew', 'roolit: ' + roles.slice(0, 7).join());
  ok(roles.slice(6).every(r => r === 'loc') && roles.length === 36, 'sijaintisarakkeita 30: ' + roles.length);
  await p.click('#impGo'); await p.waitForTimeout(600);
  const r = await p.evaluate(() => { const A = __aik(); return { locs: A.LOCS.length, lt: A.LT.length, floors: A.LT.filter(n => !n.par).length, lines: A.lines.length, groups: A.groups.map(g => g.name), first: A.LOCS[0].name, qty: A.lines.map(l => Math.round(A.totalQty(l) * 10) / 10), prod: A.lines.map(l => l.prod), agreed: A.lines.map(l => l.agreed) }; });
  ok(r.locs === 30 && r.floors === 6 && r.lt === 36, 'sijaintipuu 6 kerrosta × 5 asuntoa: ' + JSON.stringify([r.locs, r.floors, r.lt]));
  ok(r.lines === 13, 'suoritteita 13: ' + r.lines);
  ok(r.groups.join() === 'Väliseinät,Pinnat,Varustelu,LVIS', 'rakenneryhmät: ' + r.groups.join());
  ok(r.prod[0] === 12 && r.agreed[0] === 2 && r.prod[1] === 25, 'tuottavuus ja työryhmä sarakkeista: ' + r.prod.slice(0, 3) + ' / ' + r.agreed.slice(0, 3));
  ok(Math.abs(r.qty[0] - 6 * (.8 * 36.5 + .8 * 52 * 2 + .8 * 71 + .8 * 36.5)) < 8, 'runko-m² summa: ' + r.qty[0]);
  ok(r.first === 'Kerros 1 › Asunto 1', 'nimi ' + r.first);
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
