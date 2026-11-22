// Määrä, tuotantonopeus, työryhmä ja kesto.
// Tuotantonopeus = yksikköä / pääresurssi (esim. työntekijä) / työpäivä.

const EPS = 1e-9;

/** Kesto työpäivinä, kun työryhmän koko on annettu. */
export function durationFromCrew(quantity: number, productionRate: number, crew: number): number {
  if (!(productionRate > 0) || !(crew > 0)) throw new RangeError('Tuotantonopeuden ja työryhmän pitää olla positiivisia');
  return Math.max(0, quantity) / productionRate / crew;
}

/** Tarvittava työryhmä (kokonaisluku, vähintään 1), kun kesto on annettu. */
export function crewForDuration(quantity: number, productionRate: number, duration: number): number {
  if (!(productionRate > 0) || !(duration > 0)) throw new RangeError('Tuotantonopeuden ja keston pitää olla positiivisia');
  return Math.max(1, Math.ceil(Math.max(0, quantity) / productionRate / duration - EPS));
}

/** Tuotantonopeuden muunnos: yksikköä / tunti -> yksikköä / työpäivä. */
export function ratePerDayFromHourly(ratePerHour: number, hoursPerDay: number): number {
  return ratePerHour * hoursPerDay;
}

/** Henkilötyöpäivät (työmäärä). */
export function manDays(quantity: number, productionRate: number): number {
  if (!(productionRate > 0)) throw new RangeError('Tuotantonopeuden pitää olla positiivinen');
  return Math.max(0, quantity) / productionRate;
}
