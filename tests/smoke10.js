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
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1200,height:900}});await ctx.addInitScript(stub);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const url='file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html';
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto(url);await p.waitForSelector('#chart path');await p.waitForTimeout(300);
console.log('writes on load',await p.evaluate(()=>window.__writes||0));

await p.click('[data-ptog=list]');await p.click('#listCard .item >> nth=0');for(let i=0;i<3;i++) await p.keyboard.press('ArrowRight');
console.log('status',await p.textContent('#saveState'));
await p.waitForTimeout(1700);console.log('after wait',await p.textContent('#saveState'),'writes',await p.evaluate(()=>window.__writes||0));
// reload -> auto-open latest
await p.reload();await p.waitForSelector('#chart path');await p.waitForTimeout(500);
await p.click('[data-ptog=list]');
console.log('after reload runko',await p.$$eval('#listCard .item small',e=>e[0].textContent),'sub',await p.textContent('#subline'));
// rename + new project + list
await p.click('#projBtn');await p.fill('#pj-name','Kerrostalo A');await p.dispatchEvent('#pj-name','change');await p.waitForTimeout(1600);
await p.click('[data-pj=example]');await p.waitForTimeout(400);
console.log('lines in new',await p.$$eval('#listCard .item',e=>e.length),'projects',await p.$$eval('.pjrow',e=>e.map(x=>x.textContent.replace(/\s+/g,' '))));
// open the saved one
await p.click('.pjrow:not(.cur) [data-pj=open]');await p.waitForTimeout(300);
console.log('reopened lines',await p.$$eval('#listCard .item',e=>e.length),await p.inputValue('#pj-name'));
// export
await p.click('[data-pj=export]');const dl=await p.evaluate(()=>window.__dl[0]);console.log('export',dl.filename,JSON.parse(dl.data).state.lines.length);
// import
require('fs').writeFileSync('imp.json',dl.data);
await p.setInputFiles('[data-pjfile]','imp.json');await p.waitForTimeout(500);console.log('import name',await p.inputValue('#pj-name'));
// delete
await p.click('.pjrow:not(.cur) [data-pj=del]');await p.click('[data-pj=delok]');await p.waitForTimeout(400);
console.log('after delete',await p.$$eval('.pjrow',e=>e.length));
await p.screenshot({path:'shot10.png'});
console.log('errors',errs);await b.close();})();
