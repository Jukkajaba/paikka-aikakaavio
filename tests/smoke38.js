const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
// select line so dep drawn? deps always drawn in flow
const lag=()=>p.evaluate(()=>[...document.querySelectorAll('#chart text.tl')].map(t=>t.textContent).filter(t=>/pv$/.test(t)));
console.log('before',await lag());
const pt=await p.evaluate(()=>{const e=document.querySelector('#chart line[data-role="dep"]');const s=document.getElementById('chart').getBoundingClientRect();return [s.left+(+e.getAttribute('x1')+ +e.getAttribute('x2'))/2,s.top+(+e.getAttribute('y1')+ +e.getAttribute('y2'))/2]});
await p.keyboard.down('Control');await p.mouse.move(pt[0]-2,pt[1]);await p.mouse.move(pt[0],pt[1]);await p.mouse.down();await p.mouse.move(pt[0]+50,pt[1],{steps:6});await p.mouse.up();await p.keyboard.up('Control');
console.log('after',await lag());
await p.keyboard.press('Control+z');console.log('undo',await lag());console.log(errs);await b.close();})();
