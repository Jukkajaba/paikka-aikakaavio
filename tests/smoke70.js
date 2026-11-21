const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1300,height:900}})).newPage();
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.locator('#chart [data-role="body"]').first().click({force:true});
await p.focus('#f-mdl-m');await p.keyboard.type('M1');await p.keyboard.press('Tab');
console.log('focus after tab',await p.evaluate(()=>document.activeElement.id||document.activeElement.tagName));
await p.keyboard.type('abc,def');await p.keyboard.press('Tab');
console.log(await p.evaluate(()=>[document.getElementById('f-mdl-m').value,document.getElementById('f-mdl-i').value,document.activeElement.id]));
await b.close();})();
