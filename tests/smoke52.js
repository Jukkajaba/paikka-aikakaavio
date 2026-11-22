const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const box=await p.locator('#gantt').boundingBox();
const f=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gt')].slice(0,6).map(t=>t.textContent.slice(0,t.textContent.length/2)).join('|')+' // '+[...document.querySelectorAll('#gantt text.gc')].slice(0,2).map(t=>t.textContent).join(','));
await p.mouse.dblclick(box.x+120,box.y+13);await p.keyboard.type('A');await p.keyboard.press('Enter');
await p.keyboard.type('B');await p.keyboard.press('Enter');await p.keyboard.type('C');await p.keyboard.press('Escape');
console.log(await f(),errs);await b.close();})();
