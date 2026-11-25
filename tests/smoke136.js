// useampi ylätehtävätaso: sisennys ryhmille ja tehtäville, syvyysraja, ulosnosto, poisto, sulkeminen
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(300); await p.click('#vGantt'); await p.waitForTimeout(500);
  const typ = async (s, key) => { await p.keyboard.type(s); await p.keyboard.press(key); await p.waitForTimeout(250); };
  const st = () => p.evaluate(() => { const A = __aik(), gn = id => (A.groups.find(g => g.id === id) || {}).name; return { groups: A.groups.map(g => g.name + (g.parent ? '<' + gn(g.parent) : '')), lines: A.lines.map(l => A.trade(l.trade).name + (l.grp ? '@' + gn(l.grp) : '')), rows: A.gRows.filter(r => !r.entry).map(r => r.label + ':' + (r.lvl || 0)) }; });
  const sel = async lab => { const gi = await p.evaluate(l => __aik().gRows.findIndex(r => r.label === l), lab); await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200); };
  // Sisävaihe > Väliseinät > Runko, Levytys
  await typ('Sisävaihe', 'Enter'); await typ('Väliseinät', 'Tab'); await typ('Runko', 'Enter');
  let s = await st(); ok(s.lines.join() === 'Väliseinät@Sisävaihe,Runko@Sisävaihe', 'ennen toista tasoa: ' + s.lines.join());
  await p.keyboard.type('Runko2'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  await sel('Runko'); await p.keyboard.press('Tab'); await p.waitForTimeout(300); s = await st();
  ok(s.groups.join() === 'Sisävaihe,Väliseinät<Sisävaihe', 'kaksi tasoa: ' + s.groups.join()); ok(s.lines.some(x => x === 'Runko@Väliseinät'), 'Runko Väliseinien alla: ' + s.lines.join());
  ok(s.rows.join() === 'Sisävaihe:0,Väliseinät:1,Runko:2,Runko2:1' || /Runko:2/.test(s.rows.join()), 'sisennystasot: ' + s.rows.join());
  // uusi tehtävä Runko-rivin alle menee samaan ryhmään
  await sel('Runko'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); await p.keyboard.type('Levytys'); await p.keyboard.press('Enter'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(250); s = await st();
  ok(s.lines.some(x => x === 'Levytys@Väliseinät'), 'Levytys Väliseinien alla: ' + s.lines.join());
  // sulje ylin ryhmä: alarivit piiloon
  // Shift+Tab Levytys: nousee Sisävaiheen tasolle
  await sel('Levytys'); await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(300); s = await st(); ok(s.lines.some(x => x === 'Levytys@Sisävaihe'), 'Levytys nousi: ' + s.lines.join());
  // ryhmän Shift+Tab ja Tab
  await sel('Väliseinät'); await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(300); s = await st(); ok(s.groups.join() === 'Sisävaihe,Väliseinät', 'Väliseinät ylätasolle: ' + s.groups.join());
  await sel('Väliseinät'); await p.keyboard.press('Tab'); await p.waitForTimeout(300); s = await st(); ok(s.groups.join() === 'Sisävaihe,Väliseinät<Sisävaihe', 'Väliseinät takaisin sisään: ' + s.groups.join());
  // ylätehtävän poisto: sisältö siirtyy yläryhmään
  await sel('Väliseinät'); await p.keyboard.press('Delete'); await p.waitForTimeout(300); s = await st();
  ok(s.groups.join() === 'Sisävaihe' && s.lines.every(x => /@Sisävaihe$/.test(x)), 'poiston jälkeen: ' + s.groups.join() + ' | ' + s.lines.join());
  // kumoa
  await p.keyboard.press('Control+z'); await p.waitForTimeout(300); s = await st(); ok(s.groups.join() === 'Sisävaihe,Väliseinät<Sisävaihe', 'kumoa palautti alaryhmän: ' + s.groups.join());
  // syvyysraja
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(600);
  await typ('A', 'Enter'); await typ('B', 'Tab'); await typ('C', 'Tab'); await typ('D', 'Tab'); await typ('E', 'Tab'); await typ('F', 'Tab'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  s = await st(); ok(s.groups.length <= 4, 'ryhmiä enintään 4: ' + s.groups.join());
  ok(await p.evaluate(() => { const A = __aik(); const d = g => { let n = 0, q = g; while (q) { n++; q = q.parent && A.groups.find(x => x.id === q.parent); } return n; }; return A.groups.every(g => d(g) <= 4); }), 'syvyys ≤ 4');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
