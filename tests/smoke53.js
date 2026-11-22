const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('button:has-text("Projekti")');await p.waitForTimeout(200);
await p.click('[data-pj="new"]');await p.fill('#pj-newname','Testi A');await p.click('[data-pj="newblank"]');await p.waitForTimeout(400);
console.log('chips',await p.locator('#chips button').allTextContents(),'subline',await p.textContent('#subline'));
await p.click('#projBtn');await p.waitForTimeout(150);await p.click('[data-pj="new"]');await p.click('[data-pj="newdefaults"]');await p.waitForTimeout(400);
console.log('chips',(await p.locator('#chips button').allTextContents()).length,errs);await b.close();})();
