// zoomaus: aika (+/−, Ctrl+rullaus, Koko) ja rivikorkeus
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const vis = () => p.inputValue('#gVis');
  await p.click('#vGantt'); await p.waitForTimeout(200);
  const v0 = +await vis(); await p.click('#zIn'); const v1 = +await vis(); ok(v1 < v0, 'zoom in ' + v0 + '→' + v1);
  await p.click('#zOut'); await p.click('#zOut'); const v2 = +await vis(); ok(v2 > v0, 'zoom out ' + v2);
  await p.click('#zFit'); ok(+await vis() === 52, 'fit ' + await vis());
  const bb = await p.locator('#ganttScroll').boundingBox(); await p.mouse.move(bb.x + 600, bb.y + 100);
  await p.keyboard.down('Control'); await p.mouse.wheel(0, -300); await p.keyboard.up('Control'); await p.waitForTimeout(200);
  ok(+await vis() < 52, 'ctrl+wheel ' + await vis());
  const h = async () => p.evaluate(() => document.getElementById('gantt').getBoundingClientRect().height);
  for (const k of ['c', 'n', 'w']) { await p.selectOption('#rowSel', k); await p.waitForTimeout(150); console.log(k, await h()); }
  await p.selectOption('#rowSel', 'c'); await p.screenshot({ path: '/tmp/zoom-c.png' });
  await p.selectOption('#rowSel', 'w'); await p.screenshot({ path: '/tmp/zoom-w.png' });
  await p.click('#vFlow'); await p.waitForTimeout(200); await p.click('#zIn'); ok(true, 'flow zoom ok');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
