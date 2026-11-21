const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message+(e.stack||'').split('\n')[1]));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const bd=p.locator('#chart path[data-role="body"]').first();const bb=await bd.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(100);
await p.click('[data-ptog=st]');await p.waitForTimeout(150);
const pcts=p.locator('#stCard [data-field="apct"]');console.log('pct inputs',await pcts.count());
await pcts.nth(0).fill('100');await pcts.nth(0).dispatchEvent('change');await p.waitForTimeout(100);
const pc2=p.locator('#stCard [data-field="apct"]');await pc2.nth(1).fill('50');await pc2.nth(1).dispatchEvent('change');await p.waitForTimeout(100);
// status date
await p.click('[data-ptog=bl]');await p.fill('#st-day','2027-01-20');await p.dispatchEvent('#st-day','change');await p.waitForTimeout(150);
console.log('actual paths',await p.locator('#chart path[stroke-width="3"]').count(),'status line',await p.locator('#chart line[stroke="#e08a1e"]').count());
console.log('panel',(await p.textContent('#blCard')).slice(0,260).replace(/\s+/g,' '));
await p.screenshot({path:'shot58a.png'});
await p.click('#vGantt');await p.waitForTimeout(200);
console.log('hdr',await p.evaluate(()=>[...document.querySelectorAll('#ganttHead text.ax')].map(t=>t.textContent).filter(x=>x.length>1).join(',')),await p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].slice(0,10).map(t=>t.textContent).join(' ')));
await p.screenshot({path:'shot58b.png'});console.log(errs);await b.close();})();
