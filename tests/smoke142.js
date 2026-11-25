// usean rivin valinta Ganttissa: Shift-väli, Ctrl-lisäys, Tab/Shift+Tab ja Delete usealle riville, yksi kumoaminen
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(300); await p.click('#vGantt'); await p.waitForTimeout(500);
  const typ = async (s, key) => { await p.keyboard.type(s); await p.keyboard.press(key); await p.waitForTimeout(250); };
  await typ('A', 'Enter'); await typ('B', 'Enter'); await typ('C', 'Enter'); await typ('D', 'Enter'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const rows = () => p.evaluate(() => __aik().gRows.filter(r => !r.entry).map(r => r.label + ':' + (r.lvl || 0)).join());
  const click = async (lab, mods) => { const gi = await p.evaluate(l => __aik().gRows.findIndex(r => r.label === l), lab); await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true, modifiers: mods || [] }); await p.waitForTimeout(200); };
  ok((await rows()) === 'A:0,B:0,C:0,D:0', 'alku: ' + await rows());
  await click('A'); await click('C', ['Shift']);
  await p.keyboard.press('Tab'); await p.waitForTimeout(300);
  let r = await rows(); ok(r === 'A:0,B:1,C:1,D:0', 'Tab usealle riville: ' + r);
  await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(300); r = await rows(); ok(r === 'A:0,B:0,C:0,D:0', 'Shift+Tab: järjestys säilyy: ' + r);
  // Ctrl-klikkaus: A ja C, Delete, yksi kumoaminen
  await click('A'); await click('C', ['Control']); await p.keyboard.press('Delete'); await p.waitForTimeout(300); r = await rows(); ok(r === 'B:0,D:0', 'Delete usealle: ' + r);
  await p.keyboard.press('Control+z'); await p.waitForTimeout(300); r = await rows(); ok(r === 'A:0,B:0,C:0,D:0', 'yksi kumoaminen palauttaa kaikki: ' + r);
  // tavallinen klikkaus purkaa monivalinnan: Delete poistaa vain yhden
  await click('A'); await click('B', ['Shift']); await click('D'); await p.keyboard.press('Delete'); await p.waitForTimeout(300); r = await rows(); ok(r === 'A:0,B:0,C:0', 'klikkaus purki monivalinnan: ' + r);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
