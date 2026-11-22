import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeNetwork, CycleError, type NetNode } from '../src/calc/network.ts';

const n = (id: string, duration: number, notBefore: number | null = null): NetNode => ({ id, duration, notBefore });

test('FS-ketju, kriittinen polku ja pelivara', () => {
  // A(3) -> B(2) -> D(1); A -> C(1) -> D
  const r = computeNetwork([n('A', 3), n('B', 2), n('C', 1), n('D', 1)], [
    { from: 'A', to: 'B', type: 'FS', lag: 0 }, { from: 'B', to: 'D', type: 'FS', lag: 0 },
    { from: 'A', to: 'C', type: 'FS', lag: 0 }, { from: 'C', to: 'D', type: 'FS', lag: 0 },
  ]);
  assert.equal(r.es.get('D'), 5);
  assert.equal(r.projectEnd, 6);
  assert.deepEqual([...r.critical].sort(), ['A', 'B', 'D']);
  assert.equal(r.totalFloat.get('C'), 1);
});

test('riippuvuustyypit ja viiveet', () => {
  const r = computeNetwork([n('A', 4), n('SS', 2), n('FF', 2), n('SF', 2), n('NEG', 2)], [
    { from: 'A', to: 'SS', type: 'SS', lag: 1 },
    { from: 'A', to: 'FF', type: 'FF', lag: 1 },
    { from: 'A', to: 'SF', type: 'SF', lag: 3 },
    { from: 'A', to: 'NEG', type: 'FS', lag: -2 },
  ]);
  assert.equal(r.es.get('SS'), 1);
  assert.equal(r.ef.get('FF'), 5);
  assert.equal(r.ef.get('SF'), 3);
  assert.equal(r.es.get('NEG'), 2);
});

test('notBefore pitää tehtävän piirretyssä kohdassa, kiinteä riippuvuus ohittaa sen', () => {
  const r1 = computeNetwork([n('A', 2), n('B', 2, 10)], [{ from: 'A', to: 'B', type: 'FS', lag: 0 }]);
  assert.equal(r1.es.get('B'), 10);
  const r2 = computeNetwork([n('A', 2), n('B', 2, 10)], [{ from: 'A', to: 'B', type: 'FS', lag: 0, rigid: true }]);
  assert.equal(r2.es.get('B'), 2);
});

test('takaraja tuottaa negatiivisen pelivaran', () => {
  const r = computeNetwork([n('A', 5)], [], { deadline: 4 });
  assert.equal(r.totalFloat.get('A'), -1);
  assert.ok(r.critical.has('A'));
});

test('kehä tunnistetaan ja nimetään', () => {
  assert.throws(
    () => computeNetwork([n('A', 1), n('B', 1), n('C', 1)], [
      { from: 'A', to: 'B', type: 'FS', lag: 0 }, { from: 'B', to: 'C', type: 'FS', lag: 0 }, { from: 'C', to: 'A', type: 'FS', lag: 0 },
    ]),
    (e: unknown) => e instanceof CycleError && e.nodeIds.length === 4 && e.nodeIds[0] === e.nodeIds[3],
  );
});

test('puuttuva solmu riippuvuudessa', () => {
  assert.throws(() => computeNetwork([n('A', 1)], [{ from: 'A', to: 'X', type: 'FS', lag: 0 }]), RangeError);
});

test('suuri verkko lasketaan nopeasti (500 sijaintia × 30 työlajia)', () => {
  const nodes: NetNode[] = [], edges: { from: string; to: string; type: 'FS' | 'SS'; lag: number }[] = [];
  for (let t = 0; t < 30; t++) for (let l = 0; l < 500; l++) {
    nodes.push(n(t + ':' + l, 1, l === 0 ? t * 5 : null));
    if (l > 0) edges.push({ from: t + ':' + (l - 1), to: t + ':' + l, type: 'FS', lag: 0 });
    if (t > 0) edges.push({ from: t - 1 + ':' + l, to: t + ':' + l, type: 'FS', lag: 0 });
  }
  const t0 = performance.now();
  const r = computeNetwork(nodes, edges);
  assert.equal(r.projectEnd, 500 + 145);
  assert.ok(performance.now() - t0 < 1000);
});
