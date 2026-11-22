const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const r=async s=>p.$eval(s,e=>{const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.right)]});
console.log('save',await r('#saveBtn'),'state',await r('#saveState'),'summary',await r('#summary'),'toolbar has save',await p.locator('.toolbar #saveBtn').count());

await p.screenshot({path:'head.png',clip:{x:0,y:0,width:1400,height:150}});
console.log('virheet',errs);await b.close();})();
