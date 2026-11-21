const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');
if(!(await p.locator('#ld-text').isVisible())){await p.evaluate(()=>{document.querySelectorAll('#locCard details').forEach(d=>d.open=true)});}
await p.locator('#ld-text').fill('Talo A\n  Kerros 1\n    Asunto 1\n    Asunto 2\n  Kerros 2\n    Asunto 1\nTalo B\n  Kerros 1\n    Asunto 1\n    Asunto 2');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(200);await p.click('[data-ptog="locs"]');
await p.click('#vGantt');await p.selectOption('#gGroup','trade');await p.selectOption('#lvlSel','2');await p.waitForTimeout(300);
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gt')].filter(t=>!/^[▾▸]$/.test(t.textContent.trim())).slice(0,6).map(t=>{const y=t.getAttribute('y');const c=[...document.querySelectorAll('#gantt text.gc')].filter(x=>x.getAttribute('y')===y).slice(0,2).map(x=>x.textContent).join('–');return t.firstChild.textContent+' '+c}));
console.log('before',await rows());
const g=await p.$$('#gantt [data-gr=glmove]');console.log('glmove rects',g.length);
// Talo B -rivin (2. glmove) veto
const names=await p.$$eval('#gantt text.gt',e=>e.map(x=>x.firstChild.textContent));
const bb=await g[2].boundingBox();console.log('box',bb&&bb.x);
await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+40,bb.y+bb.height/2,{steps:5});await p.mouse.up();await p.waitForTimeout(300);
console.log('after',await rows());
console.log('virheet',errs);await b.close();})();
