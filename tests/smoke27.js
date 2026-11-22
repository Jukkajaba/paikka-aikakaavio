const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const n=()=>p.evaluate(()=>document.querySelectorAll('#gantt [data-gr="gdeppick"]').length);
console.log(await n(),await p.isDisabled('#depClear'));await p.click('#depClear');console.log(await n(),await p.isDisabled('#depClear'));
await p.click('#undo');console.log('undo',await n(),await p.isDisabled('#depClear'));console.log(errs);await b.close();})();
