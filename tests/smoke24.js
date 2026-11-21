const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const st=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].filter((t,i)=>i%4==0).slice(7,10).map(t=>t.textContent).join(' ')+' | '+[...document.querySelectorAll('#gantt text.gc')].map(t=>t.textContent).filter(t=>/pv$/.test(t)&&/^[+−]/.test(t)));
console.log(await st());
const pick=p.locator('#gantt [data-gr="gdeppick"]').first();const bb=await pick.boundingBox();
const pt=await p.evaluate(()=>{const e=document.querySelector('#gantt [data-gr="gdeppick"]'),s=document.getElementById('gantt').getBoundingClientRect(),m=e.getAttribute('d').match(/H([\d.]+)V([\d.]+)/);return [s.left+ +m[1],s.top+ +m[2]/2+20]});const x=pt[0],y=pt[1];console.log(JSON.stringify(bb));
// find a point on the vertical segment: use element path midpoint via mouse at vertical segment
await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+60,y,{steps:6});await p.mouse.up();
console.log('after +',await st());
await p.keyboard.press('Control+z');console.log('undo',await st());
console.log(errs);await b.close();})();
