// tahti: virtualisointi (isossa projektissa piirretään vain näkyvä alue) ja vieritys piirtää uudet rivit
const { chromium } = require('playwright');
(async () => {
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  const src = require('fs').readFileSync('aikataulun-piirtoprototyyppi.html', 'utf8').replace('stateObj: () => stateObj() });', 'stateObj: () => stateObj(), applyState: st => applyState(st) });');
  require('fs').writeFileSync('/tmp/big168.html', src);
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1500, height: 800 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///tmp/big168.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  await p.evaluate(() => { const a = __aik(), st = JSON.parse(JSON.stringify(a.stateObj())); st.lt = [];
    for (let f = 1; f <= 20; f++) { st.lt.push({ id: 'f' + f, name: 'Kerros ' + f, share: 1, par: null }); for (let i = 1; i <= 10; i++) st.lt.push({ id: 'f' + f + 'a' + i, name: 'Asunto ' + i, share: 1, par: 'f' + f }); }
    const base = st.lines[0], tr = st.trades, ls = []; for (let t = 0; t < 25; t++) { const l = JSON.parse(JSON.stringify(base)); l.id = 100 + t; l.trade = tr[t % tr.length].id; l.from = 'f1a1'; l.to = 'f20a10'; l.start = t * 4; l.dur = 1; l.ov = {}; delete l.grp; ls.push(l); }
    st.lines = ls; st.groups = []; st.deps = []; st.locs = undefined; st.nextId = 1000; st.weeks = 80; a.applyState(st); });
  await p.click('#vTakt'); await p.waitForTimeout(800);
  const n0 = await p.locator('#taktR .tkb').count(); ok(n0 > 50 && n0 < 2500, 'piirretty vain osa laatikoista: ' + n0);
  ok(/5000 laatikkoa/.test(await p.innerText('#tkNote')), 'laatikoiden kokonaismäärä näkyy: ' + await p.innerText('#tkNote'));
  // vieritä alas: viimeinen rivi piirtyy
  await p.evaluate(() => { const e = document.getElementById('taktBox'); e.scrollTop = e.scrollHeight; e.scrollLeft = 2400; }); await p.waitForTimeout(600);
  const lastRow = await p.evaluate(() => [...document.querySelectorAll('#taktL text.gc')].map(t => t.textContent).slice(-1)[0]);
  ok(/Asunto/.test(lastRow || ''), 'alin rivi piirtyi vierityksen jälkeen: ' + lastRow);
  ok(await p.locator('#taktR .tkb').count() > 0, 'laatikot piirtyvät vierityksen jälkeen');
  ok(errs.length === 0, 'virheet ' + errs.join('|')); console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
