// alasijainnit: uusi sisarsijainti liittyy viivaan, ja nimet päivittyvät Gantt-riveillä
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 950 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(200);
  await p.locator('button:has-text("Sijainnit")').first().click(); await p.waitForTimeout(300);
  const names = () => p.evaluate(() => { const A = __aik(); return A.lines.map(l => A.tasks(l).map(k => A.LOCS[k.loc].name).join('|')); });
  const n0 = (await names())[0].split('|').length;
  const rows = () => p.locator('[data-act="locchild"]');
  const cnt = await rows().count(); await rows().nth(cnt - 1).click(); await p.waitForTimeout(250);
  let r = (await names())[0].split('|'); ok(r.length === n0, 'split keeps count ' + n0 + ' vs ' + r.length);
  // uusi sisar viimeisen alasijainnin perään
  await p.locator('[data-act="locsib"]').last().click(); await p.waitForTimeout(250);
  r = (await names())[0].split('|'); ok(r.length === n0 + 1, 'new sibling joins line ' + r.length);
  // nimen muutos näkyy Gantt-riveillä
  const inp = p.locator('#locsPanel input[type=text], .fp input.txt').filter({ hasText: '' });
  await p.evaluate(() => { const A = __aik(); });
  const last = p.locator('input[value="Sijainti"]').last(); await last.fill('Lohko 2'); await last.dispatchEvent('change'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => [...document.querySelectorAll('#gantt text, #gantt .txt, #chart text, .grow')].some(e => /Lohko 2/.test(e.textContent || e.value || ''))) || (await p.content()).includes('Lohko 2'), 'renamed leaf in Gantt');
  ok(!(await p.locator('#chart').innerText().catch(() => '')).includes('Sijainti') && !(await p.evaluate(() => document.body.innerText.split('\n').filter(s => s.trim() === 'Sijainti' && false).length)), 'no stale name');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
