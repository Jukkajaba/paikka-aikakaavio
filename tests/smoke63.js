const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html');
  const vis = () => pg.evaluate(() => ({ hint: !document.getElementById('hint').hidden && getComputedStyle(document.getElementById('hint')).display !== 'none', pressed: document.getElementById('helpBtn').getAttribute('aria-pressed') }));
  console.log('alku', await vis());
  await pg.click('#helpBtn'); console.log('paalla', await vis());
  await pg.click('[data-ptog=bl]'); await pg.click('[data-ptog=fc]');
  console.log('bl help visible', await pg.evaluate(() => { const e = document.querySelector('#blCard .hlp'); return getComputedStyle(e).display; }));
  await pg.click('#vGantt'); console.log('gantt', await vis());
  await pg.click('#helpBtn'); console.log('pois', await vis(), await pg.evaluate(() => getComputedStyle(document.querySelector('#blCard .hlp')).display));
  console.log('errs', errs); await b.close();
})();
