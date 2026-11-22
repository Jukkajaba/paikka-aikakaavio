// Työkalenterit: mitkä päivät ovat työpäiviä. Kaikki kestot ovat työpäiviä ja lasketaan kalenterin kautta.
import type { Entity, Id, IsoDate } from './common.ts';

/** Viikon työpäivät maanantaista sunnuntaihin. */
export type WorkWeek = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

export const MON_FRI: WorkWeek = [true, true, true, true, true, false, false];

export interface CalendarException {
  date: IsoDate;
  /** true = työpäivä (esim. lauantaityö), false = vapaapäivä (pyhä, loma). */
  working: boolean;
  name?: string;
}

/**
 * Kalenteri. Projektilla on yksi kalenteri; tehtävällä tai työlajilla voi myöhemmin olla oma
 * (esim. vuorotyö). parentId: periytyy toisesta kalenterista, omat poikkeukset menevät edelle.
 */
export interface Calendar extends Entity {
  name: string;
  parentId: Id | null;
  workWeek: WorkWeek;
  /** Työtunteja päivässä. Tarvitaan, kun tuotantonopeus annetaan tunteina. */
  hoursPerDay: number;
  /** Lisää automaattisesti maan arkipyhät (esim. "FI"). */
  holidayRegion: string | null;
  exceptions: CalendarException[];
}
