const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.click('[data-ptog=st]');await p.waitForTimeout(300);
const dark=()=>p.$$eval('#gantt rect[fill="#000"]',e=>e.length);
const pcts=()=>p.$$eval('#stCard [data-field=apct]',e=>e.map(x=>x.value).join(','));
await p.click('[data-st=today]');await p.waitForTimeout(200);
await p.fill('#st-day','2027-02-01');await p.dispatchEvent('#st-day','change');await p.waitForTimeout(200);
console.log('dark start',await dark());
const e0=await p.$$('#gantt text.gt');let ab=await e0[0].boundingBox();await p.mouse.click(ab.x+4,ab.y+ab.height/2);await p.waitForTimeout(200);
console.log('expanded dark',await dark());
for(let i=0;i<5;i++){const e=await p.$$('#gantt text.gt');const k=Math.min(e.length-1,i+1);const bb=await e[k].boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(200);console.log('click',i,'dark',await dark(),'pcts',await pcts(),'fills',await p.$$eval('#gantt rect[fill]',e=>{const m={};e.forEach(x=>{const f=x.getAttribute('fill')+'/'+x.getAttribute('opacity');m[f]=(m[f]||0)+1});return JSON.stringify(m)}));}
console.log('virheet',errs);await b.close();})();
