const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(() => { window.__drawOn0 = true; }); await p.goto('file://'+process.cwd()+'/aikataulun-piirtoprototyyppi.html');await p.waitForSelector('#chart path');
const rows=()=>p.evaluate(()=>[...document.querySelectorAll('#locCard .locrow')].length);
const axis=()=>p.evaluate(()=>[...document.querySelectorAll('#chart text.ax')].map(t=>t.textContent).filter(t=>/Kerros|Asunto|Sijainti|Talo|Rappu/.test(t)).slice(0,6).join('|'));
await p.click('[data-ptog="locs"]');console.log('alku rivit',await rows());
await p.click('#locCard summary');
await p.fill('[data-ld="tl"]','2');await p.fill('[data-ld="rp"]','2');await p.fill('[data-ld="kr"]','3');await p.fill('[data-ld="as"]','4');
await p.click('[data-act="locgen"][data-mode="replace"]');await p.waitForTimeout(150);
console.log('gen rivit',await rows(),await p.locator('#locCard .ok').last().innerText().catch(()=>''), 'axis',await axis());
console.log('lines ok',await p.evaluate(()=>document.querySelectorAll('#chart path[data-role="body"]').length));
// undo
await p.click('#undo');await p.waitForTimeout(100);console.log('undo rivit',await rows());
// teksti

await p.fill('#ld-text','Talo X\n  Kerros 1\n  Kerros 2\n    Huone a\n    Huone b\nTalo Y\n  Kerros 1');
await p.click('[data-act="locimp"][data-mode="replace"]');await p.waitForTimeout(150);
console.log('teksti rivit',await rows(),'axis',await axis());
// poisto, siirto, lisäys
await p.locator('#locCard [data-act="locchild"]').first().click();await p.waitForTimeout(100);console.log('lapsi lisatty',await rows());
await p.locator('#locCard [data-act="locup"]:not([disabled])').first().click();await p.waitForTimeout(100);
await p.locator('#locCard [data-act="locsplit"]').first().click();await p.waitForTimeout(100);console.log('split',await rows());
await p.locator('#locCard [data-act="locdel"]:not([disabled])').first().click();await p.waitForTimeout(100);console.log('del',await rows());
await p.locator('#locCard [data-act="loccol"]').first().click();console.log('collapsed',await rows());
await p.fill('#locCard input[data-field="locname"] >> nth=0','Uusi nimi');await p.keyboard.press('Tab');await p.waitForTimeout(150);
console.log('rename ok',await p.evaluate(()=>document.querySelector('#locCard input[data-field="locname"]').value));
console.log('lines',await p.evaluate(()=>document.querySelectorAll('#chart path[data-role="body"]').length));
console.log(errs);await b.close();})();
