const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n  Kerros 2\nTalo B\n  Kerros 1\n  Kerros 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);
await p.click('[data-ptog="locs"]');
await p.click('[data-ptog=st]');
await p.click('#vGantt');await p.waitForTimeout(300);
await p.screenshot({path:'smoke81a.png'});
// klikkaa Gantt-rivi nimestä (kolmas rivi)
const bb=await p.locator('#ganttSvg, #gSvg').first().boundingBox().catch(()=>null);
await p.mouse.click(135,620);await p.waitForTimeout(300);await p.screenshot({path:'smoke81b.png'});console.log(await p.evaluate(()=>document.getElementById('stCard')?.innerText.slice(0,260).replace(/\s+/g,' ')));
console.log(errs);await b.close();})();
