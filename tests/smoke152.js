// xlsx-vienti ja -tuonti
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1500, height: 1000 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#schBtn');
  const [d] = await Promise.all([p.waitForEvent('download'), p.click('#schXlsx')]); await d.saveAs('/tmp/sch.xlsx');
  ok(fs.statSync('/tmp/sch.xlsx').size > 1000, 'tiedosto luotu');
  const n0 = await p.evaluate(() => __aik().lines.length);
  // tuo samaan tiedosto takaisin
  await p.setInputFiles('#schFile', '/tmp/sch.xlsx'); await p.waitForTimeout(500);
  ok(await p.locator('#schGo').count() === 1, 'xlsx jäsennetty: ' + (await p.textContent('#schBody')).slice(0, 200));
  await p.click('#schGo'); await p.waitForTimeout(300);
  const n1 = await p.evaluate(() => __aik().lines.length); ok(n1 === 2 * n0, 'kierto tuo saman määrän tehtäviä ' + n0 + '->' + n1);
  // oikea Excel-tiedosto (openpyxl) päivämäärillä
  require('child_process').execSync(`python3 -c "
import openpyxl, datetime
wb=openpyxl.Workbook(); ws=wb.active; ws.append(['Tehtävä','Alku','Loppu','Kesto'])
ws.append(['Betonointi', datetime.date(2027,2,1), datetime.date(2027,2,12), 10]); ws.append(['Muuraus', datetime.date(2027,2,15), datetime.date(2027,2,26), 10]); wb.save('/tmp/op.xlsx')"`);
  await p.setInputFiles('#schFile', '/tmp/op.xlsx'); await p.waitForTimeout(500); await p.click('#schGo'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const a = __aik(); return a.lines.slice(-2).map(l => a.trade(l.trade).name + ':' + l.start + ':' + l.dur); });
  ok(/Betonointi:\d+:10/.test(r[0]) && /Muuraus/.test(r[1]), 'openpyxl-tiedosto tuotu: ' + r);
  // openpyxl lukee vientitiedoston
  const py = require('child_process').execSync(`python3 -c "
import openpyxl
ws=openpyxl.load_workbook('/tmp/sch.xlsx').active
print(ws.max_row, ws['A1'].value, ws['D2'].value, ws['D2'].number_format)"`).toString().trim(); ok(/Littera/.test(py) && /d\.m\.yyyy/.test(py), 'openpyxl lukee: ' + py);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
