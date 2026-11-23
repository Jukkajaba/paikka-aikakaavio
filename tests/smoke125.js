// kesto/työryhmä/määrä -säännöt: määrä muuttuu → työryhmä pysyy; kestolukko; kokonaiskesto skaalaa suhteessa; sovittu työryhmä ja lisätunnit
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#vGantt'); await p.waitForTimeout(400);
  const colIdx = async key => p.evaluate(key => { const hs = [...document.querySelectorAll('#ganttHead [data-gcm] text:not(:last-child)')]; return hs.map(h => h.textContent.replace(/[▾\s]+$/, '')); }, key);
  // sarakkeiden lisäys valikosta
  await p.click('#ganttHead [data-gcm]'); await p.waitForTimeout(150);
  for (const k of ['agreed', 'extra']) { const c = p.locator('input[data-gcol="' + k + '"]'); if (!(await c.isChecked())) await c.check(); }
  await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const heads = await colIdx(); ok(heads.includes('Sovittu') && heads.includes('Lisätunnit'), 'sarakkeet näkyvät: ' + heads.join(','));
  const ci = k => heads.indexOf(k);
  const rowOf = line => p.evaluate(line => __aik().gRows.findIndex(r => r.g && r.line === line && !r.gk), line);
  const st = line => p.evaluate(line => { const A = __aik(), l = A.lines.find(x => x.id === line); return { dur: lineEnd(l) - l.start, crew: A.tasks(l).reduce((m, t) => Math.max(m, t.crew), 1), qty: A.totalQty(l), lockD: !!l.lockD, agreed: l.agreed }; }, line);
  const edit = async (line, col, val) => {
    const i = await rowOf(line); const pos = await p.evaluate(([i, ci]) => { const r = document.querySelector('#gantt rect[data-gi="' + i + '"]').getBoundingClientRect(); const hs = [...document.querySelectorAll('#ganttHead [data-gcm] text:not(:last-child)')]; return { y: r.top + r.height / 2, x: hs[ci].getBoundingClientRect().right - 12 }; }, [i, ci(col)]);
    await p.mouse.click(pos.x, pos.y); await p.waitForTimeout(150); if (!(await p.locator('input.gced').count())) return false; await p.fill('input.gced', val); await p.keyboard.press('Enter'); await p.waitForTimeout(300); return true;
  };
  // 1. määrä x2 → työryhmä pysyy, kesto kasvaa
  const a0 = await st(1); await edit(1, 'Määrä', String(a0.qty * 2)); const a1 = await st(1);
  ok(a1.crew === a0.crew, 'työryhmä pysyi (' + a0.crew + ' → ' + a1.crew + ')'); ok(a1.dur > a0.dur * 1.8 && a1.dur < a0.dur * 2.2, 'kesto ~2× (' + a0.dur + ' → ' + a1.dur + ')');
  // 2. kestolukko: määrä x2 → kesto pysyy, työryhmä kasvaa
  await p.evaluate(() => { __aik().lines.find(x => x.id === 2).lockD = true; }); const b0 = await st(2); await edit(2, 'Määrä', String(b0.qty * 2)); const b1 = await st(2);
  ok(Math.abs(b1.dur - b0.dur) < 0.2, 'lukittu kesto pysyi (' + b0.dur + ' → ' + b1.dur + ')'); ok(b1.crew > b0.crew, 'työryhmä kasvoi (' + b0.crew + ' → ' + b1.crew + ')');
  // 3. kestolukko estää työryhmän asetuksen
  await edit(2, 'Resurssi', '9'); const b2 = await st(2); ok(b2.crew === b1.crew, 'työryhmän asetus estetty');
  // 4. sovittu työryhmä: lisätunnit
  await edit(2, 'Sovittu', '2'); const b3 = await st(2); ok(b3.agreed === 2, 'sovittu tallentui');
  const cell = await p.evaluate(([i, ci]) => { const r = document.querySelector('#gantt rect[data-gi="' + i + '"]').getBoundingClientRect(); return [...document.querySelectorAll('#gantt text.gc')].filter(t => Math.abs(t.getBoundingClientRect().top + t.getBoundingClientRect().height / 2 - (r.top + r.height / 2)) < 6).map(t => t.textContent); }, [await rowOf(2), 0]);
  ok(cell.some(t => /\d+ h$/.test(t)), 'lisätunnit näkyvät: ' + cell.join('|'));
  // 5. kokonaiskesto skaalaa sijaintikohtaiset kestot suhteessa
  await p.evaluate(() => { const A = __aik(), l = A.lines.find(x => x.id === 3); delete l.lockD; l.ov = l.ov || {}; l.ov[A.tasks(l)[1].locId] = Object.assign(l.ov[A.tasks(l)[1].locId] || {}, { d: 10 }); });
  const c0 = await p.evaluate(() => { const A = __aik(), l = A.lines.find(x => x.id === 3); return A.tasks(l).map(t => t.d); }); const cs0 = await st(3);
  await edit(3, 'Kesto', String(Math.round(cs0.dur * 2)));
  const c1 = await p.evaluate(() => { const A = __aik(), l = A.lines.find(x => x.id === 3); return A.tasks(l).map(t => t.d); });
  ok(c1[1] > c1[0] * 1.5, 'poikkeava kesto säilyi suhteessa (' + c0.join(',') + ' → ' + c1.join(',') + ')'); ok(Math.abs(c1[0] / c0[0] - c1[1] / c0[1]) < 0.35, 'sama kerroin kaikille');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
