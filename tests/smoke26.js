const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
await p.selectOption('#gGroup','loc');await p.focus('#gGroup');
const n=()=>p.evaluate(()=>document.querySelectorAll('#gantt [data-gr="gdeppick"]').length);
const pt=await p.evaluate(()=>{const e=document.querySelector('#gantt [data-gr="gdeppick"]');const s=document.getElementById('gantt').getBoundingClientRect(),m=e.getAttribute('d').match(/H([\d.]+)V([\d.]+)/),m0=e.getAttribute('d').match(/M[\d.]+ ([\d.]+)/);return [s.left+ +m[1],s.top+(+m0[1]+ +m[2])/2]});
console.log('n',await n());await p.mouse.click(pt[0],pt[1]);await p.keyboard.press('Delete');console.log('after',await n());await b.close();})();
