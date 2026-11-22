const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const flowN=()=>p.evaluate(()=>document.querySelectorAll('#chart path[data-role="body"]').length);
console.log('flow lines',await flowN());
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gt')].map(t=>t.textContent).filter(t=>t.length>3).map(t=>t.slice(0,t.length/2)).join('|'));
await p.click('#gAddTask');await p.waitForTimeout(100);
console.log('rows',(await rows()).slice(-60));
console.log('panel',(await p.evaluate(()=>document.getElementById('panel').innerText)).replace(/\n/g,' ').slice(0,200));
await p.click('#vFlow');await p.waitForTimeout(100);console.log('flow lines after',await flowN(),'vio',await p.evaluate(()=>document.getElementById('summary').textContent));
await p.click('#vGantt');
// rename
await p.fill('#f-tname','Vesikatto');await p.dispatchEvent('#f-tname','change');
console.log('renamed',(await rows()).slice(-30));
// duration + crew
const box=await p.locator('#gantt').boundingBox();
const info=()=>p.evaluate(()=>{const t=[...document.querySelectorAll('#gantt text.gc')].map(t=>t.textContent);return t.slice(-4).join(' ')});
console.log('row vals',await info());
// drag end of last row
const gi=await p.evaluate(()=>{const e=[...document.querySelectorAll('#gantt [data-gr="gend"]')];return e.length?e[e.length-1].dataset.gi:null});
const h=await p.locator('#gantt [data-gr="gend"][data-gi="'+gi+'"]').boundingBox();
await p.mouse.move(h.x+h.width/2,h.y+h.height/2);await p.mouse.down();await p.mouse.move(h.x+h.width/2+40,h.y+h.height/2,{steps:5});await p.mouse.up();
console.log('after end drag',await info());
// dep: ctrl-drag from Runko K6 (row 6) to new row
const last=await p.evaluate(()=>[...document.querySelectorAll('#gantt [data-gi]')].filter(e=>!e.dataset.gr).length);
await p.keyboard.down('Control');await p.mouse.move(box.x+600,box.y+6*26+13);await p.mouse.down();await p.mouse.move(box.x+500,box.y+(gi)*26+13,{steps:6});await p.mouse.up();await p.keyboard.up('Control');
console.log('deps',await p.locator('#gantt [data-gr="gdeppick"]').count(),await info());
// loc grouping
await p.selectOption('#gGroup','loc');console.log('loc rows',(await rows()).slice(-60));
await p.selectOption('#gGroup','trade');
// delete
await p.keyboard.press('Delete');console.log('after delete',(await rows()).slice(-40),errs);
await p.click('#undo');console.log('undo',(await rows()).slice(-40),errs);
await b.close();})();
