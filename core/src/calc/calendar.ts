// Työkalenterilaskenta: päivämäärät <-> työpäiväindeksit.
//
// Laskenta (kestot, riippuvuudet, kriittinen polku) tehdään työpäiväindekseillä: 0 = projektin ensimmäisen
// työpäivän alku, 1,5 = toisen työpäivän puoliväli. Tämä moduuli muuntaa indeksit päivämääriksi ja takaisin
// kalenterin työpäivien, pyhien ja poikkeusten mukaan.
import type { IsoDate } from '../model/common.ts';
import type { Calendar, CalendarException, WorkWeek } from '../model/calendar.ts';
import type { WorkInstant, DateSpan } from '../model/schedule.ts';
import { dayNumber, isoOfDayNumber, weekdayOfDayNumber } from './dates.ts';
import { holidaysFor } from './holidays.ts';

/** Kalenterin säännöt yhdistettynä (perintä ratkaistu). */
export interface CalendarRules {
  workWeek: WorkWeek;
  holidayRegion: string | null;
  /** Poikkeukset päivämäärän mukaan. Omat poikkeukset menevät pyhien ja vanhemman edelle. */
  exceptions: Map<IsoDate, boolean>;
  hoursPerDay: number;
}

/** Yhdistää kalenterin ja sen vanhemmat (lapsen säännöt menevät edelle). */
export function resolveCalendar(cal: Pick<Calendar, 'workWeek' | 'holidayRegion' | 'exceptions' | 'hoursPerDay' | 'parentId'>, lookup?: (id: string) => Calendar | undefined): CalendarRules {
  const chain: Pick<Calendar, 'workWeek' | 'holidayRegion' | 'exceptions' | 'hoursPerDay' | 'parentId'>[] = [cal];
  const seen = new Set<string>();
  let p = cal.parentId;
  while (p && lookup && !seen.has(p)) {
    seen.add(p);
    const c = lookup(p);
    if (!c) break;
    chain.push(c);
    p = c.parentId;
  }
  const exceptions = new Map<IsoDate, boolean>();
  for (let i = chain.length - 1; i >= 0; i--) for (const e of chain[i].exceptions) exceptions.set(e.date, e.working);
  const region = chain.find(c => c.holidayRegion)?.holidayRegion ?? null;
  return { workWeek: cal.workWeek, holidayRegion: region, exceptions, hoursPerDay: cal.hoursPerDay };
}

export function simpleRules(workWeek: WorkWeek, holidayRegion: string | null = null, exceptions: CalendarException[] = [], hoursPerDay = 8): CalendarRules {
  return { workWeek, holidayRegion, exceptions: new Map(exceptions.map(e => [e.date, e.working])), hoursPerDay };
}

const EPS = 1e-9;

/**
 * Aikajana yhdelle kalenterille ja nollakohdalle. Työpäivät haetaan välimuistiin tarpeen mukaan
 * (kumpaankin suuntaan nollakohdasta), joten haku on nopea myös pitkissä projekteissa.
 */
export class WorkTimeline {
  readonly rules: CalendarRules;
  readonly origin: IsoDate;
  /** Työpäivien päivänumerot nollakohdasta eteenpäin: fwd[i] = indeksin i työpäivä. */
  private fwd: number[] = [];
  /** Nollakohtaa edeltävät työpäivät: back[i] = indeksin -(i+1) työpäivä. */
  private back: number[] = [];
  private holidayYears = new Map<number, Set<number>>();
  private readonly originDay: number;

  constructor(rules: CalendarRules, origin: IsoDate) {
    if (!rules.workWeek.some(Boolean) && ![...rules.exceptions.values()].some(Boolean)) throw new RangeError('Kalenterissa ei ole työpäiviä');
    this.rules = rules;
    this.origin = origin;
    this.originDay = dayNumber(origin);
  }

  private isHoliday(n: number): boolean {
    if (!this.rules.holidayRegion) return false;
    const year = new Date(n * 86400000).getUTCFullYear();
    let set = this.holidayYears.get(year);
    if (!set) {
      set = new Set(holidaysFor(this.rules.holidayRegion, year).map(h => dayNumber(h.date)));
      this.holidayYears.set(year, set);
    }
    return set.has(n);
  }

