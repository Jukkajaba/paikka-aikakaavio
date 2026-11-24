// Enter lisää tehtävän alle, ↑↓ siirtää, tyhjä Enter/Esc lopettaa; valitun rivin Enter ja + avaavat nimikentän
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(300); await p.click('#vGantt'); await p.waitForTimeout(500);
  const typ = async (s, key) => { await p.keyboard.type(s); await p.keyboard.press(key); await p.waitForTimeout(250); };
  const names = () => p.evaluate(() => __aik().gRows.filter(r => !r.entry).map(r => r.label).join());
  await typ('Kaivuu', 'Enter'); await typ('Täytöt', 'Enter'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  ok(await names() === 'Kaivuu,Täytöt', 'perusjono: ' + await names());
  // Enter olemassa olevalla rivillä lisää alle
  const gi = await p.evaluate(() => __aik().gRows.findIndex(r => r.label === 'Kaivuu'));
  await p.locator('#gantt [data-gi="' + gi + '"]').first().click({ position: { x: 60, y: 10 }, force: true }); await p.waitForTimeout(200);
  await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  ok(await p.locator('body > input.gedit').count() === 1, 'valitun rivin Enter avasi nimikentän');
  await typ('Perustukset', 'Enter'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); // tyhjä Enter lopettaa ja poistaa tyhjän rivin
  ok(await names() === 'Kaivuu,Perustukset,Täytöt', 'Perustukset Kaivuun alle, tyhjä rivi poistui: ' + await names());
  ok(await p.locator('body > input.gedit').count() === 0, 'nimikenttä sulkeutui');
  // ↑↓
  await p.mouse.dblclick(await p.evaluate(() => { const r = document.querySelector('#gantt rect[data-gi="0"]').getBoundingClientRect(); return r.left + 60; }), await p.evaluate(() => { const r = document.querySelector('#gantt rect[data-gi="0"]').getBoundingClientRect(); return r.top + 10; })).catch(() => {});
  await p.waitForTimeout(300);
  if (await p.locator('body > input.gedit').count()) { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(250); ok(await p.evaluate(() => document.querySelector('body > input.gedit').value) === 'Perustukset', 'nuoli alas siirsi seuraavalle riville'); await p.keyboard.press('Escape'); }
  // + -painike avaa nimikentän
  await p.click('#gAddTask'); await p.waitForTimeout(300); ok(await p.locator('body > input.gedit').count() === 1, '+ avasi nimikentän'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  ok(await names() === 'Kaivuu,Perustukset,Täytöt', 'Esc poisti tyhjän rivin: ' + await names());
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
