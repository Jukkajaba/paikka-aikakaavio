const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gi]');
console.log('rows',await p.locator('#gantt [data-gi]').count(),'flowHidden',await p.locator('#chartWrap').isHidden());
await p.screenshot({path:'shot12a.png'});
// select line by clicking a row
await p.locator('#gantt [data-gi]').nth(1).click({position:{x:300,y:10},force:true});
console.log('panel',(await p.locator('#panel h2').first().textContent()));
// collapse via chevron
await p.locator('#gantt [data-gi]').nth(0).click({position:{x:10,y:10},force:true});
console.log('rows after collapse',await p.locator('#gantt [data-gi]').count());
await p.selectOption('#lvlSel',{index:(await p.locator('#lvlSel option').count())-1});
await p.selectOption('#gGroup','loc');
console.log('rows loc',await p.locator('#gantt [data-gi]').count());
await p.screenshot({path:'shot12b.png'});
await p.selectOption('#gGroup','trade');
await p.selectOption('#lvlSel','x');console.log('collapsed rows',await p.locator('#gantt [data-gi]').count());
await p.selectOption('#lvlSel',{index:(await p.locator('#lvlSel option').count())-1});
await p.click('#vFlow');console.log('flow back',await p.locator('#chart path').count()>0);
console.log('errors',errs);await b.close();})();
