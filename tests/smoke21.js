const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const info=()=>p.evaluate(()=>({rows:[...document.querySelectorAll('#gantt text.gt')].slice(0,14).map(x=>x.textContent)}));
console.log(JSON.stringify(await info()));
// geometry of child rows
const box=await p.locator('#gantt').boundingBox();
const rowY=i=>box.y+i*26+13;
// find child rows (non-group): text without gg class
const kids=await p.evaluate(()=>[...document.querySelectorAll('#gantt text.gt')].map((t,i)=>({i,g:t.classList.contains('gg'),t:t.textContent})));
console.log(JSON.stringify(kids.slice(0,12)));
const kidIdx=kids.filter(k=>!k.g).map(k=>k.i);
const a=1, c=9;
const depCount=()=>p.evaluate(()=>document.querySelectorAll('#gantt [data-gr="gdeppick"]').length);
console.log('deps before',await depCount(),'rows',a,c);
await p.keyboard.down('Control');
await p.mouse.move(box.x+400,rowY(a));await p.mouse.down();await p.mouse.move(box.x+500,rowY(c)-5,{steps:6});
await p.screenshot({path:'shot21a.png',clip:{x:40,y:300,width:1200,height:420}});
await p.mouse.move(box.x+500,rowY(c),{steps:2});await p.mouse.up();await p.keyboard.up('Control');
console.log('deps after',await depCount());
await p.screenshot({path:'shot21b.png',clip:{x:40,y:300,width:1200,height:420}});
// duplicate attempt
await p.keyboard.down('Control');await p.mouse.move(box.x+400,rowY(a));await p.mouse.down();await p.mouse.move(box.x+500,rowY(c),{steps:4});await p.mouse.up();await p.keyboard.up('Control');
console.log('after duplicate',await depCount());
// reverse (cycle) attempt
await p.keyboard.down('Control');await p.mouse.move(box.x+400,rowY(c));await p.mouse.down();await p.mouse.move(box.x+500,rowY(a),{steps:4});await p.mouse.up();await p.keyboard.up('Control');
console.log('after cycle attempt',await depCount());
// move end ball b to another child row
const ball=p.locator('#gantt [data-gr="gdepend"][data-end="b"]').first();
const bb=await ball.boundingBox();const e2=10;
await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+30,rowY(e2),{steps:5});await p.mouse.up();
console.log('after move end',await depCount());
await p.screenshot({path:'shot21c.png',clip:{x:40,y:300,width:1200,height:420}});
await p.keyboard.press('Control+z');
console.log('after undo',await depCount());
console.log('errors',errs);await b.close();})();
