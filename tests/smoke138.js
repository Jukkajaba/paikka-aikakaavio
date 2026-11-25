// Enter/Tab valitulla rivillä toimivat, vaikka fokus oli vielä Gantt-välilehden painikkeessa; uusi rivi syntyy olemassa olevien väliin
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(300);
  const typ = async (s, key) => { await p.keyboard.type(s); await p.keyboard.press(key); await p.waitForTimeout(250); };
  await p.click('#vGantt'); await p.waitForTimeout(500);
  await typ('Kevyet väliseinät', 'Enter'); await typ('Pinnat', 'Enter'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const rows = () => p.evaluate(() => __aik().gRows.filter(r => !r.entry).map(r => r.label + ':' + (r.lvl || 0)).join());
  // fokus takaisin painikkeeseen (kuten kun käyttäjä on juuri klikannut painiketta), sitten rivin valinta ja Enter
  await p.focus('#vGantt'); const gi = await p.evaluate(() => __aik().gRows.findIndex(r => r.label === 'Kevyet väliseinät'));
  await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200);
  await p.keyboard.press('Enter'); await p.waitForTimeout(300); await p.keyboard.type('Rungot'); await p.keyboard.press('Tab'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.waitForTimeout(300); await p.keyboard.type('Levytys'); await p.keyboard.press('Enter'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const r = await rows(); ok(r.indexOf('Kevyet väliseinät:0') === 0 && /Rungot:1/.test(r) && /Levytys:1/.test(r) && /Pinnat:0$/.test(r), 'uudet rivit väliin ja sisennetty: ' + r);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
