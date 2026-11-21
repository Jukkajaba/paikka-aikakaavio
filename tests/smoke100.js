// määräluettelon tuonti: sarakkeet, rivit, ei sijainteja
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const run = async (txt, mode) => {
    await p.click('#impBtn'); await p.fill('#impTxt', txt); await p.click('#impParse');
    if (mode) await p.check('input[name=impMode][value=' + mode + ']');
    const n0 = await p.evaluate(() => __aik().lines.length); await p.click('#impGo'); await p.waitForTimeout(150);
    return (await p.evaluate(() => __aik().lines.length)) - n0;
  };
  await p.evaluate(() => { document.querySelector('[data-pj=example]') && 0; });
  let n = await run("Littera\tSuorite\tMäärä\tYksikkö\tKerros 1\tKerros 2\tKerros 3\n1\tPerustukset\t\t\t\t\t\n1.1\tAnturamuotti ja valu\t300\tm2\t100\t100\t100\n1.2\tSokkeliharkko\t80\tm2\t30\t30\t20");
  ok(n === 2, 'cols lines ' + n);
  const r = await p.evaluate(() => { const A = __aik(), l = A.lines[A.lines.length - 1]; const T = A.tasks(l); return { q: T.map(t => t.qty), tq: A.totalQty(l), g: A.groups.some(g => g.name === 'Perustukset'), locs: A.LOCS.length, grp: !!l.grp }; });
  ok(r.q.length >= 3 && r.q.slice(-3).join() === '30,30,20' || r.q.join().indexOf('30,30,20') >= 0, 'per-loc qty ' + r.q);
  ok(await p.evaluate(() => { const L = __aik().lines.slice(-2); return L[1].start - L[0].start === 5; }), 'stagger 5 pv');
  ok(Math.round(r.tq) === 80, 'total ' + r.tq); ok(r.g && r.grp, 'group');
  n = await run("Nimike\tSijainti\tMäärä\tYksikkö\nMuuraus\tKerros 1\t10\tm2\nMuuraus\tKerros 2\t20\tm2");
  ok(n === 1, 'rows lines ' + n);
  n = await run("Perustukset\n  Anturamuotti\t300\tm2\n  Sokkeli\t90\tm2", 'koko');
  ok(n === 2 && await p.evaluate(() => __aik().lines.slice(-1)[0].flat === true), 'flat');
  n = await run("Suorite\tMäärä\tYks\nLaatta\t500\tm2", 'jaa');
  ok(n === 1 && await p.evaluate(() => __aik().lines.slice(-1)[0].lockQ === 500), 'distributed');
  await p.click('#undo'); ok(await p.evaluate(() => !__aik().lines.some(l => l.lockQ === 500)), 'undo');
  // tyhjä projekti + ei sijainteja: ei saa kaatua
  await p.click('#projBtn'); await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(500);
  n = await run("Suorite\tMäärä\tYks\nLaatta\t500\tm2"); ok(n === 1 && await p.evaluate(() => __aik().lines.slice(-1)[0].flat === true), 'blank project flat');
  // tuonnin jälkeen paneeli säilyttää sisältönsä, mutta uusi projekti tyhjentää sen
  await p.click('#impBtn'); ok((await p.inputValue('#impTxt')) !== '' && (await p.locator('#impBody').innerHTML()) !== '', 'kept after import'); await p.evaluate(() => document.getElementById('impBox').classList.remove('on'));
  await p.click('[data-pj=new]'); await p.click('[data-pj=newblank]'); await p.waitForTimeout(500);
  await p.click('#impBtn'); ok((await p.inputValue('#impTxt')) === '' && (await p.locator('#impBody').innerHTML()) === '', 'reset after new project');
  await p.evaluate(() => { document.getElementById('impBox').classList.remove('on'); });
  await p.click('#impBtn'); await p.fill('#impTxt', "Nimike\tMäärä\tYksikkö\nTeräkset\t4000\tkg\nSeinä\t100\tm2"); await p.click('#impParse');
  ok(+await p.inputValue('[data-ip="0"]') === 10 && +await p.inputValue('[data-ip="1"]') === 10, 'same default for all');
  ok(/pv/.test(await p.locator('#impBody').innerText()), 'duration estimate');
  // kesto muokattavaksi ja sijaintien käyttö valinnaiseksi
  await p.evaluate(() => { document.getElementById('impBox').classList.remove('on'); });
  await p.click('#impBtn'); await p.fill('#impTxt', "Suorite\tMäärä\tYks\tK1\tK2\nLaatta\t200\tm2\t120\t80"); await p.click('#impParse');
  await p.fill('[data-id2="0"]', '40'); await p.dispatchEvent('[data-id2="0"]', 'change');
  ok(Math.abs(+await p.inputValue('[data-ip="0"]') - 200 / (40 * 2)) < 0.01, 'duration edit updates productivity ' + await p.inputValue('[data-ip="0"]'));
  const locsBefore = await p.evaluate(() => __aik().LOCS.length);
  await p.check('input[name=impLocs][value=no]'); ok(await p.locator('[data-lm]').count() === 0, 'no location mapping when off');
  await p.check('input[name=impMode][value=koko]'); await p.click('#impGo'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => { const A = __aik(), l = A.lines.slice(-1)[0]; return !!l.flat && Math.round(A.totalQty(l)) === 200 || l.qty === 200; }) && (await p.evaluate(() => __aik().LOCS.length)) === locsBefore, 'imported without locations');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
