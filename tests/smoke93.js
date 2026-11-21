const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\nTalo B\n  Kerros 1\n    Asunto 1\n    Asunto 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);await p.click('[data-ptog="locs"]');
await p.click('#vGantt');await p.click('[data-ptog=st]');await p.waitForTimeout(300);
const info=()=>p.evaluate(()=>({lab:(document.querySelector('#stCard .lab2')||{}).textContent,tasks:document.querySelectorAll('#stCard .task').length}));
const names=()=>p.$$eval('#gantt text.gt',e=>e.map(x=>x.firstChild.textContent).filter(t=>!/^[▾▸]$/.test(t.trim())).slice(0,14));
await p.selectOption('#gGroup','trade');await p.selectOption('#lvlSel','2');await p.waitForTimeout(300);
console.log('trade rows',await names());
async function clickName(txt){const els=await p.$$('#gantt text.gt');for(const e of els){const t=await e.evaluate(x=>x.firstChild.textContent);if(t===txt){const bb=await e.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(200);return true;}}return false;}
console.log(await clickName('Talo A'),'Talo A',await info());
console.log(await clickName('Kerros 1'),'Kerros 1',await info());
await p.selectOption('#gGroup','loc');await p.selectOption('#lvlSel','2');await p.waitForTimeout(300);
console.log('loc rows',await names());
console.log(await clickName('Talo B'),'loc Talo B',await info());
console.log(await clickName('Talo A'),'loc Talo A',await info());
const n0=(await names()).length;const a=await p.$$('#gantt text.gt');const ab=await a[0].boundingBox();await p.mouse.click(ab.x+3,ab.y+ab.height/2);await p.waitForTimeout(200);console.log('fold rows',n0,(await names()).length);
console.log('virheet',errs);await b.close();})();
