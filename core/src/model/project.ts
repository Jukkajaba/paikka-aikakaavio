// Projekti, sijainnit, työlajit ja resurssit.
import type { Entity, Id, IsoDate, Locale, ProjectEntity } from './common.ts';

export type ProjectStatus = 'planning' | 'active' | 'archived';

export interface Project extends Entity {
  name: string;
  status: ProjectStatus;
  calendarId: Id;
  /** Aikataulun nollakohta: ensimmäinen mahdollinen työpäivä. */
  startDate: IsoDate;
  /** Tavoitevalmistuminen (vertailuun ja ennusteeseen). */
  targetEndDate: IsoDate | null;
  /** Tilannepäivä: toteumat ja ennuste lasketaan tähän päivään. */
  statusDate: IsoDate | null;
  locale: Locale;
  /** IFC-linkin URL-pohja, esim. "https://viewer.example/?model=X&guid={guid}". */
  modelLinkTemplate: string | null;
}

/**
 * Sijaintipuu (talo > rappu > kerros > lohko > asunto). Aikataulutus käyttää lehtisijainteja
 * esijärjestyksessä (sortKey vanhemman sisällä). Ensimmäinen = alinna paikka-aikakaaviossa.
 */
export interface Location extends ProjectEntity {
  parentId: Id | null;
  name: string;
  /** Järjestys sisarusten kesken. Merkkijono, jotta väliin voi lisätä numeroimatta muita uudelleen. */
  sortKey: string;
  /** Suhteellinen työmäärä (1 = tavallinen). Määrät ja kestot jakautuvat osuuksien mukaan. */
  share: number;
  /** IFC-mallin tilan tai alueen GlobalId, jos sijainti on tuotu tai linkitetty malliin. */
  ifcGuid: string | null;
}

/** Resurssityyppi: työntekijät, nosturi, tietty kalusto. Pääresurssi määrää keston. */
export interface ResourceType extends ProjectEntity {
  name: string;
  unit: string;
  /** Käytettävissä oleva määrä samaan aikaan (ylitäytön tarkistus), null = ei rajaa. */
  available: number | null;
}

export interface TradeExtraResource {
  resourceTypeId: Id;
  /** Määrä pääresurssin yksikköä kohden (esim. 0,5 nosturia / työntekijä). */
  perMainUnit: number;
}

/** Työlaji (suorite). */
export interface Trade extends ProjectEntity {
  name: string;
  code: string | null; // littera / nimikekoodi
  unit: string;
  /** Tuotantonopeus: yksikköä / pääresurssi / työpäivä. */
  productionRate: number;
  /** Työjärjestys: pienempi tehdään ensin samassa sijainnissa, samat saavat olla päällekkäin. */
  rank: number;
  maxCrew: number | null;
  color: string;
  mainResourceTypeId: Id | null;
  extraResources: TradeExtraResource[];
  /** Oma kalenteri (esim. vuorotyö). null = projektin kalenteri. */
  calendarId: Id | null;
}
