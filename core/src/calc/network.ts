// Verkkolaskenta: aikaisimmat ajat (eteenpäin), myöhäisimmät ajat (taaksepäin), kokonaispelivara ja kriittinen polku.
// Yleinen, ei tiedä viivoista eikä sijainneista: schedule.ts muodostaa verkon aikataulusta.
import type { DependencyType } from '../model/schedule.ts';

export interface NetNode {
  id: string;
  duration: number;
  /** Ei aikaisemmin kuin (piirretty tai suunniteltu alku). null = heti kun edeltäjät sallivat. */
  notBefore: number | null;
}

export interface NetEdge {
  from: string;
  to: string;
  type: DependencyType;
  lag: number;
  /** Kiinteä: seuraajan oma notBefore ohitetaan, jolloin se seuraa edeltäjää myös aikaisemmaksi. */
  rigid?: boolean;
}

export interface NetResult {
  es: Map<string, number>;
  ef: Map<string, number>;
  ls: Map<string, number>;
  lf: Map<string, number>;
  totalFloat: Map<string, number>;
  critical: Set<string>;
  projectStart: number;
  projectEnd: number;
}

export class CycleError extends Error {
  readonly nodeIds: string[];
  constructor(nodeIds: string[]) {
    super('Riippuvuuksissa on kehä: ' + nodeIds.join(' -> '));
    this.nodeIds = nodeIds;
  }
}

const EPS = 1e-6;
const r3 = (x: number) => Math.round(x * 1000) / 1000;

/** Topologinen järjestys (Kahn). Heittää CycleError, jos verkossa on kehä. */
export function topoOrder(nodes: NetNode[], edges: NetEdge[]): string[] {
  const indeg = new Map<string, number>(nodes.map(n => [n.id, 0]));
  const out = new Map<string, string[]>(nodes.map(n => [n.id, []]));
  for (const e of edges) {
    if (!indeg.has(e.from) || !indeg.has(e.to)) throw new RangeError('Riippuvuus viittaa puuttuvaan tehtävään: ' + e.from + ' -> ' + e.to);
    out.get(e.from)!.push(e.to);
    indeg.set(e.to, indeg.get(e.to)! + 1);
  }
  const queue = nodes.filter(n => indeg.get(n.id) === 0).map(n => n.id);
  const order: string[] = [];
  for (let qi = 0; qi < queue.length; qi++) {
    const id = queue[qi];
    order.push(id);
    for (const t of out.get(id)!) {
      const d = indeg.get(t)! - 1;
      indeg.set(t, d);
      if (d === 0) queue.push(t);
    }
  }
  if (order.length < nodes.length) throw new CycleError(findCycle(nodes, out, new Set(order)));
  return order;
}

function findCycle(nodes: NetNode[], out: Map<string, string[]>, done: Set<string>): string[] {
  const state = new Map<string, number>(); // 1 = pinossa, 2 = käsitelty
  const stack: string[] = [];
  const visit = (id: string): string[] | null => {
    state.set(id, 1);
    stack.push(id);
    for (const t of out.get(id)!) {
      if (done.has(t)) continue;
      if (state.get(t) === 1) return stack.slice(stack.indexOf(t)).concat(t);
      if (!state.has(t)) { const c = visit(t); if (c) return c; }
    }
    stack.pop();
    state.set(id, 2);
    return null;
  };
  for (const n of nodes) if (!done.has(n.id) && !state.has(n.id)) { const c = visit(n.id); if (c) return c; }
  return [];
}

/** Seuraajan aikaisin alku, jonka yksi riippuvuus vaatii. */
function requiredStart(e: NetEdge, es: number, ef: number, succDuration: number): number {
  switch (e.type) {
    case 'FS': return ef + e.lag;
    case 'SS': return es + e.lag;
    case 'FF': return ef + e.lag - succDuration;
    case 'SF': return es + e.lag - succDuration;
  }
}

/** Edeltäjän myöhäisin loppu, jonka yksi riippuvuus sallii. */
function allowedFinish(e: NetEdge, ls: number, lf: number, predDuration: number): number {
  switch (e.type) {
    case 'FS': return ls - e.lag;
    case 'SS': return ls - e.lag + predDuration;
    case 'FF': return lf - e.lag;
    case 'SF': return lf - e.lag + predDuration;
  }
}

/**
 * Laskee verkon. origin = aikaisin mahdollinen alku (projektin alku, oletus 0).
 * deadline = projektin vaadittu loppu taaksepäin laskentaan (oletus: laskettu loppu).
 * resolution = aikojen pyöristystarkkuus (oletus 0,001 työpäivää; viivalaskenta käyttää 0,1).
 */
export function computeNetwork(nodes: NetNode[], edges: NetEdge[], opts: { origin?: number; deadline?: number; resolution?: number } = {}): NetResult {
  const origin = opts.origin ?? 0;
  const res = opts.resolution ?? 0.001;
  const inv = 1 / res;
  const rnd = (x: number) => { const v = Math.round(x * inv) / inv; return v === 0 ? 0 : v; };
  const order = topoOrder(nodes, edges);
  const byId = new Map(nodes.map(n => [n.id, n]));
  const inE = new Map<string, NetEdge[]>(nodes.map(n => [n.id, []]));
  const outE = new Map<string, NetEdge[]>(nodes.map(n => [n.id, []]));
  for (const e of edges) { inE.get(e.to)!.push(e); outE.get(e.from)!.push(e); }

  const es = new Map<string, number>(), ef = new Map<string, number>();
  for (const id of order) {
    const n = byId.get(id)!;
    const ins = inE.get(id)!;
    const rigid = ins.some(e => e.rigid);
    let s = rigid || n.notBefore == null ? origin : Math.max(origin, n.notBefore);
    for (const e of ins) s = Math.max(s, requiredStart(e, es.get(e.from)!, ef.get(e.from)!, n.duration));
    const sr = rnd(s);
    es.set(id, sr);
    ef.set(id, rnd(sr + n.duration));
  }
  let projectEnd = origin;
  for (const v of ef.values()) projectEnd = Math.max(projectEnd, v);
  let projectStart = projectEnd;
  for (const v of es.values()) projectStart = Math.min(projectStart, v);
  if (!nodes.length) projectStart = origin;
  const deadline = opts.deadline ?? projectEnd;

  const ls = new Map<string, number>(), lf = new Map<string, number>();
  for (let k = order.length - 1; k >= 0; k--) {
    const id = order[k], n = byId.get(id)!;
    let f = deadline;
    for (const e of outE.get(id)!) f = Math.min(f, allowedFinish(e, ls.get(e.to)!, lf.get(e.to)!, n.duration));
    const fr = rnd(f);
    lf.set(id, fr);
    ls.set(id, rnd(fr - n.duration));
  }
  const totalFloat = new Map<string, number>(), critical = new Set<string>();
  for (const id of order) {
    const tf = r3(ls.get(id)! - es.get(id)!);
    totalFloat.set(id, tf);
    if (tf <= EPS) critical.add(id);
  }
  return { es, ef, ls, lf, totalFloat, critical, projectStart, projectEnd };
}
