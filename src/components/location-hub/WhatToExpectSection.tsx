import React from 'react';
import { 
  BarChart3, 
  Landmark, 
  TrendingUp, 
  Shield, 
  Heart, 
  DollarSign, 
  Users, 
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

// Financial Advisory Intelligence Cards
const INTELLIGENCE_CARDS: IntelligenceCard[] = [
  { icon: BarChart3, key: 'taxAnalysis', color: 'from-blue-500/20 to-blue-600/5' },
  { icon: Landmark, key: 'estatePlanning', color: 'from-green-500/20 to-green-600/5' },
  { icon: TrendingUp, key: 'retirementProjections', color: 'from-amber-500/20 to-amber-600/5' },
  { icon: Shield, key: 'riskAssessment', color: 'from-purple-500/20 to-purple-600/5' },
  { icon: Heart, key: 'insuranceCoverage', color: 'from-red-500/20 to-red-600/5' },
  { icon: DollarSign, key: 'cashFlow', color: 'from-cyan-500/20 to-cyan-600/5' },
  { icon: Users, key: 'marketAccess', color: 'from-indigo-500/20 to-indigo-600/5' },
  { icon: Scale, key: 'regulatoryCompliance', color: 'from-orange-500/20 to-orange-600/5' },
];

const LOCALIZED_CONTENT: Record<string, {
  sectionTitle: string;
  sectionSubtitle: string;
  cards: Record<string, { title: string; description: string }>;
}> = {
  en: {
    sectionTitle: "Data-Driven Intelligence",
    sectionSubtitle: "Our location guides go beyond basic overviews. We provide comprehensive financial planning tools with real data to help you make confident decisions.",
    cards: {
      taxAnalysis: { title: "Tax Analysis", description: "State income tax rates, property tax comparisons, and tax-advantaged strategy opportunities by market" },
      estatePlanning: { title: "Estate Planning", description: "State estate tax exemptions, probate requirements, trust-friendly jurisdictions, and wealth transfer strategies" },
      retirementProjections: { title: "Retirement Projections", description: "Cost of living adjusted retirement income needs, Social Security optimization, and pension-friendly state rankings" },
      riskAssessment: { title: "Risk Assessment", description: "Market volatility analysis, economic stability scores, and diversification recommendations by region" },
      insuranceCoverage: { title: "Insurance Coverage", description: "State-specific insurance requirements, carrier availability, premium comparisons, and coverage gap analysis" },
      cashFlow: { title: "Cash Flow Planning", description: "Cost of living indexes, lifestyle affordability, healthcare costs, and income sustainability projections" },
      marketAccess: { title: "Market Access", description: "Local advisor availability, financial institution density, and access to specialized wealth management services" },
      regulatoryCompliance: { title: "Regulatory Compliance", description: "State-specific financial regulations, licensing requirements, fiduciary standards, and consumer protection laws" }
    }
  },
  es: {
    sectionTitle: "Inteligencia Basada en Datos",
    sectionSubtitle: "Nuestras guías de ubicación van más allá de las descripciones básicas. Proporcionamos herramientas completas de planificación financiera con datos reales.",
    cards: {
      taxAnalysis: { title: "Análisis Fiscal", description: "Tasas de impuestos estatales, comparaciones de impuestos a la propiedad y oportunidades de estrategias con ventajas fiscales" },
      estatePlanning: { title: "Planificación Patrimonial", description: "Exenciones de impuestos patrimoniales estatales, requisitos testamentarios y estrategias de transferencia de riqueza" },
      retirementProjections: { title: "Proyecciones de Jubilación", description: "Necesidades de ingresos de jubilación ajustadas al costo de vida, optimización del Seguro Social y rankings de estados favorables" },
      riskAssessment: { title: "Evaluación de Riesgos", description: "Análisis de volatilidad del mercado, puntajes de estabilidad económica y recomendaciones de diversificación" },
      insuranceCoverage: { title: "Cobertura de Seguros", description: "Requisitos de seguros estatales, disponibilidad de aseguradoras, comparaciones de primas y análisis de brechas de cobertura" },
      cashFlow: { title: "Planificación de Flujo de Caja", description: "Índices de costo de vida, accesibilidad del estilo de vida, costos de salud y proyecciones de sostenibilidad de ingresos" },
      marketAccess: { title: "Acceso al Mercado", description: "Disponibilidad de asesores locales, densidad de instituciones financieras y acceso a servicios especializados" },
      regulatoryCompliance: { title: "Cumplimiento Regulatorio", description: "Regulaciones financieras estatales, requisitos de licencia, estándares fiduciarios y leyes de protección al consumidor" }
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
