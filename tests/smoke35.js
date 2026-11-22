const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
const st=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].filter(t=>/^(ma|ti|ke|to|pe) /.test(t.textContent)).filter((t,i)=>i%2==0).slice(0,16).map(t=>t.textContent).join(' '));
await p.keyboard.down('Control');await p.mouse.move(box.x+600,rowY(2));await p.mouse.down();await p.mouse.move(box.x+500,rowY(8),{steps:5});await p.mouse.up();await p.keyboard.up('Control');
console.log('dep',await st());
// drag Ikkunat K1 (row 8) bar right 40px in gantt
await p.click('#vFlow');await p.waitForTimeout(200);
const fb=await p.locator('#chart').boundingBox();
// find body path of Ikkunat (second line?) drag it right
const bodies=p.locator('#chart path[data-role="body"]');const n=await bodies.count();console.log('lines',n);
await p.click('#vGantt');
const s0=await st();
await p.mouse.move(box.x+600,rowY(9));
// gantt bar of Ikkunat K2 row 9: grab bar centre
const bar=await p.locator('#gantt [data-gr="gmove"][data-gi="8"]').boundingBox();
await p.mouse.move(bar.x+bar.width/2,bar.y+bar.height/2);await p.mouse.down();await p.mouse.move(bar.x+bar.width/2+60,bar.y+bar.height/2,{steps:6});await p.mouse.up();
console.log('before',s0);console.log('after ',await st());
const lag=await p.evaluate(()=>document.getElementById('panel').textContent.match(/iive[^.]{0,40}/g));console.log(lag&&lag.slice(0,3));
console.log(errs);await b.close();})();
