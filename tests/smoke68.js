const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
// malliosoitepohja
await p.click('#projBtn');await p.fill('#pj-tpl','https://viewer.example.com/open?m={model}&ids={ids}&t={task}');await p.press('#pj-tpl','Tab');
// valitse viiva flow-kaaviosta
const body=p.locator('#chart [data-role="body"]').first();
await body.click({force:true,button:'right'});
console.log('menu visible',await p.locator('#ctxMenu').isVisible(),await p.locator('#ctxMenu').innerText());
console.log('open disabled',await p.locator('#ctxMenu [data-cx="open"]').isDisabled());
await p.click('#ctxMenu [data-cx="edit"]');await p.waitForTimeout(100);
console.log('focus',await p.evaluate(()=>document.activeElement.id));
await p.fill('#f-mdl-m','M 1/rakenne');await p.fill('#f-mdl-i','abc 123, def;456');await p.press('#f-mdl-i','Tab');
const popupP=ctx.waitForEvent('page',{timeout:3000}).catch(()=>null);
await body.click({force:true,button:'right'});
console.log('open enabled',!(await p.locator('#ctxMenu [data-cx="open"]').isDisabled()));
await p.click('#ctxMenu [data-cx="open"]');
const pop=await popupP;console.log('popup',pop?pop.url():'ei (toast: '+await p.evaluate(()=>(document.getElementById('toast')||{}).innerText)+')');
// Gantt
await p.click('#vGantt');await p.waitForSelector('#gantt [data-gr]');
const box=await p.locator('#gantt').boundingBox();
await p.mouse.click(box.x+150,box.y+13+26*3,{button:'right'});
console.log('gantt menu',await p.locator('#ctxMenu').isVisible(),await p.locator('#ctxMenu').innerText().then(t=>t.replace(/\n/g,' | ')));
await p.keyboard.press('Escape');console.log('closed',!(await p.locator('#ctxMenu').isVisible()));
// suora osoite + virheellinen
await p.fill('#f-mdl-u','javascript:alert(1)');await p.press('#f-mdl-u','Tab');
console.log('warn',await p.locator('#panel .warnline').count());
console.log('state has tpl',await p.evaluate(()=>document.getElementById('pj-tpl').value));
// kumoa
await p.click('#undo');console.log('after undo u=',await p.evaluate(()=>document.getElementById('f-mdl-u')?document.getElementById('f-mdl-u').value:'(ei paneelia)'));
console.log(errs);await b.close();})();
