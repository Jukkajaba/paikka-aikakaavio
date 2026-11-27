// tahtinäkymän tulostus: dokumentti sisältää tahtilaatikot ja sijaintinimet, rivit jakautuvat sivuille, "sovita sivulle" tekee yhden sivun; ruutu palautuu
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 900 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  require('fs').writeFileSync('/tmp/big178.html', require('fs').readFileSync('aikataulun-piirtoprototyyppi.html', 'utf8').replace('stateObj: () => stateObj() });', 'stateObj: () => stateObj(), applyState: st => applyState(st) });'));
  await p.goto('file:///tmp/big178.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.evaluate(() => { const a = __aik(), st = JSON.parse(JSON.stringify(a.stateObj())); st.lt = []; for (let f = 1; f <= 8; f++) { st.lt.push({ id: 'f' + f, name: 'Kerros ' + f, share: 1, par: null }); for (let i = 1; i <= 6; i++) st.lt.push({ id: 'f' + f + 'a' + i, name: 'Asunto ' + i, share: 1, par: 'f' + f }); } st.lines = st.lines.slice(0, 4).map((x, i) => Object.assign(JSON.parse(JSON.stringify(x)), { from: 'f1a1', to: 'f8a6', ov: {}, total: null, start: i * 6 })); st.groups = []; st.deps = []; st.locs = undefined; a.applyState(st); });
  await p.click('#vTakt'); await p.waitForTimeout(600);
  const wk0 = await p.evaluate(() => document.getElementById('tkIn') && 1); const w0 = await p.evaluate(() => +document.getElementById('taktR').getAttribute('width'));
  const h = await p.evaluate(() => __aik().prtDoc('A4', false, {}));
  ok(/Tahtiaikataulu/.test(h), 'otsikossa Tahtiaikataulu');
  const pages = (h.match(/<section class="pg"/g) || []).length; ok(pages >= 2, 'rivit jakautuvat sivuille: ' + pages);
  ok((h.match(/class="tkb"/g) || []).length >= 48 * 4 / 2, 'laatikot mukana: ' + (h.match(/class="tkb"/g) || []).length);
  ok(/Asunto 1/.test(h) && /Kerros 3/.test(h), 'sijaintinimet mukana');
  ok(!/stroke="transparent"/.test(h) && !/class="tkh"/.test(h), 'interaktiiviset elementit pois');
  const hf = await p.evaluate(() => __aik().prtDoc('A4', false, { fit: true })); ok((hf.match(/<section class="pg"/g) || []).length === 1, 'sovita sivulle: yksi sivu');
  ok(await p.evaluate(() => +document.getElementById('taktR').getAttribute('width')) === w0, 'ruudun zoom palautuu: ' + w0);
  ok(await p.locator('#taktR .tkb').count() > 0, 'tahtinäkymä piirtyy tulostuksen jälkeen');
  const q = await b.newPage(); await q.setContent(h); const n = await q.evaluate(() => document.querySelectorAll('.pg').length); ok(n === pages, 'dokumentti avautuu');
  await q.emulateMedia({ media: 'print' }); const pdf = await q.pdf({ format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true }); ok(pdf.length > 3000, 'PDF syntyy: ' + pdf.length);
  require('fs').writeFileSync('/tmp/tahti_print.pdf', pdf);
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
