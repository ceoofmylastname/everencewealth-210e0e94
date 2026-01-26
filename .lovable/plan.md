
# Fix Missing Translations in Location Hub Speakable Section

## Problem Summary

The "Quick Answer / AI-Ready Summary" (speakable) section in the Location Hub shows English text for 6 out of 10 languages. Only EN, NL, DE, and FR are translated. Swedish, Norwegian, Danish, Finnish, Polish, and Hungarian users see English content.

## Files to Update

| File | Action |
|------|--------|
| `src/components/location-hub/SpeakableHubIntro.tsx` | Add 6 missing translations |

## Implementation

Add complete translations for the 6 missing languages to the `LOCALIZED_CONTENT` object:

### Swedish (sv)
```typescript
sv: {
  badge: "AI-redo Sammanfattning",
  title: "Snabbt Svar",
  intro: "Våra Costa del Sol platsguider är omfattande resurser som täcker städer i hela regionen. Varje guide behandlar specifika köparbehov inklusive familjeflytt, pensionsplanering, fastighetsinvesteringar och levnadskostnadsanalys. Varje sida innehåller expertinsikter, områdesbeskrivningar, prisjämförelser och handlingsbara rekommendationer för välgrundade fastighetsbeslu t.",
  highlights: [
    "8 stora städer",
    "8 tematyper per stad",
    "Tillgänglig på 10 språk",
    "Uppdateras kvartalsvis"
  ],
  footer: "Optimerad för röstassistenter och AI-sökning"
}
```

### Norwegian (no)
```typescript
no: {
  badge: "AI-klar Sammendrag",
  title: "Raskt Svar",
  intro: "Våre Costa del Sol stedsguider er omfattende ressurser som dekker byer i hele regionen. Hver guide tar for seg spesifikke kjøperbehov inkludert familieflytting, pensjonsplanlegging, eiendomsinvesteringer og levekostnadsanalyse. Hver side inneholder ekspertinnsikt, områdebeskrivelser, prissammenligninger og handlingsrettede anbefalinger for informerte eiendomsbeslutninger.",
  highlights: [
    "8 store byer",
    "8 tematyper per by",
    "Tilgjengelig på 10 språk",
    "Oppdateres kvartalsvis"
  ],
  footer: "Optimalisert for stemmeassistenter og AI-søk"
}
```

### Danish (da)
```typescript
da: {
  badge: "AI-klar Resumé",
  title: "Hurtigt Svar",
  intro: "Vores Costa del Sol stedguider er omfattende ressourcer, der dækker byer i hele regionen. Hver guide adresserer specifikke køberbehov, herunder familieflytning, pensionsplanlægning, ejendomsinvesteringer og leveomkostningsanalyse. Hver side indeholder ekspertindsigt, områdebeskrivelser, prissammenligninger og handlingsrettede anbefalinger.",
  highlights: [
    "8 store byer",
    "8 tematyper per by",
    "Tilgængelig på 10 sprog",
    "Opdateres kvartalsvis"
  ],
  footer: "Optimeret til stemmeassistenter og AI-søgning"
}
```

### Finnish (fi)
```typescript
fi: {
  badge: "AI-valmis Yhteenveto",
  title: "Nopea Vastaus",
  intro: "Costa del Sol -sijaintioppaamme ovat kattavia resursseja, jotka kattavat alueen kaupungit. Jokainen opas käsittelee tiettyjä ostajien tarpeita, kuten perheen muuttoa, eläkesuunnittelua, kiinteistösijoituksia ja elinkustannusanalyysiä. Jokainen sivu sisältää asiantuntijatietoa, aluekuvauksia, hintavertailuja ja toimintakelpoisia suosituksia tietoisiin kiinteistöpäätöksiin.",
  highlights: [
    "8 suurta kaupunkia",
    "8 tematyyppiä per kaupunki",
    "Saatavilla 10 kielellä",
    "Päivitetään neljännesvuosittain"
  ],
  footer: "Optimoitu ääniavustajille ja AI-haulle"
}
```

### Polish (pl)
```typescript
pl: {
  badge: "Podsumowanie Gotowe dla AI",
  title: "Szybka Odpowiedź",
  intro: "Nasze przewodniki po lokalizacjach Costa del Sol to kompleksowe zasoby obejmujące miasta w całym regionie. Każdy przewodnik odpowiada na konkretne potrzeby kupujących, w tym przeprowadzkę rodzinną, planowanie emerytury, inwestycje w nieruchomości i analizę kosztów życia. Każda strona zawiera eksperckie spostrzeżenia, opisy dzielnic, porównania cen i praktyczne rekomendacje.",
  highlights: [
    "8 dużych miast",
    "8 typów tematów na miasto",
    "Dostępne w 10 językach",
    "Aktualizowane kwartalnie"
  ],
  footer: "Zoptymalizowane dla asystentów głosowych i wyszukiwania AI"
}
```

### Hungarian (hu)
```typescript
hu: {
  badge: "AI-kész Összefoglaló",
  title: "Gyors Válasz",
  intro: "Costa del Sol helyszín útmutatóink átfogó források, amelyek a régió városait fedik le. Minden útmutató konkrét vásárlói igényekre válaszol, beleértve a családi költözést, nyugdíjtervezést, ingatlan befektetéseket és megélhetési költségek elemzését. Minden oldal szakértői betekintést, környékleírásokat, árösszehasonlításokat és gyakorlati ajánlásokat tartalmaz.",
  highlights: [
    "8 nagyobb város",
    "8 téma típus városonként",
    "Elérhető 10 nyelven",
    "Negyedévente frissítve"
  ],
  footer: "Optimalizálva hangasszisztensekhez és AI kereséshez"
}
```

## Validation

After implementation, verify all 10 language versions display localized content:

| URL | Quick Answer Language |
|-----|----------------------|
| `/en/locations` | English ✅ |
| `/nl/locations` | Dutch ✅ |
| `/de/locations` | German ✅ |
| `/fr/locations` | French ✅ |
| `/sv/locations` | Swedish ✅ (fixed) |
| `/no/locations` | Norwegian ✅ (fixed) |
| `/da/locations` | Danish ✅ (fixed) |
| `/fi/locations` | Finnish ✅ (fixed) |
| `/pl/locations` | Polish ✅ (fixed) |
| `/hu/locations` | Hungarian ✅ (fixed) |

## Technical Notes

- The `locationHubSchemaGenerator.ts` already has all 10 translations for the hero and meta content
- The other hub components (`WhatToExpectSection`, `HubFAQSection`, `FeaturedCitiesSection`) already have all 10 translations
- Only `SpeakableHubIntro.tsx` is incomplete
- This fix ensures 100% localization parity for the speakable/AI-citation-ready content
