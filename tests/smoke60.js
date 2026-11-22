const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog=bl]');await p.click('[data-bl="save"]');await p.waitForTimeout(100);
console.log('open',await p.locator('#chart path[stroke-dasharray="2 5"]').count());
await p.click('[data-close="bl"]');await p.waitForTimeout(100);console.log('closed',await p.locator('#chart path[stroke-dasharray="2 5"]').count());
await p.click('[data-ptog=bl]');await p.waitForTimeout(100);console.log('reopen',await p.locator('#chart path[stroke-dasharray="2 5"]').count(),errs);await b.close();})();
