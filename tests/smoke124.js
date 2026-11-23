// kokonaiskeston muokkaus toimii, vaikka työryhmä on lukittu (lockC): rivin summarivi ja ylätehtävä
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.evaluate(() => { const A = __aik(); A.groups.push({ id: 'KT1', name: 'Rk', ord: 10 }); [0, 1].forEach(i => { A.lines[i].lockC = 3; }); A.lines[2].lockC = 3; A.lines[2].grp = 'KT1'; A.lines[3].lockC = 3; A.lines[3].grp = 'KT1'; });
  await p.click('#vGantt'); await p.waitForTimeout(400);
  const edit = async (pred, val) => {
    const i = await p.evaluate(pred => { const A = __aik(); return A.gRows.findIndex(new Function('r', 'return ' + pred)); }, pred);
    const pos = await p.evaluate(i => { const r = document.querySelector('#gantt rect[data-gi="' + i + '"]').getBoundingClientRect(); const h = document.querySelector('#ganttHead [data-gcm]').getBoundingClientRect(); return { y: r.top + r.height / 2, x: h.right - 12 }; }, i);
    await p.mouse.click(pos.x, pos.y); await p.waitForTimeout(150); await p.fill('input.gced', val); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    return p.evaluate(i => { const r = __aik().gRows[i]; return r.e - r.s; }, i);
  };
  const d1 = await edit('r.g && r.line === 1', '44'); ok(Math.abs(d1 - 44) < 1.1, 'rivin summakesto lukitulla työryhmällä: ' + d1);
  const d2 = await edit('r.gk', '70'); ok(Math.abs(d2 - 70) < 1.5, 'ylätehtävän kesto lukitulla työryhmällä: ' + d2);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
