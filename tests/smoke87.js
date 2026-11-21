const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\nTalo B\n  Kerros 1\n    Asunto 1\n    Asunto 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);await p.click('[data-ptog="locs"]');
await p.click('#vGantt');await p.waitForTimeout(300);
console.log('nappeja poissa:',await p.locator('#gCollapse,#gExpand').count(),'| taso näkyy:',await p.locator('#lvlSel').isVisible());
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gt')].filter(t=>!/^[▾▸]$/.test(t.textContent.trim())).slice(0,16).map(t=>t.firstChild.textContent).join('|'));
const opts=()=>p.locator('#lvlSel option').allTextContents();
await p.selectOption('#gGroup','trade');await p.waitForTimeout(200);console.log('trade opts',await opts());
for(const v of ['1','2','x','3']){await p.selectOption('#lvlSel',v);await p.waitForTimeout(250);console.log('trade',v,await rows());}
await p.selectOption('#gGroup','loc');await p.waitForTimeout(250);console.log('loc opts',await opts());
for(const v of ['1','2','3']){await p.selectOption('#lvlSel',v);await p.waitForTimeout(250);console.log('loc',v,await rows());}
// rivin avaus klikkaamalla tasolla 1
await p.selectOption('#lvlSel','1');await p.waitForTimeout(200);
const r=await p.evaluate(()=>{const t=[...document.querySelectorAll('#gantt text.gt')].find(x=>x.textContent==='▸');const b=t.getBoundingClientRect();return [b.x+3,b.y+5]});
await p.mouse.click(r[0],r[1]);await p.waitForTimeout(250);console.log('avattu klikkaamalla',await rows());
await p.click('#vFlow');await p.waitForTimeout(200);console.log('kaavio',await p.evaluate(()=>[...document.querySelectorAll('#chart text.loc')].map(t=>t.firstChild.textContent).join('|')));
console.log(errs);await b.close();})();
