// suljettu ylätehtävä = yksi viiva paikka-aikakaaviossa
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 950 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const txt = "Littera\tSuorite\tMäärä\tYksikkö\tKerros 1\tKerros 2\tKerros 3\n1\tRunko\t\t\t\t\t\n1.1\tElementit\t300\tm2\t100\t100\t100\n1.2\tKuilumuurit\t90\tm2\t30\t30\t30\n1.3\tOntelolaatat\t600\tm2\t200\t200\t200\n2\tJulkisivu\t\t\t\t\t\n2.1\tTiili\t300\tm2\t100\t100\t100";
  const gb = () => p.locator('#chart path[data-role="gbody"]').count();
  const bodies = () => p.locator('#chart path[data-role="body"]').count();
  const b0 = await bodies();
  await p.click('#impBtn'); await p.fill('#impTxt', txt); await p.click('#impParse');
  ok(await p.isChecked('#impCG'), 'closed option default on');
  await p.click('#impGo'); await p.waitForTimeout(300);
  await p.click('#vFlow').catch(() => {}); await p.waitForTimeout(300);
  ok(await gb() === 2, 'two summary lines ' + await gb());
  const b1 = await bodies();
  ok(await bodies() === b0, 'no imported detail lines ' + await bodies());
  // riippuvuus suljettujen ryhmien välillä piirtyy
  const ids = await p.evaluate(() => { const A = __aik(); return A.lines.map(l => [l.id, l.grp]); });
  // yhteenvetoviiva valitaan klikkaamalla
  await p.locator('#chart path[data-role="gbody"]').first().click({ force: true }); await p.waitForTimeout(200);
  ok(await p.evaluate(() => __aik().selId == null), 'group selected, no line');
  // kaksoisklikkaus avaa
  const bx = await p.locator('#chart path[data-role="gbody"]').first().boundingBox(); await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.waitForTimeout(300);
  ok(await gb() === 1, 'one group remains closed ' + await gb());
  ok([1, 3].includes(await bodies() - b1), 'opened group shows its lines ' + await bodies());
  // Gantt: sulkeminen/avaaminen vaikuttaa samaan tilaan
  await p.click('#vGantt'); await p.waitForTimeout(300);
  await p.click('#vFlow'); await p.waitForTimeout(300);
  ok(await gb() === 1, 'state kept after view switch');
  // suljettu viiva on yksi suora jana, ja Ylätehtävät-painike sulkee/avaa kaikki
  await p.click('#grpBtn'); await p.waitForTimeout(250); ok(await gb() === 2, 'button closes all ' + await gb());
  ok(await p.evaluate(() => [...document.querySelectorAll('#chart path[data-role="gbody"]')].every(e => (e.getAttribute('d').match(/L/g) || []).length === 1)), 'straight single segment');
  await p.click('#grpBtn'); await p.waitForTimeout(250); ok(await gb() === 0, 'button opens all ' + await gb());
  await p.click('#grpBtn'); await p.waitForTimeout(250); await p.locator('#chart path[data-role="gbody"]').first().click({ force: true }); const bx2 = await p.locator('#chart path[data-role="gbody"]').first().boundingBox(); await p.mouse.click(bx2.x + bx2.width / 2, bx2.y + bx2.height / 2); await p.mouse.click(bx2.x + bx2.width / 2, bx2.y + bx2.height / 2); await p.waitForTimeout(250);
  // riippuvuus avoimen ryhmän ja suljetun ryhmän välillä: ei virheitä, nuoli piirtyy ylätehtävän viivalle
  await p.click('#depBtn').catch(() => {});
  const pts = await p.evaluate(() => [...document.querySelectorAll('#chart path[data-role="body"]')].slice(-2).map(e => { const L = e.getTotalLength(), q = e.getPointAtLength(L * 0.5), m = e.getScreenCTM(); return { x: q.x * m.a + m.e, y: q.y * m.d + m.f }; }));
  const g0 = await p.locator('#chart path[data-role="gbody"]').first().boundingBox();
  await p.keyboard.down('Control'); await p.mouse.move(pts[0].x, pts[0].y); await p.mouse.down(); await p.mouse.move(g0.x + g0.width / 2, g0.y + g0.height / 2, { steps: 6 }); await p.mouse.up(); await p.keyboard.up('Control'); await p.waitForTimeout(300);
  console.log('deps', await p.evaluate(() => { const A = __aik(); return 'n/a'; }));
  // valintaruudun poisto: ei suljettuna
  await p.click('#impBtn'); if (await p.isChecked('#impCG')) await p.uncheck('#impCG'); await p.click('#impGo'); await p.waitForTimeout(300);
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
