# Paikka-aikakaavio (prototyyppi)

Yhden tiedoston rakennusaikataulutyökalu: paikka-aikakaavio, Gantt, riippuvuudet, tavoite/toteuma/ennuste, sijaintipuu, resurssit.

- `aikataulun-piirtoprototyyppi.html` – koko sovellus (logiikka + käyttöliittymä)
- `tests/` – Playwright-savutestit (`node tests/smokeN.js`, ajettava tämän kansion juuresta)
- `tests/obsolete/` – vanhentuneiden ominaisuuksien testit, säilytetty historiaa varten
- `stress_500x300.json` – kuormitustestidata (anonymisoitu)

Julkaistu artifact: yksityinen. Ei käytetä entisen työnantajan koodia tai dataa.

## Testit ja julkaisun tarkistus

- `bash tests/run-all.sh` ajaa kaikki savutestit (`tests/smoke*.js`) ja satunnaistestin (`tests/fuzz.js`, useita siemenlukuja). Palauttaa 0 vain, jos kaikki läpäisevät. Aja ennen jokaista julkaisua.
- Satunnaistestin yksittäinen ajo: `SEED=3 N=300 node tests/fuzz.js` (virheessä tulostuu toimintojen jälki, sama siemenluku toistaa virheen).
- `.github/workflows/test.yml` ajaa saman GitHub Actionsissa (ei vielä kokeiltu).
- Tallennusmuodon muutokset: lisää siirtorutiini `MIGRATIONS`-listan loppuun (ei koskaan muuteta vanhoja). Uudemmalla versiolla tehtyä projektia ei tallenneta takaisin.
- Julkaisun yhteydessä päivitä `APP_BUILD` (näkyy ongelmailmoituksessa).

## Projektin kalenteri
Projektilla on alkupäivä, työviikko (ma–su), valinnainen suomalaisten pyhien vapaapäivät, omat poikkeukset ja työtunnit/pv. Aikajana näyttää kalenteripäivät, vapaat harmaana; työ ei etene vapaina. Viikkonumerointi alkaa projektin alkuviikosta. Tallennusversio 2 (cal).
