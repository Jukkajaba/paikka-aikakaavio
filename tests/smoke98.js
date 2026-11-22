const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');
await p.click('[data-ptog=bl]');await p.click('[data-bl=save]');await p.waitForTimeout(200);
await p.click('[data-ptog=st]');await p.fill('#st-day','2027-03-01');await p.dispatchEvent('#st-day','change');await p.waitForTimeout(200);
const cols=()=>p.$$eval('#ganttHead text.ax',e=>e.map(x=>x.textContent).join(','));
console.log('hdr',await cols());
const poik=()=>p.evaluate(()=>{const g=document.querySelector('#gantt');return [...g.querySelectorAll('text.gt')].filter(t=>t.firstChild&&!/^[▾▸]/.test(t.textContent)).slice(0,4).map(t=>{const y=t.getAttribute('y');const cs=[...g.querySelectorAll('text.gc')].filter(c=>c.getAttribute('y')===y).map(c=>c.textContent+(c.getAttribute('style')?'*':''));return t.firstChild.textContent+': '+cs.join('|')})});
console.log('before',await poik());
// ennuste päälle
await p.click('[data-ptog=fc]');await p.waitForTimeout(300);
console.log('hdr',await cols());console.log('with fc',await poik());
console.log('virheet',errs);await b.close();})();
