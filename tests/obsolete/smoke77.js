const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#clear');await p.click('[data-ptog="trade"]');await p.click('[data-act="tdelunused"]');await p.waitForTimeout(100);
const bb=await p.locator('#chart').boundingBox();
await p.mouse.move(bb.x+300,bb.y+300);await p.mouse.down();await p.mouse.move(bb.x+500,bb.y+150,{steps:6});await p.mouse.up();await p.waitForTimeout(100);
await p.click('#vGantt');await p.waitForTimeout(100);await p.click('#vFlow');
console.log('tyhjä kaavio ok, lines',await p.locator('#chart path[data-role="body"]').count(),errs);await b.close();})();
