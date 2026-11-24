// hierarkiasisennys: Tab/Shift+Tab Gantin nimikentässä ja valitulla rivillä
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(300); await p.click('#vGantt'); await p.waitForTimeout(500);
  const typ = async (s, key) => { await p.keyboard.type(s); await p.keyboard.press(key); await p.waitForTimeout(250); };
  await typ('Maanrakennus', 'Enter'); await typ('Raivaus', 'Tab'); await typ('Kaivuu', 'Enter'); await typ('Perustukset', 'Enter'); await typ('Täytöt', 'Enter'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const st = () => p.evaluate(() => { const A = __aik(); return { groups: A.groups.map(g => g.name), lines: A.lines.map(l => A.trade(l.trade).name + (l.grp ? '@' + A.groups.find(g => g.id === l.grp).name : '')) }; });
  let s = await st(); ok(s.groups.join() === 'Maanrakennus', 'yksi ylätehtävä: ' + s.groups.join()); ok(s.lines.join() === 'Raivaus@Maanrakennus,Kaivuu@Maanrakennus,Perustukset@Maanrakennus,Täytöt@Maanrakennus', 'alatehtävät: ' + s.lines.join());
  const rows = await p.evaluate(() => __aik().gRows.filter(r => !r.entry).map(r => r.label)); ok(rows[0] === 'Maanrakennus' && rows.length === 5, 'rivit: ' + rows.join());
  // Shift+Tab valitulla rivillä nostaa ulos
  const gi = await p.evaluate(() => __aik().gRows.findIndex(r => r.label === 'Täytöt'));
  await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200);
  await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(250); s = await st(); ok(/^Täytöt$/.test(s.lines[3]), 'Täytöt nostettu ulos: ' + s.lines.join());
  await p.keyboard.press('Tab'); await p.waitForTimeout(250); s = await st(); ok(s.lines[3] === 'Täytöt@Maanrakennus', 'Täytöt sisennetty takaisin: ' + s.lines.join());
  // sisennys ja heti ulos: ylätehtävä muuttuu takaisin tavalliseksi tehtäväksi
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(600);
  await typ('Ylempi', 'Enter'); await typ('Alempi', 'Tab'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  s = await st(); ok(s.groups.length === 1, 'ryhmä syntyi sisennyksellä');
  const gj = await p.evaluate(() => __aik().gRows.findIndex(r => r.label === 'Alempi'));
  await p.locator('#gantt [data-gi="' + gj + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200);
  await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(250); s = await st();
  ok(s.groups.length === 0 && (await p.evaluate(() => __aik().gRows.filter(r => !r.entry).map(r => r.label).join())) === 'Ylempi,Alempi', 'ylätehtävä palasi tavalliseksi tehtäväksi: ' + s.groups.join() + ' | ' + s.lines.join());
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
