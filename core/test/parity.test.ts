// Vertailutesti: uusi viivalaskenta (calc/line.ts) antaa samat tulokset kuin prototyypin oma laskentakoodi.
// Prototyypin logiikkaosio (merkkien // <logic> ja // </logic> välissä) ajetaan erillisessä ympäristössä, ja
// molemmille annetaan samat satunnaiset viivat.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { expandLine, totalQuantity, type LeafLocation, type LineCalcInput, type TaskOverride } from '../src/calc/line.ts';
import { rng } from './helpers.ts';

const HTML = fileURLToPath(new URL('../../aikataulun-piirtoprototyyppi.html', import.meta.url));

interface ProtoTask { loc: number; locId: string; s: number; e: number; d: number; crew: number; qty: number; shift: number }
interface Proto {
  setTree(lt: { id: string; name: string; share: number; par: string | null }[]): void;
  locs(): { id: string; share: number }[];
  tasksCalc(l: unknown): ProtoTask[];
  totalQty(l: unknown): number;
}

function loadPrototype(): Proto {
  const src = readFileSync(HTML, 'utf8');
  const a = src.indexOf('// <logic>'), b = src.indexOf('// </logic>');
  assert.ok(a > 0 && b > a, 'prototyypin logiikkaosiota ei löytynyt');
  const code = src.slice(a, b) + `
    setWeeks(260);
    globalThis.__proto = {
      setTree(lt) { LT = normTree(lt); syncLocs(); },
      locs() { return LOCS.map(x => ({ id: x.id, share: x.share })); },
      tasksCalc(l) { return tasksCalc(l); },
      totalQty(l) { return totalQty(l); },
    };`;
  const ctx = vm.createContext({ console });
  vm.runInContext(code, ctx);
  return (ctx as unknown as { __proto: Proto }).__proto;
}

interface ProtoLine {
  id: number; trade: string; from: string | null; to: string | null; start: number; dur: number; gap: number; qty: number; prod: number;
  ov: Record<string, { d?: number; q?: number; shift?: number; name?: string }>;
  skip?: string[]; total?: number | null; lockC?: number | null; lockQ?: number | null; flat?: boolean;
}

function toInput(p: ProtoLine, locs: LeafLocation[]): LineCalcInput {
  const overrides: Record<string, TaskOverride> = {};
  for (const k in p.ov) {
    const o = p.ov[k];
    overrides[p.flat ? '' : k] = { duration: o.d ?? null, quantity: o.q ?? null, shift: o.shift ?? null, name: o.name ?? null };
  }
  void locs;
  return {
    flat: !!p.flat, fromLocationId: p.from, toLocationId: p.to, skipLocationIds: p.skip || [], start: p.start, gapDays: p.gap,
    durationMode: p.lockC != null ? 'crew' : p.total != null ? 'total' : 'perLocation',
    durationPerShare: p.dur, totalDuration: p.total ?? null, lockedCrew: p.lockC ?? null,
    quantityPerShare: p.qty, lockedTotalQuantity: p.lockQ ?? null, productionRate: p.prod, overrides,
  };
}

const proto = loadPrototype();

test('viivan purku vastaa prototyyppiä (2000 satunnaista viivaa)', () => {
  const R = rng(20261122);
  const pick = <T>(arr: T[]) => arr[Math.floor(R() * arr.length)];
  const num = (lo: number, hi: number, step = 0.1) => Math.round((lo + R() * (hi - lo)) / step) * step;
  let compared = 0;
  for (let round = 0; round < 2000; round++) {
    // sijaintipuu: 1–3 taloa, joissa 1–6 kerrosta, osuudet vaihtelevat
    const lt: { id: string; name: string; share: number; par: string | null }[] = [];
    const houses = 1 + Math.floor(R() * 3);
    for (let h = 0; h < houses; h++) {
      const hid = 'h' + h;
      lt.push({ id: hid, name: 'Talo ' + h, share: 1, par: null });
      const floors = 1 + Math.floor(R() * 6);
      for (let f = 0; f < floors; f++) lt.push({ id: hid + 'k' + f, name: 'Kerros ' + f, share: pick([1, 1, 0.5, 1.5, 2, 0.25]), par: hid });
    }
    proto.setTree(lt);
    const locs: LeafLocation[] = proto.locs();
    const ids = locs.map(l => l.id);
    const from = pick(ids), to = pick(ids);
    const mode = pick(['per', 'per', 'total', 'crew']);
    const flat = R() < 0.1;
    const p: ProtoLine = {
      id: 1, trade: 't', from: flat ? null : from, to: flat ? null : to, start: num(0, 40, 0.5), dur: num(0.5, 8), gap: pick([0, 0, 1, 2, -1, 0.5]),
      qty: num(1, 400, 1), prod: num(0.5, 30), ov: {}, flat,
    };
    if (mode === 'total') p.total = num(3, 60);
    if (mode === 'crew') p.lockC = 1 + Math.floor(R() * 6);
    if (R() < 0.2) p.lockQ = num(50, 2000, 1);
    const a = ids.indexOf(from), b = ids.indexOf(to);
    const inRange = ids.filter((_, i) => i >= Math.min(a, b) && i <= Math.max(a, b));
    if (!flat && R() < 0.2 && inRange.length > 2) p.skip = [pick(inRange)];
    if (!flat) for (const id of inRange) {
      if (R() < 0.15) (p.ov[id] ||= {}).d = num(0.5, 10);
      if (R() < 0.15) (p.ov[id] ||= {}).q = num(1, 300, 1);
      if (R() < 0.15) (p.ov[id] ||= {}).shift = pick([1, 2, 0.5, 3]);
    }
    const expected = proto.tasksCalc(JSON.parse(JSON.stringify(p)));
    const actual = expandLine(toInput(p, locs), locs);
    assert.equal(actual.length, expected.length, 'tehtävien määrä, kierros ' + round);
    expected.forEach((e, k) => {
      const t = actual[k], ctx = 'kierros ' + round + ', tehtävä ' + k;
      if (!flat) assert.equal(t.locationId, e.locId, ctx);
      assert.equal(t.start, e.s, 'alku, ' + ctx);
      assert.equal(t.end, e.e, 'loppu, ' + ctx);
      assert.equal(t.duration, e.d, 'kesto, ' + ctx);
      assert.equal(t.crew, e.crew, 'työryhmä, ' + ctx);
      assert.ok(Math.abs(t.quantity - e.qty) < 1e-9, 'määrä, ' + ctx);
      assert.equal(t.shift, e.shift, 'viive, ' + ctx);
      compared++;
    });
    if (!flat) assert.ok(Math.abs(totalQuantity(toInput(p, locs), locs) - proto.totalQty(JSON.parse(JSON.stringify(p)))) < 1e-6, 'kokonaismäärä, kierros ' + round);
  }
  assert.ok(compared > 5000);
});
