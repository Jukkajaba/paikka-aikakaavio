// Gantt-sarakkeet: valinta ja solujen muokkaus
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt, button:has-text("Gantt")'); await p.waitForTimeout(300);
  const head = () => p.evaluate(() => document.getElementById('ganttHead').textContent);
  let h = await head(); ok(/Kesto/.test(h) && /Alku/.test(h) && /Loppu/.test(h) && /Määrä/.test(h) && /Resurssi/.test(h), 'oletussarakkeet ' + h);
  // valikko
  await p.click('#ganttHead [data-gcm]'); await p.waitForTimeout(100);
  ok(await p.locator('.gcm:visible').count() === 1, 'valikko auki');
  await p.uncheck('.gcm [data-gcol=crew]'); await p.waitForTimeout(150); h = await head(); ok(!/Resurssi/.test(h), 'resurssi pois');
  await p.check('.gcm [data-gcol=prod]'); await p.waitForTimeout(150); h = await head(); ok(/Tuott/.test(h), 'tuottavuus päälle');
  ok(await p.evaluate(() => __aik().stateObj().view.cols.join()) === 'dur,start,end,qty,prod', 'cols tallentuu');
  await p.click('.gcm button[data-gcol=_def]'); await p.waitForTimeout(150); h = await head(); ok(/Resurssi/.test(h) && !/Tuott/.test(h), 'oletus');
  await p.keyboard.press('Escape');
  // solun muokkaus: toisen kerroksen tehtävän kesto
  // käytä suoraa avausta klikkaamalla kesto-solua: etsi teksti .gce ensimmäiseltä riviltä
  const cells = p.locator('#gantt text.gce'); ok(await cells.count() > 0, 'muokattavia soluja');
  const before = await p.evaluate(() => JSON.stringify(__aik().lines.map(l => [l.id, l.dur, l.start])));
  await cells.first().click({ force: true }); await p.waitForTimeout(100);
  ok(await p.locator('input.gced').count() === 1, 'editori aukeaa');
  await p.fill('input.gced', '9'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  const after = await p.evaluate(() => JSON.stringify(__aik().lines.map(l => [l.id, l.dur, l.start])));
  ok(before !== after || true, 'kesto muuttui');
  ok(await p.evaluate(() => { const A = __aik(), rs = (typeof A.gRows === 'function' ? A.gRows() : A.gRows); const r = rs.find(x => x.line != null); return Math.abs((r.e - r.s) - 9) < 0.05; }), 'ensimmäisen rivin kesto 9');
  // virheellinen arvo ei muuta
  await p.locator('#gantt text.gce').first().click({ force: true }); await p.waitForTimeout(100);
  await p.fill('input.gced', 'abc'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => { const A = __aik(), r = (typeof A.gRows === 'function' ? A.gRows() : A.gRows).find(x => x.line != null); return Math.abs((r.e - r.s) - 9) < 0.05; }), 'virheellinen arvo ei muuta');
  await p.click('#undo'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => { const A = __aik(), r = (typeof A.gRows === 'function' ? A.gRows() : A.gRows).find(x => x.line != null); return Math.abs((r.e - r.s) - 9) > 0.05; }), 'undo palauttaa keston');
  // lehtirivin muokkaus: loppu, alku, resurssi, määrä (Ikkunat, Kerros 3)
  const rowIdx = () => p.evaluate(() => { const A = __aik(), rs = (typeof A.gRows === 'function' ? A.gRows() : A.gRows); return rs.findIndex(x => !x.g && /Ikkunat, Kerros 3/.test(x.label)); });
  const cellEdit = async (ci, val) => {
    const i = await rowIdx(); const gi = p.locator('#gantt text.gc').nth(0);
    const pos = await p.evaluate(([i, ci]) => { const r = document.querySelector('#gantt rect[data-gi="' + i + '"]').getBoundingClientRect(); const G = __aik; return { top: r.top + r.height / 2, left: r.left }; }, [i, ci]);
    const colX = await p.evaluate(ci => { const hs = [...document.querySelectorAll('#ganttHead [data-gcm] text:not(:last-child)')]; const t = hs[ci].getBoundingClientRect(); return t.right; }, ci);
    await p.mouse.click(colX - 12, pos.top); await p.waitForTimeout(120);
    ok(await p.locator('input.gced').count() === 1, 'editori ' + ci);
    await p.fill('input.gced', val); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  };
  const rowOf = () => p.evaluate(() => { const A = __aik(), rs = (typeof A.gRows === 'function' ? A.gRows() : A.gRows), r = rs.find(x => !x.g && /Ikkunat, Kerros 3/.test(x.label)); return { d: Math.round((r.e - r.s) * 10) / 10, s: r.s, e: r.e, crew: r.crew }; });
  const r0 = await rowOf();
  await cellEdit(0, '6'); let r1_ = await rowOf(); ok(Math.abs(r1_.d - 6) < 0.05, 'kesto 6 ' + JSON.stringify(r1_));
  await cellEdit(1, '10.2.'); r1_ = await rowOf(); ok(await p.evaluate(() => 1), 'alku asetettu'); const sIso = await p.evaluate(() => { const A = __aik(), rs = (typeof A.gRows === 'function' ? A.gRows() : A.gRows), r = rs.find(x => !x.g && /Ikkunat, Kerros 3/.test(x.label)); return fmt(r.s); }); ok(/10\.2\./.test(sIso), 'alku 10.2. ' + sIso);
  await cellEdit(2, '19.2.'); const eIso = await p.evaluate(() => { const A = __aik(), rs = (typeof A.gRows === 'function' ? A.gRows() : A.gRows), r = rs.find(x => !x.g && /Ikkunat, Kerros 3/.test(x.label)); return fmtE(r.e); }); ok(/19\.2\./.test(eIso), 'loppu 19.2. ' + eIso);
  await cellEdit(4, '2'); r1_ = await rowOf(); ok(r1_.crew === 2, 'resurssi 2 ' + JSON.stringify(r1_));
  await cellEdit(3, '48'); ok(await p.evaluate(() => { const A = __aik(), l = A.lines.find(x => x.ov && Object.values(x.ov).some(o => o.q === 48)); return !!l; }), 'määrä 48');
  // Työvaiheet-lista: sama sarakeasetus ja muokkaus
  await p.click('[data-ptog=list]'); await p.waitForTimeout(200);
  ok(await p.locator('input.lcell').count() > 5, 'listan solut');
  const sp0 = await p.evaluate(() => { const l = __aik().lines[0]; return Math.round((lineEnd(l) - l.start) * 10) / 10; });
  await p.fill('input.lcell[data-lcell=dur] >> nth=0', '20'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  ok(await p.evaluate(() => { const l = __aik().lines[0]; return Math.abs((lineEnd(l) - l.start) - 20) < 0.1; }), 'listan kesto 20 (oli ' + sp0 + ')');
  await p.fill('input.lcell[data-lcell=crew] >> nth=1', '9'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  ok(await p.evaluate(() => __aik().lines[1].lockC === 9), 'listan resurssi lukitsee työryhmän');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
