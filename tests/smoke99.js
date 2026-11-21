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
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.addInitScript(stub);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const url='file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html';
await p.goto(url);await p.waitForSelector('#chart path');await p.waitForTimeout(500);
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\nTalo B\n  Kerros 1\n    Asunto 1\n    Asunto 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);await p.click('[data-ptog="locs"]');
await p.selectOption('#lvlSel','2');await p.waitForTimeout(200);
await p.click('#fltBtn');await p.locator('.flr:has-text("Talo B") .fonly').first().click({force:true});await p.waitForTimeout(200);await p.keyboard.press('Escape');
const st=()=>p.evaluate(()=>({lvl:document.getElementById('lvlSel').value,flt:document.getElementById('fltBtn').textContent,save:document.getElementById('saveState').textContent}));
console.log('before',await st());
await p.waitForTimeout(2000);console.log('writes',await p.evaluate(()=>window.__writes||0),await st());
await p.reload();await p.waitForSelector('#chart path');await p.waitForTimeout(800);
console.log('after reload',await st());
// gantt level
await p.click('#vGantt');await p.waitForTimeout(300);await p.selectOption('#lvlSel','x');await p.waitForTimeout(2000);
await p.reload();await p.waitForTimeout(800);console.log('gantt after reload',await p.evaluate(()=>document.getElementById('vGantt').getAttribute('aria-pressed')),await st());
// uusi projekti ei peri rajausta
await p.click('#projBtn');await p.click('[data-pj=example]');await p.waitForTimeout(800);console.log('new project',await st());
console.log('virheet',errs);await b.close();})();
