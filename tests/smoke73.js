const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#projBtn');await p.setInputFiles('[data-pjfile]','stress_500x300.json');
await p.waitForFunction(()=>/Stressi/.test(document.getElementById('subline').textContent),null,{timeout:120000});
console.log('iso auto',await p.evaluate(()=>({h:Math.round(document.getElementById('chart').getBoundingClientRect().height),pressed:document.getElementById('resBtn').getAttribute('aria-pressed')})),errs);await b.close();})();
