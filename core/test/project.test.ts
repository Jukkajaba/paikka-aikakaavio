import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leafLocations, locationPath, preorder, sortKeyBetween } from '../src/calc/locations.ts';
import { scheduleProject, reconcileTasks } from '../src/calc/project.ts';
import { simpleRules } from '../src/calc/calendar.ts';
import { validateCustomValues } from '../src/calc/customFields.ts';
import { MON_FRI } from '../src/model/calendar.ts';
import type { Location } from '../src/model/project.ts';
import type { Dependency, ScheduleLine, Task } from '../src/model/schedule.ts';
import type { CustomFieldDef } from '../src/model/customFields.ts';
import { entityBase } from '../src/model/common.ts';

const ORG = 'org', P = 'proj';
const base = (id: string) => ({ ...entityBase(ORG, null, '2026-11-22T00:00:00Z'), id, projectId: P });
const loc = (id: string, parentId: string | null, name: string, sortKey: string, share = 1): Location => ({ ...base(id), parentId, name, sortKey, share, ifcGuid: null });

const LOCS: Location[] = [
  loc('B', null, 'Talo B', 'b'), loc('A', null, 'Talo A', 'a'),
  loc('A2', 'A', 'Kerros 2', 'b'), loc('A1', 'A', 'Kerros 1', 'a'),
  loc('B1', 'B', 'Kerros 1', 'a'),
];

test('lehtisijainnit järjestyksessä ja polut', () => {
  assert.deepEqual(preorder(LOCS).map(l => l.id), ['A', 'A1', 'A2', 'B', 'B1']);
  assert.deepEqual(leafLocations(LOCS).map(l => l.id), ['A1', 'A2', 'B1']);
  assert.equal(locationPath(LOCS, 'A2'), 'Talo A › Kerros 2');
  const del = LOCS.map(l => (l.id === 'A2' ? { ...l, deletedAt: '2026-11-22T00:00:00Z' } : l));
  assert.deepEqual(leafLocations(del).map(l => l.id), ['A1', 'B1']);
});

test('järjestysavain mahtuu aina väliin', () => {
  let keys = ['a', 'b'];
  for (let i = 0; i < 200; i++) {
    const k = sortKeyBetween(keys[0], keys[1]); // lisätään aina alkuun
    assert.ok(keys[0] < k && k < keys[1], keys[0] + ' < ' + k + ' < ' + keys[1]);
    keys = [keys[0], k];
  }
  assert.ok(sortKeyBetween(null, 'a') < 'a');
  assert.ok(sortKeyBetween('z', null) > 'z');
});

const mkLine = (id: string, p: Partial<ScheduleLine> = {}): ScheduleLine => ({
  ...base(id), tradeId: 't', groupId: null, flat: false, fromLocationId: 'A1', toLocationId: 'B1', skipLocationIds: [],
  plannedStart: { date: '2027-01-04', frac: 0 }, gapDays: 0, durationMode: 'perLocation', durationPerShare: 5, totalDuration: null,
  lockedCrew: null, quantityPerShare: 100, lockedTotalQuantity: null, productionRate: 10, sortKey: 'a', ...p,
});
const mkTask = (id: string, lineId: string, locationId: string | null, p: Partial<Task> = {}): Task => ({
  ...base(id), lineId, locationId, name: null, durationOverride: null, quantityOverride: null, shiftDays: 0, computed: null, ...p,
});

test('projektin laskenta päivämäärinä Suomen kalenterilla', () => {
  // 2027: pitkäperjantai 26.3. ja 2. pääsiäispäivä 29.3.
  const lines = [mkLine('L1', { plannedStart: { date: '2027-03-22', frac: 0 } }), mkLine('L2', { plannedStart: { date: '2027-03-22', frac: 0 }, durationPerShare: 2 })];
  const tasks = [
    mkTask('t1', 'L1', 'A1'), mkTask('t2', 'L1', 'A2', { durationOverride: 1 }), mkTask('t3', 'L1', 'B1'),
    mkTask('u1', 'L2', 'A1'), mkTask('u2', 'L2', 'A2'),
  ];
  const deps: Dependency[] = [{ ...base('d1'), from: { kind: 'task', taskId: 't1' }, to: { kind: 'task', taskId: 'u1' }, type: 'FS', lagDays: 0, rigid: false, locationMode: 'single' }];
  const out = scheduleProject({ startDate: '2027-01-04', calendar: simpleRules(MON_FRI, 'FI'), locations: LOCS, lines, tasks, dependencies: deps }, 'NOW');
  // L1/A1: 5 työpäivää alkaen ma 22.3. -> 22.–25.3. + 30.3. (26.3. ja 29.3. pyhiä)
  assert.deepEqual(out.computed.get('t1')!.planned, { start: '2027-03-22', finish: '2027-03-30' });
  assert.deepEqual(out.computed.get('t2')!.planned, { start: '2027-03-31', finish: '2027-03-31' });
  assert.deepEqual(out.computed.get('u1')!.planned, { start: '2027-03-31', finish: '2027-04-01' });
  assert.equal(out.computed.get('t1')!.crew, 2);
  assert.deepEqual(out.missingTasks, [{ lineId: 'L2', locationId: 'B1' }]);
});

test('tehtävärivit seuraavat viivan aluetta', () => {
  const leaves = leafLocations(LOCS);
  const l = mkLine('L', { fromLocationId: 'A1', toLocationId: 'A2' });
  const tasks = [mkTask('x', 'L', 'A1'), mkTask('y', 'L', 'B1'), mkTask('z', 'L', 'A2', { deletedAt: '2026-11-01T00:00:00Z' })];
  const r = reconcileTasks(l, tasks, leaves);
  assert.deepEqual(r.create, []);
  assert.deepEqual(r.remove.map(t => t.id), ['y']);
  assert.deepEqual(r.restore.map(t => t.id), ['z']);
  const flat = reconcileTasks(mkLine('F', { flat: true, fromLocationId: null, toLocationId: null }), [], leaves);
  assert.deepEqual(flat.create, [null]);
});

test('lisäkenttien tarkistus', () => {
  const def = (key: string, type: CustomFieldDef['type'], p: Partial<CustomFieldDef> = {}): CustomFieldDef => ({ ...entityBase(ORG, null), target: 'task', key, label: { fi: key }, type, options: [], required: false, sortKey: 'a', ...p });
  const defs = [def('urakoitsija', 'text', { required: true }), def('kustannuspaikka', 'select', { options: ['100', '200'] }), def('valmis', 'date'), def('muu', 'number', { target: 'line' })];
  assert.deepEqual(validateCustomValues(defs, 'task', { urakoitsija: 'LVI Oy', kustannuspaikka: '200', valmis: '2027-02-01', tuntematon: 1 }), []);
  const errs = validateCustomValues(defs, 'task', { kustannuspaikka: '300', valmis: '1.2.2027' });
  assert.deepEqual(errs.map(e => e.key), ['urakoitsija', 'kustannuspaikka', 'valmis']);
});
