// Enter valitulla ryhmän sisäisellä tehtävällä lisää uuden tehtävän sen alle (ei ryhmän loppuun)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(300); await p.click('#vGantt'); await p.waitForTimeout(500);
  const typ = async (s, key) => { await p.keyboard.type(s); await p.keyboard.press(key); await p.waitForTimeout(250); };
  await typ('Vaihe', 'Enter'); await typ('Muuratut', 'Tab'); await typ('Kevyet', 'Enter'); await typ('Lattiat', 'Enter'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const rows = () => p.evaluate(() => __aik().gRows.filter(r => !r.entry).map(r => r.label).join());
  const sel = async lab => { const gi = await p.evaluate(l => __aik().gRows.findIndex(r => r.label === l), lab); await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200); };
  ok((await rows()) === 'Vaihe,Muuratut,Kevyet,Lattiat', 'alku: ' + await rows());
  await sel('Kevyet'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); await p.keyboard.type('Uusi'); await p.keyboard.press('Enter'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  ok((await rows()) === 'Vaihe,Muuratut,Kevyet,Uusi,Lattiat', 'Enter: ' + await rows());
  ok(await p.evaluate(() => { const A = __aik(); const l = A.lines.find(x => A.trade(x.trade).name === 'Uusi'); return !!(l && l.grp); }), 'uusi on ryhmässä');
  await sel('Kevyet'); await p.click('#gAddTask'); await p.waitForTimeout(300); await p.keyboard.type('Plus'); await p.keyboard.press('Enter'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  ok((await rows()) === 'Vaihe,Muuratut,Kevyet,Plus,Uusi,Lattiat', '+: ' + await rows());
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
