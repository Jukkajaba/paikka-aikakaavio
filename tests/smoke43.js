const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const n=()=>p.evaluate(()=>document.querySelectorAll('#fhand circle').length);
const pts=await p.evaluate(()=>{const e=[...document.querySelectorAll('#chart path[data-role="body"]')][3];const s=document.getElementById('chart').getBoundingClientRect();return [...e.getAttribute('d').matchAll(/([ML])([\d.]+) ([\d.]+)/g)].map(a=>[+a[2]+s.left,+a[3]+s.top])});
const mid=[(pts[2][0]+pts[3][0])/2,(pts[2][1]+pts[3][1])/2];
await p.mouse.move(mid[0],mid[1]);console.log('no shift',await n());
await p.keyboard.down('Shift');console.log('shift down (hover)',await n());
await p.mouse.move(mid[0]+1,mid[1]-1);console.log('after move',await n());
await p.screenshot({path:'shot43.png',clip:{x:0,y:300,width:1300,height:500}});
// drag ball
await p.mouse.down();await p.mouse.move(mid[0]+50,mid[1],{steps:5});await p.mouse.up();console.log('after drag balls',await n());
await p.keyboard.up('Shift');console.log('shift up',await n());
await p.mouse.move(100,100);console.log('away',await n(),errs);await b.close();})();
