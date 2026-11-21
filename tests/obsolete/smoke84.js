const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\n    Asunto 2\nTalo B\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\n    Asunto 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);await p.click('[data-ptog="locs"]');
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#chart text.loc')].map(t=>t.firstChild.textContent).join('|'));
const mk=()=>p.evaluate(()=>[...document.querySelectorAll('#chart [data-role="lrow"]')].filter(t=>t.textContent.startsWith('▾')).length);
await p.selectOption('#lvlSel','1');await p.waitForTimeout(200);console.log('taso1',await rows(),await mk());
await p.locator('#chart text.loc[data-role="lrow"]').first().click();await p.waitForTimeout(200);console.log('avattu',await rows(),await mk());
await p.locator('#chart text.gt[data-role="lrow"]').first().click();await p.waitForTimeout(200);console.log('supistettu',await rows(),await mk(),await p.locator('#lvlSel').inputValue());
await p.selectOption('#lvlSel','3');await p.waitForTimeout(200);console.log('kaikki',(await rows()).split('|').length,await mk());
await p.locator('#chart text.gt[data-role="lrow"]').first().click();await p.waitForTimeout(200);console.log('supista yksi',await rows(),await mk());
await p.screenshot({path:'smoke84.png'});console.log(errs);await b.close();})();
