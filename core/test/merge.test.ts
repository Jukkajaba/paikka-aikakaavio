import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyChange, diffFields, currentProgress, deepEqual } from '../src/calc/merge.ts';
import type { ChangeEvent } from '../src/model/events.ts';
import type { Entity } from '../src/model/common.ts';
import type { ProgressEntry } from '../src/model/progress.ts';

interface Thing extends Entity { name: string; duration: number; tags: string[] }

const base: Thing = {
  id: 't1', organizationId: 'o', version: 3, createdAt: '2026-11-01T00:00:00Z', createdBy: 'u1', updatedAt: '2026-11-01T00:00:00Z', updatedBy: 'u1',
  deletedAt: null, source: null, custom: {}, name: 'Levytys', duration: 5, tags: ['a'],
};

const ev = (changes: ChangeEvent['changes'], p: Partial<ChangeEvent> = {}): ChangeEvent => ({
  id: 'e', organizationId: 'o', projectId: 'p', entityType: 'task', entityId: 't1', op: 'update', changes, baseVersion: 3,
  actorId: 'u2', deviceId: 'tabletti', batchId: null, clientTime: '2026-11-22T10:00:00Z', serverSeq: null, serverTime: null, ...p,
});

test('diff näyttää vain muuttuneet kentät', () => {
  const d = diffFields(base, { ...base, duration: 6, version: 9 });
  assert.deepEqual(d, { duration: { from: 5, to: 6 } });
});

test('eri kenttien muutokset yhdistyvät ilman ristiriitaa', () => {
  const server = { ...base, name: 'Levytys 2', version: 4 }; // toinen käyttäjä muutti nimen
  const r = applyChange(server, ev({ duration: { from: 5, to: 7 } }));
  assert.equal(r.conflicts.length, 0);
  assert.equal(r.entity!.name, 'Levytys 2');
  assert.equal(r.entity!.duration, 7);
  assert.equal(r.entity!.version, 5);
  assert.equal(r.entity!.updatedBy, 'u2');
});

test('saman kentän eri arvo on ristiriita, nykyinen arvo jää voimaan', () => {
  const server = { ...base, duration: 8, version: 4 };
  const r = applyChange(server, ev({ duration: { from: 5, to: 7 } }));
  assert.equal(r.entity!.duration, 8);
  assert.equal(r.conflicts.length, 1);
  assert.deepEqual({ base: r.conflicts[0].base, incoming: r.conflicts[0].incoming, current: r.conflicts[0].current }, { base: 5, incoming: 7, current: 8 });
  const r2 = applyChange(server, ev({ duration: { from: 5, to: 7 } }), 'takeIncoming');
  assert.equal(r2.entity!.duration, 7);
});

test('sama muutos kahdesti ei ole ristiriita eikä kasvata versiota', () => {
  const server = { ...base, duration: 7, version: 4 };
  const r = applyChange(server, ev({ duration: { from: 5, to: 7 } }));
  assert.equal(r.conflicts.length, 0);
  assert.equal(r.entity!.version, 4);
});

test('poisto on merkintä ja poistettuun kohdistuva muutos on ristiriita', () => {
  const del = applyChange(base, ev({}, { op: 'delete' }));
  assert.ok(del.entity!.deletedAt);
  const upd = applyChange(del.entity, ev({ duration: { from: 5, to: 6 } }));
  assert.equal(upd.conflicts[0].reason, 'deleted');
});

test('luonti ja toistettu luonti', () => {
  const c = ev({ name: { from: undefined, to: 'Uusi' }, duration: { from: undefined, to: 1 } }, { op: 'create', entityId: 'n1' });
  const r = applyChange<Thing>(null, c);
  assert.equal(r.entity!.id, 'n1');
  assert.equal(r.entity!.version, 1);
  const again = applyChange(r.entity, c);
  assert.equal(again.conflicts.length, 0);
});

test('taulukot ja objektit vertaillaan sisällön mukaan', () => {
  assert.ok(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }));
  assert.ok(!deepEqual({ a: [1, 2] }, { a: [2, 1] }));
  const r = applyChange(base, ev({ tags: { from: ['a'], to: ['a', 'b'] } }));
  assert.deepEqual(r.entity!.tags, ['a', 'b']);
});

test('voimassa oleva toteuma = uusin kirjaus', () => {
  const p = (id: string, asOf: string, pct: number, at: string, del = false): ProgressEntry => ({
    id, organizationId: 'o', projectId: 'p', version: 1, createdAt: at, createdBy: null, updatedAt: at, updatedBy: null,
    deletedAt: del ? at : null, source: null, custom: {}, taskId: 'T', asOf, percentComplete: pct, actualStart: '2027-01-04',
    actualFinish: null, quantityDone: null, crewOnSite: null, note: null, enteredBy: null, enteredAt: at,
  });
  const entries = [p('1', '2027-01-08', 40, '2027-01-08T15:00Z'), p('2', '2027-01-11', 60, '2027-01-11T09:00Z'), p('3', '2027-01-11', 70, '2027-01-11T12:00Z'), p('4', '2027-01-12', 90, '2027-01-12T12:00Z', true)];
  assert.equal(currentProgress(entries)!.percentComplete, 70);
  assert.equal(currentProgress(entries, 'muu'), null);
});
