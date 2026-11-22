// Päivämääräapurit. Kalenteripäivät käsitellään päivänumeroina (päiviä 1970-01-01:stä, UTC), jolloin
// aikavyöhykkeet ja kesäaika eivät vaikuta laskentaan.
import type { IsoDate } from '../model/common.ts';

const MS_DAY = 86400000;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(s: unknown): s is IsoDate {
  if (typeof s !== 'string') return false;
  const m = ISO_RE.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

/** IsoDate -> päivänumero. */
export function dayNumber(date: IsoDate): number {
  if (!isIsoDate(date)) throw new RangeError('Virheellinen päivämäärä: ' + String(date));
  const m = ISO_RE.exec(date)!;
  return Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / MS_DAY);
}

/** Päivänumero -> IsoDate. */
export function isoOfDayNumber(n: number): IsoDate {
  return new Date(n * MS_DAY).toISOString().slice(0, 10);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return isoOfDayNumber(dayNumber(date) + days);
}

/** Viikonpäivä: 0 = maanantai ... 6 = sunnuntai. */
export function weekdayMon0(date: IsoDate): number {
  return (dayNumber(date) + 3) % 7; // 1970-01-01 oli torstai
}

export function weekdayOfDayNumber(n: number): number {
  return (((n + 3) % 7) + 7) % 7;
}
