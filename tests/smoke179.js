// tahti: Ctrl+klikkaus valitsee junia, veto siirtää kaikkia valittuja yhtä paljon; ilman Ctrliä vain yksi
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.evaluate(() => { const a = __aik(); a.deps.length = 0; }); // ei riippuvuuksia sotkemassa
  await p.click('#vTakt'); await p.waitForTimeout(600);
  const starts = () => p.evaluate(() => Object.fromEntries(__aik().lines.map(l => [l.id, l.start])));
  const pt = id => p.evaluate(id => { const e = [...document.querySelectorAll('#taktR .tkb')].find(x => x.dataset.tl === id); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const ids = (await p.evaluate(() => __aik().lines.filter(l => !l.flat).map(l => String(l.id)))).slice(0, 3);
  const s0 = await starts(), A = await pt(ids[0]), B = await pt(ids[1]);
  await p.keyboard.down('Control'); await p.mouse.click(A.x, A.y); await p.mouse.click(B.x, B.y); await p.keyboard.up('Control'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('#taktR .tkb').length) > 0, 'piirtyy');
  const A2 = await pt(ids[0]); await p.mouse.move(A2.x, A2.y); await p.mouse.down(); await p.mouse.move(A2.x + 90, A2.y, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(300);
  const s1 = await starts(), dA = s1[ids[0]] - s0[ids[0]], dB = s1[ids[1]] - s0[ids[1]];
  ok(dA > 0 && dA === dB, 'valitut junat siirtyivät yhtä paljon: ' + dA + ' / ' + dB);
  if (ids[2]) ok(s1[ids[2]] === s0[ids[2]], 'valitsematon ei liikkunut');
  // ilman valintaa (klikkaus ilman Ctrliä tyhjentää) liikkuu vain yksi
  const C = await pt(ids[0]); await p.mouse.click(C.x, C.y); await p.waitForTimeout(200); await p.waitForTimeout(500);
  const s2 = await starts(), C2 = await pt(ids[0]); await p.mouse.move(C2.x, C2.y); await p.mouse.down(); await p.mouse.move(C2.x + 60, C2.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(300);
  const s3 = await starts(); ok(s3[ids[0]] !== s2[ids[0]] && s3[ids[1]] === s2[ids[1]], 'tavallinen veto siirtää vain yhtä junaa ' + JSON.stringify([s2, s3, ids]));
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
