import type { LineCalcInput } from '../src/calc/line.ts';

/** Viiva oletusarvoilla testeihin. */
export function line(p: Partial<LineCalcInput> = {}): LineCalcInput {
  return {
    flat: false, fromLocationId: null, toLocationId: null, skipLocationIds: [], start: 0, gapDays: 0,
    durationMode: 'perLocation', durationPerShare: 5, totalDuration: null, lockedCrew: null,
    quantityPerShare: 100, lockedTotalQuantity: null, productionRate: 10, overrides: {}, ...p,
  };
}

/** Pieni toistettava satunnaislukugeneraattori (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
