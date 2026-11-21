const {chromium}=require('playwright');
const html=process.argv[2]||'aikataulun-piirtoprototyyppi.html';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/'+html);await p.waitForSelector('#chart path');
await p.click('[data-ptog="locs"]');await p.click('#locCard summary');
await p.fill('[data-ld="tl"]','1');await p.fill('[data-ld="rp"]','1');await p.fill('[data-ld="kr"]','25');await p.fill('[data-ld="as"]','0');
await p.click('[data-act="locgen"][data-mode="replace"]');await p.waitForTimeout(200);
await p.click('[data-close="locs"]');
const endOf=async()=>{ // viimeisen sijainnin loppu: luetaan Valmis-viikko ja Ganttin Loppu-sarake
  await p.click('#vGantt');await p.waitForTimeout(100);
  const t=await p.evaluate(()=>{const g=document.getElementById('gantt');return g?g.textContent:''});
  await p.click('#vFlow');await p.waitForTimeout(100);return t;};
const lineEnd=()=>p.evaluate(()=>{const s=document.getElementById('summary').innerText;return s.split('\n')[0]});
console.log('alku',await lineEnd());
const he=p.locator('#chart [data-role="he"]');console.log('he handles',await he.count());
// valitse viiva ja vedä päätyä 1 päivä kerrallaan
await p.locator('#chart [data-role="body"]').first().click({force:true});await p.waitForTimeout(100);
const h=p.locator('[data-role="he"]').first();const bb=await h.boundingBox();
const dayW=await p.evaluate(()=>{const s=document.querySelector('#chart');return 0});
console.log('he box',!!bb);
const out=[];
let x=bb.x+bb.width/2,y=bb.y+bb.height/2;
for(let k=1;k<=4;k++){await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x-k*9,y,{steps:5});await p.mouse.up();await p.waitForTimeout(150);
  out.push(await p.evaluate(()=>{const e=document.querySelector('#panel [data-field="dur-v"]');return e?e.value:'(ei kenttaa)'}));
  const nb=await p.locator('[data-role="he"]').first().boundingBox();x=nb.x+nb.width/2;y=nb.y+nb.height/2;}
console.log(out);console.log(errs);await b.close();})();
