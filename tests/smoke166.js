// tehtäväpaneeli ei hyppää valitun sijainnin kohdalle, kun laatikkoa klikataan
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 700 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  if (await p.locator('.fp[data-p=panel]').isHidden()) await p.click('[data-ptog=panel]');
  await p.click('#vTakt'); await p.waitForTimeout(250);
  const bx = p.locator('#taktR .tkb'); const n = await bx.count();
  const first = await bx.first().boundingBox(); await p.mouse.click(first.x + first.width / 2, first.y + first.height / 2); await p.waitForTimeout(250);
  const sc = () => p.evaluate(() => { const e = document.getElementById('panel'); return [e.scrollTop, e.scrollHeight, e.clientHeight, e.closest('.fp-body') ? e.closest('.fp-body').scrollTop : -1]; });
  const s0 = await sc(); ok(s0[1] > s0[2] || s0[0] === 0, 'paneeli ladattu ' + s0);
  await p.evaluate(() => { const e = document.getElementById('panel'); e.scrollTop = 0; });
  // klikkaa toista saman tehtävän laatikkoa (viimeinen laatikko eri sijainnissa)
  const id = await bx.first().getAttribute('data-tl'); const same = p.locator('#taktR .tkb[data-tl="' + id + '"]'); const m = await same.count();
  const last = await same.nth(m - 1).boundingBox(); await p.mouse.click(last.x + last.width / 2, last.y + last.height / 2); await p.waitForTimeout(300);
  const s1 = await sc(); ok(s1[0] === 0, 'paneeli pysyi ylhäällä, scrollTop=' + s1[0]);
  // pysyy paikallaan myös, kun paneeli on vieritetty keskelle
  const sc2 = async (btnSel, label) => {
    await p.evaluate(() => { document.getElementById('panel').scrollTop = 300; });
    const before = (await sc())[0]; await btnSel(); await p.waitForTimeout(300); const after = (await sc())[0];
    ok(after === before, label + ': paneeli ei hypännyt (' + before + '→' + after + ')');
  };
  await sc2(async () => { const bb = await same.nth(m - 2).boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); }, 'tahti');
  await p.click('#vFlow'); await p.waitForTimeout(300);
  const fb = p.locator('#chart path[data-role="body"]'); const fn = await fb.count();
  await sc2(async () => { const bb = await fb.nth(Math.max(0, fn - 3)).boundingBox(); await p.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height * 0.5); }, 'paikka-aika');
  await p.click('#vGantt'); await p.waitForTimeout(400);
  await sc2(async () => { const rows = p.locator('#gantt [data-gr="gmove"]'); const c = await rows.count(); const bb = await rows.nth(Math.min(c - 1, 6)).boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); }, 'gantt');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
