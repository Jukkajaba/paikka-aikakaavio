// tietomallin versiointi + Ilmoita ongelma
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 950 } }), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  // --- versiointi ---
  const r = await p.evaluate(() => {
    const M = window.__migr, st = __aik().stateObj(), out = {};
    out.v = st.v === M.schema();
    // vanha tallennus ilman v-kenttää migroituu nykyiseen versioon
    const old = JSON.parse(JSON.stringify(st)); delete old.v; out.old = M.run(old).v === M.schema();
    // uusi migraatio ajetaan ketjussa ja vain kerran
    M.list.push(s => { s.migrated = (s.migrated || 0) + 1; return s; });
    const o1 = JSON.parse(JSON.stringify(st)); const m1 = M.run(o1); out.chain = m1.v === M.schema() && m1.migrated === 1;
    const o2 = JSON.parse(JSON.stringify(m1)); out.once = M.run(o2).migrated === 1;
    M.list.pop();
    return out;
  });
  ok(r.v, 'state stamped with schema'); ok(r.old, 'v-less state migrates'); ok(r.chain, 'new migration runs'); ok(r.once, 'migration not repeated');
  // --- Ilmoita ongelma ---
  await p.click('#bugBtn'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.getElementById('bugBox').classList.contains('on')), 'bug dialog opens');
  await p.fill('#bugDesc', 'Salaojat-viiva meni vinoon');
  await p.evaluate(() => { window.__diag.errs.push({ m: 'testivirhe', at: 'x:1' }); });
  const rep = mode => p.evaluate(m => JSON.parse(window.__bugReport('kuvaus', m)), mode);
  const full = await rep('full'), anon = await rep('anon'), none = await rep('none');
  ok(full.projectData && full.projectData.trades[0].name && !/^Työlaji \d+$/.test(full.projectData.trades[0].name), 'full has names');
  ok(anon.projectData && anon.projectData.trades.every((t, i) => t.name === 'Työlaji ' + (i + 1)), 'anon trades');
  ok(anon.projectData.lt.every((n, i) => /^Sijainti \d+$/.test(n.name)), 'anon locations');
  const names = full.projectData.trades.map(t => t.name).concat(full.projectData.lt.map(n => n.name), full.projectData.groups.map(g => g.name)).filter(Boolean);
  const aj = JSON.stringify(anon); ok(names.every(n => !aj.includes('"' + n + '"')), 'anon has no original names');
  ok(!('imp' in anon.projectData) && none.projectData === null, 'anon drops import, none has no project');
  ok(anon.build && anon.schema >= 1 && Array.isArray(anon.errors) && anon.errors.some(e => e.m === 'testivirhe') && anon.lastActions.length > 0, 'report has build/errors/actions');
  // kirjoitettu teksti ei päädy toimintolokiin
  await p.evaluate(() => { const e = document.querySelector('[data-field="tname"]'); if (e) { e.value = 'Salainen nimi'; e.dispatchEvent(new Event('change', { bubbles: true })); } });
  ok(!JSON.stringify(await rep('none')).includes('Salainen nimi'), 'typed text not in action log');
  await p.click('#bugCopy'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.getElementById('bugMsg').textContent.length > 0), 'copy gives feedback');
  await p.click('#bugClose'); ok(!(await p.evaluate(() => document.getElementById('bugBox').classList.contains('on'))), 'closes');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
