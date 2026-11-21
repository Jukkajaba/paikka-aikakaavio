const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');
await p.waitForSelector('#chart path');
const cnt=()=>p.$$eval('#listCard .item',e=>e.length);
console.log('lines',await cnt());
await p.click('[data-ptog=locs]');
// split Kerros 3
await p.click('[data-act=locsplit][data-id=l3]');
console.log('locs',await p.$$eval('#locCard .locrow',e=>e.length));
// rename
await p.fill('[data-field=locname][data-id=l1]','Kellari');await p.dispatchEvent('[data-field=locname][data-id=l1]','change');
// add loc
await p.click('[data-act=locadd]');
console.log('locs',await p.$$eval('#locCard .locrow',e=>e.length));
// draw
const box=await p.$eval('#chart',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y}});
await p.mouse.move(box.x+400,box.y+40);await p.mouse.down();await p.mouse.move(box.x+600,box.y+160,{steps:8});await p.mouse.up();
console.log('lines',await cnt());
// task edit
await p.click('#panel details:not([data-sec="trade"]) summary >> nth=0');
await p.fill('#panel [data-field=tname]','Eka tehtävä');await p.dispatchEvent('#panel [data-field=tname]','change');
await p.click('#panel [data-act="tdur+"]');
// delete loc
await p.click('[data-act=locdel][data-id=l2]');
console.log('locs',await p.$$eval('#locCard .locrow',e=>e.length),'lines',await cnt());
await p.click('#undo');
console.log('after undo locs',await p.$$eval('#locCard .locrow',e=>e.length));
await p.screenshot({path:'shot.png',fullPage:true});
await p.setViewportSize({width:390,height:800});await p.waitForTimeout(200);
await p.screenshot({path:'shot-m.png',fullPage:true});
console.log('errors',errs);
await b.close();})();
