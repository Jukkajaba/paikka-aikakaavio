// piirtotila tahdissa: pois päältä veto tyhjästä siirtää näkymää (ei luo tehtävää), päällä luo tehtävän; sama tila kuin paikka-aikakaaviossa; kynäkuvake
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  ok(await p.locator('#cDraw svg').count() === 1 && !/^\s*\+\s*$/.test(await p.locator('#cDraw').innerText()), 'paikka-aika: kynäkuvake plussan tilalla');
  await p.click('#vTakt'); await p.waitForTimeout(500);
  ok(await p.locator('#tDraw svg').count() === 1 && (await p.getAttribute('#tDraw', 'aria-pressed')) === 'false', 'tahti: piirtopainike, oletuksena pois');
  const empty = () => p.evaluate(() => { const r = document.getElementById('taktR').getBoundingClientRect(); for (let y = r.y + 60; y < r.y + 400; y += 44) for (let x = r.x + 40; x < Math.min(r.x + r.width, 1400) - 150; x += 20) { let free = true; for (let q = 0; q <= 100; q += 20) { const f = document.elementFromPoint(x + q, y); if (!f || !f.closest || !f.closest('#taktR') || (f.classList && f.classList.contains('tkb')) || (f.dataset && f.dataset.td)) free = false; } if (free) return { x: x, y: y }; } return null; });
  const n0 = await p.evaluate(() => __aik().lines.length); let pt = await empty(); ok(!!pt, 'tyhjä kohta');
  await p.evaluate(() => { document.getElementById('taktBox').scrollLeft = 200; }); await p.waitForTimeout(200); pt = await empty();
  await p.mouse.move(pt.x, pt.y); await p.mouse.down(); await p.mouse.move(pt.x + 80, pt.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(300);
  ok((await p.evaluate(() => __aik().lines.length)) === n0, 'piirtotila pois: ei luonut tehtävää');
  ok((await p.evaluate(() => document.getElementById('taktBox').scrollLeft)) < 200, 'veto siirsi näkymää (scrollLeft pieneni)');
  await p.click('#tDraw'); ok((await p.getAttribute('#cDraw', 'aria-pressed')) === 'true', 'tila jaettu paikka-aikakaavion kanssa');
  pt = await empty(); await p.mouse.move(pt.x, pt.y); await p.mouse.down(); await p.mouse.move(pt.x + 100, pt.y + 50, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(300);
  ok((await p.evaluate(() => __aik().lines.length)) === n0 + 1, 'piirtotila päällä: tehtävä syntyi');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
