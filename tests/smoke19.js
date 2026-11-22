const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const rows=async()=>p.evaluate(()=>{const t=[...document.querySelectorAll('#gantt text.gc')].map(x=>x.textContent);const o=[];for(let i=0;i<4;i++)o.push(t.slice(i*4,i*4+4).join(' '));return o.join(' | ')});
await p.locator('#gantt [data-gi="0"]').first().click({position:{x:300,y:10},force:true});
// open tasks details if collapsed
const det=p.locator('#panel details');if(await det.count()&&!(await det.first().evaluate(d=>d.open)))await det.first().locator('summary').click();
// set total 29.4 -> per-location 4.9
await p.click('[data-act="tctl"]');
await p.fill('#f-total','29.4');await p.dispatchEvent('#f-total','change');
console.log('total29.4',await rows());
await p.locator('[data-act="dur+"]').first().click();
console.log('dur+ (4.9->5)',await rows(),'| dur input',await p.locator('input[data-field="dur-v"]').inputValue());
await p.locator('[data-act="dur+"]').first().click();
console.log('dur+ (5->6)',await p.locator('input[data-field="dur-v"]').inputValue());
await p.fill('input[data-field="dur-v"]','4.9');await p.dispatchEvent('input[data-field="dur-v"]','change');
console.log('typed 4.9',await rows(),'| field',await p.locator('input[data-field="dur-v"]').inputValue());
await p.click('[data-act="tctl"]');
const td=p.locator('input[data-field="tdur-v"]').nth(1);
await td.fill('3.3');await td.dispatchEvent('change');
console.log('task2 typed 3.3',await rows());
await p.locator('[data-act="tdur-"]').nth(1).click();
console.log('task2 minus (3.3->3)',await p.locator('input[data-field="tdur-v"]').nth(1).inputValue());
console.log('errors',errs);await b.close();})();
