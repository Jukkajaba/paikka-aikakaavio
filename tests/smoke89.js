const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
console.log('poistetut:',await p.locator('#chips,#reset,#clear,#weeks,#target,[data-ptog="trade"]').count());
await p.click('#projBtn');await p.waitForTimeout(150);
console.log('projekti kentät:',await p.locator('#pj-weeks,#pj-target').count());
await p.fill('#pj-target','12');await p.dispatchEvent('#pj-target','change');await p.waitForTimeout(150);
console.log('tavoite vk 12 →',await p.evaluate(()=>document.querySelector('.tgtl')?.textContent));
await p.fill('#pj-weeks','30');await p.dispatchEvent('#pj-weeks','change');await p.waitForTimeout(150);
console.log('kesto',await p.inputValue('#pj-weeks'));
await p.click('#projBtn');
// piirrä viiva tyhjästä, tarkista työlajiasetukset
const bb=await p.locator('#chart').boundingBox();
const draw=async(x0,y0,x1,y1)=>{await p.mouse.move(bb.x+x0,bb.y+y0);await p.mouse.down();await p.mouse.move(bb.x+x1,bb.y+y1,{steps:6});await p.mouse.up();await p.waitForTimeout(200);};
await draw(600,300,800,150);
console.log('uusi viiva paneelissa:',await p.evaluate(()=>document.querySelector('#panel h2')?.textContent),'| asetukset:',await p.locator('#panel details[data-sec="trade"]').count());
await p.locator('#panel details[data-sec="trade"] summary').click();await p.waitForTimeout(150);
await p.fill('#tr-max','3');await p.dispatchEvent('#tr-max','change');await p.waitForTimeout(150);
await p.locator('#panel details[data-sec="trade"] .swatches button').nth(2).click();await p.waitForTimeout(150);
console.log('max/väri:',await p.inputValue('#tr-max'),await p.evaluate(()=>document.querySelectorAll('#panel .swatches button[aria-pressed="true"]').length));
// tyhjennä kaikki: poista viivat Delete-näppäimellä ja piirrä uudelleen
await p.screenshot({path:'smoke89.png'});
console.log(errs);await b.close();})();
