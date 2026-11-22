const {chromium}=require('playwright');
const stub=()=>{
  const KEY='stubdb';const load=()=>JSON.parse(localStorage.getItem(KEY)||'{}');const save=o=>localStorage.setItem(KEY,JSON.stringify(o));
  const subs=[];const notify=()=>subs.forEach(f=>f());
  const snapDocs=()=>{const o=load();return Object.keys(o).filter(k=>k.startsWith('projects/')).map(k=>({id:k.split('/')[1],data:()=>o[k]})).sort((a,b)=>String(b.data().updated).localeCompare(String(a.data().updated)));};
  const db={doc:p=>({set:async d=>{const o=load();o[p]=JSON.parse(JSON.stringify(d));save(o);window.__writes=(window.__writes||0)+1;setTimeout(notify,0);},get:async()=>({exists:!!load()[p],data:()=>load()[p]}),delete:async()=>{const o=load();delete o[p];save(o);setTimeout(notify,0);}}),
    collection:p=>{const q={orderBy:()=>q,limit:()=>q,onSnapshot:(next)=>{const f=()=>{const d=snapDocs();next({docs:d,size:d.length,empty:!d.length});};subs.push(f);setTimeout(f,0);return()=>{}}};return q;}};
  window.__dl=[];
  window.claude={use:async n=>n==='db'?db:n==='downloads'?{save:async r=>{window.__dl.push(r);return{status:'saved'};}}:null};
};

(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1400, height: 900 } }); await ctx.addInitScript(stub);
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(600);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  // uudemman version projekti: avautuu, mutta sitä ei tallenneta takaisin
  await p.evaluate(() => { const st = JSON.parse(JSON.stringify(__aik().stateObj())); st.v = 999; st.tulevaKentta = { a: 1 }; const o = JSON.parse(localStorage.getItem('stubdb') || '{}'); o['projects/pnew'] = { name: 'Tuleva', state: st, updated: new Date(Date.now() + 1000).toISOString() }; localStorage.setItem('stubdb', JSON.stringify(o)); });
  await p.reload(); await p.waitForSelector('#chart path'); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => /Vain katselu/.test(document.getElementById('saveState').textContent || '')), 'read-only notice ' + await p.evaluate(() => document.getElementById('saveState').textContent));
  const w0 = await p.evaluate(() => window.__writes || 0);
  await p.click('#vGantt'); await p.click('#gAddTask'); await p.waitForTimeout(2500);
  ok(await p.evaluate(w0 => (window.__writes || 0) === w0, w0), 'no writes for newer-version project');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('stubdb'))['projects/pnew'].state.v === 999), 'stored data untouched');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
