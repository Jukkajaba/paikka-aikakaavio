const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const names=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gg')].map(t=>t.textContent.slice(0,t.textContent.length/2)).join(','));
console.log(await names());
const box=await p.locator('#gantt').boundingBox();
// drag Runko group bar far right
const y=box.y+13;await p.mouse.move(box.x+500,y);await p.mouse.down();await p.mouse.move(box.x+900,y,{steps:8});await p.mouse.up();
console.log(await names());
await p.selectOption('#gGroup','loc');console.log(errs);await b.close();})();
