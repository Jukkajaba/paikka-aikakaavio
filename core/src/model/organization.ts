// Organisaatiot, käyttäjät ja oikeudet. Vastaa suunnitelmaa "Käyttäjähallinta ja laskutus".
import type { Entity, Id, IsoDateTime, Locale } from './common.ts';

/** Asiakasyritys: laskutettava yksikkö ja tiedon eristyksen raja. */
export interface Organization extends Entity {
  name: string;
  businessId: string | null; // y-tunnus
  defaultLocale: Locale;
  /** Organisaation oletuskalenteri uusille projekteille. */
  defaultCalendarId: Id | null;
}

/** Henkilö. Voi kuulua useaan organisaatioon (esim. aliurakoitsija). organizationId = kotiorganisaatio. */
export interface User extends Entity {
  email: string;
  name: string;
  locale: Locale | null;
}

export type OrgRole = 'admin' | 'member';

/** Käyttäjän jäsenyys organisaatiossa. Päättyminen säilyttää historian (ei poisteta). */
export interface Membership extends Entity {
  userId: Id;
  role: OrgRole;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime | null;
}

export type ProjectRole = 'editor' | 'viewer';

/** Oikeus yksittäiseen projektiin. Mahdollistaa ulkopuolisen käyttäjän pääsyn vain yhteen projektiin. */
export interface ProjectAccess extends Entity {
  projectId: Id;
  userId: Id;
  role: ProjectRole;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime | null;
}
