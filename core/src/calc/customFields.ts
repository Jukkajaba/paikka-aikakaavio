// Lisäkenttien arvojen tarkistus.
import type { CustomFieldDef, CustomFieldTarget } from '../model/customFields.ts';
import { isIsoDate } from './dates.ts';

export interface CustomFieldError {
  key: string;
  message: string;
}

/** Tarkistaa lisäkenttien arvot määrittelyjä vasten. Tuntemattomat avaimet sallitaan (vanhat tai poistetut kentät säilyvät). */
export function validateCustomValues(defs: CustomFieldDef[], target: CustomFieldTarget, values: Record<string, unknown>): CustomFieldError[] {
  const errs: CustomFieldError[] = [];
  for (const d of defs) {
    if (d.target !== target || d.deletedAt) continue;
    const v = values[d.key];
    if (v === undefined || v === null || v === '') {
      if (d.required) errs.push({ key: d.key, message: 'Pakollinen kenttä' });
      continue;
    }
    switch (d.type) {
      case 'text': if (typeof v !== 'string') errs.push({ key: d.key, message: 'Pitää olla tekstiä' }); break;
      case 'number': if (typeof v !== 'number' || !Number.isFinite(v)) errs.push({ key: d.key, message: 'Pitää olla luku' }); break;
      case 'boolean': if (typeof v !== 'boolean') errs.push({ key: d.key, message: 'Pitää olla kyllä tai ei' }); break;
      case 'date': if (!isIsoDate(v)) errs.push({ key: d.key, message: 'Pitää olla päivämäärä (VVVV-KK-PP)' }); break;
      case 'select': if (typeof v !== 'string' || !d.options.includes(v)) errs.push({ key: d.key, message: 'Ei sallittu vaihtoehto' }); break;
    }
  }
  return errs;
}
