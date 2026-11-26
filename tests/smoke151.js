// aikataulun tuonti/vienti taulukkona
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 1000 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const loc = await p.evaluate(() => __aik().LOCS.map(x => x.name)); ok(loc.length >= 2, 'sijainnit ' + loc);
  const n0 = await p.evaluate(() => __aik().lines.length);
  // vienti
  const ex = await p.evaluate(() => { const a = __aik(); return { t: a.schExport('tasks'), l: a.schExport('locs') }; });
  ok(ex.t.length === n0 + 1 && ex.t[0][2] === 'Tehtävä', 'vienti rivit ' + ex.t.length + ' / ' + n0);
  ok(ex.l.length > ex.t.length, 'sijaintimuoto pidempi');
  ok(/^\d+\.\d+\.\d{4}$/.test(ex.t[1][3]) && /^\d+\.\d+\.\d{4}$/.test(ex.t[1][4]), 'päivämäärät muodossa d.m.yyyy: ' + ex.t[1][3]);
  // tuonti: sijaintitehtävä, sijaintiton ja ryhmä
  const L0 = loc[0], L1 = loc[1];
  const txt = ['Ryhmä\tTehtävä\tAlku\tLoppu\tSijainti alku\tSijainti loppu\tMäärä\tYksikkö', 'Piha / Maa\tKaivu\t11.1.2027\t22.1.2027\t\t\t50\tm3',
    'Runko\tValu\t18.1.2027\t5.2.2027\t' + L0 + '\t' + L1 + '\t200\tm2', 'Runko\tTuntematon\t1.2.2027\t3.2.2027\tAtlantis\t\t\t'].join('\n').replace('Ryhmä', 'Ylätehtävä');
  await p.click('#schBtn'); await p.fill('#schTxt', txt); await p.click('#schParse'); await p.waitForTimeout(200);
  ok(await p.locator('#schGo').count() === 1, 'tuo-nappi näkyy');
  await p.click('#schGo'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const a = __aik(), out = a.lines.slice(-3).map(l => ({ n: a.trade(l.trade).name, flat: !!l.flat, from: l.from, to: l.to, start: l.start, dur: l.dur, grp: l.grp })); return { out, groups: a.groups.map(g => g.name + ':' + (g.parent ? 'p' : '')), n: a.lines.length }; });
  ok(r.n === n0 + 3, 'kolme uutta: ' + r.n);
  ok(r.out[0].flat && r.out[0].n === 'Kaivu' && r.out[0].dur >= 5, 'kaivu sijaintiton: ' + JSON.stringify(r.out[0]));
  ok(!r.out[1].flat && r.out[1].n === 'Valu' && r.out[1].from && r.out[1].to, 'valu sijaintitehtävä: ' + JSON.stringify(r.out[1]));
  ok(r.out[2].flat && r.out[2].n === 'Tuntematon', 'tuntematon sijainti -> sijaintiton');
  ok(r.groups.some(g => g === 'Piha:') && r.groups.some(g => g === 'Maa:p') && r.groups.some(g => g === 'Runko:'), 'ryhmät luotu hierarkiana: ' + r.groups);
  ok((await p.textContent('#schMsg')).includes('Tuotu 3'), 'viesti: ' + await p.textContent('#schMsg'));
  // päivämäärät oikein: vienti -> tuonti kiertää
  const rt = await p.evaluate(() => { const a = __aik(), t = a.schExport('tasks').find(r => r[2] === 'Kaivu'); return t.slice(3, 5).join('-'); });
  ok(rt === '11.1.2027-22.1.2027', 'päivämäärät säilyvät: ' + rt);
  // Tehtävä × sijainti -muoto yhdistyy yhdeksi tehtäväksi
  const txt2 = 'Tehtävä\tSijainti\tAlku\tLoppu\nLattia\t' + L0 + '\t11.1.2027\t15.1.2027\nLattia\t' + L1 + '\t18.1.2027\t22.1.2027';
  await p.fill('#schTxt', txt2); await p.click('#schParse'); await p.waitForTimeout(100); await p.click('#schGo'); await p.waitForTimeout(300);
  const m = await p.evaluate(() => { const a = __aik(); return a.lines.length - 0; }); ok(m === n0 + 4, 'yhdistyi yhdeksi: ' + m);
  await p.click('#schClose'); await p.keyboard.press('Control+z'); await p.waitForTimeout(200);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
