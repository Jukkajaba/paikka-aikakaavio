const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const info=()=>p.evaluate(()=>({weeks:document.getElementById('pj-weeks').value,hidden:document.getElementById('ganttH').hidden,sl:document.getElementById('ganttH').scrollLeft,hw:document.getElementById('ganttHi').style.width,axis:[...document.querySelectorAll('#ganttHead text.ax')].map(t=>t.textContent).slice(-8).join(' ')}));
console.log(await info());
const box=await p.locator('#gantt').boundingBox();
// drag pan on empty area of row 6 (Runko K6 row, far right empty)
const y=box.y+6*26+13;
await p.mouse.move(box.x+900,y);await p.mouse.down();await p.mouse.move(box.x+500,y,{steps:8});await p.mouse.up();
console.log('after pan',await info());
await p.screenshot({path:'shot32a.png',clip:{x:0,y:300,width:1300,height:450}});
// wheel
await p.mouse.move(box.x+600,y);await p.mouse.wheel(300,0);await p.waitForTimeout(100);console.log('wheel',await info());
// scrollbar
await p.evaluate(()=>{document.getElementById('ganttH').scrollLeft=0});await p.waitForTimeout(100);console.log('sb0',await info());
// bar drag still works
const st=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].filter((t,i)=>i%4==0).slice(0,3).join?[...document.querySelectorAll('#gantt text.gc')].filter((t,i)=>i%4==0).slice(0,3).map(t=>t.textContent).join(' '):'');
console.log(await st());
await p.mouse.move(box.x+300,box.y+2*26+13);await p.mouse.down();await p.mouse.move(box.x+360,box.y+2*26+13,{steps:5});await p.mouse.up();console.log(await st());
// zoom
await p.fill('#gVis','12');await p.dispatchEvent('#gVis','change');console.log('vis12',await info());
await p.screenshot({path:'shot32b.png',clip:{x:0,y:300,width:1300,height:450}});
console.log(errs);await b.close();})();
