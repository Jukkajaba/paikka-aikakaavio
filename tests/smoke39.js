const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const cnt=()=>p.evaluate(()=>document.querySelectorAll('#chart path[data-role="body"]').length);
const box=await p.locator('#chart').boundingBox();console.log(await cnt());
await p.keyboard.down('Control');await p.mouse.move(box.x+700,box.y+300);await p.mouse.down();await p.mouse.move(box.x+800,box.y+200,{steps:6});await p.mouse.up();await p.keyboard.up('Control');
console.log('ctrl draw',await cnt());
await p.mouse.move(box.x+700,box.y+300);await p.mouse.down();await p.mouse.move(box.x+800,box.y+200,{steps:6});await p.mouse.up();
console.log('no ctrl draw',await cnt(),errs);await b.close();})();
