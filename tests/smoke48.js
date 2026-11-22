const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');await p.click('#depClear');
await p.selectOption('#lvlSel','x');await p.waitForTimeout(100);
const box=await p.locator('#gantt').boundingBox();const rowY=i=>box.y+i*26+13;
const rowsF=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gt')].filter(t=>!/^[▸▾]$/.test(t.textContent)).map(t=>(+t.getAttribute('x')>40?'  ':'')+t.textContent.replace(/(.+)\1$/,'$1')));
const names=async()=>(await rowsF()).join('|');
const st=()=>p.evaluate(()=>[...document.querySelectorAll('#gantt text.gc')].map(t=>t.textContent).filter(x=>/^(ma|ti|ke|to|pe) /.test(x)).filter((t,i)=>i%2==0).join(' '));
console.log(await names());
await p.mouse.click(box.x+150,rowY(1)); // select Ikkunat
await p.click('#gAddGrp');await p.waitForTimeout(100);
console.log('after grp',await names());
// select lvi row (index 3) and assign group via select
await p.mouse.click(box.x+150,rowY(3));
console.log('opts',await p.evaluate(()=>[...document.querySelectorAll('#f-grp option')].map(o=>o.textContent+'='+o.value).join(',')));
await p.selectOption('#f-grp',{index:1});await p.waitForTimeout(100);
console.log('assigned',await names());console.log(await st());
// move group bar by dragging +5 days
const sbefore=await st();
const bar=await p.locator('#gantt [data-gr="ggmove"]').first().boundingBox();
await p.mouse.move(bar.x+bar.width/2,bar.y+bar.height/2);await p.mouse.down();await p.mouse.move(bar.x+bar.width/2+60,bar.y+bar.height/2,{steps:6});await p.mouse.up();
console.log('moved',await st());
// reorder: drag Pinta (last) to top of group (before Ikkunat)
const nm=await names();console.log(nm);
await p.screenshot({path:'shot48a.png',clip:{x:40,y:300,width:1200,height:300}});
// drag row 'sahko' (index?) into group: find rows
const rows=await rowsF();
console.log(rows);
const iSah=rows.findIndex(x=>/ähkö/.test(x)),iGrp=rows.findIndex(x=>/Uusi yl/.test(x));
await p.mouse.move(box.x+120,rowY(iSah));await p.mouse.down();await p.mouse.move(box.x+120,rowY(iGrp)+2,{steps:8});await p.screenshot({path:'shot48b.png',clip:{x:40,y:300,width:1200,height:300}});await p.mouse.up();
console.log('into',await names());
// drag group to bottom
await p.mouse.move(box.x+120,rowY(iGrp));await p.mouse.down();await p.mouse.move(box.x+120,rowY(9),{steps:8});await p.mouse.up();
console.log('grp to end',await names());
// add flat task to group via panel
await p.mouse.click(box.x+120,rowY((await rowsF()).findIndex(x=>/Uusi yl/.test(x))));
await p.click('[data-act="grpaddtask"]');await p.waitForTimeout(100);console.log('flat in grp',await names());
// undo x3 and reload state check
await p.keyboard.press('Control+z');console.log('undo',await names());
// delete group
const gi=(await rowsF()).findIndex(x=>/Uusi yl/.test(x));
await p.mouse.click(box.x+120,rowY(gi));await p.click('[data-act="grpdel"]');console.log('deleted',await names());
// flow still fine
await p.click('#vFlow');await p.waitForTimeout(100);console.log('flow paths',await p.locator('#chart path').count(),errs);
await b.close();})();
