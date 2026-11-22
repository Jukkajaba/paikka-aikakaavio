// Viivan purku sijaintikohtaisiksi tehtäviksi. Siirretty prototyypin funktioista range, distribute ja tasksCalc
// (aikataulun-piirtoprototyyppi.html). Tulokset vastaavat prototyyppiä; tämä varmistetaan vertailutestillä
// (test/parity.test.ts).
//
// Ajat ovat työpäiväindeksejä (calc/calendar.ts). Kestot pyöristetään 0,1 työpäivän tarkkuuteen kuten prototyypissä.
import type { DurationMode } from '../model/schedule.ts';

export const MIN_DURATION = 0.5;
const EPS = 1e-9;
export const round1 = (x: number): number => Math.round(x * 10) / 10;

/** Lehtisijainti aikataulutusjärjestyksessä. */
export interface LeafLocation {
  id: string;
  share: number;
}

export interface TaskOverride {
  duration?: number | null;
  quantity?: number | null;
  shift?: number | null;
  name?: string | null;
}

/** Sijainnittoman viivan tehtävän avain poikkeamissa. */
export const FLAT_KEY = '';

export interface LineCalcInput {
  flat: boolean;
  fromLocationId: string | null;
  toLocationId: string | null;
  skipLocationIds: string[];
  /** Ensimmäisen tehtävän alku (työpäiväindeksi). */
  start: number;
  gapDays: number;
  durationMode: DurationMode;
  durationPerShare: number;
  totalDuration: number | null;
  lockedCrew: number | null;
  quantityPerShare: number;
  lockedTotalQuantity: number | null;
  productionRate: number;
  /** Sijainnin id (tai FLAT_KEY) -> poikkeama. */
  overrides: Record<string, TaskOverride>;
}

export interface LineTask {
  /** Järjestys viivalla (0 = ensimmäinen). */
  seq: number;
  /** Sijainnin indeksi lehtisijaintien listassa (sijainnittomalla -1). */
  locationIndex: number;
  locationId: string | null;
  start: number;
  end: number;
  duration: number;
  crew: number;
  quantity: number;
  durationOverridden: boolean;
  /** Tehtävän oma lisäviive (ensimmäisellä aina 0). */
  shift: number;
  name: string;
}

export interface LineRange {
  /** Lehtisijaintien indeksit viivan kulkujärjestyksessä. */
  indexes: number[];
  dir: 1 | -1;
}

/** Viivan sijainnit järjestyksessä. Puuttuva alku tai loppu korvataan toisella; kaikki ohitettu = koko alue. */
export function lineRange(line: Pick<LineCalcInput, 'flat' | 'fromLocationId' | 'toLocationId' | 'skipLocationIds'>, locations: LeafLocation[]): LineRange {
  if (line.flat) return { indexes: [-1], dir: 1 };
  const idx = (id: string | null) => (id == null ? -1 : locations.findIndex(l => l.id === id));
  let a = idx(line.fromLocationId), b = idx(line.toLocationId);
  if (a < 0) a = b < 0 ? 0 : b;
  if (b < 0) b = a;
  if (!locations.length) return { indexes: [], dir: 1 };
  const dir: 1 | -1 = b >= a ? 1 : -1;
  const all: number[] = [];
  for (let i = a; ; i += dir) { all.push(i); if (i === b) break; }
  if (line.skipLocationIds.length) {
    const skip = new Set(line.skipLocationIds);
    const kept = all.filter(i => !skip.has(locations[i].id));
    if (kept.length) return { indexes: kept, dir };
  }
  return { indexes: all, dir };
}

const shareAt = (line: LineCalcInput, locations: LeafLocation[], i: number) => (line.flat || i < 0 ? 1 : locations[i].share);
const keyAt = (line: LineCalcInput, locations: LeafLocation[], i: number) => (line.flat || i < 0 ? FLAT_KEY : locations[i].id);

/** Sijaintien osuuksien summa (vähintään 0,1). */
export function shareWidth(line: LineCalcInput, locations: LeafLocation[], range = lineRange(line, locations)): number {
  let w = 0;
  for (const i of range.indexes) w += shareAt(line, locations, i);
  return Math.max(w, 0.1);
}

/** Määrä osuutta kohden: lukitusta kokonaismäärästä tai suoraan viivalta. */
export function effectiveQuantityPerShare(line: LineCalcInput, locations: LeafLocation[], range = lineRange(line, locations)): number {
  return line.lockedTotalQuantity != null ? line.lockedTotalQuantity / shareWidth(line, locations, range) : line.quantityPerShare;
}

