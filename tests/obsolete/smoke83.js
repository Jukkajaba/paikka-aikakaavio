const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\n    Asunto 2\nTalo B\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\n    Asunto 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);await p.click('[data-ptog="locs"]');
console.log(await p.locator('#lvlSel option').allTextContents());
const bb=await p.locator('#chart').boundingBox();
await p.mouse.move(bb.x+300,bb.y+300);await p.mouse.down();await p.mouse.move(bb.x+500,bb.y+120,{steps:6});await p.mouse.up();await p.waitForTimeout(150);
await p.screenshot({path:'smoke83a.png'});
for(const v of ['2','1','3']){await p.selectOption('#lvlSel',v);await p.waitForTimeout(250);console.log(v,await p.evaluate(()=>[...document.querySelectorAll('#chart text.loc')].map(t=>t.textContent).join('|')));if(v==='2')await p.screenshot({path:'smoke83b.png'});if(v==='1')await p.screenshot({path:'smoke83c.png'});}
await p.selectOption('#lvlSel','1');await p.waitForTimeout(200);
await p.locator('#chart text.loc[data-role="lrow"]').first().click();await p.waitForTimeout(200);
console.log('avattu',await p.evaluate(()=>[...document.querySelectorAll('#chart text.loc')].map(t=>t.textContent).join('|')),await p.locator('#lvlSel').inputValue());
console.log(errs);await b.close();})();
