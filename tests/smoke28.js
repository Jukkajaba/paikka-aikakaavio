const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
await p.click('#depClear');
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
const st=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].filter((t,i)=>i%4==0).slice(0,16).map(t=>t.textContent).join(' '));
const n=()=>p.evaluate(()=>document.querySelectorAll('#gantt [data-gr="gdeppick"]').length);
console.log(await st());
await p.keyboard.down('Control');await p.mouse.move(box.x+400,rowY(0));await p.mouse.down();await p.mouse.move(box.x+500,rowY(7),{steps:6});await p.mouse.up();await p.keyboard.up('Control');
console.log('n',await n());console.log(await st());
// same line group->own task rejected
await p.keyboard.down('Control');await p.mouse.move(box.x+400,rowY(0));await p.mouse.down();await p.mouse.move(box.x+500,rowY(3),{steps:6});await p.mouse.up();await p.keyboard.up('Control');
console.log('same-line n',await n());
// reverse (cycle)
await p.keyboard.down('Control');await p.mouse.move(box.x+500,rowY(7));await p.mouse.down();await p.mouse.move(box.x+400,rowY(0),{steps:6});await p.mouse.up();await p.keyboard.up('Control');
console.log('cycle n',await n());
await p.screenshot({path:'shot28.png',clip:{x:40,y:300,width:1200,height:420}});
await p.selectOption('#gGroup','loc');console.log('loc grouping n',await n());
await p.click('#vFlow');await p.waitForTimeout(200);console.log(errs);await p.screenshot({path:'shot28b.png'});await b.close();})();
