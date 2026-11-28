// välitavoitteet: luonti paikka-aikakaaviossa (koko / yksi sijainti / usean rivin laajennus), siirto, Delete, kumoa, näkyminen ganttissa ja tahdissa, tallennus
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const ms = () => p.evaluate(() => __aik().stateObj().miles);
  await p.evaluate(() => { const t = document.querySelector('[data-ptog="bl"]'); if (t) t.click(); }); await p.waitForTimeout(300);
  ok(await p.locator('[data-ml="edit"]').count() === 1, 'paneelissa muokkauspainike');
  ok((await ms()).length === 0, 'alussa ei välitavoitteita');
  await p.click('[data-ml="edit"]'); await p.waitForTimeout(200);
  const g = await p.evaluate(() => { const r = document.getElementById('chart').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; });
  // 1) napsautus aika-akselin yläosaan = koko aikataulu
  await p.mouse.click(g.x + 400, g.y + 10); await p.waitForTimeout(250);
  let m = await ms(); ok(m.length === 1 && !m[0].la, 'akselista koko aikataulun viiva ' + JSON.stringify(m));
  ok(await p.locator('line.mile').count() >= 1, 'viiva piirtyy');
  // 2) napsautus sijaintiriville = vain sille
  const G = await p.evaluate(() => ({ TOP: 0 }));
  await p.mouse.click(g.x + 250, g.y + 150); await p.waitForTimeout(250);
  m = await ms(); ok(m.length === 2 && m[1].la && m[1].la === m[1].lb, 'rivistä yhden sijainnin viiva ' + JSON.stringify(m[1]));
  // 3) pystyveto = usea rivi
  await p.mouse.move(g.x + 330, g.y + 120); await p.mouse.down(); await p.mouse.move(g.x + 330, g.y + 220, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(250);
  m = await ms(); ok(m.length === 3 && m[2].la && m[2].la !== m[2].lb, 'pystyvedolla usean sijainnin viiva ' + JSON.stringify(m[2]));
  // 4) siirto sivusuunnassa
  const c0 = m[2].c; const hx = await p.evaluate(() => { const l = document.querySelectorAll('[data-ms]'); const e = l[l.length - 1].getBoundingClientRect(); return { x: e.x + e.width / 2, y: e.y + e.height / 2 }; });
  await p.mouse.move(hx.x, hx.y); await p.mouse.down(); await p.mouse.move(hx.x + 60, hx.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(250);
  m = await ms(); ok(m[2].c !== c0 && m.length === 3, 'sivuveto siirsi viivaa ' + c0 + ' → ' + m[2].c);
  // 5) Delete poistaa valitun, kumoa palauttaa
  await p.keyboard.press('Delete'); await p.waitForTimeout(200); ok((await ms()).length === 2, 'Delete poisti');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(250); ok((await ms()).length === 3, 'kumoa palautti');
  // 6) viivat näkyvät ganttissa ja tahdissa
  await p.click('#vGantt'); await p.waitForTimeout(400); ok(await p.locator('#gantt line.mile').count() >= 1, 'gantissa viiva');
  await p.click('[data-ml="edit"]'); await p.waitForTimeout(200);
  await p.click('#vTakt'); await p.waitForTimeout(400); ok(await p.locator('#taktR line.mile').count() >= 1, 'tahdissa viiva');
  ok(await p.locator('[data-ms]').count() === 0, 'ei tartuntaviivoja kun muokkaus pois');
  // 7) päivämäärän muutos paneelista ja tallennus
  const iso = await p.inputValue('[data-mldate]'); ok(/^\d{4}-\d\d-\d\d$/.test(iso), 'päivämääräkenttä');
  const st = await p.evaluate(() => JSON.stringify(__aik().stateObj().miles)); ok(JSON.parse(st).length === 3, 'stateObj sisältää viivat');
  // 8) kesto: leveä vyöhyke
  await p.click('#vFlow'); await p.waitForTimeout(300);
  await p.fill('[data-mlw]', '10'); await p.press('[data-mlw]', 'Tab'); await p.waitForTimeout(300);
  ok((await ms()).some(q => q.w === 10), 'kesto tallentui');
  ok(await p.locator('#chart rect.mile').count() >= 1, 'vyöhyke piirtyy');
  // 9) gantti: sijaintikohtainen viiva ei peitä kaikkia rivejä
  await p.click('#vGantt'); await p.waitForTimeout(400);
  const cov = await p.evaluate(() => { const ls = [...document.querySelectorAll('#gantt line.mile')]; const H = +document.getElementById('gantt').getAttribute('height'); let tot = 0; const col = {}; ls.forEach(l => { const k = l.getAttribute('stroke'); col[k] = (col[k] || 0) + Math.abs(l.getAttribute('y2') - l.getAttribute('y1')); }); return { H: H, col: col }; });
  ok(Object.values(cov.col).some(v => v < cov.H * 0.95), 'gantissa on rajattu viiva (ei koko korkeus) ' + JSON.stringify(cov));
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
