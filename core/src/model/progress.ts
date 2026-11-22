// Toteumat ja vertailuaikataulut.
import type { Id, IsoDate, IsoDateTime, ProjectEntity } from './common.ts';
import type { DateSpan } from './schedule.ts';

/**
 * Toteumakirjaus. Kirjaukset ovat aina lisäyksiä, eivät korvaa toisiaan: kaksi offline-laitetta voi kirjata
 * samaan tehtävään ilman ristiriitaa. Voimassa oleva tila = uusin kirjaus (currentProgress).
 */
export interface ProgressEntry extends ProjectEntity {
  taskId: Id;
  /** Päivä, jota kirjaus koskee (tilannepäivä). */
  asOf: IsoDate;
  percentComplete: number;
  actualStart: IsoDate | null;
  actualFinish: IsoDate | null;
  /** Toteutunut määrä tähän mennessä (valinnainen, tuottavuuden seurantaan). */
  quantityDone: number | null;
  crewOnSite: number | null;
  note: string | null;
  enteredBy: Id | null;
  enteredAt: IsoDateTime;
}

/** Vertailuaikataulu: aikataulun tilannekuva tiettynä päivänä (esim. urakkaohjelma). */
export interface Baseline extends ProjectEntity {
  name: string;
  takenAt: IsoDateTime;
  takenBy: Id | null;
  /** Merkitty päävertailuksi (esim. sopimusaikataulu). */
  primary: boolean;
}

export interface BaselineTask extends ProjectEntity {
  baselineId: Id;
  taskId: Id;
  lineId: Id;
  locationId: Id | null;
  planned: DateSpan;
  quantity: number;
  crew: number;
}
