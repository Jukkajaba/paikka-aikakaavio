// Maakohtaiset arkipyhät. Lisätään kalenteriin, kun Calendar.holidayRegion on asetettu.
import type { IsoDate } from '../model/common.ts';
import { addDays, isoOfDayNumber, dayNumber, weekdayMon0 } from './dates.ts';

export interface Holiday {
  date: IsoDate;
  name: string;
}

/** Pääsiäispäivä (gregoriaaninen kalenteri, Meeus/Jones/Butcher). */
export function easterSunday(year: number): IsoDate {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number): IsoDate => y + '-' + pad(m) + '-' + pad(d);

/** Ensimmäinen annettu viikonpäivä (0 = ma) aikavälillä alkaen päivästä. */
function firstWeekdayFrom(date: IsoDate, weekday: number): IsoDate {
  const n = dayNumber(date), w = weekdayMon0(date);
  return isoOfDayNumber(n + ((weekday - w + 7) % 7));
}

/**
 * Suomen pyhät ja aatot, jotka ovat yleisesti vapaapäiviä. Myös viikonloppuun osuvat ovat listassa
 * (kalenteri voi sisältää lauantaityötä).
 */
export function finnishHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);
  return [
    { date: ymd(year, 1, 1), name: 'Uudenvuodenpäivä' },
    { date: ymd(year, 1, 6), name: 'Loppiainen' },
    { date: addDays(easter, -2), name: 'Pitkäperjantai' },
    { date: easter, name: 'Pääsiäispäivä' },
    { date: addDays(easter, 1), name: '2. pääsiäispäivä' },
    { date: ymd(year, 5, 1), name: 'Vappu' },
    { date: addDays(easter, 39), name: 'Helatorstai' },
    { date: addDays(easter, 49), name: 'Helluntaipäivä' },
    { date: firstWeekdayFrom(ymd(year, 6, 19), 4), name: 'Juhannusaatto' },
    { date: firstWeekdayFrom(ymd(year, 6, 20), 5), name: 'Juhannuspäivä' },
    { date: firstWeekdayFrom(ymd(year, 10, 31), 5), name: 'Pyhäinpäivä' },
    { date: ymd(year, 12, 6), name: 'Itsenäisyyspäivä' },
    { date: ymd(year, 12, 24), name: 'Jouluaatto' },
    { date: ymd(year, 12, 25), name: 'Joulupäivä' },
    { date: ymd(year, 12, 26), name: 'Tapaninpäivä' },
  ];
}

const REGIONS: Record<string, (year: number) => Holiday[]> = { FI: finnishHolidays };

export function holidaysFor(region: string, year: number): Holiday[] {
  const f = REGIONS[region.toUpperCase()];
  if (!f) throw new RangeError('Tuntematon pyhäpäiväalue: ' + region);
  return f(year);
}

export function supportedHolidayRegions(): string[] {
  return Object.keys(REGIONS);
}
