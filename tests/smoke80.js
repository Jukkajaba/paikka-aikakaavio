const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
if(!(await p.locator('#ld-text').isVisible())){await p.click('[data-ptog="locs"]');} if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
const ta=p.locator('#ld-text');await ta.fill('Talo A\nKerros 1\nKerros 2\nTalo B\nKerros 1\nKerros 2');
// Tab-testi: valitse rivit 2-3 ja Tab
await ta.evaluate(e=>{e.focus();const v=e.value;e.selectionStart=v.indexOf('Kerros 1');e.selectionEnd=v.indexOf('Talo B')-1;});
await p.keyboard.press('Tab');await ta.evaluate(e=>e.selectionStart=e.selectionEnd=e.value.indexOf('Talo B'));
console.log(JSON.stringify(await ta.inputValue()));
await ta.evaluate(e=>{const v=e.value;e.selectionStart=e.selectionEnd=v.length;});await p.keyboard.press('Tab');console.log(JSON.stringify((await ta.inputValue()).slice(-14)));
await ta.fill('Talo A\n  Kerros 1\n  Kerros 2\nTalo B\n  Kerros 1\n  Kerros 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);
const bb=await p.locator('#chart').boundingBox();
await p.mouse.move(bb.x+300,bb.y+300);await p.mouse.down();await p.mouse.move(bb.x+500,bb.y+100,{steps:6});await p.mouse.up();await p.waitForTimeout(150);
await p.click('#vGantt');await p.selectOption('#gGroup','loc');await p.waitForTimeout(300);
console.log(await p.evaluate(()=>[...document.querySelectorAll('#locCard input.txt')].map(i=>i.value).join('|')));await p.screenshot({path:'smoke80.png'});console.log(errs);await b.close();})();
