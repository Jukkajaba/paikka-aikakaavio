const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
// flow: select Runko line (first body), find its end ball overlap: add dep Runko K6 -> Ikkunat K1? create via ctrl-drag in gantt
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
await p.keyboard.down('Control');await p.mouse.move(box.x+600,rowY(6));await p.mouse.down();await p.mouse.move(box.x+500,rowY(8),{steps:5});await p.mouse.up();await p.keyboard.up('Control');
const ends=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].filter(t=>/^(ma|ti|ke|to|pe) /.test(t.textContent)).slice(0,14).map(t=>t.textContent).join(' '));
console.log('gantt start',await ends());
// gantt: drag Runko K6 (row 6) end handle (gend) right 30px
const h=await p.locator('#gantt [data-gr="gend"][data-gi="6"]').boundingBox();
await p.mouse.move(h.x+h.width/2,h.y+h.height/2);await p.mouse.down();await p.mouse.move(h.x+h.width/2+30,h.y+h.height/2,{steps:5});await p.mouse.up();
console.log('gantt end drag',await ends());
// flow
await p.click('#vFlow');await p.waitForTimeout(200);
const fbox=await p.locator('#chart').boundingBox();
const info=await p.evaluate(()=>{const he=document.querySelector('#chart [data-role="he"]');if(!he)return null;const r=he.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {role:e.dataset.role}});
console.log('flow top at handle',info);
console.log(errs);await b.close();})();
