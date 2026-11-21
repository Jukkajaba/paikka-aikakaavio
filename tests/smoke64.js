const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html');
  await pg.click('#helpBtn');
  await pg.click('#projBtn');for (const k of ['locs','list']) await pg.click('[data-ptog="'+k+'"]');
  await pg.click('#vGantt');
  await pg.click('#gantt rect, #gantt text >> nth=3', {force:true}).catch(()=>{});
  const n = await pg.evaluate(() => [...document.querySelectorAll('.hlp')].filter(e => e.offsetParent).map(e => e.textContent.slice(0,30)));
  console.log(n); console.log('errs', errs); await b.close();
})();
