// "Aika sijainnissa" vastaa laatikoiden todellista pituutta myös työryhmä-ohjatussa tilassa
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  if (await p.locator('.fp[data-p=panel]').isHidden()) await p.click('[data-ptog=panel]');
  const id = await p.evaluate(() => { const a = __aik(), l = a.lines[1]; l.lockC = 2; l.dur = 1; return l.id; });
  await p.click('#vTakt'); await p.waitForTimeout(300);
  const real = await p.evaluate(id => { const a = __aik(), l = a.lines.find(x => x.id === id), t = a.tasks(l); return t.reduce((s, x) => s + x.d, 0) / t.length; }, id);
  const bb = await p.locator('#taktR .tkb[data-tl="' + id + '"]').first().boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(250);
  const v = +(await p.locator('#panel [data-field="dur-v"]:visible').first().inputValue());
  ok(Math.abs(v - real) < 0.06 && real > 1.2, 'kenttä näyttää todellisen keskikeston ' + v + ' vs ' + real.toFixed(2));
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
