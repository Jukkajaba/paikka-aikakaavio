// Satunnaistesti ("apina"): tekee satunnaisia käyttötoimintoja ja tarkistaa eheysehdot jokaisen jälkeen.
// Käyttö: SEED=1 N=150 node tests/fuzz.js   (palauttaa 1 jos ehto rikkoutuu; tulostaa toimintojen jäljen)
const { chromium } = require('playwright');
const SEED = +(process.env.SEED || 1), N = +(process.env.N || 150);
let s = SEED * 2654435761 % 4294967296; const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }, pick = a => a[Math.floor(rnd() * a.length)];
const EXCL = '[data-pj="del"],[data-pj="delok"],[data-pj="export"],#helpBtn,#impClose,#projBtn,[data-act="mdlopen"]';
const INV = () => {
  const A = __aik(), e = [], ids = new Set(A.LOCS.map(x => x.id)), lid = new Set(A.lines.map(l => String(l.id))), gid = new Set(A.groups.map(g => g.id));
  const seen = new Set(); A.LT.forEach(n => { if (seen.has(n.id)) e.push('dup LT id ' + n.id); seen.add(n.id); });
  A.LT.forEach(n => { if (n.par && !seen.has(n.par)) e.push('LT parent missing'); });
  A.lines.forEach(l => {
    if (l.grp && !gid.has(l.grp)) e.push('line ' + l.id + ' group missing');
    if (!A.trade(l.trade)) e.push('line ' + l.id + ' trade missing');
    if (l.flat) return;
    if (!ids.has(l.from) || !ids.has(l.to)) { e.push('line ' + l.id + ' range ids'); return; }
    if (l.skip && l.skip.some(i => !ids.has(i))) e.push('line ' + l.id + ' skip ids');
    let ts; try { ts = A.tasks(l); } catch (x) { e.push('tasks throw ' + l.id + ' ' + x.message); return; }
    if (!ts.length) e.push('line ' + l.id + ' no tasks');
    ts.forEach(t => { if (!isFinite(t.s) || !isFinite(t.e) || t.e <= t.s) e.push('line ' + l.id + ' bad time ' + t.s + '-' + t.e); if (!isFinite(t.crew) || t.crew < 1) e.push('line ' + l.id + ' crew ' + t.crew); if (!ids.has(t.locId)) e.push('task loc'); });
    if (!isFinite(A.totalQty(l))) e.push('line ' + l.id + ' qty');
  });
  A.deps.forEach(d => ['a', 'b'].forEach(k => { const r = d[k]; if (r.g != null ? !gid.has(r.g) : !lid.has(String(r.l))) e.push('dep ref missing'); }));
  const html = document.getElementById('chart').outerHTML; if (/NaN|undefined|Infinity/.test(html)) e.push('chart has NaN/undefined/Infinity');
  const g = document.getElementById('gantt'); if (g && /NaN|undefined|Infinity/.test(g.outerHTML)) e.push('gantt has NaN/undefined/Infinity');
  const tx = document.body.innerText; if (/\bNaN\b|undefined|Infinity/.test(tx)) e.push('text has NaN/undefined: ' + (tx.match(/.{0,25}(NaN|undefined|Infinity).{0,15}/) || [''])[0].replace(/\n/g, ' '));
  try { JSON.stringify(A.stateObj()); } catch (x) { e.push('state not serialisable'); }
  return e;
};
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1400, height: 950 } }), errs = [], trace = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept().catch(() => { }));
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(400);
  await p.evaluate(() => { window.confirm = () => true; window.alert = () => { }; window.prompt = () => ''; });
  const NUMV = ['0', '-3', '1', '2', '7', '25', '100', '1e9', '', '0.1', '3.5', '999999'];
  const TXT = ['Lohko', 'a'.repeat(40), '', 'Ö ä å', '<b>x</b>', '1.2'];
  const SAMPLE = ["Littera\tSuorite\tMäärä\tYksikkö\tKerros 1\tKerros 2\tKerros 3\n1\tRunko\t\t\t\t\t\n1.1\tElementit\t300\tm2\t100\t100\t100\n1.2\tOntelolaatat\t600\tm2\t200\t200\t200\n2\tJulkisivu\t\t\t\t\t\n2.1\tTiili\t300\tm2\t100\t100\t100", "Suorite\tMäärä\tYks\nLaatta\t500\tm2\nMuotti\t800\tm2"];
  for (let i = 0; i < N; i++) {
    const r = rnd(); let desc = '';
    try {
      if (r < 0.46) { // klikkaa satunnaista näkyvää painiketta
        const idx = await p.evaluate(sel => { const els = [...document.querySelectorAll('button:not([disabled]),[data-act],.chip')].filter(e => !e.matches(sel) && e.offsetParent !== null && !e.closest('#impBox')); const k = els.length; window.__els = els; return k; }, EXCL);
        if (idx) { const k = Math.floor(rnd() * idx); desc = 'click ' + await p.evaluate(k => { const e = window.__els[k]; return (e.id || e.dataset.act || e.dataset.pj || e.dataset.ract || e.dataset.field || e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 18) + ' [' + (e.closest('[data-p]') ? e.closest('[data-p]').dataset.p : 'main') + ']'; }, k); trace.push('(about to) ' + desc); await p.evaluate(k => { window.__els[k].click(); }, k); }
      } else if (r < 0.62) { // muuta satunnaista kenttää
        const n = await p.evaluate(() => { const els = [...document.querySelectorAll('input:not([type=file]):not([type=checkbox]):not([type=radio]),select,textarea')].filter(e => e.offsetParent !== null && !e.closest('#impBox') && !e.disabled && e.id !== 'pj-name'); window.__els = els; return els.length; });
        if (n) { const k = Math.floor(rnd() * n), v = pick(NUMV), tv = pick(TXT), oi = rnd();
          trace.push('(about to) set #' + k + ' ' + await p.evaluate(k => { const e = window.__els[k]; return (e.id || e.dataset.field || e.dataset.rf || e.className) + ' in ' + (e.closest('[data-p]') ? e.closest('[data-p]').dataset.p : 'main'); }, k) + ' v=' + v + ' tv=' + tv);
          desc = 'set ' + await p.evaluate(([k, v, tv, oi]) => { const e = window.__els[k]; let val; if (e.tagName === 'SELECT') { e.selectedIndex = Math.floor(oi * e.options.length); val = e.value; } else if (e.type === 'number' || e.classList.contains('num')) { e.value = v; val = v; } else { e.value = tv; val = tv; } e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return (e.id || e.dataset.field || e.dataset.rf || e.className) + '=' + val; }, [k, v, tv, oi]); }
      } else if (r < 0.70) { // valintaruutu
        const n = await p.evaluate(() => { const els = [...document.querySelectorAll('input[type=checkbox],input[type=radio]')].filter(e => e.offsetParent !== null && !e.closest('#impBox') && !e.disabled); window.__els = els; return els.length; });
        if (n) { const k = Math.floor(rnd() * n); desc = 'check ' + await p.evaluate(k => { const e = window.__els[k]; e.click(); return e.dataset.field || e.id || e.name; }, k); }
      } else if (r < 0.86) { // piirtoalue: klikkaus tai vedon aloitus satunnaisesta kohdasta
        const box = await p.evaluate(() => { const e = document.getElementById('chart').offsetParent ? document.getElementById('chart') : document.getElementById('gantt'); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; });
        if (box && box.w > 50) { const x = box.x + 60 + rnd() * (box.w - 80), y = box.y + 30 + rnd() * Math.max(20, box.h - 50), x2 = x + (rnd() - 0.5) * 300, y2 = y + (rnd() - 0.5) * 120, mod = rnd() < 0.15 ? 'Control' : rnd() < 0.1 ? 'Shift' : null;
          desc = 'drag ' + Math.round(x) + ',' + Math.round(y) + '→' + Math.round(x2) + ',' + Math.round(y2) + (mod ? ' +' + mod : ''); if (mod) await p.keyboard.down(mod);
          await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x2, y2, { steps: 4 }); await p.mouse.up(); if (mod) await p.keyboard.up(mod);
          if (rnd() < 0.3) { await p.mouse.click(x2, y2); await p.mouse.click(x2, y2); desc += ' +dbl'; } }
      } else if (r < 0.90) { desc = 'import'; await p.evaluate(txt => { document.getElementById('impBtn').click(); document.getElementById('impTxt').value = txt; document.getElementById('impParse').click(); document.getElementById('impGo').click(); document.getElementById('impBox').classList.remove('on'); }, pick(SAMPLE)); }
      else if (r < 0.94) { desc = 'undo'; await p.evaluate(() => document.getElementById('undo').click()); }
      else { const v = pick(['vFlow', 'vGantt']); desc = 'view ' + v; await p.evaluate(v => document.getElementById(v).click(), v); }
    } catch (err) { desc += ' [driver: ' + err.message.split('\n')[0] + ']'; }
    trace.push(desc); try { await p.waitForTimeout(25); } catch (err) { console.log('CRASH seed', SEED, 'step', i, err.message.split('\n')[0], '\n  trace(last 8): ' + trace.slice(-8).join(' | ')); process.exit(1); }
    let e = []; try { e = await p.evaluate(INV); } catch (err) { e = ['inv throw ' + err.message]; }
    if (errs.length) e.push('pageerror: ' + errs[0]);
    if (e.length) { console.log('FAIL seed', SEED, 'step', i, '\n  ' + e.slice(0, 4).join('\n  ') + '\n  trace(last 8): ' + trace.slice(-8).join(' | ')); await b.close(); process.exit(1); }
  }
  if (process.env.TQ) { for (const v of process.env.TQ.split(',')) { const t0 = Date.now(); try { await p.evaluate(v => { const e = document.querySelector('[data-field="tq-v"]') || document.querySelector('#f-tqty'); if (!e) throw new Error('no tq'); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, v); console.log('tq', v, Date.now() - t0, 'ms', JSON.stringify(await p.evaluate(() => { const A = __aik(); const l = A.lines.find(q => q.id === A.selId); return l ? { crew: A.tasks(l).map(t => t.crew).slice(0, 3), qty: A.totalQty(l) } : null; }))); } catch (err) { console.log('tq', v, 'ERR', err.message.split('\n')[0]); break; } } }
  if (process.env.WAIT) { await p.waitForTimeout(+process.env.WAIT); console.log('after wait', await p.evaluate(() => document.body.innerHTML.length)); }
  if (process.env.DUMP) console.log(JSON.stringify(await p.evaluate(() => { const A = __aik(); return { lines: A.lines.length, locs: A.LOCS.length, lt: A.LT.length, tasks: A.lines.reduce((m, l) => m + (l.flat ? 1 : A.tasks(l).length), 0), maxd: A.lines.map(l => l.flat ? 0 : Math.max.apply(null, A.tasks(l).map(t => t.e))).sort((a, b) => b - a)[0], rows: A.gRows.length, html: document.body.innerHTML.length }; })));
  if (process.env.VERBOSE) console.log(trace.join('\n'));
  console.log('OK seed', SEED, N, 'steps'); await b.close();
})();
