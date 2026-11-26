// toteumahistoria: jokainen valmiusasteen muutos tallentaa pisteen (tilannepäivä), toteumaviiva piirretään pisteiden kautta
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; window.__resOpen = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const hist = () => p.evaluate(() => { const l = __aik().lines[0], r = []; Object.keys(l.ov || {}).forEach(k => { if (l.ov[k].hist) r.push(k + ':' + JSON.stringify(l.ov[k].hist)); }); return r.join(' '); });
  const act = () => p.evaluate(() => [...document.querySelectorAll('#chart path[stroke-width="3"]')].map(e => (e.getAttribute('d') || '').split('L').length - 1).join());
  const bd = p.locator('#chart path[data-role="body"]').first(), bb = await bd.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(200);
  await p.click('[data-ptog=st]'); await p.waitForTimeout(200);
  await p.fill('#st-day', '2027-01-15'); await p.dispatchEvent('#st-day', 'change'); await p.waitForTimeout(200);
  const pc = () => p.locator('#stCard [data-field="apct"]').nth(0);
  await pc().fill('50'); await pc().dispatchEvent('change'); await p.waitForTimeout(200);
  ok(/"?l\d:\[\[\d+,50\]\]/.test(await hist()), 'piste 1: ' + await hist());
  await p.fill('#st-day', '2027-01-25'); await p.dispatchEvent('#st-day', 'change'); await p.waitForTimeout(200);
  await pc().fill('80'); await pc().dispatchEvent('change'); await p.waitForTimeout(200);
  const h2 = await hist(); ok((h2.match(/\],\[/g) || []).length === 1, 'kaksi pistettä: ' + h2);
  ok(+(await act()).split(',')[0] >= 2, 'toteumaviiva kulkee pisteiden kautta (L-osia ≥2): ' + await act());
  // pisteen muokkaus ja poisto
  await p.locator('#stCard [data-field="ahp"]').nth(0).fill('40'); await p.locator('#stCard [data-field="ahp"]').nth(0).dispatchEvent('change'); await p.waitForTimeout(200);
  ok(/\[\d+,40\]/.test(await hist()), 'pisteen % muokattu: ' + await hist());
  await p.locator('#stCard [data-act="ahdel"]').nth(1).click(); await p.waitForTimeout(200);
  const h3 = await hist(); ok((h3.match(/\],\[/g) || []).length === 0 && /40/.test(h3), 'piste poistettu: ' + h3);
  const pct = await p.evaluate(() => { const l = __aik().lines[0], k = Object.keys(l.ov).find(k => l.ov[k].hist); return l.ov[k].pct; }); ok(pct === 40, 'pct seuraa viimeistä pistettä: ' + pct);
  await p.locator('#stCard [data-act="aclear"]').first().click(); await p.waitForTimeout(200);
  ok((await hist()) === '', 'tyhjennys poistaa historian');
  // tilannepäivä tänään -> päivittyy automaattisesti
  await p.click('[data-st="today"]'); await p.waitForTimeout(200);
  ok(await p.locator('#st-auto').isChecked(), 'automaattinen päivitys päällä Tänään-napista');
  await p.fill('#st-day', '2027-02-01'); await p.dispatchEvent('#st-day', 'change'); await p.waitForTimeout(200);
  ok(!(await p.locator('#st-auto').isChecked()), 'käsin asetettu päivä poistaa automatiikan');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
