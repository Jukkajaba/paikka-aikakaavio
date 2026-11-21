const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
 
await p.click('[data-ptog=list]');await p.click('#listCard .item >> nth=4');
console.log('before',await p.inputValue('#f-total'));
if((await p.getAttribute('[data-act="tctl"]','aria-pressed'))!=='true')await p.click('[data-act="tctl"]');await p.fill('#f-total','33');await p.dispatchEvent('#f-total','change');
console.log('after',await p.inputValue('#f-total'),await p.textContent('#panel .meta'));
await p.click('#panel summary');
console.log(await p.$$eval('#panel .task .tmeta',e=>e.map(x=>x.textContent)));
await p.click('#panel [data-act="dur+"]');console.log('dur+',await p.inputValue('#f-total'));
console.log('errors',errs);await b.close();})();
