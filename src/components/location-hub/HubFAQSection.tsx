import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
    sectionSubtitle: "Common questions about our Costa del Sol location guides",
    faqs: [
      {
        question: "What are Location Intelligence Pages?",
        answer: "Location Intelligence Pages are comprehensive guides to Costa del Sol cities, covering property buying, investment opportunities, cost of living, best areas for families, retirement guides, and more. Each guide provides expert insights, data-driven analysis, and actionable recommendations tailored to specific buyer intents."
      },
      {
        question: "Which cities are covered in the Costa del Sol location guides?",
        answer: "Our guides cover 8 major cities: Marbella, Estepona, Fuengirola, Benalmádena, Torremolinos, Málaga, Casares, and Mijas. Each city has multiple guides covering different buyer intents and topics, from property investment to family relocation."
      },
      {
        question: "What topics do the location guides cover?",
        answer: "Our guides cover 8 intent types: Property Buying (step-by-step guides), Best Areas for Families (schools, safety, amenities), Investment Areas (ROI, rental yields), Expat Guide (community, lifestyle), Retirement Guide (healthcare, climate), Cost of Living (budgets, utilities), Property Prices (market analysis), and Relocation Guide (visas, moving process)."
      },
      {
        question: "Are the location guides available in my language?",
        answer: "Yes! Our guides are available in 10 languages: English, German, Dutch, French, Swedish, Norwegian, Danish, Finnish, Polish, and Hungarian. Each version is professionally translated and culturally adapted to ensure accuracy and relevance for international buyers."
      },
      {
        question: "How often are the Costa del Sol location guides updated?",
        answer: "Our guides are regularly updated to reflect current market conditions, pricing trends, and local developments. We aim to review and update content quarterly, with real-time updates for significant market changes or new developments."
      }
    ]
  },
  nl: {
    sectionTitle: "Veelgestelde Vragen",
    sectionSubtitle: "Veelgestelde vragen over onze Costa del Sol locatiegidsen",
    faqs: [
      {
        question: "Wat zijn Locatie Intelligence Pagina's?",
        answer: "Locatie Intelligence Pagina's zijn uitgebreide gidsen voor Costa del Sol steden, met informatie over vastgoedaankoop, investeringsmogelijkheden, kosten van levensonderhoud, beste gebieden voor gezinnen, pensioengidsen en meer. Elke gids biedt expertinzichten en datagestuurde analyses."
      },
      {
        question: "Welke steden worden behandeld in de Costa del Sol locatiegidsen?",
        answer: "Onze gidsen behandelen 8 grote steden: Marbella, Estepona, Fuengirola, Benalmádena, Torremolinos, Málaga, Casares en Mijas. Elke stad heeft meerdere gidsen die verschillende kopersbehoeften behandelen."
      },
      {
        question: "Welke onderwerpen behandelen de locatiegidsen?",
        answer: "Onze gidsen behandelen 8 intentietypes: Vastgoedaankoop, Beste Gebieden voor Gezinnen, Investeringsgebieden, Expat Gids, Pensioengids, Kosten van Levensonderhoud, Vastgoedprijzen en Verhuisgids."
      },
      {
        question: "Zijn de locatiegidsen beschikbaar in mijn taal?",
        answer: "Ja! Onze gidsen zijn beschikbaar in 10 talen: Engels, Duits, Nederlands, Frans, Zweeds, Noors, Deens, Fins, Pools en Hongaars. Elke versie is professioneel vertaald."
      },
      {
        question: "Hoe vaak worden de Costa del Sol locatiegidsen bijgewerkt?",
        answer: "Onze gidsen worden regelmatig bijgewerkt om actuele marktomstandigheden, prijstrends en lokale ontwikkelingen weer te geven. We streven ernaar de inhoud elk kwartaal te herzien."
      }
    ]
  },
  de: {
    sectionTitle: "Häufig Gestellte Fragen",
    sectionSubtitle: "Häufige Fragen zu unseren Costa del Sol Standortführern",
    faqs: [
      {
        question: "Was sind Standort-Intelligenz-Seiten?",
        answer: "Standort-Intelligenz-Seiten sind umfassende Führer zu Costa del Sol Städten, die Immobilienkauf, Investitionsmöglichkeiten, Lebenshaltungskosten, beste Gegenden für Familien, Ruhestandsführer und mehr abdecken."
      },
      {
        question: "Welche Städte werden in den Costa del Sol Standortführern behandelt?",
        answer: "Unsere Führer behandeln 8 große Städte: Marbella, Estepona, Fuengirola, Benalmádena, Torremolinos, Málaga, Casares und Mijas."
      },
      {
        question: "Welche Themen behandeln die Standortführer?",
        answer: "Unsere Führer behandeln 8 Thementypen: Immobilienkauf, Beste Gegenden für Familien, Investitionsgebiete, Expat-Führer, Ruhestandsführer, Lebenshaltungskosten, Immobilienpreise und Umzugsführer."
      },
      {
        question: "Sind die Standortführer in meiner Sprache verfügbar?",
        answer: "Ja! Unsere Führer sind in 10 Sprachen verfügbar: Englisch, Deutsch, Niederländisch, Französisch, Schwedisch, Norwegisch, Dänisch, Finnisch, Polnisch und Ungarisch."
      },
      {
        question: "Wie oft werden die Costa del Sol Standortführer aktualisiert?",
        answer: "Unsere Führer werden regelmäßig aktualisiert, um aktuelle Marktbedingungen, Preistrends und lokale Entwicklungen widerzuspiegeln. Wir streben vierteljährliche Überprüfungen an."
      }
    ]
  },
  fr: {
    sectionTitle: "Questions Fréquentes",
    sectionSubtitle: "Questions courantes sur nos guides d'emplacement Costa del Sol",
    faqs: [
      {
        question: "Que sont les Pages d'Intelligence de Localisation?",
        answer: "Les Pages d'Intelligence de Localisation sont des guides complets des villes de la Costa del Sol, couvrant l'achat immobilier, les opportunités d'investissement, le coût de la vie, les meilleurs quartiers pour les familles, et plus encore."
      },
      {
        question: "Quelles villes sont couvertes dans les guides Costa del Sol?",
        answer: "Nos guides couvrent 8 grandes villes: Marbella, Estepona, Fuengirola, Benalmádena, Torremolinos, Málaga, Casares et Mijas."
      },
      {
        question: "Quels sujets les guides couvrent-ils?",
        answer: "Nos guides couvrent 8 types de thèmes: Achat Immobilier, Meilleurs Quartiers pour Familles, Zones d'Investissement, Guide Expat, Guide Retraite, Coût de la Vie, Prix Immobiliers et Guide de Relocalisation."
      },
      {
        question: "Les guides sont-ils disponibles dans ma langue?",
        answer: "Oui! Nos guides sont disponibles en 10 langues: anglais, allemand, néerlandais, français, suédois, norvégien, danois, finnois, polonais et hongrois."
      },
      {
        question: "À quelle fréquence les guides sont-ils mis à jour?",
        answer: "Nos guides sont régulièrement mis à jour pour refléter les conditions actuelles du marché, les tendances des prix et les développements locaux."
      }
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

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {content.faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border/50 rounded-xl px-6 bg-card"
              >
                <AccordionTrigger className="text-left text-lg font-medium hover:no-underline hover:text-primary py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
