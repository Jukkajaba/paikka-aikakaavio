// tahti: uuden tehtävän piirto vetämällä tyhjään kohtaan
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  await p.click('#vTakt'); await p.waitForTimeout(300);
  const n0 = await p.evaluate(() => __aik().lines.length), nB = await p.locator('#taktR .tkb').count();
  const r = await p.locator('#taktR').boundingBox();
  // tyhjä kohta: viimeisen rivin alue kaukana oikealla (aikajanan loppupää)
  const x0 = r.x + 1000, y0 = r.y + 34 + 44 * 0.5 + 44 * 3;
  await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move(x0 + 40, y0 + 20); await p.mouse.move(x0 + 100, y0 + 44 * 2);
  await p.waitForTimeout(120); ok(await p.locator('#taktR rect[stroke-dasharray="6 4"]').count() >= 2, 'esikatselu näkyy vedon aikana');
  await p.mouse.up(); await p.waitForTimeout(250);
  const n1 = await p.evaluate(() => __aik().lines.length); ok(n1 === n0 + 1, 'uusi tehtävä luotu ' + n0 + '→' + n1);
  const info = await p.evaluate(() => { const a = __aik(), l = a.lines[a.lines.length - 1]; return { k: a.tasks(l).length, from: l.from, to: l.to }; });
  ok(info.k >= 3, 'tehtävä kattaa useita sijainteja: ' + JSON.stringify(info));
  ok(await p.locator('#taktR .tkb').count() > nB, 'laatikot näkyvät');
  ok(await p.locator('#taktR rect[stroke-dasharray="6 4"]').count() === 0, 'esikatselu poistunut');
  // pelkkä klikkaus tyhjään ei luo mitään
  await p.mouse.click(r.x + 1100, r.y + 34 + 44 * 0.5 + 44 * 5); await p.waitForTimeout(150);
  ok((await p.evaluate(() => __aik().lines.length)) === n1, 'klikkaus ei luo tehtävää');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
