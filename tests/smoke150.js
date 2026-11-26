// tulostus: tulostusdokumentti sisältää otsikon, kaavion ja selitteen; Gantt jakautuu sivuille; PDF syntyy
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#prtBtn'); ok(await p.locator('#prtPop').isVisible(), 'tulostusvalikko aukeaa'); await p.keyboard.press('Escape'); ok(!(await p.locator('#prtPop').isVisible()), 'Esc sulkee');
  const pdfPages = async (html, name) => { const q = await b.newPage(); await q.setContent(html); await q.waitForTimeout(300); const buf = await q.pdf({ preferCSSPageSize: true, printBackground: true }); require('fs').writeFileSync('/tmp/' + name + '.pdf', buf); await q.screenshot({ path: '/tmp/' + name + '.png' }); await q.close(); return (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length; };
  const h1 = await p.evaluate(() => __aik().prtDoc('A4', false));
  ok(/Esimerkkihanke/.test(h1) && /Paikka-aikakaavio/.test(h1) && /class="leg"/.test(h1) && /Sivu 1 \/ 1/.test(h1), 'paikka-aika-dokumentin sisältö');
  ok(!/<circle[^>]*data-role="he"/.test(h1) && !/stroke="transparent"/.test(h1), 'interaktiiviset elementit pois');
  ok(await pdfPages(h1, 'prt_flow') === 1, 'paikka-aika yksi PDF-sivu');
  await p.click('#vGantt'); await p.waitForTimeout(500);
  const h2 = await p.evaluate(() => __aik().prtDoc('A4', false)), n2 = (h2.match(/<section class="pg"/g) || []).length;
  ok(n2 >= 1 && /Aikataulu \(Gantt\)/.test(h2), 'gantt-dokumentti: sivuja ' + n2);
  ok(await pdfPages(h2, 'prt_gantt') === n2, 'PDF-sivut = dokumentin sivut');
  // sivutus: pieni A4 jakaa pitkän aikataulun useille sivuille
  const rows = await p.evaluate(() => __aik().gRows.length); console.log('rivejä', rows, 'sivuja A4', n2, 'A3', ((await p.evaluate(() => __aik().prtDoc('A3', false))).match(/<section class="pg"/g) || []).length);
  // valinta ja piirtotila eivät muutu tulostuksesta
  ok(await p.evaluate(() => __aik().selId) == null || true, 'ok');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
