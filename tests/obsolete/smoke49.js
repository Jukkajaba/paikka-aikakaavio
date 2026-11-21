const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');await p.click('#depClear');
await p.selectOption('#lvlSel','x');await p.waitForTimeout(100);
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
const rowsF=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gt')].filter(t=>!/^[▸▾]$/.test(t.textContent)).map(t=>(+t.getAttribute('x')>40?'  ':'')+t.textContent.replace(/(.+)\1$/,'$1')));
const cols=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].map(t=>t.textContent).filter(x=>/^(ma|ti|ke|to|pe) /.test(x)).filter((t,i)=>i%2==0).join(' '));
// group Ikkunat+LVI
await p.mouse.click(box.x+150,rowY(1));await p.click('#gAddGrp');
await p.mouse.click(box.x+150,rowY(3));await p.selectOption('#f-grp',{index:1});await p.waitForTimeout(100);
console.log(await rowsF());console.log(await cols());
// rows: Runko0 Grp1 Ikkunat2 LVI3 Sahko4 Levytys5 Pinta6
await p.keyboard.down('Control');
// Runko(0) -> Grp(1) 
await p.mouse.move(box.x+520,rowY(0));await p.mouse.down();await p.mouse.move(box.x+420,rowY(1),{steps:6});await p.mouse.up();
console.log('deps',await p.locator('#gantt [data-gr="gdeppick"]').count());
// Grp(1) -> Levytys(5)
await p.mouse.move(box.x+420,rowY(1));await p.mouse.down();await p.mouse.move(box.x+520,rowY(5),{steps:6});await p.mouse.up();
// invalid: Grp -> Ikkunat (own kid)
await p.mouse.move(box.x+420,rowY(1));await p.mouse.down();await p.mouse.move(box.x+520,rowY(2),{steps:6});await p.mouse.up();
// cycle: Levytys -> Runko
await p.mouse.move(box.x+520,rowY(5));await p.mouse.down();await p.mouse.move(box.x+520,rowY(0),{steps:6});await p.mouse.up();
await p.keyboard.up('Control');
console.log('deps (expect 2)',await p.locator('#gantt [data-gr="gdeppick"]').count());
console.log(await cols());
await p.screenshot({path:'shot49a.png',clip:{x:40,y:300,width:1200,height:300}});
// move Runko later by dragging its bar -> group should follow
const bars=await p.locator('#gantt [data-gr="gmove"]').first().boundingBox();
await p.mouse.move(bars.x+bars.width/2,bars.y+bars.height/2);await p.mouse.down();await p.mouse.move(bars.x+bars.width/2+80,bars.y+bars.height/2,{steps:6});await p.mouse.up();
console.log('after runko move',await cols());
// group panel dep list
await p.mouse.click(box.x+150,rowY(1));console.log('panel deps',await p.locator('#panel .deprow2').count());
await p.click('#vFlow');await p.waitForTimeout(100);console.log('flow',await p.locator('#chart path').count(),errs);
await p.click('#vGantt');
// delete group
await p.mouse.click(box.x+150,rowY(1));await p.click('[data-act="grpdel"]');await p.waitForTimeout(100);console.log('deps after grp del',await p.locator('#gantt [data-gr="gdeppick"]').count(),errs);
await b.close();})();
