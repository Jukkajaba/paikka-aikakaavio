import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeSchedule, type EngineLine } from '../src/calc/schedule.ts';
import { expandLine, lineRange, distributeTotal } from '../src/calc/line.ts';
import { durationFromCrew, crewForDuration, manDays } from '../src/calc/quantity.ts';
import { line, rng } from './helpers.ts';

const LOCS = [1, 2, 3, 4].map(i => ({ id: 'k' + i, share: 1 }));
const L = (id: string, p: Partial<EngineLine> = {}): EngineLine => ({ ...line({ fromLocationId: 'k1', toLocationId: 'k4', ...p }), id, groupId: p.groupId ?? null });

test('viivan purku: kesto, tauko ja suunta', () => {
  const ts = expandLine(line({ fromLocationId: 'k4', toLocationId: 'k2', durationPerShare: 2, gapDays: 1, start: 3 }), LOCS);
  assert.deepEqual(ts.map(t => [t.locationId, t.start, t.end]), [['k4', 3, 5], ['k3', 6, 8], ['k2', 9, 11]]);
  assert.equal(lineRange(line({ fromLocationId: 'k1', toLocationId: 'k4', skipLocationIds: ['k2'] }), LOCS).indexes.join(), '0,2,3');
});

test('kokonaiskesto jakautuu osuuksien mukaan ja summa täsmää', () => {
  const locs = [{ id: 'a', share: 1 }, { id: 'b', share: 2 }, { id: 'c', share: 1 }];
  const l = line({ fromLocationId: 'a', toLocationId: 'c', durationMode: 'total', totalDuration: 10 });
  const d = distributeTotal(l, locs, lineRange(l, locs));
  assert.deepEqual([...d.values()], [2.5, 5, 2.5]);
  const ts = expandLine(l, locs);
  assert.equal(ts[ts.length - 1].end, 10);
});

test('lukittu työryhmä määrää keston', () => {
  const ts = expandLine(line({ fromLocationId: 'k1', toLocationId: 'k1', durationMode: 'crew', lockedCrew: 4, quantityPerShare: 200, productionRate: 10 }), LOCS);
  assert.equal(ts[0].duration, 5);
  assert.equal(ts[0].crew, 4);
  assert.equal(durationFromCrew(200, 10, 4), 5);
  assert.equal(crewForDuration(200, 10, 3), 7);
  assert.equal(manDays(200, 10), 20);
});

test('ilman riippuvuuksia aikataulu = viivojen purku', () => {
  const R = rng(7);
  const lines = Array.from({ length: 20 }, (_, i) => L('v' + i, { start: Math.round(R() * 20), durationPerShare: 1 + Math.round(R() * 4), gapDays: [0, 1, -1, 0.5][i % 4] }));
  const res = computeSchedule({ locations: LOCS, lines, dependencies: [] });
  for (const l of lines) {
    const exp = expandLine(l, LOCS), got = res.byLine.get(l.id)!;
    exp.forEach((t, k) => { assert.equal(got[k].start, t.start); assert.equal(got[k].end, t.end); assert.equal(got[k].movedBy, 0); });
  }
});

test('FS-riippuvuus työntää seuraajaa ja viiva seuraa perässä', () => {
  const res = computeSchedule({
    locations: LOCS,
    lines: [L('runko', { durationPerShare: 5 }), L('ikkunat', { durationPerShare: 2, start: 0 })],
    dependencies: [{ id: 'd1', from: { kind: 'task', lineId: 'runko', locationId: 'k1' }, to: { kind: 'task', lineId: 'ikkunat', locationId: 'k1' }, type: 'FS', lag: 1, rigid: false }],
  });
  const ik = res.byLine.get('ikkunat')!;
  assert.equal(ik[0].start, 6);
  assert.equal(ik[0].movedBy, 6);
  assert.deepEqual(ik.map(t => t.start), [6, 8, 10, 12]);
});

test('kiinteä riippuvuus vetää seuraajan aikaisemmaksi', () => {
  const res = computeSchedule({
    locations: LOCS,
    lines: [L('a', { durationPerShare: 1, fromLocationId: 'k1', toLocationId: 'k1' }), L('b', { durationPerShare: 1, start: 10, fromLocationId: 'k1', toLocationId: 'k1' })],
    dependencies: [{ id: 'd', from: { kind: 'line', lineId: 'a' }, to: { kind: 'line', lineId: 'b' }, type: 'FS', lag: 0, rigid: true }],
  });
  assert.equal(res.byLine.get('b')![0].start, 1);
});

test('viivaviite: edeltäjänä viivan loppu, seuraajana alku', () => {
  const res = computeSchedule({
    locations: LOCS,
    lines: [L('a', { durationPerShare: 2 }), L('b', { durationPerShare: 1 })],
    dependencies: [{ id: 'd', from: { kind: 'line', lineId: 'a' }, to: { kind: 'line', lineId: 'b' }, type: 'FS', lag: 0, rigid: false }],
  });
  assert.equal(res.byLine.get('b')![0].start, 8);
});

test('ryhmä siirtyy kokonaisuutena ja keskinäiset erot säilyvät', () => {
  const res = computeSchedule({
    locations: LOCS,
    lines: [
      L('pohja', { durationPerShare: 3, fromLocationId: 'k1', toLocationId: 'k1' }),
      L('g1', { groupId: 'G', start: 0, durationPerShare: 1 }),
      L('g2', { groupId: 'G', start: 2, durationPerShare: 1 }),
    ],
    dependencies: [{ id: 'd', from: { kind: 'line', lineId: 'pohja' }, to: { kind: 'group', groupId: 'G' }, type: 'FS', lag: 0, rigid: false }],
  });
  assert.equal(res.byLine.get('g1')![0].start, 3);
  assert.equal(res.byLine.get('g2')![0].start, 5);
});

test('puuttuvaan viivaan osoittava riippuvuus ohitetaan ja raportoidaan', () => {
  const res = computeSchedule({
    locations: LOCS, lines: [L('a')],
    dependencies: [{ id: 'x', from: { kind: 'line', lineId: 'poistettu' }, to: { kind: 'line', lineId: 'a' }, type: 'FS', lag: 0, rigid: false }],
  });
  assert.deepEqual(res.skippedDependencies, ['x']);
});

test('kriittinen polku kulkee viivojen läpi', () => {
  const res = computeSchedule({
    locations: LOCS,
    lines: [L('a', { durationPerShare: 2 }), L('b', { durationPerShare: 2 }), L('sivu', { durationPerShare: 0.5, fromLocationId: 'k1', toLocationId: 'k1' })],
    dependencies: [{ id: 'd', from: { kind: 'task', lineId: 'a', locationId: 'k4' }, to: { kind: 'task', lineId: 'b', locationId: 'k1' }, type: 'FS', lag: 0, rigid: false }],
  });
  assert.ok(res.byLine.get('a')!.every(t => t.critical));
  assert.ok(res.byLine.get('b')!.every(t => t.critical));
  assert.ok(!res.byLine.get('sivu')![0].critical);
  assert.equal(res.projectEnd, 16);
});
