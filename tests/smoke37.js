const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const pe=sel=>p.evaluate(s=>{const e=document.querySelector(s);return e?getComputedStyle(e).pointerEvents:null},sel);
console.log('no ctrl pick/ball',await pe('#gantt [data-gr="gdeppick"]'),await pe('#gantt [data-gr="gdepend"]'));
await p.keyboard.down('Control');await p.mouse.move(600,400);await p.mouse.move(610,410);
console.log('ctrl pick/ball',await pe('#gantt [data-gr="gdeppick"]'),await pe('#gantt [data-gr="gdepend"]'));
// lag drag with ctrl
const pt=await p.evaluate(()=>{const e=document.querySelector('#gantt [data-gr="gdeppick"]'),s=document.getElementById('gantt').getBoundingClientRect(),m=e.getAttribute('d').match(/H([\d.]+)V([\d.]+)/),m0=e.getAttribute('d').match(/M[\d.]+ ([\d.]+)/);return [s.left+ +m[1],s.top+(+m0[1]+ +m[2])/2]});
await p.mouse.move(pt[0],pt[1]);await p.mouse.down();await p.mouse.move(pt[0]+40,pt[1],{steps:5});await p.mouse.up();await p.keyboard.up('Control');
console.log('lag label',await p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].map(t=>t.textContent).filter(t=>/^[+−]\d+ pv/.test(t))));
console.log('after release',await pe('#gantt [data-gr="gdeppick"]'));
// select dep with ctrl click then Delete
await p.keyboard.down('Control');await p.mouse.move(pt[0]-1,pt[1]);await p.mouse.move(pt[0],pt[1]);await p.mouse.click(pt[0],pt[1]);await p.keyboard.up('Control');
await p.keyboard.press('Delete');console.log('deps left',await p.locator('#gantt [data-gr="gdeppick"]').count());
console.log(errs);await b.close();})();
