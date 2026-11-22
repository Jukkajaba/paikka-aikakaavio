const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n  Kerros 2\nTalo B\n  Kerros 1\n  Kerros 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);await p.click('[data-ptog="locs"]');
await p.click('#vGantt');await p.selectOption('#gGroup','loc');await p.waitForTimeout(400);
const info=()=>p.evaluate(()=>[...document.querySelectorAll('[data-gr="glmove"],[data-gr="gmove"]')].slice(0,9).map(r=>r.dataset.gr[1]+Math.round(r.getBoundingClientRect().x)).join(' '));
console.log('ennen',await info());
const hs=await p.evaluate(()=>[...document.querySelectorAll('[data-gr="glmove"]')].map(r=>{const b=r.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width)]}));
const r=hs[1];console.log('otsikkopalkit',hs.length,JSON.stringify(hs.slice(0,3)));
await p.mouse.move(r[0]+r[2]/2,r[1]+10);await p.mouse.down();await p.mouse.move(r[0]+r[2]/2+60,r[1]+10,{steps:5});await p.mouse.up();await p.waitForTimeout(300);
console.log('jälkeen',await info());await p.screenshot({path:'smoke82.png'});
await p.click('#undoBtn').catch(()=>{});
console.log(errs);await b.close();})();
