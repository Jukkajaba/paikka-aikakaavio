// viikkonumerot: kaavion viikkonumerot seuraavat projektin alkupäivää (ISO-viikot)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const wk = () => p.evaluate(() => [1, 2, 3, 4, 5, 6, 7].map(n => wkNo(n)).join());
  ok(await wk() === '1,2,3,4,5,6,7', 'demo alkaa vk 1: ' + await wk());
  await p.click('#vGantt'); await p.waitForTimeout(300); await p.click('text=Projektit'); await p.waitForTimeout(300); const cs = p.locator('#pj-cstart'); await cs.fill('2026-11-26'); await cs.dispatchEvent('change'); await p.waitForTimeout(500); await p.click('#vFlow').catch(() => {}); await p.waitForTimeout(300);
  ok(await wk() === '48,49,50,51,52,53,1', 'alku to 26.11.2026 -> 48..: ' + await wk());
  ok((await p.evaluate(() => [...document.querySelectorAll('#chart text.ax')].slice(0, 3).map(t => t.textContent).join())) === '48,49,50', 'kaavion akseli');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
