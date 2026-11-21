const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
console.log('chips',await p.$$eval('#ptog [data-ptog]',e=>e.map(x=>x.textContent)),'projBtn',await p.locator('#projBtn').count());
await p.click('[data-ptog=lista]');console.log('lista',await p.isVisible('#listCard'),await p.isVisible('#notes'));
await p.click('.fp[data-p=lista] [data-tab=notes]');console.log('notes',await p.isVisible('#listCard'),await p.isVisible('#notes'));
await p.click('[data-seurbtn]');
for(const t of ['bl','st','fc']){await p.click('.fp[data-p=seur] [data-tab='+t+']');console.log(t,await p.isVisible('#blCard'),await p.isVisible('#stCard'),await p.isVisible('#fcCard'));}
await p.click('#projBtn');console.log('proj',await p.isVisible('.fp[data-p=proj]'));
await p.click('.fp[data-p=seur] [data-close=seur]');console.log('seur closed',await p.isVisible('.fp[data-p=seur]'));
await p.reload();await p.waitForSelector('#chart path');console.log('persist',await p.isVisible('.fp[data-p=lista]'),await p.isVisible('.fp[data-p=proj]'));
console.log('virheet',errs);await b.close();})();
