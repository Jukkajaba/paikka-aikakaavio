// Aikataulun rakenne: ylätehtävät, viivat, sijaintikohtaiset tehtävät ja riippuvuudet.
//
// Viiva (ScheduleLine) on yksi työlaji sijaintialueen yli: paikka-aikakaavion vino viiva ja Ganttin ylätehtävä.
// Viivasta muodostuu yksi tehtävä (Task) jokaista sijaintia kohden. Tehtävä on oma tallennettava rivinsä, jotta
// sillä on pysyvä tunniste (toteumat, IFC-linkit, integraatiot) ja omat poikkeamat (kesto, määrä, viive, nimi).
import type { Id, IsoDate, ProjectEntity } from './common.ts';

/**
 * Suunniteltu ajankohta: kalenteripäivä + osa päivästä (0 = päivän alku, 0,5 = puolivälissä).
 * Suunnitelma kiinnitetään päivämäärään ja kestot ovat työpäiviä: jos kalenteriin lisätään pyhä,
 * kesto venyy oikein eikä alkupäivä siirry.
 */
export interface WorkInstant {
  date: IsoDate;
  frac: number;
}

/** Ylätehtävä (ryhmä). Voi sisältää viivoja; riippuvuus voi osoittaa ryhmään. */
export interface ScheduleGroup extends ProjectEntity {
  name: string;
  parentId: Id | null; // varaus syvemmälle tehtävähierarkialle, nyt käytössä yksi taso
  sortKey: string;
}

/**
 * Keston laskentatapa:
 * - perLocation: kesto sijaintia kohden × sijainnin osuus (durationPerShare)
 * - total: kokonaiskesto jaetaan sijainneille osuuksien mukaan (totalDuration)
 * - crew: työryhmän koko lukittu, kesto = määrä / tuotantonopeus / ryhmä (lockedCrew)
 */
export type DurationMode = 'perLocation' | 'total' | 'crew';

export interface ScheduleLine extends ProjectEntity {
  tradeId: Id;
  groupId: Id | null;
  /** Sijainniton tehtävä: yksi tehtävä, ei näy paikka-aikakaaviossa. */
  flat: boolean;
  /** Sijaintialue lehtisijaintien järjestyksessä (from -> to, voi kulkea kumpaan suuntaan tahansa). */
  fromLocationId: Id | null;
  toLocationId: Id | null;
  /** Alueen sisällä ohitettavat sijainnit. */
  skipLocationIds: Id[];
  /** Ensimmäisen tehtävän suunniteltu alku. */
  plannedStart: WorkInstant;
  /** Tauko peräkkäisten sijaintien välillä (työpäiviä, negatiivinen = päällekkäisyys). */
  gapDays: number;
  durationMode: DurationMode;
  durationPerShare: number;
  totalDuration: number | null;
  lockedCrew: number | null;
  /** Määrä osuutta kohden (sijainnin määrä = quantityPerShare × osuus, ellei sijainnilla ole omaa). */
  quantityPerShare: number;
  /** Lukittu kokonaismäärä: pysyy samana, kun sijainnit tai osuudet muuttuvat. */
  lockedTotalQuantity: number | null;
  /** Viivakohtainen tuotantonopeus (oletus työlajilta). */
  productionRate: number;
  sortKey: string;
}

/** Sijaintikohtainen tehtävä. Poikkeamat ovat null, kun arvo tulee viivalta. */
export interface Task extends ProjectEntity {
  lineId: Id;
  /** null sijainnittomalla viivalla. */
  locationId: Id | null;
  name: string | null;
  durationOverride: number | null;
  quantityOverride: number | null;
  /** Lisäviive ennen tätä tehtävää (työpäiviä, vain viivan muille kuin ensimmäiselle tehtävälle). */
  shiftDays: number;
  /** Laskennan tulos tallennettuna (raportit, rajapinta, haku). Lähde on aina laskenta, ei käyttäjä. */
  computed: TaskComputed | null;
}

export interface DateSpan {
  start: IsoDate;
  /** Viimeinen työpäivä (mukaan lukien). */
  finish: IsoDate;
}

export interface TaskComputed {
  planned: DateSpan;
  forecast: DateSpan | null;
  crew: number;
  quantity: number;
  totalFloatDays: number | null;
  critical: boolean;
  computedAt: string;
}

/** Riippuvuuden pää: tehtävä, viiva (ylätehtävänä) tai ryhmä. */
export type TaskRef =
  | { kind: 'task'; taskId: Id }
  /** Edeltäjänä viivan viimeisenä päättyvä tehtävä, seuraajana viivan ensimmäinen tehtävä. */
  | { kind: 'line'; lineId: Id }
  /** Edeltäjänä ryhmän loppu, seuraajana ryhmän alku. */
  | { kind: 'group'; groupId: Id };

/** FS = loppu-alku, SS = alku-alku, FF = loppu-loppu, SF = alku-loppu. */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface Dependency extends ProjectEntity {
  from: TaskRef;
  to: TaskRef;
  type: DependencyType;
  /** Viive työpäivinä, negatiivinen = limitys. */
  lagDays: number;
  /** Kiinteä: seuraaja seuraa edeltäjää myös aikaisemmaksi (ei vain työnnä myöhemmäksi). */
  rigid: boolean;
  /** Sijaintien välinen riippuvuus: "sama sijainti" -sääntö koko viivalle (varaus, ei vielä laskennassa). */
  locationMode: 'single' | 'sameLocation';
}
