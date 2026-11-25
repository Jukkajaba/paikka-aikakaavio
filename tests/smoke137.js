// sisäkkäiset ylätehtävät paikka-aikakaaviossa: suljettu yläryhmä kokoaa kaikki alla olevat; riippuvuudet alaryhmiin; syklit ja sisäkkäiset viitteet estetty
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.evaluate(() => { const A = __aik(); A.groups.push({ id: 'KT1', name: 'Ylä', ord: 10 }); A.groups.push({ id: 'KT2', name: 'Ala', ord: 10, parent: 'KT1' });
    A.lines[1].grp = 'KT1'; A.lines[2].grp = 'KT2'; A.lines[3].grp = 'KT2'; A.deps.push({ id: 991, a: { l: A.lines[0].id, loc: null }, b: { g: 'KT2' }, rigid: false }); window.dispatchEvent(new Event('resize')); });
  await p.waitForTimeout(400);
  const open0 = await p.evaluate(() => document.querySelectorAll('#chart [data-role="gbody"]').length);
  await p.evaluate(() => document.getElementById('grpBtn').click()); await p.waitForTimeout(400);
  const cl = await p.evaluate(() => { const o = []; document.querySelectorAll('#chart [data-role="gbody"]').forEach(e => o.push(e.dataset.grp)); return o; });
  ok(open0 === 0, 'auki: ei yhteenvetoviivoja ' + open0);
  ok(cl.length >= 1 && cl.every(x => x === 'KT1'), 'suljettuna vain uloin ryhmä piirtyy: ' + cl.join());
  const title = await p.evaluate(() => (document.querySelector('#chart [data-role="gbody"] title') || {}).textContent || '');
  ok(/3 tehtävää/.test(title), 'ylin ryhmä kokoaa kaikki alla olevat: ' + title);
  const dn = await p.evaluate(() => document.querySelectorAll('#chart [data-role="depend"]').length); ok(dn >= 1, 'riippuvuus piirtyy suljettuun ryhmään (' + dn + ')');
  // vain alaryhmä suljettuna
  await p.evaluate(() => { document.getElementById('grpBtn').click(); }); await p.waitForTimeout(300);
  const cl2 = await p.evaluate(() => { const o = []; document.querySelectorAll('#chart [data-role="gbody"]').forEach(e => o.push(e.dataset.grp)); return o; }); ok(cl2.length === 0, 'kaikki auki: ' + cl2.join());
  // sisäkkäinen viite ja sykli estetty
  ok(await p.evaluate(() => __aik().deps.some(d => d.id === 991)), 'riippuvuus säilyi');
  await p.click('#vGantt'); await p.waitForTimeout(400);
  const rows = await p.evaluate(() => __aik().gRows.map(r => r.label + ':' + (r.lvl || 0)).join());
  ok(/Ylä:0/.test(rows), 'Gantt avautuu: ' + rows);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
