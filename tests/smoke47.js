const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');await p.click('#depClear');
await p.click('#gAddTask');await p.selectOption('#lvlSel','x');await p.waitForTimeout(100);
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
const names=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gt')].filter(t=>t.textContent.length>3).map(t=>t.textContent.slice(0,t.textContent.length/2)).join('|'));
const st=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].map(t=>t.textContent).filter(x=>/^(ma|ti|ke|to|pe) /.test(x)).filter((t,i)=>i%2==0).join(' '));
console.log(await names());console.log(await st());
// Runko(0) -> flat(6)
await p.keyboard.down('Control');await p.mouse.move(box.x+500,rowY(0));await p.mouse.down();await p.mouse.move(box.x+400,rowY(6),{steps:6});await p.mouse.up();
console.log('deps',await p.locator('#gantt [data-gr="gdeppick"]').count());
// flat(6) -> Ikkunat(1)? cycle-free: flat -> Levytys(4)
await p.mouse.move(box.x+400,rowY(6));await p.mouse.down();await p.mouse.move(box.x+500,rowY(4),{steps:6});await p.mouse.up();await p.keyboard.up('Control');
console.log('deps',await p.locator('#gantt [data-gr="gdeppick"]').count());console.log(await st());
await p.screenshot({path:'shot47.png',clip:{x:40,y:300,width:1200,height:300}});
await p.click('#vFlow');await p.waitForTimeout(100);console.log('flow arrows',await p.locator('#chart [data-role="dep"]').count(),errs);
await b.close();})();
