// alkunäkymä tyhjässä projektissa
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 950 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const vis = () => p.evaluate(() => document.getElementById('welcome').classList.contains('on'));
  ok(!(await vis()), 'no welcome in example project');
  const newBlank = async () => { await p.click('#projBtn').catch(() => {}); await p.waitForTimeout(200); if (!(await p.locator('[data-pj="new"]').count())) { await p.click('#projBtn'); await p.waitForTimeout(200); } await p.click('[data-pj="new"]'); await p.waitForTimeout(150); await p.click('[data-pj="newblank"]'); await p.waitForTimeout(500); await p.click('#projBtn'); await p.waitForTimeout(200); };
  await newBlank();
  ok(await vis(), 'welcome in blank project');
  ok(await p.locator('#welcome [data-wl]').count() >= 3, 'three choices');
  await p.click('[data-wl="import"]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.getElementById('impBox').classList.contains('on')), 'import opens');
  await p.click('#impClose'); await p.waitForTimeout(100);
  await p.click('[data-wl="blank"]'); await p.waitForTimeout(250);
  ok(!(await vis()), 'start from blank hides welcome');
  await newBlank(); ok(await vis(), 'welcome again for new project');
  await p.click('[data-wl="example"]'); await p.waitForTimeout(600);
  ok(!(await vis()) && await p.evaluate(() => __aik().lines.length > 0), 'example opens and hides welcome');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
