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
    intro: "Everence Wealth Location Guides are comprehensive financial planning resources covering cities across the United States. Each guide addresses specific client needs including retirement planning, tax optimization, insurance coverage, and estate planning. Every page features expert insights, market analysis, cost of living breakdowns, and actionable recommendations to help you make informed financial decisions.",
    highlights: [
      "50 states served",
      "8 planning topics per market",
      "Bilingual guidance",
      "Updated quarterly"
    ],
    footer: "Optimized for voice assistants and AI search"
  },
  es: {
    badge: "Resumen Listo para IA",
    title: "Respuesta Rápida",
    intro: "Las Guías de Ubicación de Everence Wealth son recursos completos de planificación financiera que cubren ciudades en los Estados Unidos. Cada guía aborda necesidades específicas del cliente, incluyendo planificación de jubilación, optimización fiscal, cobertura de seguros y planificación patrimonial. Cada página presenta información experta, análisis de mercado y recomendaciones prácticas para decisiones financieras informadas.",
    highlights: [
      "50 estados atendidos",
      "8 temas por mercado",
      "Orientación bilingüe",
      "Actualizado trimestralmente"
    ],
    footer: "Optimizado para asistentes de voz y búsqueda con IA"
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
