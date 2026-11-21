const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
// add dependency in flow view via ctrl-drag is complex; use api: just switch and check
await p.click('#vGantt');await p.selectOption('#gGroup','loc');
await p.locator('#gantt [data-gi]').nth(1).click({position:{x:700,y:10},force:true});
await p.screenshot({path:'shot13.png',clip:{x:40,y:330,width:900,height:560}});
console.log('chipsHidden',await p.locator('#chips').isHidden(),'errors',errs);await b.close();})();
