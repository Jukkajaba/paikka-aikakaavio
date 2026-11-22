// Sijaintipuun käsittely: lehtisijainnit aikataulutusjärjestyksessä ja näyttönimet.
import type { Location } from '../model/project.ts';
import type { LeafLocation } from './line.ts';

type Loc = Pick<Location, 'id' | 'parentId' | 'name' | 'sortKey' | 'share'> & { deletedAt?: string | null };

/** Puun solmut esijärjestyksessä (vanhempi ennen lapsiaan, sisarukset sortKeyn mukaan). Poistetut ohitetaan. */
export function preorder<T extends Loc>(locations: T[]): T[] {
  const alive = locations.filter(l => !l.deletedAt);
  const ids = new Set(alive.map(l => l.id));
  const kids = new Map<string, T[]>();
  for (const l of alive) {
    const p = l.parentId && ids.has(l.parentId) ? l.parentId : '';
    if (!kids.has(p)) kids.set(p, []);
    kids.get(p)!.push(l);
  }
  for (const arr of kids.values()) arr.sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : a.id < b.id ? -1 : 1));
  const out: T[] = [];
  const seen = new Set<string>();
  const walk = (p: string) => {
    for (const n of kids.get(p) || []) {
      if (seen.has(n.id)) continue; // suoja kehältä
      seen.add(n.id);
      out.push(n);
      walk(n.id);
    }
  };
  walk('');
  return out;
}

/** Lehtisijainnit (ei lapsia) esijärjestyksessä: aikataulutuksen sijainnit. */
export function leafLocations(locations: Loc[]): LeafLocation[] {
  const ordered = preorder(locations);
  const hasKid = new Set(ordered.filter(l => l.parentId).map(l => l.parentId as string));
  return ordered.filter(l => !hasKid.has(l.id)).map(l => ({ id: l.id, share: l.share }));
}

/** Polku juuresta, esim. "Talo A › Rappu B › Kerros 3". */
export function locationPath(locations: Loc[], id: string, sep = ' › '): string {
  const by = new Map(locations.map(l => [l.id, l]));
  const parts: string[] = [];
  const seen = new Set<string>();
  let cur = by.get(id);
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    parts.unshift(cur.name);
    cur = cur.parentId ? by.get(cur.parentId) : undefined;
  }
  return parts.join(sep);
}

/**
 * Järjestysavain kahden avaimen väliin (a < tulos < b). Tyhjä = ei rajaa. Avaimet ovat merkkijonoja,
 * jotta sijainnin voi siirtää numeroimatta muita uudelleen (vähemmän muutoksia ja synkronointiristiriitoja).
 */
export function sortKeyBetween(a: string | null, b: string | null): string {
  const lo = a || '', hi = b || null;
  if (hi !== null && lo >= hi) throw new RangeError('sortKeyBetween: a >= b');
  if (lo.endsWith('0') || (hi && hi.endsWith('0'))) throw new RangeError('sortKeyBetween: avain ei saa päättyä nollaan');
  return midpoint(lo, hi);
}

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

// Murto-osaindeksointi (fractional indexing): avaimet eivät koskaan pääty nollaan, joten väliin mahtuu aina uusi.
function midpoint(a: string, b: string | null): string {
  if (b !== null) {
    let n = 0;
    while ((a[n] || '0') === b[n]) n++;
    if (n > 0) return b.slice(0, n) + midpoint(a.slice(n), b.slice(n));
  }
  const da = a ? DIGITS.indexOf(a[0]) : 0;
  const db = b !== null ? DIGITS.indexOf(b[0]) : DIGITS.length;
  if (db - da > 1) return DIGITS[Math.round(0.5 * (da + db))];
  if (b && b.length > 1) return b.slice(0, 1);
  return DIGITS[da] + midpoint(a.slice(1), null);
}
