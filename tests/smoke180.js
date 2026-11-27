// "Kaikki seuraavat aikaisemmaksi": rigid kaikille, ajat säilyvät, väli muuttuu viiveeksi; seuraaja vetäytyy kun edeltäjä siirtyy aikaisemmaksi
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const snap = () => p.evaluate(() => ({ st: __aik().lines.map(l => [l.id, l.start, l.dur]), d: __aik().deps.map(d => !!d.rigid) }));
  await p.evaluate(() => { __aik().deps.forEach(d => { d.rigid = false; }); }); await p.click('#vGantt'); await p.waitForTimeout(300);
  const s0 = await snap(); ok(s0.d.length > 0 && s0.d.every(x => !x), 'alussa ei rigid-riippuvuuksia: ' + s0.d.length);
  await p.click('#depRigid'); await p.waitForTimeout(300);
  const s1 = await snap(); ok(s1.d.every(x => x), 'kaikki rigid'); ok(JSON.stringify(s1.st) === JSON.stringify(s0.st), 'ajat säilyivät');
  await p.click('#depRigid'); await p.waitForTimeout(200); ok(JSON.stringify((await snap()).st) === JSON.stringify(s1.st), 'toinen painallus ei muuta mitään');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(300); const s2 = await snap(); ok(s2.d.every(x => x) || s2.d.every(x => !x), 'kumoa toimii: ' + JSON.stringify(s2.d));
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
