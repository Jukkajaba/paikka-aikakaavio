const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const bb=await p.locator('#chart').boundingBox();
const draw=async(x0,y0,x1,y1)=>{await p.mouse.move(bb.x+x0,bb.y+y0);await p.mouse.down();await p.mouse.move(bb.x+x1,bb.y+y1,{steps:6});await p.mouse.up();await p.waitForTimeout(200);};
const n=()=>p.locator('#chart [data-role="body"]').count();
// poista kaikki viivat valitsemalla ja Poista
for(let i=0;i<10;i++){const c=await n();if(!c)break;await p.locator('#chart [data-role="body"]').first().click({force:true});await p.waitForTimeout(100);const del=p.locator('#panel [data-act="del"]').first();if(await del.count())await del.click();await p.waitForTimeout(100);}
console.log('viivoja',await n());
await draw(300,300,500,150);console.log('piirretty tyhjään:',await n(),errs);
// klikkaus tyhjään ei jätä jäämiä
await p.mouse.click(bb.x+700,bb.y+250);await p.waitForTimeout(100);
console.log('virheet',errs);await b.close();})();
