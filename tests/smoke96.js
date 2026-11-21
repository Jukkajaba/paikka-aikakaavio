const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\nTalo B\n  Kerros 1\n    Asunto 1\n    Asunto 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);await p.click('[data-ptog="locs"]');
await p.click('#vGantt');await p.click('[data-ptog=st]');await p.waitForTimeout(300);
const snap=()=>p.$$eval('#gantt rect',e=>{const m={};e.forEach(x=>{const f=(x.getAttribute('fill')||'')+'/'+(x.getAttribute('opacity')||'');if(/t-|#000|ink/.test(f))m[f]=(m[f]||0)+1});return JSON.stringify(m)});
await p.selectOption('#gGroup','trade');await p.selectOption('#lvlSel','3').catch(()=>{});await p.waitForTimeout(300);
console.log('start',await snap());
const names=()=>p.$$eval('#gantt text.gt',e=>e.map(x=>x.firstChild.textContent));
console.log(await names());
for(let i=0;i<6;i++){const e=await p.$$('#gantt text.gt');const k=Math.min(e.length-1,i*2+1);const bb=await e[k].boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(200);console.log('click',k,await snap());}
console.log('virheet',errs);await b.close();})();
