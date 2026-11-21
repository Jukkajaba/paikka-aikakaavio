const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const n=()=>p.evaluate(()=>document.querySelectorAll('#gantt [data-gr="gdeppick"]').length);
console.log('on',await n());await p.click('#depToggle');console.log('off',await n());await p.click('#depToggle');console.log('on',await n());
await p.screenshot({path:'shot23.png',clip:{x:0,y:0,width:1300,height:500}});await b.close();})();
