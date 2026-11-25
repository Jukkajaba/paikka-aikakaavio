// pieni + = alatehtävä: valitun tehtävän alle sisennettynä, ylätehtävän sisään; oikean klikkauksen valikossa tehtävien luonti
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(300); await p.click('#vGantt'); await p.waitForTimeout(500);
  const typ = async (s, key) => { await p.keyboard.type(s); await p.keyboard.press(key); await p.waitForTimeout(250); };
  await typ('Maanrakennus', 'Enter'); await typ('Pinnat', 'Enter'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const rows = () => p.evaluate(() => __aik().gRows.filter(r => !r.entry).map(r => r.label + ':' + (r.lvl || 0)).join());
  const sel = async lab => { const gi = await p.evaluate(l => __aik().gRows.findIndex(r => r.label === l), lab); await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200); };
  ok(await p.isVisible('#gAddSub') && !(await p.isVisible('#gAddGrp')), 'vain kaksi + -painiketta näkyy');
  await sel('Maanrakennus'); await p.click('#gAddSub'); await p.waitForTimeout(300); await p.keyboard.type('Raivaus'); await p.keyboard.press('Enter'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  let r = await rows(); ok(r === 'Maanrakennus:0,Raivaus:1,Pinnat:0', 'alatehtävä: ' + r);
  // valittu ylätehtävä + pieni +: uusi tehtävä ryhmän sisään
  await sel('Maanrakennus'); await p.click('#gAddSub'); await p.waitForTimeout(300); await p.keyboard.type('Kaivuu'); await p.keyboard.press('Enter'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  r = await rows(); ok(/^Maanrakennus:0,Raivaus:1,Kaivuu:1,Pinnat:0$/.test(r), 'ryhmän sisään: ' + r);
  // valittu alatehtävä + pieni +: sen alle tulee alatehtävä (toinen taso)
  await sel('Raivaus'); await p.click('#gAddSub'); await p.waitForTimeout(300); await p.keyboard.type('Puut'); await p.keyboard.press('Enter'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  r = await rows(); ok(/Raivaus:1,Puut:2,Kaivuu:1/.test(r), 'toinen taso: ' + r);
  // oikean klikkauksen valikko
  const gi = await p.evaluate(() => __aik().gRows.findIndex(x => x.label === 'Pinnat'));
  await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true, button: 'right' }); await p.waitForTimeout(300);
  const items = await p.evaluate(() => [...document.querySelectorAll('[data-cx]')].map(x => x.dataset.cx).join());
  ok(/taskadd/.test(items) && /tasksub/.test(items) && /grpnew/.test(items), 'valikon kohdat: ' + items);
  await p.hover('.ctx-sub > button'); await p.click('[data-cx=taskadd]'); await p.waitForTimeout(300); await p.keyboard.type('Uusi'); await p.keyboard.press('Enter'); await p.waitForTimeout(250); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  r = await rows(); ok(/Pinnat:0,Uusi:0$/.test(r), 'valikosta uusi tehtävä: ' + r);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
