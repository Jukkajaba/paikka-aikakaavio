const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message+(e.stack||'').split('\n')[1]));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog=bl]');await p.click('[data-bl="save"]');await p.waitForTimeout(100);
const ends=()=>p.evaluate(()=>[...document.querySelectorAll('#chart path[data-role="body"]')].slice(0,2).map(e=>e.getAttribute('d').slice(0,24)).join(' | '));
console.log('before',await ends());
// edit: move first line, add task in gantt
const bd=p.locator('#chart path[data-role="body"]').first();const bb=await bd.boundingBox();
await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+60,bb.y+bb.height/2,{steps:6});await p.mouse.up();
await p.click('#vGantt');await p.click('#gAddTask');await p.click('#vFlow');await p.waitForTimeout(150);
console.log('moved',await ends());console.log((await p.textContent('#blCard')).match(/Tavoitteen jälkeen[^.]*\./)[0]);
await p.click('[data-bl="restore"]');await p.click('[data-bl="restoreok"]');await p.waitForTimeout(150);
console.log('restored',await ends());console.log((await p.textContent('#blCard')).match(/Tavoitteen jälkeen[^.]*\./)[0]);
await p.click('button:has-text("Kumoa")');await p.waitForTimeout(150);console.log('undo',await ends(),errs);await b.close();})();
