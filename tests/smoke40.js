const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');await p.click('#depClear');
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
const st=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].filter(t=>/^(ma|ti|ke|to|pe) /.test(t.textContent)).slice(14,16).map(t=>t.textContent).join(' '));
const cols=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt path[fill="none"]')].filter(e=>!e.dataset.gr).map(e=>e.getAttribute('stroke')));
console.log('Ikkunat K1 before',await st());
// Runko K1 (row1) -> Ikkunat K1 (row 8)
await p.keyboard.down('Control');await p.mouse.move(box.x+400,rowY(1));await p.mouse.down();await p.mouse.move(box.x+500,rowY(8),{steps:5});await p.mouse.up();await p.keyboard.up('Control');
console.log('after create',await st(),await cols());
await p.screenshot({path:'shot40.png',clip:{x:40,y:300,width:1200,height:420}});
const bar=await p.locator('#gantt [data-gr="gmove"][data-gi="8"]').boundingBox();
await p.mouse.move(bar.x+bar.width/2,bar.y+bar.height/2);await p.mouse.down();await p.mouse.move(bar.x+bar.width/2-300,bar.y+bar.height/2,{steps:8});await p.mouse.up();
console.log('dragged earlier',await st(),await cols());
console.log(errs);await b.close();})();
