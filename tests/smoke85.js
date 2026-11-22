const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\n    Asunto 2\nTalo B\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\n    Asunto 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);await p.click('[data-ptog="locs"]');
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#chart text.loc')].map(t=>t.firstChild.textContent).join('|'));
console.log('nappi',await p.locator('#fltBtn').textContent());
await p.click('#fltBtn');console.log('rivejä listassa',await p.locator('#fltList .flr').count());
// vain Talo B
await p.locator('#fltList .flr').nth(7).hover();await p.locator('#fltList .flr').nth(7).locator('.fonly').click();await p.waitForTimeout(250);
console.log('Vain Talo B:',await p.locator('#fltBtn').textContent(),'|',await rows());await p.screenshot({path:'smoke85a.png'});
// haku
await p.fill('#fltQ','kerros 2');console.log('haku rivejä',await p.locator('#fltList .flr').count());
await p.press('#fltQ','Enter');await p.waitForTimeout(250);console.log('Vain haku:',await p.locator('#fltBtn').textContent(),'|',await rows());
// taso + rajaus
await p.keyboard.press('Escape');await p.selectOption('#lvlSel','2');await p.waitForTimeout(200);console.log('taso2',await rows());
// gantt
await p.click('#vGantt');await p.waitForTimeout(300);
for(const m of ['trade','loc']){await p.selectOption('#gGroup',m);await p.waitForTimeout(250);console.log('gantt',m,await p.evaluate(()=>[...document.querySelectorAll('#gantt text.gt')].slice(0,14).map(t=>t.firstChild.textContent).join('|')));}
await p.screenshot({path:'smoke85b.png'});
await p.click('#vFlow');await p.selectOption('#lvlSel','3');
await p.click('#fltBtn');await p.click('#fltAll');await p.waitForTimeout(200);console.log('kaikki',await p.locator('#fltBtn').textContent(),(await rows()).split('|').length);
// piirtäminen rajatussa
await p.locator('#fltList .flr').nth(7).hover();await p.locator('#fltList .flr').nth(7).locator('.fonly').click();await p.keyboard.press('Escape');await p.waitForTimeout(200);
const bb=await p.locator('#chart').boundingBox();await p.mouse.move(bb.x+300,bb.y+200);await p.mouse.down();await p.mouse.move(bb.x+450,bb.y+100,{steps:5});await p.mouse.up();
console.log('toast',await p.evaluate(()=>document.body.innerText.includes('Piirtäminen ja viivan')));
console.log(errs);await b.close();})();
