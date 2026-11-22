// Muutostapahtumat: muutoshistoria ja offline-synkronointi käyttävät samaa mallia.
import type { Id, IsoDateTime } from './common.ts';

export type EntityType =
  | 'organization' | 'user' | 'membership' | 'projectAccess'
  | 'calendar' | 'project' | 'location' | 'resourceType' | 'trade'
  | 'group' | 'line' | 'task' | 'dependency'
  | 'progress' | 'baseline' | 'baselineTask' | 'customField';

export type ChangeOp = 'create' | 'update' | 'delete';

export interface FieldChange {
  from: unknown;
  to: unknown;
}

/**
 * Yksi muutos yhteen entiteettiin.
 * - Laite luo tapahtuman (id, deviceId, clientTime) ja lähettää sen, kun yhteys on.
 * - Palvelin antaa järjestysnumeron (serverSeq) hyväksyessään. Laitteet hakevat muutokset "seq > viimeisin".
 * - baseVersion: entiteetin versio, johon muutos tehtiin. Jos palvelimen versio on eri, muutos yhdistetään
 *   kenttäkohtaisesti (calc/merge.ts).
 * - Useampi tapahtuma voi kuulua samaan käyttäjän toimintoon (batchId), jolloin kumoa perii ne yhdessä.
 */
export interface ChangeEvent {
  id: Id;
  organizationId: Id;
  projectId: Id | null;
  entityType: EntityType;
  entityId: Id;
  op: ChangeOp;
  /** create: kaikki kentät (from = undefined). update: vain muuttuneet. delete: tyhjä. */
  changes: Record<string, FieldChange>;
  baseVersion: number | null;
  actorId: Id | null;
  deviceId: string | null;
  batchId: Id | null;
  clientTime: IsoDateTime;
  serverSeq: number | null;
  serverTime: IsoDateTime | null;
}
