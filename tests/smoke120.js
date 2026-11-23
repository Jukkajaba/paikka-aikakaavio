// Tuo määrät: sarakeroolien tunnistus ilman otsikkoriviä (littera, määrä = sijaintien summa)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(300);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const r = await p.evaluate(() => {
    const rows = [['1', 'Runko'], ['1.1', 'Elementtiasennus', '1200', 'm2', 200, 200, 200, 200, 200, 200], ['1.2', 'Ontelolaatat', '1020', 'm2', 170, 170, 170, 170, 170, 170], ['2', 'Sisävalmistus'], ['2.1', 'Väliseinät', '1800', 'm2', 300, 300, 300, 300, 300, 300]].map(x => x.map(String));
    const H = [['Littera', 'Suorite', 'Määrä', 'Yksikkö', 'Kerros 1', 'Kerros 2', 'Kerros 3', 'Kerros 4', 'Kerros 5', 'Kerros 6']];
    return [qlGuess(H.concat(rows)).roles.join(), qlGuess(rows).roles.join()];
  });
  ok(r[0] === 'code,name,qty,unit,loc,loc,loc,loc,loc,loc', 'otsikolla ' + r[0]);
  ok(r[1] === r[0], 'ilman otsikkoa ' + r[1]);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
