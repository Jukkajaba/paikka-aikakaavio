const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');await p.click('#depClear');
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
const info=()=>p.evaluate(()=>({k1:[...document.querySelectorAll('#gantt text.gc')].filter(t=>/^(ma|ti|ke|to|pe) /.test(t.textContent)).map(t=>t.textContent).slice(14,16).join(' '),lag:[...document.querySelectorAll('#gantt text.gc')].map(t=>t.textContent).filter(t=>/^[+−]\d+ pv/.test(t)),col:[...document.querySelectorAll('#gantt path[fill="none"]')].filter(e=>!e.dataset.gr).map(e=>e.getAttribute('stroke'))}));
await p.keyboard.down('Control');await p.mouse.move(box.x+400,rowY(1));await p.mouse.down();await p.mouse.move(box.x+500,rowY(8),{steps:5});await p.mouse.up();
console.log('created',JSON.stringify(await info()));
const getPt=()=>p.evaluate(()=>{const e=document.querySelector('#gantt [data-gr="gdeppick"]'),s=document.getElementById('gantt').getBoundingClientRect(),m=e.getAttribute('d').match(/H([\d.]+)V([\d.]+)/),m0=e.getAttribute('d').match(/M[\d.]+ ([\d.]+)/);return [s.left+ +m[1],s.top+(+m0[1]+ +m[2])/2]});
let pt=await getPt();
// drag left 100px => gap shrinks: successor moves earlier
await p.mouse.move(pt[0]-1,pt[1]);await p.mouse.move(pt[0],pt[1]);await p.mouse.down();await p.mouse.move(pt[0]-100,pt[1],{steps:8});await p.mouse.up();
console.log('dragged left',JSON.stringify(await info()));
pt=await getPt();await p.mouse.move(pt[0]-1,pt[1]);await p.mouse.move(pt[0],pt[1]);await p.mouse.down();await p.mouse.move(pt[0]+60,pt[1],{steps:8});await p.mouse.up();await p.keyboard.up('Control');
console.log('dragged right',JSON.stringify(await info()));
console.log(errs);await b.close();})();
