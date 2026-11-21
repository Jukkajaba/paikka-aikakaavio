const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const rows=async()=>p.evaluate(()=>{const t=[...document.querySelectorAll('#gantt text.gc')].map(x=>x.textContent);const o=[];for(let i=0;i<7;i++)o.push(t.slice(i*4,i*4+4).join(' '));return o.join(' | ')});
const drag=async(sel,dx)=>{const bb=await p.locator(sel).boundingBox();const x=bb.x+bb.width/2,y=bb.y+bb.height/2;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+dx/2,y);await p.mouse.move(x+dx,y);await p.mouse.up();};
// set total on first line via panel to enter total mode
await p.locator('#gantt [data-gi="0"]').first().click({position:{x:300,y:10},force:true});
if((await p.getAttribute('[data-act="tctl"]','aria-pressed'))!=='true')await p.click('[data-act="tctl"]');await p.fill('#f-total','40');await p.dispatchEvent('#f-total','change');
console.log('with total  ',await rows());
await drag('#gantt [data-gr="gend"][data-gi="2"]',30);
console.log('child2 end+ ',await rows());
await p.click('#undo');
await drag('#gantt [data-gr="gend"][data-gi="0"]',30);
console.log('summary end+ (total again)',await rows());
console.log('errors',errs);await b.close();})();
