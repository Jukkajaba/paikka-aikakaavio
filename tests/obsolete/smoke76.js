const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const n=()=>p.evaluate(()=>({chips:document.querySelectorAll('#chips .chip[data-trade]').length,x:document.querySelectorAll('#chips .chip-x').length}));
console.log('alku',await n());
await p.click('#clear');await p.waitForTimeout(100);console.log('viivat tyhjennetty',await n());
await p.click('#chips .chip-x >> nth=0');await p.waitForTimeout(80);console.log('yksi poistettu',await n());
await p.click('[data-ptog="trade"]');await p.waitForTimeout(80);
console.log('massapoisto-nappi',await p.locator('[data-act="tdelunused"]').count());
await p.click('[data-act="tdelunused"]');await p.waitForTimeout(100);console.log('kaikki poistettu',await n());
await p.click('#undo');await p.waitForTimeout(80);console.log('kumoa',await n());
await p.click('#undo');await p.waitForTimeout(80);console.log('kumoa2',await n());
// uusi työlaji ja piirto toimii edelleen
await p.click('#chips [data-newtrade]');await p.waitForTimeout(80);console.log('uusi',await n());
console.log(errs);await b.close();})();
