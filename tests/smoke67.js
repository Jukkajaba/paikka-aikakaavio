const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');await p.click('#depClear');
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
const nd=()=>p.evaluate(()=>document.querySelectorAll('#gantt [data-gr="gdeppick"]').length);
const mk=async(a,c)=>{await p.keyboard.down('Control');await p.mouse.move(box.x+520,rowY(a));await p.mouse.down();await p.mouse.move(box.x+520,rowY(c),{steps:6});await p.mouse.up();await p.keyboard.up('Control');};
await p.click('[data-ptog=list]');const ln=()=>p.evaluate(()=>document.querySelectorAll('#listCard .list > *').length);console.log('lines0',await ln());await mk(0,1);await mk(1,2);await mk(2,3);
console.log('deps',await nd(),'bars',await p.locator('#gantt [data-gr="gmove"]').count());
for(let i=0;i<4;i++){await p.keyboard.press('Delete');console.log('after Delete',i+1,await nd(),'lines',await ln());}
console.log(errs);await b.close();})();
