const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const cnt=()=>p.evaluate(()=>document.querySelectorAll('#chart path[data-role="body"]').length);
const box=await p.locator('#chart').boundingBox();console.log(await cnt());
await p.mouse.move(box.x+700,box.y+300);await p.mouse.down();await p.mouse.move(box.x+800,box.y+200,{steps:6});await p.mouse.up();
console.log(await cnt());
// move a line body (drag) while panned
await p.mouse.move(box.x+700,box.y+300);await p.mouse.down();await p.mouse.move(box.x+500,box.y+300,{steps:6});await p.mouse.up();
await p.mouse.move(box.x+300,box.y+12);await p.mouse.down();await p.mouse.move(box.x+100,box.y+12,{steps:6});await p.mouse.up();
const t=await p.evaluate(()=>document.getElementById('summary').textContent);console.log(t,errs);await b.close();})();
