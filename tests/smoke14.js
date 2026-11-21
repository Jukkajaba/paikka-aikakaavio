const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');await p.locator('#gantt [data-gi="0"]').first().click({position:{x:300,y:10},force:true});await p.click('[data-act="tctl"]');await p.waitForTimeout(150);
const rowTxt=async i=>p.evaluate(i=>[...document.querySelectorAll('#gantt text.gc')].slice(i*4,i*4+4).map(t=>t.textContent).join(' '),i);
const drag=async(sel,dx)=>{const bb=await p.locator(sel).boundingBox();const x=bb.x+bb.width/2,y=bb.y+bb.height/2;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+dx/2,y);await p.mouse.move(x+dx,y);await p.mouse.up();};
console.log('row0 before',await rowTxt(0),'| row1',await rowTxt(1),'| row2',await rowTxt(2));
// summary bar move (row 0 gmove) by +60px
await drag('#gantt [data-gr="gmove"][data-gi="0"]',60);
console.log('after summary move',await rowTxt(0),'| row1',await rowTxt(1));
// child row 2 (Kerros 2) move +40px => shift
await drag('#gantt [data-gr="gmove"][data-gi="2"]',40);
console.log('after child move row2',await rowTxt(2));
// child row 1 end resize +30
const eb=await p.locator('#gantt [data-gr="gend"][data-gi="1"]').boundingBox();
await p.mouse.move(eb.x+eb.width/2,eb.y+eb.height/2);await p.mouse.down();await p.mouse.move(eb.x+eb.width/2+30,eb.y+eb.height/2,{steps:3});await p.mouse.up();
console.log('after end resize row1',await rowTxt(1),'| row0',await rowTxt(0));
console.log('undoEnabled',!(await p.locator('#undo').isDisabled()));
await p.click('#undo');await p.click('#undo');await p.click('#undo');
console.log('after 3 undos',await rowTxt(0),'| row1',await rowTxt(1),'| row2',await rowTxt(2));
await p.screenshot({path:'shot14.png',clip:{x:40,y:330,width:900,height:300}});
// summary end
await drag('#gantt [data-gr="gend"][data-gi="0"]',40);
console.log('summary end',await rowTxt(0));
console.log('errors',errs);await b.close();})();
