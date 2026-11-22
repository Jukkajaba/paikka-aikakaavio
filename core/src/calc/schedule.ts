// Koko aikataulun laskenta: viivat puretaan tehtäviksi, tehtävistä ja riippuvuuksista muodostetaan verkko,
// ja verkosta lasketaan ajat, pelivarat ja kriittinen polku. Kaikki ajat ovat työpäiväindeksejä.
import type { DependencyType } from '../model/schedule.ts';
import { expandLine, type LeafLocation, type LineCalcInput, type LineTask } from './line.ts';
import { computeNetwork, type NetEdge, type NetNode } from './network.ts';

export type EngineRef =
  | { kind: 'task'; lineId: string; locationId: string | null }
  | { kind: 'line'; lineId: string }
  | { kind: 'group'; groupId: string };

export interface EngineLine extends LineCalcInput {
  id: string;
  groupId: string | null;
}

export interface EngineDependency {
  id: string;
  from: EngineRef;
  to: EngineRef;
  type: DependencyType;
  lag: number;
  rigid: boolean;
}

export interface ScheduleInput {
  locations: LeafLocation[];
  lines: EngineLine[];
  dependencies: EngineDependency[];
  /** Aikaisin mahdollinen alku (oletus 0). */
  origin?: number;
  /** Vaadittu valmistuminen pelivarojen laskentaan (oletus: laskettu loppu). */
  deadline?: number;
}

export interface ScheduledTask extends LineTask {
  lineId: string;
  /** Suunnitelman mukainen (piirretty) alku ennen riippuvuuksia. */
  drawnStart: number;
  totalFloat: number;
  critical: boolean;
  /** Riippuvuudet siirsivät tehtävää myöhemmäksi (tai kiinteä riippuvuus aikaisemmaksi). */
  movedBy: number;
}

export interface ScheduleResult {
  tasks: ScheduledTask[];
  byLine: Map<string, ScheduledTask[]>;
  projectStart: number;
  projectEnd: number;
  /** Riippuvuudet, joita ei voitu käyttää (puuttuva viiva, sijainti tai ryhmä). */
  skippedDependencies: string[];
}

export const taskKey = (lineId: string, locationId: string | null) => lineId + '|' + (locationId ?? '');

/** Laskee aikataulun. Heittää CycleError, jos riippuvuuksissa on kehä. */
export function computeSchedule(input: ScheduleInput): ScheduleResult {
  const origin = input.origin ?? 0;
  const expanded = new Map<string, LineTask[]>();
  for (const l of input.lines) expanded.set(l.id, expandLine(l, input.locations));
  const lineById = new Map(input.lines.map(l => [l.id, l]));

  const nodes: NetNode[] = [];
  const edges: NetEdge[] = [];
  for (const l of input.lines) {
    const ts = expanded.get(l.id)!;
    ts.forEach((t, k) => {
      nodes.push({ id: taskKey(l.id, t.locationId), duration: t.duration, notBefore: k === 0 ? l.start : null });
      if (k > 0) {
        const prev = taskKey(l.id, ts[k - 1].locationId), cur = taskKey(l.id, t.locationId);
        // viivan sisäinen ketju: edellisen loppu + tauko + oma viive, mutta ei ennen edellisen alkua
        edges.push({ from: prev, to: cur, type: 'FS', lag: l.gapDays + t.shift });
        edges.push({ from: prev, to: cur, type: 'SS', lag: 0 });
      }
    });
  }

  const kidsOf = (gid: string) => input.lines.filter(l => l.groupId === gid && expanded.get(l.id)!.length);
  const firstOf = (lid: string) => expanded.get(lid)![0];
  const lastEnding = (lid: string) => expanded.get(lid)!.reduce((m, t) => (t.end > m.end + 1e-9 ? t : m));
  const startDriven = (t: DependencyType, role: 'from' | 'to') => (role === 'from' ? t === 'SS' || t === 'SF' : t === 'FS' || t === 'SS');

  /** Riippuvuuden pää verkon solmuiksi. offset = viiveeseen lisättävä (ryhmän sisäiset suhteelliset alut). */
  const ends = (ref: EngineRef, role: 'from' | 'to', type: DependencyType): { id: string; offset: number }[] | null => {
    const sd = startDriven(type, role);
    if (ref.kind === 'task') {
      const ts = expanded.get(ref.lineId);
      const t = ts && ts.find(x => x.locationId === ref.locationId);
      return t ? [{ id: taskKey(ref.lineId, t.locationId), offset: 0 }] : null;
    }
    if (ref.kind === 'line') {
      const ts = expanded.get(ref.lineId);
      if (!ts || !ts.length) return null;
      if (sd) return [{ id: taskKey(ref.lineId, ts[0].locationId), offset: 0 }];
      if (role === 'from') return ts.map(t => ({ id: taskKey(ref.lineId, t.locationId), offset: 0 }));
      const t = lastEnding(ref.lineId);
      return [{ id: taskKey(ref.lineId, t.locationId), offset: 0 }];
    }
    const kids = kidsOf(ref.groupId);
    if (!kids.length) return null;
    if (role === 'from') {
      if (sd) { // ryhmän alku = aikaisimmin alkava viiva
        const k = kids.reduce((m, l) => (firstOf(l.id).start < firstOf(m.id).start ? l : m));
        return [{ id: taskKey(k.id, firstOf(k.id).locationId), offset: 0 }];
      }
      return kids.flatMap(l => expanded.get(l.id)!.map(t => ({ id: taskKey(l.id, t.locationId), offset: 0 })));
    }
    if (sd) { // ryhmä siirtyy kokonaisuutena: viivojen keskinäiset erot säilyvät
      const g0 = Math.min(...kids.map(l => firstOf(l.id).start));
      return kids.map(l => ({ id: taskKey(l.id, firstOf(l.id).locationId), offset: firstOf(l.id).start - g0 }));
    }
    const k = kids.reduce((m, l) => (lastEnding(l.id).end > lastEnding(m.id).end ? l : m));
    return [{ id: taskKey(k.id, lastEnding(k.id).locationId), offset: 0 }];
  };

  const skipped: string[] = [];
  for (const d of input.dependencies) {
    const known = (r: EngineRef) => (r.kind === 'group' ? true : lineById.has(r.lineId));
    const A = known(d.from) ? ends(d.from, 'from', d.type) : null;
    const B = known(d.to) ? ends(d.to, 'to', d.type) : null;
    if (!A || !B) { skipped.push(d.id); continue; }
    for (const a of A) for (const b of B) if (a.id !== b.id) edges.push({ from: a.id, to: b.id, type: d.type, lag: d.lag + b.offset, rigid: d.rigid });
  }

  const net = computeNetwork(nodes, edges, { origin, deadline: input.deadline, resolution: 0.1 });
  const out: ScheduledTask[] = [];
  const byLine = new Map<string, ScheduledTask[]>();
  for (const l of input.lines) {
    const arr: ScheduledTask[] = expanded.get(l.id)!.map(t => {
      const k = taskKey(l.id, t.locationId);
      const s = net.es.get(k)!, e = net.ef.get(k)!;
      return { ...t, lineId: l.id, drawnStart: t.start, start: s, end: e, totalFloat: net.totalFloat.get(k)!, critical: net.critical.has(k), movedBy: Math.round((s - t.start) * 1000) / 1000 };
    });
    byLine.set(l.id, arr);
    out.push(...arr);
  }
  return { tasks: out, byLine, projectStart: net.projectStart, projectEnd: net.projectEnd, skippedDependencies: skipped };
}
