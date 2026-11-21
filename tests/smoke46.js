const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:1300}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
await p.click('#gAddTask');await p.waitForTimeout(100);
const info=()=>p.evaluate(()=>{const t=[...document.querySelectorAll('#gantt text.gc')].map(t=>t.textContent).filter(x=>/^(ma|ti|ke|to|pe) |^\d/.test(x));return t.slice(-4).join(' ')});
console.log('start',await info());
const h=await p.locator('#gantt [data-gr="gend"]').last().boundingBox();
await p.mouse.move(h.x+h.width/2,h.y+h.height/2);await p.mouse.down();await p.mouse.move(h.x+h.width/2+40,h.y+h.height/2,{steps:5});await p.mouse.up();
console.log('after end drag',await info());
// move bar
const m=await p.locator('#gantt [data-gr="gmove"]').last().boundingBox();
await p.mouse.move(m.x+m.width/2,m.y+m.height/2);await p.mouse.down();await p.mouse.move(m.x+m.width/2+60,m.y+m.height/2,{steps:5});await p.mouse.up();
console.log('after move',await info());
// dependency Runko K6 row6 -> flat
const box=await p.locator('#gantt').boundingBox();
const lastGi=await p.evaluate(()=>[...document.querySelectorAll('#gantt [data-gr="gmove"]')].pop().dataset.gi);
const sc=await p.evaluate(()=>document.getElementById('ganttScroll').scrollTop);
await p.evaluate(()=>{document.getElementById('ganttScroll').scrollTop=0});await p.waitForTimeout(100);
const r6=await p.locator('#gantt [data-gr="gmove"][data-gi="6"]').boundingBox();
await p.evaluate((s)=>{document.getElementById('ganttScroll').scrollTop=s},sc);await p.waitForTimeout(100);
const fl=await p.locator('#gantt [data-gr="gmove"]').last().boundingBox();
// both visible? make scroll container tall via viewport; use bars
console.log('rows',lastGi,sc);
console.log(errs);await b.close();})();
