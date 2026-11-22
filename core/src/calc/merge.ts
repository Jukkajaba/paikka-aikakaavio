// Muutosten muodostus ja yhdistäminen (muutoshistoria ja offline-synkronointi).
//
// Periaate: muutokset yhdistetään kenttäkohtaisesti. Jos kaksi käyttäjää muutti eri kenttiä, molemmat muutokset
// jäävät voimaan. Jos samaa kenttää muutettiin eri arvoihin, syntyy ristiriita, joka näytetään käyttäjälle.
// Toteumakirjaukset ovat lisäyksiä (ProgressEntry), joten niissä ristiriitoja ei synny.
import type { Entity, Id, IsoDateTime } from '../model/common.ts';
import type { ChangeEvent, FieldChange } from '../model/events.ts';
import type { ProgressEntry } from '../model/progress.ts';

/** Kentät, joita muutoshistoria ei seuraa (järjestelmä ylläpitää ne). */
export const SYSTEM_FIELDS = ['id', 'organizationId', 'version', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'];

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return a === b || (a === undefined && b === null) || (a === null && b === undefined);
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  const ka = Object.keys(a as object).filter(k => (a as Record<string, unknown>)[k] !== undefined);
  const kb = Object.keys(b as object).filter(k => (b as Record<string, unknown>)[k] !== undefined);
  if (ka.length !== kb.length) return false;
  return ka.every(k => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

const clone = <T>(x: T): T => (x === undefined ? x : JSON.parse(JSON.stringify(x)));

/** Muuttuneet kentät kahden version välillä. */
export function diffFields(before: object | null, after: object, ignore: string[] = SYSTEM_FIELDS): Record<string, FieldChange> {
  const b = (before || {}) as Record<string, unknown>, a = after as Record<string, unknown>;
  const out: Record<string, FieldChange> = {};
  const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
  for (const k of keys) {
    if (ignore.includes(k)) continue;
    if (!deepEqual(b[k], a[k])) out[k] = { from: clone(b[k]), to: clone(a[k]) };
  }
  return out;
}

export interface Conflict {
  entityId: Id;
  field: string;
  /** Arvo, josta muuttaja lähti. */
  base: unknown;
  /** Muuttajan haluama arvo. */
  incoming: unknown;
  /** Nykyinen (toisen tekemä) arvo, joka jäi voimaan. */
  current: unknown;
  reason: 'field' | 'deleted' | 'exists';
}

export interface ApplyResult<T> {
  entity: T | null;
  applied: string[];
  conflicts: Conflict[];
}

export type ConflictPolicy = 'keepCurrent' | 'takeIncoming';

/**
 * Soveltaa muutostapahtuman nykyiseen entiteettiin.
 * - Kenttä, jonka nykyinen arvo on sama kuin muuttajan lähtöarvo, muutetaan.
 * - Kenttä, jossa on jo haluttu arvo, ohitetaan (sama muutos kahdesti ei ole ristiriita).
 * - Muuten ristiriita. Oletuksena nykyinen arvo jää voimaan ja ristiriita palautetaan ratkaistavaksi.
 * Poisto on merkintä (deletedAt), ja poistettuun kohdistuva muutos on ristiriita.
 */
export function applyChange<T extends Entity>(current: T | null, ev: ChangeEvent, policy: ConflictPolicy = 'keepCurrent'): ApplyResult<T> {
  const at: IsoDateTime = ev.serverTime || ev.clientTime;
  const stamp = (e: T): T => ({ ...e, version: e.version + 1, updatedAt: at, updatedBy: ev.actorId });

  if (ev.op === 'create') {
    const fields: Record<string, unknown> = {};
    for (const k in ev.changes) fields[k] = clone(ev.changes[k].to);
    if (!current) {
      const e = { ...fields, id: ev.entityId, organizationId: ev.organizationId, version: 1, createdAt: at, createdBy: ev.actorId, updatedAt: at, updatedBy: ev.actorId } as unknown as T;
      return { entity: e, applied: Object.keys(ev.changes), conflicts: [] };
    }
    // sama luonti uudelleen (esim. lähetys toistui): ei muutoksia
    const diffs = Object.keys(fields).filter(k => !SYSTEM_FIELDS.includes(k) && !deepEqual((current as Record<string, unknown>)[k], fields[k]));
    return { entity: current, applied: [], conflicts: diffs.map(k => ({ entityId: ev.entityId, field: k, base: undefined, incoming: fields[k], current: (current as Record<string, unknown>)[k], reason: 'exists' as const })) };
  }

  if (!current) return { entity: null, applied: [], conflicts: ev.op === 'update' ? [{ entityId: ev.entityId, field: '*', base: null, incoming: null, current: null, reason: 'deleted' }] : [] };

  if (ev.op === 'delete') {
    if (current.deletedAt) return { entity: current, applied: [], conflicts: [] };
    return { entity: stamp({ ...current, deletedAt: at }), applied: ['deletedAt'], conflicts: [] };
  }

  if (current.deletedAt) return { entity: current, applied: [], conflicts: [{ entityId: ev.entityId, field: '*', base: null, incoming: ev.changes, current: null, reason: 'deleted' }] };

  const next = { ...current } as Record<string, unknown>;
  const applied: string[] = [], conflicts: Conflict[] = [];
  for (const k in ev.changes) {
    if (SYSTEM_FIELDS.includes(k)) continue;
    const ch = ev.changes[k], cur = next[k];
    if (deepEqual(cur, ch.to)) continue;
    if (deepEqual(cur, ch.from) || policy === 'takeIncoming') {
      if (!deepEqual(cur, ch.from)) conflicts.push({ entityId: ev.entityId, field: k, base: ch.from, incoming: ch.to, current: cur, reason: 'field' });
      next[k] = clone(ch.to);
      applied.push(k);
    } else conflicts.push({ entityId: ev.entityId, field: k, base: ch.from, incoming: ch.to, current: cur, reason: 'field' });
  }
  return { entity: applied.length ? stamp(next as T) : current, applied, conflicts };
}

/** Voimassa oleva toteuma: uusin kirjaus (tilannepäivä, sitten kirjausaika). Poistetut ohitetaan. */
export function currentProgress(entries: ProgressEntry[], taskId?: Id): ProgressEntry | null {
  let best: ProgressEntry | null = null;
  for (const e of entries) {
    if (e.deletedAt || (taskId && e.taskId !== taskId)) continue;
    if (!best || e.asOf > best.asOf || (e.asOf === best.asOf && e.enteredAt > best.enteredAt)) best = e;
  }
  return best;
}
