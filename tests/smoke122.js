// riippuvuus ylätehtävään näkyy paikka-aikakaaviossa
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const n0 = await p.evaluate(() => document.querySelectorAll('#chart [data-role="depend"]').length);
  await p.evaluate(() => { const A = __aik(); A.groups.push({ id: 'KT9', name: 'Sisä', ord: 10 }); A.lines[1].grp = 'KT9'; A.lines[2].grp = 'KT9'; A.deps.push({ id: 991, a: { l: A.lines[0].id, loc: null }, b: { g: 'KT9' }, rigid: false }); window.dispatchEvent(new Event('resize')); });
  await p.waitForTimeout(400);
  const n1 = await p.evaluate(() => document.querySelectorAll('#chart [data-role="depend"]').length);
  ok(n1 >= n0 + 2, 'ylätehtäväriippuvuus piirtyy (' + n0 + ' → ' + n1 + ')');
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
