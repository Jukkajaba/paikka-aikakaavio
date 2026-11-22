// Asiakaskohtaiset lisäkentät: organisaatio määrittelee kentät itse, arvot ovat entiteetin custom-kentässä.
import type { Entity, LocalizedText } from './common.ts';

export type CustomFieldTarget = 'project' | 'location' | 'trade' | 'line' | 'task';
export type CustomFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export interface CustomFieldDef extends Entity {
  target: CustomFieldTarget;
  /** Tallennusavain custom-objektissa. Ei muutu, vaikka nimi muuttuu. */
  key: string;
  label: LocalizedText;
  type: CustomFieldType;
  /** select-tyypin vaihtoehdot. */
  options: string[];
  required: boolean;
  sortKey: string;
}
