const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const nd=()=>p.evaluate(()=>document.querySelectorAll('#gantt [data-gr="gdeppick"]').length);
console.log('deps',await nd());
for (let i=0;i<3;i++){
  await p.keyboard.down('Control');
  const loc=p.locator('#gantt [data-gr="gdeppick"]').first(); const bx=await loc.boundingBox();
  // click at path midpoint via evaluate
  const pt=await loc.evaluate(el=>{const L=el.getTotalLength();const q=el.getPointAtLength(L/2);const m=el.getScreenCTM();return {x:q.x*m.a+m.e,y:q.y*m.d+m.f}});
  await p.mouse.move(pt.x,pt.y);console.log('hit',await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e.tagName+':'+(e.getAttribute('data-gr')||e.getAttribute('class'))},[pt.x,pt.y]));await p.mouse.down();await p.mouse.up();
  await p.keyboard.up('Control');
  await p.keyboard.press('Delete');
  console.log('after delete',i+1,await nd(), await p.evaluate(()=>document.activeElement.tagName+'#'+document.activeElement.id));
}
console.log(errs);await b.close();})();
