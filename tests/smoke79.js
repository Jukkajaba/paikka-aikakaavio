const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await (async()=>{await p.click('[data-ptog=list]');while(await p.locator('#listCard [data-act="del"]').count()){await p.locator('#listCard [data-act="del"]').first().click();}await p.click('[data-ptog=list]');})();const bb=await p.locator('#chart').boundingBox();
await p.mouse.move(bb.x+300,bb.y+300);await p.mouse.down();await p.mouse.move(bb.x+500,bb.y+150,{steps:6});await p.mouse.up();await p.waitForTimeout(150);
const crew=async()=>p.evaluate(()=>{const b=[...document.querySelectorAll('#panel button')].find(x=>x.dataset.act==='crew+');return b?b.parentElement.innerText.replace(/\s+/g,' '):'?'});
const out=[];for(let i=0;i<12;i++){out.push(await crew());await p.click('#panel [data-act="crew+"]');await p.waitForTimeout(80);}
console.log(out.join('\n'));
for(let i=0;i<14;i++){await p.click('#panel [data-act="crew-"]');await p.waitForTimeout(60);}
console.log('down',await crew(),errs);await b.close();})();
