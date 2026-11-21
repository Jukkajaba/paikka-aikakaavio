const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');
await p.waitForSelector('#chart path');
const vis=()=>p.$$eval('.fp',e=>e.map(x=>x.dataset.p+':'+!x.hidden).join(' '));
console.log(await vis());
await p.click('[data-ptog=locs]');await p.click('[data-ptog=notes]');console.log('pos',await p.$$eval('.fp:not([hidden])',e=>e.map(x=>x.dataset.p+' '+x.style.left)));
console.log(await vis());
const bar=await p.$('.fp[data-p=locs] .fp-bar');const bb=await bar.boundingBox();
await p.mouse.move(bb.x+60,bb.y+10);await p.mouse.down();await p.mouse.move(bb.x-500,bb.y+60,{steps:6});await p.mouse.up();
console.log('locs left', await p.$eval('.fp[data-p=locs]',e=>e.style.left+' '+e.style.top));
await p.click('[data-act=locsplit]'); // functional inside floating panel
console.log('locrows',await p.$$eval('#locCard .locrow',e=>e.length));
await p.click('.fp[data-p=notes] [data-close]');
console.log(await vis());
await p.screenshot({path:'shot2.png'});
await p.click('[data-ptog=locs]');await p.click('[data-ptog=locs]');
await p.setViewportSize({width:390,height:800});await p.waitForTimeout(300);
console.log('narrow pos',await p.$eval('.fp[data-p=panel]',e=>getComputedStyle(e).position));
console.log('errors',errs);await b.close();})();
