// monivalinta: Shift+vedä maalaa rivit; oikean klikkauksen valikko valituille (sisennä, luo ylätehtävä, poista)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#projBtn'); await p.waitForTimeout(200); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(600);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(300); await p.click('#vGantt'); await p.waitForTimeout(500);
  const typ = async (s, key) => { await p.keyboard.type(s); await p.keyboard.press(key); await p.waitForTimeout(250); };
  for (const n of ['A', 'B', 'C', 'D', 'E']) await typ(n, 'Enter'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const rows = () => p.evaluate(() => __aik().gRows.filter(r => !r.entry).map(r => r.label + ':' + (r.lvl || 0)).join());
  const box = async lab => p.evaluate(l => { const i = __aik().gRows.findIndex(r => r.label === l); const e = [...document.querySelectorAll('#gantt [data-gr="gorder"][data-gi="' + i + '"]')][0]; const b = e.getBoundingClientRect(); return { x: b.left + 40, y: b.top + b.height / 2 }; }, lab);
  // Shift + vedä B:stä D:hen
  const bB = await box('B'), bD = await box('D');
  await p.keyboard.down('Shift'); await p.mouse.move(bB.x, bB.y); await p.mouse.down(); await p.mouse.move(bB.x, (bB.y + bD.y) / 2, { steps: 4 }); await p.mouse.move(bD.x, bD.y, { steps: 4 }); await p.mouse.up(); await p.keyboard.up('Shift'); await p.waitForTimeout(250);
  const n1 = await p.evaluate(() => { try { return 0; } catch (e) { return -1; } });
  // oikea klikkaus valitulla rivillä C -> monivalintavalikko
  const bC = await box('C'); await p.mouse.click(bC.x, bC.y, { button: 'right' }); await p.waitForTimeout(300);
  const items = await p.evaluate(() => [...document.querySelectorAll('#ctxMenu [data-cx]')].map(x => x.dataset.cx).join());
  ok(items === 'mi,mo,mg,md', 'monivalintavalikko: ' + items + ' ' + await p.evaluate(() => document.querySelector('#ctxMenu .ctx-h') && document.querySelector('#ctxMenu .ctx-h').textContent));
  ok(/3 riviä/.test(await p.evaluate(() => (document.querySelector('#ctxMenu .ctx-h') || {}).textContent || '')), 'maalaus valitsi 3 riviä');
  await p.click('[data-cx=mg]'); await p.waitForTimeout(400); await p.keyboard.type('Ryhmä'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  let r = await rows(); ok(r === 'A:0,Ryhmä:0,B:1,C:1,D:1,E:0', 'ylätehtävä valituista: ' + r);
  for (let q = 0; q < 6 && (await rows()) !== 'A:0,B:0,C:0,D:0,E:0'; q++) { await p.keyboard.press('Control+z'); await p.waitForTimeout(250); }
  r = await rows(); ok(r === 'A:0,B:0,C:0,D:0,E:0', 'kumoa palauttaa alkutilan: ' + r);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
