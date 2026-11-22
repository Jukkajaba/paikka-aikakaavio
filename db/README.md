# db – PostgreSQL-tietokanta

- `migrations/` – numeroidut migraatiot, ajetaan järjestyksessä. Ajettua tiedostoa ei muuteta, vaan jokainen muutos tehdään uutena tiedostona (`0002_...sql`).
- `tests/` – tietokantatestit: rajoitteet, muutoshistorian lukitus ja organisaatioiden eristys.

```
for f in db/migrations/*.sql; do psql -v ON_ERROR_STOP=1 -f "$f"; done
for f in db/tests/*.sql; do psql -v ON_ERROR_STOP=1 -f "$f"; done
```

## Periaatteet

- Jokaisella rivillä on `organization_id`, `version`, `deleted_at`, lähdetiedot (`source_*`) ja `custom` (lisäkentät).
- **Organisaatioiden eristys:** rivitason suojaus (RLS). Sovellus käyttää roolia, joka ei omista tauluja, ja asettaa jokaisessa transaktiossa `SET LOCAL app.organization_id = '<uuid>'`. Ilman asetusta mitään ei näy.
- **Muutoshistoria:** `change_event` on vain lisättävissä. `server_seq` antaa synkronoinnin järjestyksen ("kaikki muutokset numeron N jälkeen").
- **Uudelleentuonti:** sama `(source_system, source_external_id)` vain kerran organisaatiossa, joten tuonti päivittää eikä luo kaksoiskappaleita.
- **Kentät vastaavat** `core/src/model`-tyyppejä (snake_case ↔ camelCase).
- Käytössä olevia sarakkeita ei poisteta eikä nimetä uudelleen. Uusi sarake lisätään, ja vanha poistetaan hallitusti myöhemmin.
