// tahti: yhteinen tahtiaika usealle tehtävälle, työryhmän laskenta ja enimmäismiehityksen merkki
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  await p.click('#vTakt'); await p.waitForTimeout(250);
  const st = () => p.evaluate(() => { const a = __aik(); return a.lines.map(l => { const ts = a.tasks(l); return { d: ts.map(t => t.d), crew: Math.max(...ts.map(t => t.crew)), max: a.trade(l.trade).maxCrew }; }); });
  const s0 = await st();
  await p.fill('#tkTakt', '5'); await p.click('#tkTaktSet'); await p.waitForTimeout(250);
  const s1 = await st();
  ok(s1.every(x => x.d.every(d => d === 5)), 'kaikki laatikot 5 pv: ' + JSON.stringify(s1.map(x => x.d[0])));
  await p.fill('#tkTakt', '1'); await p.click('#tkTaktSet'); await p.waitForTimeout(250);
  const s2 = await st();
  ok(s2.some((x, i) => x.crew > s1[i].crew), 'lyhyempi tahtiaika kasvattaa työryhmää');
  ok(s2.some(x => x.crew > x.max), 'jokin ylittää enimmäismiehityksen: ' + JSON.stringify(s2.map(x => [x.crew, x.max])));
  ok(await p.locator('#taktR g[pointer-events="none"] circle[fill="#e08a1e"]').count() >= 1, 'ylityksen merkki näkyy laatikossa');
  await p.click('#tkTaktFree'); await p.waitForTimeout(250);
  const s3 = await st(); ok(JSON.stringify(s3.map(x => x.d)) === JSON.stringify(s0.map(x => x.d)), 'vapautus palauttaa kestot');
  // valittu tehtävä: vain yksi muuttuu
  const bb = await p.locator('#taktR .tkb').first().boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(200);
  await p.fill('#tkTakt', '3'); await p.click('#tkTaktSet'); await p.waitForTimeout(250);
  const s4 = await st(); ok(s4.filter(x => x.d.every(d => d === 3)).length === 1, 'vain valittu tehtävä sai tahtiajan');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