  isWorkdayNumber(n: number): boolean {
    const ex = this.rules.exceptions.get(isoOfDayNumber(n));
    if (ex !== undefined) return ex;
    if (!this.rules.workWeek[weekdayOfDayNumber(n)]) return false;
    return !this.isHoliday(n);
  }

  isWorkday(date: IsoDate): boolean {
    return this.isWorkdayNumber(dayNumber(date));
  }

  /** Työpäivän päivänumero indeksille (kokonaisluku, voi olla negatiivinen). */
  private dayAt(i: number): number {
    const LIMIT = 200000; // noin 550 vuotta: suojaa ikuiselta silmukalta
    if (i >= 0) {
      let n = this.fwd.length ? this.fwd[this.fwd.length - 1] + 1 : this.originDay;
      while (this.fwd.length <= i) {
        if (n - this.originDay > LIMIT) throw new RangeError('Työpäivää ei löydy kalenterista');
        if (this.isWorkdayNumber(n)) this.fwd.push(n);
        n++;
      }
      return this.fwd[i];
    }
    const j = -i - 1;
    let n = this.back.length ? this.back[this.back.length - 1] - 1 : this.originDay - 1;
    while (this.back.length <= j) {
      if (this.originDay - n > LIMIT) throw new RangeError('Työpäivää ei löydy kalenterista');
      if (this.isWorkdayNumber(n)) this.back.push(n);
      n--;
    }
    return this.back[j];
  }

  /** Indeksi työpäivälle, joka on päivämäärä tai sen jälkeinen ensimmäinen työpäivä. */
  private indexOnOrAfter(n: number): number {
    // arvio: kalenteripäivien ero × työpäivien osuus, sitten korjaus
    let i = Math.floor((n - this.originDay) * 5 / 7);
    while (this.dayAt(i) < n) i++;
    while (this.dayAt(i - 1) >= n) i--;
    return i;
  }

  /** Alkuhetken indeksi: päivän alku. Vapaapäivä siirtyy seuraavan työpäivän alkuun. */
  startIndex(date: IsoDate): number {
    return this.indexOnOrAfter(dayNumber(date));
  }

  /** Loppuhetken indeksi päivälle (mukaan lukien): päivän loppu. Vapaapäivä siirtyy edellisen työpäivän loppuun. */
  finishIndex(date: IsoDate): number {
    return this.indexOnOrAfter(dayNumber(date) + 1);
  }

  /** Indeksi -> päivämäärä ja osa päivästä. */
  instantOf(index: number): WorkInstant {
    const i = Math.floor(index + EPS);
    const frac = Math.max(0, Math.round((index - i) * 1000) / 1000);
    return { date: isoOfDayNumber(this.dayAt(i)), frac };
  }

  indexOfInstant(w: WorkInstant): number {
    return this.startIndex(w.date) + (this.isWorkday(w.date) ? w.frac : 0);
  }

  /** Alkuindeksin päivä. */
  startDateOf(index: number): IsoDate {
    return isoOfDayNumber(this.dayAt(Math.floor(index + EPS)));
  }

  /** Loppuindeksin viimeinen (osittainenkin) työpäivä. Loppu 5,0 = indeksin 4 päivä. */
  finishDateOf(endIndex: number): IsoDate {
    return isoOfDayNumber(this.dayAt(Math.ceil(endIndex - EPS) - 1));
  }

  spanOf(start: number, end: number): DateSpan {
    const s = this.startDateOf(start);
    const f = this.finishDateOf(Math.max(end, start + EPS * 10));
    return { start: s, finish: f < s ? s : f };
  }

  /** Työpäivien määrä aikavälillä [a, b] (molemmat mukaan lukien). */
  workdaysBetween(a: IsoDate, b: IsoDate): number {
    return Math.max(0, this.finishIndex(b) - this.startIndex(a));
  }

  /** Lisää työpäiviä päivämäärään: 0 = sama päivä (tai seuraava työpäivä). */
  addWorkdays(date: IsoDate, n: number): IsoDate {
    return this.startDateOf(this.startIndex(date) + n);
  }
}
