const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n    Asunto 1\nTalo B\n  Kerros 1\n    Asunto 1');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#chart text.loc')].map(t=>t.firstChild.textContent).join('|'));
await p.selectOption('#lvlSel','2');await p.waitForTimeout(200);const a=await rows();
await p.locator('#chart text.loc').first().click({force:true});await p.waitForTimeout(150);
console.log('taso2',a,'| klikkauksen jälkeen sama:',a===await rows());
const bt=p.locator('#locCard [data-act="loccol"]').first();if(await bt.count()){await bt.click();await p.waitForTimeout(150);}
console.log('paneelin supistus ei muuta kaaviota:',a===await rows(),await p.locator('#lvlSel').inputValue(),errs);await b.close();})();
