const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].map(x=>x.textContent).join(' ').slice(0,0)+[...document.querySelectorAll('#gantt text.gt')].filter(t=>!t.classList.contains('gg')&&t.textContent.length>3).slice(0,16).map(t=>t.textContent.slice(0,t.textContent.length/2)).join('|'));
const starts=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].filter((t,i)=>i%4==0).slice(0,18).map(t=>t.textContent).join(' '));
console.log(await starts());
// Ikkunat K1 (row 8) -> Runko K1 (row 1): Runko is earlier than Ikkunat; link Ikkunat K3 (row10) -> Runko K6 (row 6)?? use Runko K6 end -> Ikkunat K1 start
await p.keyboard.down('Control');await p.mouse.move(box.x+600,rowY(2));await p.mouse.down();await p.mouse.move(box.x+500,rowY(8),{steps:5});await p.mouse.up();await p.keyboard.up('Control');
console.log(await starts());
console.log(errs);await b.close();})();
