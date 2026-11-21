const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const info=()=>p.evaluate(()=>({weeks:document.getElementById('pj-weeks').value,hidden:document.getElementById('chartH').hidden,sl:document.getElementById('chartH').scrollLeft,axis:[...document.querySelectorAll('#chart text.ax')].map(t=>t.textContent).filter(x=>/^\d+$/.test(x)).slice(0,3).join(' ')}));
console.log(JSON.stringify(await info()));
const box=await p.locator('#chart').boundingBox();
await p.mouse.move(box.x+800,box.y+12);await p.mouse.down();await p.mouse.move(box.x+400,box.y+12,{steps:8});await p.mouse.up();
console.log('pan',JSON.stringify(await info()));
await p.screenshot({path:'shot33.png',clip:{x:0,y:250,width:1300,height:500}});
await p.mouse.move(box.x+500,box.y+100);await p.mouse.wheel(0,0);await p.evaluate(()=>{document.getElementById('chartH').scrollLeft=0});await p.waitForTimeout(150);console.log('sb0',JSON.stringify(await info()));
// draw a line still works
const n0=await p.locator('#chart [data-role="body"]').count();
await p.mouse.move(box.x+300,box.y+200);await p.mouse.down();await p.mouse.move(box.x+420,box.y+120,{steps:6});await p.mouse.up();
console.log('lines',n0,await p.locator('#chart [data-role="body"]').count());
console.log(errs);await b.close();})();
