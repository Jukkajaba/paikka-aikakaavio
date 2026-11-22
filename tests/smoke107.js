// Resurssit-paneeli: resurssityypit, pääresurssi, lisäresurssi, kuvaaja, saatavuushuomio
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 950 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.locator('#chart [data-role="body"]').first().click({ force: true }); await p.waitForTimeout(250);
  await p.click('#resBtn'); await p.waitForTimeout(250);
  ok(await p.locator('#resCard').isVisible(), 'panel open');
  await p.fill('#rp-new', 'Kaivinkone'); await p.click('[data-ract="add"]'); await p.waitForTimeout(250);
  ok(await p.locator('[data-ract="show"]').count() === 1, 'graph selector with 2 resources');
  // valittu työlaji (Runko) -> pääresurssi Kaivinkone
  const rid = await p.evaluate(() => document.querySelector('[data-ract="show"]').value);
  const sel = p.locator('.task[style*="outline"] select[data-tm]'); ok(await sel.count() === 1, 'selected trade highlighted');
  await sel.selectOption(rid); await p.waitForTimeout(250);
  ok(await p.locator('#chart text:has-text("kpl")').count() >= 1, 'graph shows kpl');
  // lisäresurssi: Työntekijät 2 / kone
  await p.locator('.task[style*="outline"] select[data-xadd]').selectOption({ label: 'Työntekijät' }); await p.waitForTimeout(250);
  const xn = p.locator('.task[style*="outline"] input[data-xn]'); ok(await xn.count() === 1, 'extra row'); await xn.fill('2'); await xn.dispatchEvent('change'); await p.waitForTimeout(250);
  const peakOf = async v => { await p.selectOption('[data-ract="show"]', v); await p.waitForTimeout(250); return p.evaluate(() => { const t = [...document.querySelectorAll('#chart text')].find(x => /^huippu /.test(x.textContent)); return t ? parseFloat(t.textContent.replace('huippu ', '')) : 0; }); };
  const hloId = await p.evaluate(() => [...document.querySelectorAll('[data-ract="show"] option')].find(o => o.textContent === 'Työntekijät').value);
  const kone = await peakOf(rid), hlo = await peakOf(hloId);
  ok(kone >= 1 && hlo >= 2 * kone, 'extra resource doubles persons: kone ' + kone + ' hlö ' + hlo);
  // saatavuus
  const av = p.locator('input[data-rf="avail"]').nth(1); await av.fill('1'); await av.dispatchEvent('change'); await p.waitForTimeout(250);
  await p.click('[data-ptog=notes]'); await p.waitForTimeout(250);
  ok(/Kaivinkone: enimmillään/.test(await p.locator('#notes').innerText()), 'availability note');
  // kuvaaja pois/päälle
  const gr = p.locator('[data-ract="graph"]'); const was = await gr.getAttribute('aria-pressed'); await gr.click(); await p.waitForTimeout(250);
  ok((await gr.getAttribute('aria-pressed')) !== was, 'graph toggle');
  // poisto
  await p.click('[data-ract="del"]'); await p.waitForTimeout(250); ok(await p.locator('[data-ract="show"]').count() === 0, 'resource deleted');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
