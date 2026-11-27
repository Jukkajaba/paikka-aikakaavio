// xlsx-vienti: ylätehtävät lihavoituna, sisennys tason mukaan
const { chromium } = require('playwright'); const { execSync } = require('child_process');
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1500, height: 1000 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__drawOn0 = true; });
  await p.goto('file://' + process.cwd() + '/aikataulun-piirtoprototyyppi.html'); await p.waitForSelector('#chart path'); await p.waitForTimeout(500);
  let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
  await p.click('#schBtn'); await p.fill('#schTxt', 'Ylätehtävä\tTehtävä\tAlku\tLoppu\nPiha / Maa\tKaivu\t11.1.2027\t22.1.2027\nRunko\tValu\t18.1.2027\t5.2.2027'); await p.click('#schParse'); await p.click('#schGo'); await p.waitForTimeout(300);
  const [d] = await Promise.all([p.waitForEvent('download'), p.click('#schXlsx')]); await d.saveAs('/tmp/h.xlsx');
  const py = execSync(`python3 -W ignore -c "
import openpyxl
ws=openpyxl.load_workbook('/tmp/h.xlsx').active
for r in ws.iter_rows(min_row=2):
    c=r[1]; print(c.value, c.font.b, c.alignment.indent, r[-1].value)"`).toString();
  ok(/Piha True 0\.0 0/.test(py) && /Maa True 1\.0 1/.test(py) && /Kaivu False 2\.0 2/.test(py) && /Runko True 0\.0 0/.test(py), 'tyylit: ' + py);
  ok(errs.length === 0, 'virheet ' + errs.join('|'));
  console.log(fail ? 'EPÄONNISTUI ' + fail : 'OK'); await b.close(); process.exit(fail ? 1 : 0);
})();
