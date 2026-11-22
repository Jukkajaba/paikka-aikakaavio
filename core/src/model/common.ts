// Yhteiset perustyypit kaikille tallennettaville tiedoille.

/** UUID-merkkijono. Luodaan myös laitteella (offline), joten tunnisteet eivät mene päällekkäin. */
export type Id = string;

/** Kalenteripäivä muodossa VVVV-KK-PP (ei kellonaikaa, ei aikavyöhykettä). */
export type IsoDate = string;

/** Aikaleima ISO 8601 -muodossa UTC-aikana, esim. 2026-11-22T14:52:00.000Z. */
export type IsoDateTime = string;

/** Kielitunniste, esim. "fi", "sv", "en". */
export type Locale = string;

/** Käännettävä teksti: kieli -> teksti. */
export type LocalizedText = Partial<Record<Locale, string>>;

/**
 * Mistä tieto on tuotu. Uudelleentuonnissa sama ulkoinen tunniste päivittää olemassa olevan rivin
 * eikä luo kaksoiskappaletta. IFC-mallista tuoduilla sijainneilla externalId on IFC GlobalId.
 */
export interface SourceRef {
  /** Lähdejärjestelmä, esim. "excel", "ifc", "api:<integraatio>". */
  system: string;
  /** Tunniste lähdejärjestelmässä. */
  externalId: string;
  importedAt: IsoDateTime;
  /** Saman tuontikerran rivit jakavat tunnisteen (tuonnin voi perua tai toistaa). */
  importBatchId?: Id;
}

/**
 * Jokaisen tallennettavan tiedon perusta.
 * - version kasvaa jokaisessa muutoksessa (samanaikaisen muokkauksen ja offline-synkronoinnin ristiriitojen tunnistus).
 * - deletedAt: poisto on merkintä, ei rivin hävitys. Offline-laite tarvitsee tiedon poistosta synkronoinnissa,
 *   ja muutoshistoria säilyy.
 * - custom: asiakaskohtaiset lisäkentät (määrittely CustomFieldDef).
 */
export interface Entity {
  id: Id;
  organizationId: Id;
  version: number;
  createdAt: IsoDateTime;
  createdBy: Id | null;
  updatedAt: IsoDateTime;
  updatedBy: Id | null;
  deletedAt: IsoDateTime | null;
  source: SourceRef | null;
  custom: Record<string, unknown>;
}

/** Projektiin kuuluvan tiedon perusta. */
export interface ProjectEntity extends Entity {
  projectId: Id;
}

/** Uusi tunniste. Toimii selaimessa ja Node.js:ssä. */
export function newId(): Id {
  return globalThis.crypto.randomUUID();
}

export function nowIso(): IsoDateTime {
  return new Date().toISOString();
}

/** Täyttää perustiedot uudelle entiteetille. */
export function entityBase(organizationId: Id, actorId: Id | null, at: IsoDateTime = nowIso()): Entity {
  return {
    id: newId(),
    organizationId,
    version: 1,
    createdAt: at,
    createdBy: actorId,
    updatedAt: at,
    updatedBy: actorId,
    deletedAt: null,
    source: null,
    custom: {},
  };
}
