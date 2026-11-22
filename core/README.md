# core – tietomalli ja aikataululaskenta

Yhteinen TypeScript-moduuli, jota sekä selain (myös ilman verkkoyhteyttä) että palvelin käyttävät. Laskenta antaa siksi samat tulokset kummassakin. Moduulissa ei ole ulkoisia ajonaikaisia riippuvuuksia.

## Ajaminen

Vaatii Node.js 22.18 tai uudemman. Node ajaa TypeScriptin suoraan ilman käännösvaihetta.

```
cd core
npm install        # vain tyyppitarkistusta varten (typescript, @types/node)
npm test           # kaikki testit
npm run typecheck  # tyyppitarkistus
```

Testit ajetaan GitHubissa automaattisesti jokaisesta muutoksesta (`.github/workflows/ci.yml`).

## Rakenne

| Tiedosto | Sisältö |
|---|---|
| `src/model/common.ts` | Perustiedot kaikille riveille: UUID, versio, poistomerkintä, lähdetieto, lisäkentät |
| `src/model/organization.ts` | Organisaatio, käyttäjä, jäsenyys, projektikohtainen oikeus |
| `src/model/calendar.ts` | Työkalenteri: työviikko, pyhäalue, poikkeukset, perintä |
| `src/model/project.ts` | Projekti, sijaintipuu, resurssityypit, työlajit |
| `src/model/schedule.ts` | Ylätehtävät, viivat, sijaintikohtaiset tehtävät, riippuvuudet (FS/SS/FF/SF) |
| `src/model/progress.ts` | Toteumakirjaukset (lisäyksiä), vertailuaikataulut |
| `src/model/customFields.ts` | Asiakaskohtaisten lisäkenttien määrittely |
| `src/model/events.ts` | Muutostapahtuma: muutoshistoria ja offline-synkronointi |
| `src/calc/calendar.ts` | Päivämäärät ↔ työpäiväindeksit kalenterin mukaan |
| `src/calc/holidays.ts` | Suomen arkipyhät (pääsiäisen laskenta mukana) |
| `src/calc/line.ts` | Viivan purku sijaintikohtaisiksi tehtäviksi (siirretty prototyypistä) |
| `src/calc/network.ts` | Verkkolaskenta: aikaisimmat ja myöhäisimmät ajat, pelivara, kriittinen polku, kehien tunnistus |
| `src/calc/schedule.ts` | Koko aikataulu: viivat + riippuvuudet (tehtävä, viiva, ryhmä) verkoksi |
| `src/calc/project.ts` | Tallennetut tiedot → laskenta → päivämäärät; tehtävärivien ylläpito |
| `src/calc/merge.ts` | Muutosten kenttäkohtainen yhdistäminen ja ristiriidat |
| `src/calc/locations.ts` | Sijaintipuun järjestys, polut, järjestysavaimet |
| `src/calc/quantity.ts` | Määrä, tuotantonopeus, työryhmä ja kesto |
| `src/calc/customFields.ts` | Lisäkenttien arvojen tarkistus |

## Keskeiset päätökset

- **Ajat:** laskenta käyttää työpäiväindeksejä (0 = projektin ensimmäisen työpäivän alku). Tallennettu suunnitelma kiinnitetään päivämäärään (`WorkInstant`) ja kestot ovat työpäiviä, joten pyhän lisääminen kalenteriin pidentää kestoa oikein. Toteumat ovat kalenteripäiviä.
- **Tarkkuus:** kestot ja ajat 0,1 työpäivää, kuten prototyypissä.
- **Tuotantonopeus:** yksikköä / pääresurssi / työpäivä. Tuntipohjainen nopeus muunnetaan kalenterin `hoursPerDay`-arvolla.
- **Tehtävä on oma rivinsä:** jokaisella viivan sijainnilla on pysyvä tunniste, johon toteumat, IFC-linkit ja integraatiot viittaavat.
- **Toteumat ovat lisäyksiä:** voimassa oleva tila on uusin kirjaus, joten offline-kirjaukset eivät riitele.
- **Poisto on merkintä** (`deletedAt`) ja **jokaisella rivillä on versio**, jotta synkronointi ja muutoshistoria toimivat.
- **Kiinteä riippuvuus** (`rigid`) ohittaa seuraajan piirretyn alun, jolloin seuraaja seuraa edeltäjää myös aikaisemmaksi.
- **Ryhmä seuraajana** siirtyy kokonaisuutena: viivojen keskinäiset erot säilyvät (kuten prototyypissä).

## Vertailu prototyyppiin

`test/parity.test.ts` ajaa prototyypin oman laskentakoodin (`aikataulun-piirtoprototyyppi.html`, merkkien `// <logic>` ja `// </logic>` välissä) ja vertaa sitä tämän moduulin viivalaskentaan 2000 satunnaisella viivalla. Jos prototyypin laskentaa muutetaan, testi kertoo, mihin uutta moduulia pitää päivittää.

## Seuraavaksi

- Ennusteen laskenta (prototyypin `computeForecast`) toteumien ja tilannepäivän perusteella
- Työjärjestyksen ja resurssien ylitäytön tarkistukset (`violations`, `histogram`)
- Määräluettelon tuonti (`qlParse`, `qlGuess`, `qlBuild`)
- Käyttöliittymätekstien käännöstiedostot
- Prototyypin siirtäminen käyttämään tätä moduulia
