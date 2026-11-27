// MS Project XML -tuonti: hierarkia, päivämäärät, edeltäjät (viive) -> riippuvuudet; sarakekartoitus muistetaan
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const T = (u, n, lvl, wbs, s, f, dur, pred, sum) => '<Task><UID>' + u + '</UID><ID>' + u + '</ID><Name>' + n + '</Name><OutlineLevel>' + lvl + '</OutlineLevel><WBS>' + wbs + '</WBS><Summary>' + (sum ? 1 : 0) + '</Summary><Start>' + s + 'T08:00:00</Start><Finish>' + f + 'T17:00:00</Finish><Duration>' + dur + '</Duration>' + (pred || []).map(q => '<PredecessorLink><PredecessorUID>' + q[0] + '</PredecessorUID><Type>' + q[1] + '</Type><LinkLag>' + q[2] + '</LinkLag></PredecessorLink>').join('') + '</Task>';
  const xml = '<?xml version="1.0"?><Project xmlns="http://schemas.microsoft.com/project"><MinutesPerDay>480</MinutesPerDay><Tasks>' + T(0, 'Projekti', 0, '0', '2027-02-01', '2027-02-26', 'PT160H0M0S', null, true) +
    T(1, 'Sisävaihe', 1, '1', '2027-02-01', '2027-02-12', 'PT80H0M0S', null, true) + T(2, 'Muuraus', 2, '1.1', '2027-02-01', '2027-02-05', 'PT40H0M0S') + T(3, 'Plaano', 2, '1.2', '2027-02-08', '2027-02-12', 'PT40H0M0S', [[2, 1, 4800]]) + T(4, 'Maalaus', 1, '2', '2027-02-15', '2027-02-19', 'PT40H0M0S', [[3, 3, 0]]) + '</Tasks></Project>';
  await p.click('#schBtn'); await p.waitForTimeout(200);
  await p.setInputFiles('#schFile', { name: 'planner.xml', mimeType: 'text/xml', buffer: Buffer.from(xml) }); await p.waitForTimeout(500);
  const roles = await p.evaluate(() => [...document.querySelectorAll('#schBody select[data-sr]')].map(s => s.value));
  ok(roles.includes('lvl') && roles.includes('pred') && roles.includes('rid') && roles.includes('name'), 'roolit tunnistettu: ' + roles.join());
  const n0 = await p.evaluate(() => __aik().lines.length), d0 = await p.evaluate(() => __aik().deps.length);
  await p.click('#schGo'); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const A = __aik(); return { n: A.lines.length, groups: A.groups.map(g => g.name), names: A.lines.slice(-3).map(l => A.trade(l.trade).name), deps: A.deps.slice(-2).map(d => [d.a.l, d.b.l, d.lag || 0]), ids: A.lines.slice(-3).map(l => l.id) }; });
  ok(r.n === n0 + 3, 'kolme tehtävää tuotu: ' + r.n + ' vs ' + n0);
  ok(r.groups.includes('Sisävaihe'), 'ylätehtävä Sisävaihe: ' + r.groups.join());
  ok(r.deps.length === 2 && r.deps[0][2] === 1 && r.deps[0][0] === r.ids[0] && r.deps[0][1] === r.ids[1], 'riippuvuus Muuraus→Plaano viive 1 pv (4800/10/480): ' + JSON.stringify(r.deps));
  ok(r.deps[1][0] === r.ids[1] && r.deps[1][1] === r.ids[2], 'riippuvuus Plaano→Maalaus');
  ok(await p.evaluate(d => __aik().deps.length === d + 2, d0), 'kaksi riippuvuutta lisätty');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
