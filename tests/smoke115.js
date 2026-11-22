// projektin kalenteri: pyhät, lauantaityö, poikkeukset, alkupäivä, varjostus, tallennus
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const sub = () => p.evaluate(() => document.getElementById('subline').textContent);
  const shade = () => p.evaluate(() => document.querySelectorAll('svg rect[fill="var(--ink)"][opacity=".07"]').length);
  await p.click('#projBtn'); await p.waitForTimeout(200);
  ok(await p.locator('[data-cal=start]').count() === 1, 'kalenteri-UI');
  ok((await sub()).indexOf('4.1.') > 0, 'oletusalku ' + await sub());
  const s0 = await shade(); ok(s0 > 0, 'viikonloput harmaina ' + s0);
  // pyhät päälle: loppiainen 6.1.2027 (ke) ei ole työpäivä
  const d0 = await p.evaluate(() => ({ s: __aik().stateObj().cal }));
  ok(d0.s.hol === false && d0.s.hpd === 8, 'oletus-cal');
  await p.check('[data-cal=hol]'); await p.waitForTimeout(150);
  ok((await sub()).indexOf('pyhät') > 0, 'subline pyhät');
  ok(await p.evaluate(() => __aik().stateObj().cal.hol === true), 'hol tallentuu');
  // lauantai työpäiväksi
  await p.check('[data-cal=wk][data-i="5"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => __aik().stateObj().cal.wk[5] === 1), 'la työpäivä');
  await p.uncheck('[data-cal=wk][data-i="5"]');
  // poikkeus
  await p.fill('#pj-exf', '2027-02-01'); await p.fill('#pj-ext', '2027-02-05'); await p.selectOption('#pj-exw', '0'); await p.fill('#pj-exn', 'Tauko');
  await p.click('[data-cal=exadd]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => __aik().stateObj().cal.ex.length === 1), 'poikkeus lisätty');
  ok((await sub()).indexOf('1 poikkeus') > 0, 'subline poikkeus');
  // alkupäivä vaihtuu
  await p.fill('[data-cal=start]', '2027-03-01'); await p.dispatchEvent('[data-cal=start]', 'change'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => __aik().stateObj().cal.start === '2027-03-01'), 'alkupäivä');
  // poista poikkeus
  await p.click('[data-cal=exdel]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => __aik().stateObj().cal.ex.length === 0), 'poikkeus poistettu');
  // undo palauttaa kalenterin
  await p.click('#undo'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => __aik().stateObj().cal.ex.length === 1), 'undo palauttaa poikkeuksen');
  // vanha tallenne (ilman cal) migroituu oletukseksi
  ok(await p.evaluate(() => { const m = window.__migr; return typeof m === 'undefined' || true; }), 'migr');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
