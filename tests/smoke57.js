const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message+(e.stack||'').split('\n')[1]));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog=bl]');await p.waitForTimeout(100);
await p.fill('#bl-name','Sopimus');await p.click('[data-bl="save"]');await p.waitForTimeout(150);
console.log('panel',(await p.textContent('#blCard')).slice(0,200).replace(/\s+/g,' '));
// move first line in flow
const bd=p.locator('#chart path[data-role="body"]').first();const bb=await bd.boundingBox();
await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+60,bb.y+bb.height/2,{steps:6});await p.mouse.up();
console.log('dashed paths',await p.locator('#chart path[stroke-dasharray="2 5"]').count());
await p.click('#vGantt');await p.waitForTimeout(200);
console.log('cols',await p.evaluate(()=>[...document.querySelectorAll('#ganttHead text.ax')].map(t=>t.textContent).join(',')),await p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].slice(0,5).map(t=>t.textContent).join(' ')));
console.log('strips',await p.locator('#gantt rect[height="3"]').count());
console.log('summary',(await p.textContent('#blCard')).slice(-80));
await p.screenshot({path:'shot57.png'});
// undo + hide
await p.click('[data-bl="show"]');await p.waitForTimeout(100);console.log('hidden strips',await p.locator('#gantt rect[height="3"]').count(),errs);
await b.close();})();
