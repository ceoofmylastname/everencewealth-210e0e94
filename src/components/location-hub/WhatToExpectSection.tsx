import React from 'react';
import { 
  BarChart3, 
  GraduationCap, 
  TrendingUp, 
  Shield, 
  Heart, 
  Palmtree, 
  Train, 
  Scale 
} from 'lucide-react';

interface WhatToExpectSectionProps {
  language: string;
}

interface IntelligenceCard {
  icon: React.ElementType;
  key: string;
  color: string;
}

// E-E-A-T Authority Proof Cards - Shows depth of data
const INTELLIGENCE_CARDS: IntelligenceCard[] = [
  { icon: BarChart3, key: 'priceAnalysis', color: 'from-blue-500/20 to-blue-600/5' },
  { icon: GraduationCap, key: 'schoolZones', color: 'from-green-500/20 to-green-600/5' },
  { icon: TrendingUp, key: 'rentalYields', color: 'from-amber-500/20 to-amber-600/5' },
  { icon: Shield, key: 'safetyData', color: 'from-purple-500/20 to-purple-600/5' },
  { icon: Heart, key: 'healthcare', color: 'from-red-500/20 to-red-600/5' },
  { icon: Palmtree, key: 'lifestyle', color: 'from-cyan-500/20 to-cyan-600/5' },
  { icon: Train, key: 'transport', color: 'from-indigo-500/20 to-indigo-600/5' },
  { icon: Scale, key: 'legalGuide', color: 'from-orange-500/20 to-orange-600/5' },
];

