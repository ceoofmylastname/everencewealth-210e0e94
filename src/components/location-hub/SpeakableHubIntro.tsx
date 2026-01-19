import React from 'react';
import { Volume2, Sparkles, MapPin, BookOpen, Globe, Target } from 'lucide-react';

interface SpeakableHubIntroProps {
  language: string;
  cityCount?: number;
  guideCount?: number;
}

const LOCALIZED_CONTENT: Record<string, {
  badge: string;
  title: string;
  intro: string;
  highlights: string[];
  footer: string;
}> = {
  en: {
    badge: "AI-Ready Summary",
    title: "Quick Answer",
    intro: "Our Costa del Sol Location Guides are comprehensive resources covering cities across the region. Each guide addresses specific buyer intents including family relocation, retirement planning, property investment, and cost of living analysis. Every page features expert insights, neighborhood breakdowns, price comparisons, and actionable recommendations to help you make informed real estate decisions.",
    highlights: [
      "8 major cities covered",
      "8 intent types per city",
      "Available in 10 languages",
      "Updated quarterly"
    ],
    footer: "Optimized for voice assistants and AI search"
  },
  nl: {
    badge: "AI-Gereed Samenvatting",
    title: "Snel Antwoord",
    intro: "Onze Costa del Sol Locatiegidsen zijn uitgebreide bronnen die steden in de hele regio behandelen. Elke gids behandelt specifieke kopersbehoeften, waaronder gezinsverhuizing, pensioenplanning, vastgoedinvesteringen en kosten van levensonderhoud. Elke pagina bevat expertinzichten, wijkoverzichten, prijsvergelijkingen en uitvoerbare aanbevelingen.",
    highlights: [
      "8 grote steden",
      "8 intentietypes per stad",
      "Beschikbaar in 10 talen",
      "Kwartaallijks bijgewerkt"
    ],
    footer: "Geoptimaliseerd voor spraakassistenten en AI-zoekopdrachten"
  },
  de: {
    badge: "KI-bereite Zusammenfassung",
    title: "Schnelle Antwort",
    intro: "Unsere Costa del Sol Standortführer sind umfassende Ressourcen, die Städte in der gesamten Region abdecken. Jeder Führer behandelt spezifische Käuferbedürfnisse wie Familienumzug, Ruhestandsplanung, Immobilieninvestitionen und Lebenshaltungskostenanalyse. Jede Seite enthält Experteneinblicke, Stadtteilübersichten und Preisvergleiche.",
    highlights: [
      "8 große Städte",
      "8 Thementypen pro Stadt",
      "In 10 Sprachen verfügbar",
      "Vierteljährlich aktualisiert"
    ],
    footer: "Optimiert für Sprachassistenten und KI-Suche"
  },
  fr: {
    badge: "Résumé prêt pour l'IA",
    title: "Réponse Rapide",
    intro: "Nos guides d'emplacement Costa del Sol sont des ressources complètes couvrant les villes de la région. Chaque guide aborde des besoins spécifiques des acheteurs, notamment la relocalisation familiale, la planification de la retraite, l'investissement immobilier et l'analyse du coût de la vie. Chaque page contient des informations d'experts et des recommandations.",
    highlights: [
      "8 grandes villes",
      "8 types de thèmes par ville",
      "Disponible en 10 langues",
      "Mis à jour trimestriellement"
    ],
    footer: "Optimisé pour les assistants vocaux et la recherche IA"
  }
};

export const SpeakableHubIntro: React.FC<SpeakableHubIntroProps> = ({ 
  language, 
  cityCount = 8, 
  guideCount = 19 
}) => {
  const content = LOCALIZED_CONTENT[language] || LOCALIZED_CONTENT.en;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50" />
            
            <div className="relative glass-luxury rounded-3xl p-6 md:p-10 border border-primary/20">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                  <Volume2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="text-primary text-sm font-medium tracking-wide uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {content.title}
                  </span>
                  <h2 className="text-lg font-semibold text-foreground">{content.badge}</h2>
                </div>
              </div>

              {/* Speakable Content - this is what AI reads */}
              <div className="speakable-hub-intro speakable-box">
                <p className="text-lg md:text-xl leading-relaxed text-foreground/90 mb-6">
                  {content.intro}
                </p>
              </div>

              {/* Highlight Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{content.highlights[0]}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Target className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{content.highlights[1]}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{content.highlights[2]}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{content.highlights[3]}</span>
                </div>
              </div>

              {/* Bottom Accent */}
              <div className="pt-4 border-t border-primary/10">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {content.footer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
