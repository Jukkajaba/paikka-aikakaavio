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
  await p.click('#resBtn'); await p.fill('#rp-new', 'Kaivinkone'); await p.click('[data-ract="add"]'); await p.waitForTimeout(300); await p.click('#resBtn');
  await p.click('#impBtn'); await p.fill('#impTxt', "Littera\tSuorite\tMäärä\tYksikkö\tK1\tK2\n1\tRak\t\t\t\t\n1.1\tLaatta\t200\tm2\t120\t80"); await p.click('#impParse');
  await p.fill('[data-ip="0"]', '25'); await p.dispatchEvent('[data-ip="0"]', 'change'); await p.click('#impGo'); await p.waitForTimeout(2500);
  await p.reload(); await p.waitForSelector('#chart path'); await p.waitForTimeout(1000);
  await p.click('#impBtn');
  ok((await p.inputValue('#impTxt')).indexOf('Laatta') >= 0, 'text restored after reload');
  ok(+await p.inputValue('[data-ip="0"]') === 25, 'row settings restored ' + await p.inputValue('[data-ip="0"]'));
  await p.evaluate(() => document.getElementById('impBox').classList.remove('on')); await p.click('#resBtn'); await p.waitForTimeout(200); ok((await p.locator('#resCard').innerText()).indexOf('Kaivinkone') >= 0 || (await p.locator('#resCard input[data-rf="name"]').evaluateAll(a => a.map(x => x.value))).indexOf('Kaivinkone') >= 0, 'resources restored after reload');
  ok(!errs.length, 'errors ' + errs.join('|')); console.log(fail ? 'FAIL' : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
