// ylätehtävän poisto: Delete-näppäin ja oikean klikkauksen valikko; tehtävät säilyvät
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(400);
  const ng = () => p.evaluate(() => __aik().groups.length), nl = () => p.evaluate(() => __aik().lines.length);
  const n0 = await nl();
  await p.evaluate(() => document.getElementById('gAddGrp').click()); await p.waitForTimeout(300); ok(await ng() === 1, 'ryhmä luotu');
  await p.keyboard.press('Delete'); await p.waitForTimeout(300); ok(await ng() === 0, 'Delete poisti ylätehtävän');
  await p.evaluate(() => document.getElementById('gAddGrp').click()); await p.waitForTimeout(300);
  await p.evaluate(() => { const A = __aik(); A.lines[0].grp = A.groups[0].id; window.dispatchEvent(new Event('resize')); }); await p.waitForTimeout(300);
  const gi = await p.evaluate(() => __aik().gRows.findIndex(r => r.gk));
  const pos = await p.evaluate(gi => { const r = document.querySelector('#gantt rect[data-gi="' + gi + '"]').getBoundingClientRect(); return { x: r.left + 60, y: r.top + r.height / 2 }; }, gi);
  await p.mouse.click(pos.x, pos.y, { button: 'right' }); await p.waitForTimeout(250);
  ok(await p.locator('button[data-cx="grpdel"]').count() === 1, 'valikossa poisto'); await p.locator('button[data-cx="grpdel"]').click(); await p.waitForTimeout(300);
  ok(await ng() === 0, 'valikko poisti ylätehtävän'); ok(await nl() === n0, 'tehtävät säilyivät (' + n0 + ' → ' + await nl() + ')');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
