const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const starts=()=>p.$$eval('#listCard .item small',e=>e.map(x=>x.textContent));
await p.click('[data-ptog=list]');
console.log('start',await starts());
// move runko (line 1) later with arrow keys: ikkunat K1 depends on runko K1 (end 5 -> ikkunat start 12)
await p.click('#listCard .item >> nth=0');
for(let i=0;i<10;i++) await p.keyboard.press('ArrowRight');
console.log('runko +10',await starts());
await p.click('#undo');
// set lag on dep via panel: select ikkunat (line 2)
await p.click('#listCard .item >> nth=1');
await p.click('#panel [data-act="deplag+"]');await p.click('#panel [data-act="deplag+"]');
console.log('lag text',await p.$$eval('#panel .deprow2 output',e=>e.map(x=>x.textContent)));
// drag a dep end ball to another task
const n=()=>p.$$eval('[data-role=dep]',e=>e.length);
const ball=await p.$eval('[data-role=depend][data-end=b]',e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}});
const pt=async(id,frac)=>p.$eval('[data-role=body][data-id="'+id+'"]',(e,f)=>{const L=e.getTotalLength();const q=e.getPointAtLength(L*f);const m=e.getScreenCTM();return {x:q.x*m.a+m.e,y:q.y*m.d+m.f};},frac);
const T=await pt(6,0.5);
const before=await p.$$eval('[data-role=dep]',e=>e.map(x=>x.getAttribute('data-id')+':'+x.getAttribute('x2')));
await p.mouse.move(ball.x,ball.y);await p.mouse.down();await p.mouse.move(T.x,T.y,{steps:10});await p.mouse.up();
const after=await p.$$eval('[data-role=dep]',e=>e.map(x=>x.getAttribute('data-id')+':'+x.getAttribute('x2')));
console.log('moved end',before.join(' '),'->',after.join(' '));
// ctrl+drag on dep line moves nearer end
const m=await p.$eval('[data-role=dep]',e=>{const x1=+e.getAttribute('x1'),x2=+e.getAttribute('x2'),y1=+e.getAttribute('y1'),y2=+e.getAttribute('y2');const r=document.getElementById('chart').getBoundingClientRect();return {x:r.x+x1*0.8+x2*0.2,y:r.y+y1*0.8+y2*0.2};});
const T2=await pt(4,0.7);
await p.keyboard.down('Control');await p.mouse.move(m.x,m.y);await p.mouse.down();await p.mouse.move(T2.x,T2.y,{steps:10});await p.mouse.up();await p.keyboard.up('Control');
console.log('ctrl-moved',await p.$$eval('[data-role=dep]',e=>e.map(x=>x.getAttribute('data-id')+':'+x.getAttribute('x1')+','+x.getAttribute('x2'))).then(a=>a.join(' ')));
await p.screenshot({path:'shot8.png',clip:{x:0,y:300,width:1200,height:520}});
console.log('errors',errs);await b.close();})();
