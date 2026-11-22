# Paikka-aikakaavio (prototyyppi)

Yhden tiedoston rakennusaikataulutyökalu: paikka-aikakaavio, Gantt, riippuvuudet, tavoite/toteuma/ennuste, sijaintipuu, resurssit.

- `aikataulun-piirtoprototyyppi.html` – koko sovellus (logiikka + käyttöliittymä)
- `tests/` – Playwright-savutestit (`node tests/smokeN.js`, ajettava tämän kansion juuresta)
- `tests/obsolete/` – vanhentuneiden ominaisuuksien testit, säilytetty historiaa varten
- `stress_500x300.json` – kuormitustestidata (anonymisoitu)

## Tuotantoversion perusta

- `core/` – yhteinen tietomalli ja aikataululaskenta (TypeScript, selain ja palvelin). Ks. [core/README.md](core/README.md).
- `db/` – PostgreSQL-migraatiot ja tietokantatestit. Ks. [db/README.md](db/README.md).
- `.github/workflows/ci.yml` – testit ja tarkistukset ajetaan automaattisesti jokaisesta muutoksesta.

Julkaistu artifact: yksityinen. Ei käytetä entisen työnantajan koodia tai dataa.