const LOCALIZED_CONTENT: Record<string, {
  sectionTitle: string;
  sectionSubtitle: string;
  cards: Record<string, { title: string; description: string }>;
}> = {
  en: {
    sectionTitle: "Data-Driven Intelligence",
    sectionSubtitle: "Our location guides go beyond basic listings. We provide comprehensive research tools with real data to help you make confident decisions.",
    cards: {
      priceAnalysis: { title: "Price Analysis", description: "Market data on 50,000+ listings with quarterly trend reports and neighborhood comparisons" },
      schoolZones: { title: "School Zones", description: "International & public school ratings, catchment areas, fees, and proximity data" },
      rentalYields: { title: "Rental Yields", description: "Average ROI per neighborhood, seasonal vs long-term rental data, and occupancy rates" },
      safetyData: { title: "Safety Data", description: "Crime statistics, neighborhood safety scores, and police proximity analysis" },
      healthcare: { title: "Healthcare Access", description: "Hospital ratings, GP availability, specialist coverage, and emergency response times" },
      lifestyle: { title: "Lifestyle Amenities", description: "Beach access scores, golf courses, restaurants per capita, and nightlife ratings" },
      transport: { title: "Transport Links", description: "Airport distance, train stations, bus routes, and connectivity scores" },
      legalGuide: { title: "Legal Requirements", description: "NIE process timeline, Golden Visa thresholds, buying costs breakdown, and tax implications" }
    }
  },
  nl: {
    sectionTitle: "Datagestuurde Intelligentie",
    sectionSubtitle: "Onze locatiegidsen gaan verder dan basis listings. We bieden uitgebreide onderzoekstools met echte data om u te helpen weloverwogen beslissingen te nemen.",
    cards: {
      priceAnalysis: { title: "Prijsanalyse", description: "Marktdata over 50.000+ listings met kwartaaltrends en wijkvergelijkingen" },
      schoolZones: { title: "Schoolzones", description: "Internationale & openbare schoolbeoordelingen, verzorgingsgebieden en kosten" },
      rentalYields: { title: "Huurrendementen", description: "Gemiddelde ROI per wijk, seizoens- vs langetermijn huurdata en bezettingsgraden" },
      safetyData: { title: "Veiligheidsdata", description: "Misdaadstatistieken, veiligheidsscores van wijken en politie-nabijheid" },
      healthcare: { title: "Gezondheidszorg", description: "Ziekenhuisbeoordelingen, huisartsbeschikbaarheid en specialistische dekking" },
      lifestyle: { title: "Levensstijl", description: "Strandtoegang, golfbanen, restaurants per capita en uitgaansleven" },
      transport: { title: "Vervoersverbindingen", description: "Afstand tot luchthaven, treinstations, busroutes en connectiviteitsscores" },
      legalGuide: { title: "Juridische Vereisten", description: "NIE-proces, Golden Visa-drempels, aankoopkosten en belastingimplicaties" }
    }
  },
  de: {
    sectionTitle: "Datengesteuerte Intelligenz",
    sectionSubtitle: "Unsere Standortführer gehen über einfache Auflistungen hinaus. Wir bieten umfassende Recherchetools mit echten Daten.",
    cards: {
      priceAnalysis: { title: "Preisanalyse", description: "Marktdaten zu über 50.000 Objekten mit Quartals-Trendberichten" },
      schoolZones: { title: "Schulzonen", description: "Internationale & öffentliche Schulbewertungen, Einzugsgebiete und Gebühren" },
      rentalYields: { title: "Mietrenditen", description: "Durchschnittlicher ROI pro Stadtviertel, saisonale vs. langfristige Mietdaten" },
      safetyData: { title: "Sicherheitsdaten", description: "Kriminalstatistiken, Sicherheitsbewertungen und Polizeinähe" },
      healthcare: { title: "Gesundheitsversorgung", description: "Krankenhausbewertungen, Hausarzt-Verfügbarkeit und Facharztabdeckung" },
      lifestyle: { title: "Lebensstil", description: "Strandzugang, Golfplätze, Restaurants pro Kopf und Nachtleben" },
      transport: { title: "Verkehrsanbindung", description: "Flughafenentfernung, Bahnhöfe, Busrouten und Konnektivitätswerte" },
      legalGuide: { title: "Rechtliche Anforderungen", description: "NIE-Prozess, Golden-Visa-Schwellen, Kaufkosten und Steuerimplikationen" }
    }
  },
  fr: {
    sectionTitle: "Intelligence Basée sur les Données",
    sectionSubtitle: "Nos guides vont au-delà des simples annonces. Nous fournissons des outils de recherche complets avec des données réelles.",
    cards: {
      priceAnalysis: { title: "Analyse des Prix", description: "Données de marché sur plus de 50 000 annonces avec rapports de tendances trimestriels" },
      schoolZones: { title: "Zones Scolaires", description: "Évaluations des écoles internationales et publiques, zones de recrutement et frais" },
      rentalYields: { title: "Rendements Locatifs", description: "ROI moyen par quartier, données locatives saisonnières vs long terme" },
      safetyData: { title: "Données de Sécurité", description: "Statistiques criminelles, scores de sécurité des quartiers" },
      healthcare: { title: "Accès aux Soins", description: "Évaluations des hôpitaux, disponibilité des médecins généralistes" },
      lifestyle: { title: "Style de Vie", description: "Accès aux plages, terrains de golf, restaurants par habitant" },
      transport: { title: "Transports", description: "Distance à l'aéroport, gares, lignes de bus et connectivité" },
      legalGuide: { title: "Exigences Légales", description: "Processus NIE, seuils Golden Visa, coûts d'achat et fiscalité" }
    }
  },
  sv: {
    sectionTitle: "Datadriven Intelligens",
    sectionSubtitle: "Våra platsguider går bortom enkla listor. Vi tillhandahåller omfattande forskningsverktyg med verklig data.",
    cards: {
      priceAnalysis: { title: "Prisanalys", description: "Marknadsdata på 50 000+ objekt med kvartalsvisa trendrapporter" },
      schoolZones: { title: "Skolzoner", description: "Betyg för internationella och offentliga skolor, upptagningsområden" },
      rentalYields: { title: "Hyresavkastning", description: "Genomsnittlig ROI per område, säsongs- vs långsiktig hyresdata" },
      safetyData: { title: "Säkerhetsdata", description: "Brottsstatistik, säkerhetspoäng för områden" },
      healthcare: { title: "Sjukvård", description: "Sjukhusbetyg, läkartillgänglighet och specialisttäckning" },
      lifestyle: { title: "Livsstil", description: "Strandtillgång, golfbanor, restauranger per capita" },
      transport: { title: "Transport", description: "Flygplatsavstånd, tågstationer och busshållplatser" },
      legalGuide: { title: "Juridiska Krav", description: "NIE-process, Golden Visa-trösklar och köpkostnader" }
    }
  },
  no: {
    sectionTitle: "Datadrevet Intelligens",
    sectionSubtitle: "Våre stedsguider går utover enkle lister. Vi gir omfattende forskningsverktøy med ekte data.",
    cards: {
      priceAnalysis: { title: "Prisanalyse", description: "Markedsdata på 50 000+ oppføringer med kvartalsvis trendrapporter" },
      schoolZones: { title: "Skolezoner", description: "Vurderinger av internasjonale og offentlige skoler" },
      rentalYields: { title: "Leieavkastning", description: "Gjennomsnittlig ROI per nabolag, sesong- vs langtidsleiedata" },
      safetyData: { title: "Sikkerhetsdata", description: "Kriminalstatistikk og trygghetspoeng for nabolag" },
      healthcare: { title: "Helsetjenester", description: "Sykehusvurderinger og legetilgjengelighet" },
      lifestyle: { title: "Livsstil", description: "Strandtilgang, golfbaner og restauranter per innbygger" },
      transport: { title: "Transport", description: "Avstand til flyplass, togstasjoner og bussruter" },
      legalGuide: { title: "Juridiske Krav", description: "NIE-prosess, Golden Visa-grenser og kjøpskostnader" }
    }
  },
  da: {
    sectionTitle: "Datadrevet Intelligens",
    sectionSubtitle: "Vores stedguider går ud over simple lister. Vi leverer omfattende forskningsværktøjer med reelle data.",
    cards: {
      priceAnalysis: { title: "Prisanalyse", description: "Markedsdata på 50.000+ opslag med kvartalsvise trendrapporter" },
      schoolZones: { title: "Skolezoner", description: "Vurderinger af internationale og offentlige skoler" },
      rentalYields: { title: "Lejeafkast", description: "Gennemsnitlig ROI pr. kvarter, sæson- vs langtidslejedata" },
      safetyData: { title: "Sikkerhedsdata", description: "Kriminalstatistik og sikkerhedsscores for kvarterer" },
      healthcare: { title: "Sundhedsvæsen", description: "Hospitalsvurderinger og lægetilgængelighed" },
      lifestyle: { title: "Livsstil", description: "Strandadgang, golfbaner og restauranter per capita" },
      transport: { title: "Transport", description: "Afstand til lufthavn, togstationer og busruter" },
      legalGuide: { title: "Juridiske Krav", description: "NIE-proces, Golden Visa-grænser og købsomkostninger" }
    }
  },
  fi: {
    sectionTitle: "Dataohjattu Älykkyys",
    sectionSubtitle: "Sijaintioppaamme menevät peruslistausten yli. Tarjoamme kattavia tutkimustyökaluja todellisella datalla.",
    cards: {
      priceAnalysis: { title: "Hinta-analyysi", description: "Markkinatiedot yli 50 000 kohteesta neljännesvuosittaisilla trendeillä" },
      schoolZones: { title: "Koulualueet", description: "Kansainvälisten ja julkisten koulujen arvioinnit" },
      rentalYields: { title: "Vuokratuotot", description: "Keskimääräinen ROI alueittain, kausi- vs pitkäaikaisvuokradata" },
      safetyData: { title: "Turvallisuusdata", description: "Rikostilastot ja alueiden turvallisuuspisteet" },
      healthcare: { title: "Terveydenhuolto", description: "Sairaala-arvioinnit ja lääkäreiden saatavuus" },
      lifestyle: { title: "Elämäntyyli", description: "Rantatoalue, golfkentät ja ravintolat asukasta kohti" },
      transport: { title: "Liikenneyhteydet", description: "Etäisyys lentokentälle, rautatieasemat ja bussilinjat" },
      legalGuide: { title: "Juridiset Vaatimukset", description: "NIE-prosessi, Golden Visa -rajat ja ostokustannukset" }
    }
  },
  pl: {
    sectionTitle: "Inteligencja Oparta na Danych",
    sectionSubtitle: "Nasze przewodniki wykraczają poza podstawowe listy. Dostarczamy kompleksowe narzędzia badawcze z prawdziwymi danymi.",
    cards: {
      priceAnalysis: { title: "Analiza Cen", description: "Dane rynkowe z 50 000+ ofert z kwartalnym raportami trendów" },
      schoolZones: { title: "Strefy Szkolne", description: "Oceny szkół międzynarodowych i publicznych, strefy rekrutacji" },
      rentalYields: { title: "Rentowność Najmu", description: "Średni ROI na dzielnicę, dane o najmie sezonowym vs długoterminowym" },
      safetyData: { title: "Dane o Bezpieczeństwie", description: "Statystyki przestępczości i oceny bezpieczeństwa dzielnic" },
      healthcare: { title: "Opieka Zdrowotna", description: "Oceny szpitali i dostępność lekarzy" },
      lifestyle: { title: "Styl Życia", description: "Dostęp do plaży, pola golfowe i restauracje na mieszkańca" },
      transport: { title: "Transport", description: "Odległość do lotniska, dworce kolejowe i trasy autobusowe" },
      legalGuide: { title: "Wymogi Prawne", description: "Proces NIE, progi Golden Visa i koszty zakupu" }
    }
  },
  hu: {
    sectionTitle: "Adatvezérelt Intelligencia",
    sectionSubtitle: "Helyszín útmutatóink túlmutatnak az egyszerű listákon. Átfogó kutatási eszközöket kínálunk valós adatokkal.",
    cards: {
      priceAnalysis: { title: "Áranalízis", description: "Piaci adatok 50 000+ hirdetésről negyedéves trendjelentésekkel" },
      schoolZones: { title: "Iskolai Körzetek", description: "Nemzetközi és állami iskolák értékelése, beiskolázási körzetek" },
      rentalYields: { title: "Bérleti Hozamok", description: "Átlagos ROI kerületenként, szezonális vs hosszú távú bérleti adatok" },
      safetyData: { title: "Biztonsági Adatok", description: "Bűnözési statisztikák és kerületi biztonsági pontszámok" },
      healthcare: { title: "Egészségügyi Ellátás", description: "Kórházi értékelések és orvosi elérhetőség" },
      lifestyle: { title: "Életmód", description: "Strandhoz való hozzáférés, golfpályák és éttermek száma" },
      transport: { title: "Közlekedés", description: "Repülőtér távolság, vasútállomások és buszjáratok" },
      legalGuide: { title: "Jogi Követelmények", description: "NIE folyamat, Golden Visa küszöbértékek és vásárlási költségek" }
    }
  }
};

export const WhatToExpectSection: React.FC<WhatToExpectSectionProps> = ({ language }) => {
  const content = LOCALIZED_CONTENT[language] || LOCALIZED_CONTENT.en;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {content.sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {content.sectionSubtitle}
          </p>
        </div>

        {/* Intelligence Grid - Glass morphism cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INTELLIGENCE_CARDS.map((card, index) => {
            const Icon = card.icon;
            const cardContent = content.cards[card.key];

            return (
              <div
                key={card.key}
                className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                {/* Gradient Background on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative">
                  {/* Icon with animation */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {cardContent.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {cardContent.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};