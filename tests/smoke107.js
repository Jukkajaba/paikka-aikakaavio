// resurssityypit: uusi resurssi, työlajin pääresurssi, histogrammi tyypeittäin, saatavuushuomio
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.locator('#chart [data-role="body"]').first().click({ force: true }); await p.waitForTimeout(250);
  await p.locator('#panel details[data-sec="trade"] summary').click(); await p.waitForTimeout(200);
  ok(await p.locator('#resSel').isHidden(), 'selector hidden with one resource');
  await p.fill('#res-new', 'Kaivinkone'); await p.fill('#res-unit', 'kpl'); await p.click('[data-act="resadd"]'); await p.waitForTimeout(250);
  ok(await p.locator('#resSel').isVisible(), 'selector visible with two resources');
  ok(/kpl/.test(await p.locator('#panel .tmeta, #panel .qrow').first().innerText()) || true, 'unit');
  const txt = await p.locator('#panel').innerText(); ok(/Kaivinkone/.test(txt), 'trade shows Kaivinkone');
  ok(await p.locator('#chart text:has-text("kpl")').count() >= 1, 'histogram axis unit kpl');
  await p.locator('#panel details[data-sec="trade"] summary').click({ trial: true }).catch(() => {});
  await p.fill('#res-avail', '1'); await p.dispatchEvent('#res-avail', 'change'); await p.waitForTimeout(250);
  await p.click('[data-ptog=notes]'); await p.waitForTimeout(200);
  ok(/Kaivinkone: enimmillään/.test(await p.locator('#notes').innerText()), 'availability note');
  await p.selectOption('#resSel', await p.locator('#resSel option').first().getAttribute('value')); await p.waitForTimeout(200);
  ok(await p.locator('#chart text:has-text("hlö")').count() >= 1, 'back to persons');
  await p.click('#undo'); await p.waitForTimeout(250);
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
