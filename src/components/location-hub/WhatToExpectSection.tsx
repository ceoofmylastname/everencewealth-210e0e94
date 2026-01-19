import React from 'react';
import { 
  Home, 
  Users, 
  TrendingUp, 
  Globe, 
  Sunset, 
  Wallet, 
  BarChart3, 
  Plane 
} from 'lucide-react';

interface WhatToExpectSectionProps {
  language: string;
}

interface IntentType {
  icon: React.ElementType;
  key: string;
  color: string;
}

const INTENT_TYPES: IntentType[] = [
  { icon: Home, key: 'buying', color: 'from-blue-500/20 to-blue-600/10' },
  { icon: Users, key: 'families', color: 'from-green-500/20 to-green-600/10' },
  { icon: TrendingUp, key: 'investment', color: 'from-amber-500/20 to-amber-600/10' },
  { icon: Globe, key: 'expat', color: 'from-purple-500/20 to-purple-600/10' },
  { icon: Sunset, key: 'retirement', color: 'from-orange-500/20 to-orange-600/10' },
  { icon: Wallet, key: 'cost', color: 'from-emerald-500/20 to-emerald-600/10' },
  { icon: BarChart3, key: 'prices', color: 'from-cyan-500/20 to-cyan-600/10' },
  { icon: Plane, key: 'relocation', color: 'from-rose-500/20 to-rose-600/10' },
];

const LOCALIZED_CONTENT: Record<string, {
  sectionTitle: string;
  sectionSubtitle: string;
  intents: Record<string, { title: string; description: string }>;
}> = {
  en: {
    sectionTitle: "What to Expect",
    sectionSubtitle: "Our location guides cover 8 essential topics to help you make informed decisions about living and investing in the Costa del Sol.",
    intents: {
      buying: { title: "Buying Property", description: "Step-by-step purchase guides with legal requirements, costs, and timeline" },
      families: { title: "Best Areas for Families", description: "School districts, safety ratings, parks, and family-friendly amenities" },
      investment: { title: "Investment Areas", description: "ROI data, rental yields, market trends, and growth projections" },
      expat: { title: "Expat Guide", description: "Community insights, lifestyle tips, and integration resources" },
      retirement: { title: "Retirement Guide", description: "Healthcare access, climate benefits, and cost analysis" },
      cost: { title: "Cost of Living", description: "Monthly budgets, utility costs, and lifestyle comparisons" },
      prices: { title: "Property Prices", description: "Market analysis, price trends, and neighborhood comparisons" },
      relocation: { title: "Relocation Guide", description: "Moving process, visa requirements, and settling-in checklist" }
    }
  },
  nl: {
    sectionTitle: "Wat te Verwachten",
    sectionSubtitle: "Onze locatiegidsen behandelen 8 essentiële onderwerpen om u te helpen weloverwogen beslissingen te nemen over wonen en investeren aan de Costa del Sol.",
    intents: {
      buying: { title: "Vastgoed Kopen", description: "Stapsgewijze aankoopgidsen met wettelijke vereisten en kosten" },
      families: { title: "Beste Gebieden voor Gezinnen", description: "Schooldistricten, veiligheid en gezinsvriendelijke voorzieningen" },
      investment: { title: "Investeringsgebieden", description: "ROI-gegevens, huurrendementen en markttrends" },
      expat: { title: "Expat Gids", description: "Gemeenschapsinzichten, levensstijltips en integratiebronnen" },
      retirement: { title: "Pensioengids", description: "Toegang tot gezondheidszorg, klimaatvoordelen en kostenanalyse" },
      cost: { title: "Kosten van Levensonderhoud", description: "Maandelijkse budgetten en nutskosten" },
      prices: { title: "Vastgoedprijzen", description: "Marktanalyse, prijstrends en wijkvergelijkingen" },
      relocation: { title: "Verhuisgids", description: "Verhuisproces, visumvereisten en vestigingschecklist" }
    }
  },
  de: {
    sectionTitle: "Was Sie Erwartet",
    sectionSubtitle: "Unsere Standortführer behandeln 8 wesentliche Themen, um Ihnen bei informierten Entscheidungen über Leben und Investieren an der Costa del Sol zu helfen.",
    intents: {
      buying: { title: "Immobilienkauf", description: "Schritt-für-Schritt-Kaufanleitungen mit rechtlichen Anforderungen" },
      families: { title: "Beste Gegenden für Familien", description: "Schulbezirke, Sicherheit und familienfreundliche Einrichtungen" },
      investment: { title: "Investitionsgebiete", description: "ROI-Daten, Mietrenditen und Markttrends" },
      expat: { title: "Expat-Führer", description: "Gemeinschaftseinblicke und Integrationsmittel" },
      retirement: { title: "Ruhestandsführer", description: "Gesundheitsversorgung, Klimavorteile und Kostenanalyse" },
      cost: { title: "Lebenshaltungskosten", description: "Monatliche Budgets und Nebenkosten" },
      prices: { title: "Immobilienpreise", description: "Marktanalyse, Preistrends und Stadtteilvergleiche" },
      relocation: { title: "Umzugsführer", description: "Umzugsprozess, Visaanforderungen und Checkliste" }
    }
  },
  fr: {
    sectionTitle: "À Quoi S'attendre",
    sectionSubtitle: "Nos guides d'emplacement couvrent 8 sujets essentiels pour vous aider à prendre des décisions éclairées sur la vie et l'investissement sur la Costa del Sol.",
    intents: {
      buying: { title: "Achat Immobilier", description: "Guides d'achat étape par étape avec exigences légales" },
      families: { title: "Meilleurs Quartiers pour Familles", description: "Districts scolaires, sécurité et commodités familiales" },
      investment: { title: "Zones d'Investissement", description: "Données ROI, rendements locatifs et tendances du marché" },
      expat: { title: "Guide Expat", description: "Aperçus de la communauté et ressources d'intégration" },
      retirement: { title: "Guide Retraite", description: "Accès aux soins, avantages climatiques et analyse des coûts" },
      cost: { title: "Coût de la Vie", description: "Budgets mensuels et coûts des services publics" },
      prices: { title: "Prix Immobiliers", description: "Analyse de marché, tendances et comparaisons" },
      relocation: { title: "Guide de Relocalisation", description: "Processus de déménagement, visas et checklist" }
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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.sectionSubtitle}
          </p>
        </div>

        {/* Intent Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INTENT_TYPES.map((intent, index) => {
            const Icon = intent.icon;
            const intentContent = content.intents[intent.key];

            return (
              <div
                key={intent.key}
                className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${intent.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {intentContent.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {intentContent.description}
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
