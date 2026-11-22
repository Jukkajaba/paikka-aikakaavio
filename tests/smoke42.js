const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const ends=()=>p.evaluate(()=>{const e=[...document.querySelectorAll('#chart path[data-role="body"]')][3];return e.getAttribute('d')});
// first line segments: use path d
const d0=await ends();console.log(d0.slice(0,160));
const info=await p.evaluate(()=>{const e=[...document.querySelectorAll('#chart path[data-role="body"]')][3];const s=document.getElementById('chart').getBoundingClientRect();const m=[...e.getAttribute('d').matchAll(/([ML])([\d.]+) ([\d.]+)/g)].map(a=>[+a[2]+s.left,+a[3]+s.top]);return m});
// segment 2 midpoint (points idx 2,3)
const mid=[(info[2][0]+info[3][0])/2,(info[2][1]+info[3][1])/2];
await p.keyboard.down('Shift');await p.mouse.move(mid[0],mid[1]);await p.mouse.down();await p.mouse.move(mid[0]+60,mid[1],{steps:6});await p.mouse.up();await p.keyboard.up('Shift');
const d1=await ends();console.log(d1.slice(0,160));
console.log('changed',d0!==d1,errs);
await p.keyboard.press('Control+z');console.log('undo same',(await ends())===d0);await b.close();})();
