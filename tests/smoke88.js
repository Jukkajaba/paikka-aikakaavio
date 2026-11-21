const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
console.log('oletuspuu (tasoja):',await p.locator('#lvlSel option').count(),'näkyy',await p.locator('#lvlSel').isVisible());
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Kerros 1\nKerros 2\nKerros 3');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(250);
console.log('yksitasoinen puu: näkyy',await p.locator('#lvlSel').isVisible());
await p.click('#vGantt');await p.waitForTimeout(200);console.log('gantt: näkyy',await p.locator('#lvlSel').isVisible(),errs);
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n  Kerros 2').catch(()=>{});
await b.close();})();
