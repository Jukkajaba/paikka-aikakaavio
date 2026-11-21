const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const n=()=>p.$$eval('[data-role=dep]',e=>e.length);
console.log('seed deps',await n());
// find two segment points via a line: use nearestTask logic indirectly: pick body hits of line 1 (runko) and line 6 (pinta) mid-row 3
const g=await p.evaluate(()=>{const r=document.getElementById('chart').getBoundingClientRect();return {x:r.x,y:r.y}});
// runko K3 approx: use paths' bounding box -> sample points along path
const pt=async(id,frac)=>p.$eval('[data-role=body][data-id="'+id+'"]',(e,f)=>{const L=e.getTotalLength();const q=e.getPointAtLength(L*f);const m=e.getScreenCTM();return {x:q.x*m.a+m.e,y:q.y*m.d+m.f};},frac);
const A=await pt(1,0.3),B=await pt(6,0.3);
await p.keyboard.down('Control');
await p.mouse.move(A.x,A.y);await p.mouse.down();await p.mouse.move((A.x+B.x)/2,(A.y+B.y)/2,{steps:5});await p.mouse.move(B.x,B.y,{steps:5});await p.mouse.up();
await p.keyboard.up('Control');
console.log('after ctrl-drag',await n());
await p.click('#depToggle');console.log('hidden',await n());await p.click('#depToggle');console.log('shown',await n());
await p.click('#undo');console.log('undo',await n());
// select a dep and delete with key
const d=await p.$eval('[data-role=dep]',e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}});
await p.mouse.click(d.x,d.y);await p.keyboard.press('Delete');console.log('deleted',await n());
await p.screenshot({path:'shot7.png',clip:{x:0,y:300,width:1200,height:500}});
console.log('errors',errs);await b.close();})();