/** Viivan kokonaismäärä (sijaintikohtaiset määrät huomioiden). */
export function totalQuantity(line: LineCalcInput, locations: LeafLocation[]): number {
  if (line.lockedTotalQuantity != null) return line.lockedTotalQuantity;
  const r = lineRange(line, locations);
  let s = 0;
  for (const i of r.indexes) {
    const o = line.overrides[keyAt(line, locations, i)];
    s += o?.quantity != null ? o.quantity : line.quantityPerShare * shareAt(line, locations, i);
  }
  return s;
}

/**
 * Kokonaiskesto jaetaan sijainneille osuuksien mukaan niin, että summa täsmää 0,1 päivän tarkkuudella.
 * Tehtävät, joilla on oma kesto, pysyvät ennallaan; muut jakavat jäljelle jäävän ajan.
 * Palauttaa järjestysnumero -> kesto.
 */
export function distributeTotal(line: LineCalcInput, locations: LeafLocation[], range: LineRange): Map<number, number> {
  let fixed = 0, fw = 0;
  const free: number[] = [];
  range.indexes.forEach((i, k) => {
    const o = line.overrides[keyAt(line, locations, i)] || {};
    if (k > 0) fixed += o.shift || 0;
    if (o.duration != null) fixed += o.duration;
    else { free.push(k); fw += shareAt(line, locations, i); }
  });
  const out = new Map<number, number>();
  if (!free.length) return out;
  const n = range.indexes.length;
  const pool = Math.round(Math.max(free.length * MIN_DURATION, (line.totalDuration ?? 0) - (n - 1) * line.gapDays - fixed) * 10);
  const ideal = free.map(k => (pool * shareAt(line, locations, range.indexes[k])) / fw);
  const fl = ideal.map(x => Math.max(MIN_DURATION * 10, Math.floor(x)));
  let rem = pool - fl.reduce((a, b) => a + b, 0);
  const order = ideal.map((x, i) => [x - Math.floor(x), i] as [number, number]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let j = 0; rem > 0; j++, rem--) fl[order[j % order.length][1]]++;
  free.forEach((k, i) => out.set(k, fl[i] / 10));
  return out;
}

/** Purkaa viivan tehtäviksi: alku, loppu, kesto, työryhmä ja määrä jokaiselle sijainnille. */
export function expandLine(line: LineCalcInput, locations: LeafLocation[]): LineTask[] {
  const r = lineRange(line, locations);
  const rateOk = line.productionRate > 0;
  const crewMode = line.durationMode === 'crew' && line.lockedCrew != null && line.lockedCrew > 0 && rateOk;
  const lc = crewMode ? (line.lockedCrew as number) : null;
  const dist = line.durationMode === 'total' && line.totalDuration != null && lc == null ? distributeTotal(line, locations, r) : null;
  const q = effectiveQuantityPerShare(line, locations, r);
  const out: LineTask[] = [];
  let prevEnd = 0, prevS = 0;
  r.indexes.forEach((i, k) => {
    const share = shareAt(line, locations, i);
    const o = line.overrides[keyAt(line, locations, i)] || {};
    const qk = o.quantity != null ? o.quantity : q * share;
    let d: number;
    if (o.duration != null) d = o.duration;
    else if (lc != null) d = Math.max(MIN_DURATION, round1(qk / line.productionRate / lc));
    else if (dist && dist.has(k)) d = dist.get(k) as number;
    else d = Math.max(MIN_DURATION, round1(line.durationPerShare * share));
    const sh = k === 0 ? 0 : o.shift || 0;
    // negatiivinen tauko = päällekkäisyys, mutta tehtävä ei ala ennen edellisen alkua
    const s = k === 0 ? line.start : round1(Math.max(prevS, prevEnd + line.gapDays + sh));
    const crew = lc != null && o.duration == null ? lc : rateOk && d > 0 ? Math.max(1, Math.ceil(qk / line.productionRate / d - EPS)) : 1;
    const e = round1(s + d);
    out.push({
      seq: k, locationIndex: i, locationId: i < 0 || line.flat ? null : locations[i].id,
      start: s, end: e, duration: d, crew, quantity: qk, durationOverridden: o.duration != null, shift: sh, name: o.name || '',
    });
    prevEnd = e;
    prevS = s;
  });
  return out;
}
