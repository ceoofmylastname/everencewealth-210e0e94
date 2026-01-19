import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface HubFAQSectionProps {
  language: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const LOCALIZED_CONTENT: Record<string, {
  sectionTitle: string;
  sectionSubtitle: string;
  faqs: FAQ[];
}> = {
  en: {
    sectionTitle: "Frequently Asked Questions",
    sectionSubtitle: "Common questions about finding your perfect Costa del Sol location",
    faqs: [
      {
        question: "Where is the best place to retire on the Costa del Sol?",
        answer: "For retirees, Estepona and Mijas offer excellent value with a relaxed pace of life, quality healthcare access, and lower living costs. Marbella attracts those seeking luxury amenities, while Nerja provides authentic Spanish charm. Our retirement guides analyze healthcare proximity, cost of living, climate benefits, and expat community strength for each city."
      },
      {
        question: "Which city has the highest rental yield for investors?",
        answer: "Fuengirola and Torremolinos typically offer the highest rental yields (5-7% annually) due to strong tourist demand and lower purchase prices. Marbella commands premium rents but higher entry costs result in yields around 3-4%. Our investment guides provide ROI data, occupancy rates, and seasonal vs long-term rental comparisons for each location."
      },
      {
        question: "What are the safest areas for families with children?",
        answer: "Benalmádena, Fuengirola, and Nueva Andalucía (Marbella) consistently rank highest for family safety. These areas offer excellent international schools, family-friendly beaches, parks, and low crime rates. Our family guides include school catchment maps, safety scores, pediatric healthcare access, and community amenities ratings."
      },
      {
        question: "How much does it cost to live in Marbella vs Fuengirola?",
        answer: "Marbella's living costs are approximately 40-50% higher than Fuengirola. A comfortable lifestyle in Fuengirola requires €2,500-3,500/month, while Marbella ranges €4,000-6,000/month. Our cost of living guides break down expenses including rent, utilities, groceries, dining, healthcare, and transportation for accurate budgeting."
      },
      {
        question: "Do I need a visa to buy property in Spain?",
        answer: "EU citizens can buy property freely. Non-EU buyers need an NIE (tax identification number) but no visa for the purchase itself. The Golden Visa program grants residency to non-EU buyers investing €500,000+ in property. Our legal guides cover the complete buying process, visa requirements, tax implications, and step-by-step timelines."
      }
    ]
  },
  nl: {
    sectionTitle: "Veelgestelde Vragen",
    sectionSubtitle: "Veelgestelde vragen over het vinden van uw perfecte Costa del Sol locatie",
    faqs: [
      {
        question: "Wat is de beste plek om met pensioen te gaan aan de Costa del Sol?",
        answer: "Voor gepensioneerden bieden Estepona en Mijas uitstekende waarde met een ontspannen levensritme, goede gezondheidszorg en lagere kosten. Marbella trekt degenen aan die luxe voorzieningen zoeken. Onze pensioengidsen analyseren gezondheidszorgtoegang, kosten van levensonderhoud en expat-gemeenschapssterkte voor elke stad."
      },
      {
        question: "Welke stad heeft het hoogste huurrendement voor investeerders?",
        answer: "Fuengirola en Torremolinos bieden doorgaans de hoogste huurrendementen (5-7% per jaar) vanwege sterke toeristische vraag en lagere aankoopprijzen. Onze investeringsgidsen bieden ROI-gegevens, bezettingsgraden en vergelijkingen tussen seizoens- en langetermijnverhuur."
      },
      {
        question: "Wat zijn de veiligste gebieden voor gezinnen met kinderen?",
        answer: "Benalmádena, Fuengirola en Nueva Andalucía (Marbella) scoren consequent het hoogst voor gezinsveiligheid. Deze gebieden bieden uitstekende internationale scholen, gezinsvriendelijke stranden en lage misdaadcijfers. Onze gezinsgidsen bevatten schoolzonekaarten en veiligheidsscores."
      },
      {
        question: "Hoeveel kost het om te leven in Marbella vs Fuengirola?",
        answer: "De kosten van levensonderhoud in Marbella zijn ongeveer 40-50% hoger dan in Fuengirola. Een comfortabele levensstijl in Fuengirola vereist €2.500-3.500/maand, terwijl Marbella €4.000-6.000/maand kost. Onze gidsen splitsen alle uitgaven uit voor nauwkeurig budgetteren."
      },
      {
        question: "Heb ik een visum nodig om vastgoed te kopen in Spanje?",
        answer: "EU-burgers kunnen vrij vastgoed kopen. Niet-EU-kopers hebben een NIE nodig maar geen visum voor de aankoop. Het Golden Visa-programma verleent verblijfsrecht aan niet-EU-kopers die €500.000+ investeren. Onze juridische gidsen behandelen het volledige aankoopproces."
      }
    ]
  },
  de: {
    sectionTitle: "Häufig Gestellte Fragen",
    sectionSubtitle: "Häufige Fragen zur Suche nach Ihrem perfekten Costa del Sol Standort",
    faqs: [
      {
        question: "Wo ist der beste Ort für den Ruhestand an der Costa del Sol?",
        answer: "Für Rentner bieten Estepona und Mijas hervorragendes Preis-Leistungs-Verhältnis mit entspanntem Lebenstempo und guter Gesundheitsversorgung. Marbella zieht diejenigen an, die Luxus-Annehmlichkeiten suchen. Unsere Ruhestandsführer analysieren Gesundheitsnähe, Lebenshaltungskosten und Expat-Gemeinschaftsstärke."
      },
      {
        question: "Welche Stadt hat die höchste Mietrendite für Investoren?",
        answer: "Fuengirola und Torremolinos bieten typischerweise die höchsten Mietrenditen (5-7% jährlich) aufgrund starker Touristennachfrage. Unsere Investitionsführer bieten ROI-Daten, Belegungsraten und Vergleiche zwischen Saison- und Langzeitvermietung."
      },
      {
        question: "Was sind die sichersten Gebiete für Familien mit Kindern?",
        answer: "Benalmádena, Fuengirola und Nueva Andalucía (Marbella) rangieren durchgehend am höchsten für Familiensicherheit. Diese Gebiete bieten ausgezeichnete internationale Schulen und niedrige Kriminalitätsraten. Unsere Familienführer enthalten Schuleinzugsgebietskarten und Sicherheitsbewertungen."
      },
      {
        question: "Wie viel kostet das Leben in Marbella im Vergleich zu Fuengirola?",
        answer: "Die Lebenshaltungskosten in Marbella sind etwa 40-50% höher als in Fuengirola. Ein komfortabler Lebensstil in Fuengirola erfordert €2.500-3.500/Monat, während Marbella €4.000-6.000/Monat kostet. Unsere Lebenshaltungskostenführer schlüsseln alle Ausgaben auf."
      },
      {
        question: "Brauche ich ein Visum, um Immobilien in Spanien zu kaufen?",
        answer: "EU-Bürger können frei Immobilien kaufen. Nicht-EU-Käufer benötigen eine NIE, aber kein Visum für den Kauf. Das Golden-Visa-Programm gewährt Aufenthaltsrecht bei Investitionen von €500.000+. Unsere Rechtsführer behandeln den kompletten Kaufprozess."
      }
    ]
  },
  fr: {
    sectionTitle: "Questions Fréquentes",
    sectionSubtitle: "Questions courantes sur la recherche de votre emplacement parfait sur la Costa del Sol",
    faqs: [
      {
        question: "Quel est le meilleur endroit pour prendre sa retraite sur la Costa del Sol?",
        answer: "Pour les retraités, Estepona et Mijas offrent un excellent rapport qualité-prix avec un rythme de vie détendu et un accès aux soins de qualité. Marbella attire ceux qui recherchent des équipements de luxe. Nos guides retraite analysent l'accès aux soins, le coût de la vie et la force de la communauté expatriée."
      },
      {
        question: "Quelle ville a le rendement locatif le plus élevé pour les investisseurs?",
        answer: "Fuengirola et Torremolinos offrent généralement les rendements locatifs les plus élevés (5-7% par an) en raison de la forte demande touristique. Nos guides d'investissement fournissent des données ROI, des taux d'occupation et des comparaisons entre locations saisonnières et long terme."
      },
      {
        question: "Quels sont les quartiers les plus sûrs pour les familles avec enfants?",
        answer: "Benalmádena, Fuengirola et Nueva Andalucía (Marbella) se classent systématiquement parmi les plus sûrs pour les familles. Ces zones offrent d'excellentes écoles internationales et de faibles taux de criminalité. Nos guides famille incluent des cartes de zones scolaires et des scores de sécurité."
      },
      {
        question: "Combien coûte la vie à Marbella par rapport à Fuengirola?",
        answer: "Le coût de la vie à Marbella est environ 40-50% plus élevé qu'à Fuengirola. Un mode de vie confortable à Fuengirola nécessite €2.500-3.500/mois, tandis que Marbella varie de €4.000-6.000/mois. Nos guides détaillent toutes les dépenses pour un budget précis."
      },
      {
        question: "Ai-je besoin d'un visa pour acheter un bien immobilier en Espagne?",
        answer: "Les citoyens de l'UE peuvent acheter librement. Les acheteurs hors UE ont besoin d'un NIE mais pas de visa pour l'achat. Le programme Golden Visa accorde la résidence pour les investissements de €500.000+. Nos guides juridiques couvrent le processus d'achat complet."
      }
    ]
  },
  sv: {
    sectionTitle: "Vanliga Frågor",
    sectionSubtitle: "Vanliga frågor om att hitta din perfekta plats på Costa del Sol",
    faqs: [
      { question: "Var är bästa platsen att gå i pension på Costa del Sol?", answer: "För pensionärer erbjuder Estepona och Mijas utmärkt värde med avslappnad livsstil och bra sjukvård. Marbella lockar de som söker lyxbekvämligheter. Våra pensionsguider analyserar sjukvårdstillgång, levnadskostnader och expatgemenskap." },
      { question: "Vilken stad har högst hyresavkastning för investerare?", answer: "Fuengirola och Torremolinos erbjuder vanligtvis högst hyresavkastning (5-7% årligen). Våra investeringsguider ger ROI-data och jämförelser mellan säsongs- och långtidsuthyrning." },
      { question: "Vilka är de säkraste områdena för familjer med barn?", answer: "Benalmádena, Fuengirola och Nueva Andalucía rankas konsekvent högst för familjesäkerhet. Våra familjeguider inkluderar skolzonskartor och säkerhetsbetyg." },
      { question: "Hur mycket kostar det att bo i Marbella jämfört med Fuengirola?", answer: "Levnadskostnaderna i Marbella är cirka 40-50% högre än i Fuengirola. Våra guider ger detaljerade kostnadsuppställningar." },
      { question: "Behöver jag visum för att köpa fastighet i Spanien?", answer: "EU-medborgare kan köpa fritt. Icke-EU-köpare behöver NIE men inget visum. Golden Visa-programmet ger uppehållstillstånd för investeringar på €500.000+." }
    ]
  },
  no: {
    sectionTitle: "Ofte Stilte Spørsmål",
    sectionSubtitle: "Vanlige spørsmål om å finne din perfekte Costa del Sol-lokasjon",
    faqs: [
      { question: "Hvor er det beste stedet å pensjonere seg på Costa del Sol?", answer: "For pensjonister tilbyr Estepona og Mijas utmerket verdi med avslappet livstempo og god helsetilgang. Marbella tiltrekker de som søker luksus. Våre pensjonsguider analyserer helsetilgang, levekostnader og expat-samfunn." },
      { question: "Hvilken by har høyest leieavkastning for investorer?", answer: "Fuengirola og Torremolinos tilbyr typisk høyest leieavkastning (5-7% årlig). Våre investeringsguider gir ROI-data og sammenligninger mellom sesong- og langtidsleie." },
      { question: "Hva er de tryggeste områdene for familier med barn?", answer: "Benalmádena, Fuengirola og Nueva Andalucía rangeres konsekvent høyest for familiesikkerhet. Våre familieguider inkluderer skolesone-kart og sikkerhetsvurderinger." },
      { question: "Hvor mye koster det å bo i Marbella sammenlignet med Fuengirola?", answer: "Levekostnadene i Marbella er omtrent 40-50% høyere enn i Fuengirola. Våre guider gir detaljerte kostnadsoppstillinger." },
      { question: "Trenger jeg visum for å kjøpe eiendom i Spania?", answer: "EU-borgere kan kjøpe fritt. Ikke-EU-kjøpere trenger NIE men ikke visum. Golden Visa-programmet gir oppholdstillatelse for investeringer på €500.000+." }
    ]
  },
  da: {
    sectionTitle: "Ofte Stillede Spørgsmål",
    sectionSubtitle: "Almindelige spørgsmål om at finde din perfekte Costa del Sol-placering",
    faqs: [
      { question: "Hvor er det bedste sted at gå på pension på Costa del Sol?", answer: "For pensionister tilbyder Estepona og Mijas fremragende værdi med afslappet livstempo og god sundhedsadgang. Marbella tiltrækker dem, der søger luksus. Vores pensionsguider analyserer sundhedsadgang, leveomkostninger og expat-samfund." },
      { question: "Hvilken by har det højeste lejeafkast for investorer?", answer: "Fuengirola og Torremolinos tilbyder typisk det højeste lejeafkast (5-7% årligt). Vores investeringsguider giver ROI-data og sammenligninger." },
      { question: "Hvad er de sikreste områder for familier med børn?", answer: "Benalmádena, Fuengirola og Nueva Andalucía rangerer konsekvent højest for familiesikkerhed. Vores familieguider inkluderer skolezone-kort og sikkerhedsvurderinger." },
      { question: "Hvor meget koster det at bo i Marbella sammenlignet med Fuengirola?", answer: "Leveomkostningerne i Marbella er cirka 40-50% højere end i Fuengirola. Vores guider giver detaljerede omkostningsoversigter." },
      { question: "Har jeg brug for visum for at købe ejendom i Spanien?", answer: "EU-borgere kan købe frit. Ikke-EU-købere har brug for NIE men ikke visum. Golden Visa-programmet giver opholdstilladelse for investeringer på €500.000+." }
    ]
  },
  fi: {
    sectionTitle: "Usein Kysytyt Kysymykset",
    sectionSubtitle: "Yleisiä kysymyksiä täydellisen Costa del Sol -sijainnin löytämisestä",
    faqs: [
      { question: "Mikä on paras paikka jäädä eläkkeelle Costa del Solilla?", answer: "Eläkeläisille Estepona ja Mijas tarjoavat erinomaista vastinetta rahalle rennolla elämäntyylillä ja hyvällä terveydenhuollolla. Marbella houkuttelee luksusta etsiviä. Eläkeoppaamme analysoivat terveydenhuollon saatavuutta ja elinkustannuksia." },
      { question: "Missä kaupungissa on korkein vuokratuotto sijoittajille?", answer: "Fuengirola ja Torremolinos tarjoavat tyypillisesti korkeimman vuokratuoton (5-7% vuodessa). Sijoitusoppaamme tarjoavat ROI-tietoja ja vertailuja." },
      { question: "Mitkä ovat turvallisimmat alueet lapsiperheille?", answer: "Benalmádena, Fuengirola ja Nueva Andalucía sijoittuvat johdonmukaisesti korkeimmalle perheturvallisuudessa. Perheoppaamme sisältävät koulukarttoja ja turvallisuusarvioita." },
      { question: "Paljonko eläminen maksaa Marbellassa verrattuna Fuengirolaan?", answer: "Marbellan elinkustannukset ovat noin 40-50% korkeammat kuin Fuengirolassa. Oppaamme antavat yksityiskohtaiset kustannuserittelyt." },
      { question: "Tarvitsenko viisumin ostaakseni kiinteistön Espanjasta?", answer: "EU-kansalaiset voivat ostaa vapaasti. Ei-EU-ostajat tarvitsevat NIE:n mutta eivät viisumia. Golden Visa -ohjelma myöntää oleskeluluvan €500.000+ sijoituksille." }
    ]
  },
  pl: {
    sectionTitle: "Często Zadawane Pytania",
    sectionSubtitle: "Częste pytania dotyczące znalezienia idealnej lokalizacji na Costa del Sol",
    faqs: [
      { question: "Gdzie jest najlepsze miejsce na emeryturę na Costa del Sol?", answer: "Dla emerytów Estepona i Mijas oferują doskonałą wartość z spokojnym tempem życia i dobrym dostępem do opieki zdrowotnej. Marbella przyciąga szukających luksusu. Nasze przewodniki emerytalne analizują dostęp do opieki zdrowotnej i koszty życia." },
      { question: "Które miasto ma najwyższy zwrot z najmu dla inwestorów?", answer: "Fuengirola i Torremolinos zazwyczaj oferują najwyższe zwroty z najmu (5-7% rocznie). Nasze przewodniki inwestycyjne dostarczają dane ROI i porównania." },
      { question: "Jakie są najbezpieczniejsze obszary dla rodzin z dziećmi?", answer: "Benalmádena, Fuengirola i Nueva Andalucía konsekwentnie plasują się najwyżej pod względem bezpieczeństwa rodzin. Nasze przewodniki rodzinne zawierają mapy stref szkolnych i oceny bezpieczeństwa." },
      { question: "Ile kosztuje życie w Marbelli w porównaniu z Fuengirolą?", answer: "Koszty życia w Marbelli są o około 40-50% wyższe niż w Fuengiroli. Nasze przewodniki podają szczegółowe zestawienia kosztów." },
      { question: "Czy potrzebuję wizy, aby kupić nieruchomość w Hiszpanii?", answer: "Obywatele UE mogą kupować swobodnie. Kupujący spoza UE potrzebują NIE, ale nie wizy. Program Golden Visa przyznaje pobyt dla inwestycji €500.000+." }
    ]
  },
  hu: {
    sectionTitle: "Gyakran Ismételt Kérdések",
    sectionSubtitle: "Gyakori kérdések a tökéletes Costa del Sol helyszín megtalálásáról",
    faqs: [
      { question: "Hol a legjobb hely a nyugdíjba vonuláshoz a Costa del Solon?", answer: "Nyugdíjasok számára Estepona és Mijas kiváló értéket kínál nyugodt életvitellel és jó egészségügyi ellátással. Marbella a luxust keresőket vonzza. Nyugdíjas útmutatóink elemzik az egészségügyi hozzáférést és a megélhetési költségeket." },
      { question: "Melyik városban a legmagasabb a bérleti hozam a befektetők számára?", answer: "Fuengirola és Torremolinos általában a legmagasabb bérleti hozamot kínálják (évi 5-7%). Befektetési útmutatóink ROI-adatokat és összehasonlításokat nyújtanak." },
      { question: "Melyek a legbiztonságosabb területek a gyermekes családok számára?", answer: "Benalmádena, Fuengirola és Nueva Andalucía következetesen a legmagasabbra rangsoroltak a családi biztonság terén. Családi útmutatóink iskolai körzetmaps és biztonsági értékeléseket tartalmaznak." },
      { question: "Mennyibe kerül az élet Marbellában Fuengirolához képest?", answer: "A megélhetési költségek Marbellában körülbelül 40-50%-kal magasabbak, mint Fuengirolában. Útmutatóink részletes költségbontást adnak." },
      { question: "Szükségem van vízumra, hogy ingatlant vegyek Spanyolországban?", answer: "Az EU állampolgárok szabadon vásárolhatnak. Nem EU-s vásárlóknak NIE-re van szükségük, de vízumra nem. A Golden Visa program tartózkodási engedélyt ad €500.000+ befektetéssel." }
    ]
  }
};

export const HubFAQSection: React.FC<HubFAQSectionProps> = ({ language }) => {
  const content = LOCALIZED_CONTENT[language] || LOCALIZED_CONTENT.en;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {content.sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.sectionSubtitle}
          </p>
        </div>

        {/* FAQ - Semantic HTML with details/summary */}
        <div className="max-w-3xl mx-auto space-y-4">
          {content.faqs.map((faq, index) => (
            <details
              key={index}
              className="group border border-border/50 rounded-xl bg-card overflow-hidden transition-all duration-300 hover:border-primary/30"
            >
              <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none text-lg font-medium text-foreground hover:text-primary transition-colors">
                <span className="pr-4">{faq.question}</span>
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border/30 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};