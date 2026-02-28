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
    sectionSubtitle: "Common questions about retirement planning and wealth management",
    faqs: [
      {
        question: "What makes an independent broker different?",
        answer: "An independent broker works exclusively for you — not for any single insurance company. Unlike captive agents who can only sell their company's products, independent brokers have access to 75+ carriers, allowing unbiased product recommendations that truly fit your needs. This means transparent comparisons, client-first guidance, and a focus on your long-term financial goals."
      },
      {
        question: "How do Index Strategies provide tax-free retirement income?",
        answer: "Index Strategies grow cash value linked to S&P 500 performance with a 0% floor protecting against losses. When the S&P 500 drops, you lose 0% and compound from your full principal—this is Zero is Your Hero. Policy loans against the cash value are generally tax-free under IRC Section 7702. This creates a supplemental retirement income stream that doesn't increase your tax bracket or affect Social Security benefits."
      },
      {
        question: "What are the Three Tax Buckets and why should I care?",
        answer: "The Three Tax Buckets framework divides savings into taxable (brokerage), tax-deferred (401k/IRA), and tax-exempt (Roth/IUL) accounts. Most Americans over-concentrate in tax-deferred accounts, creating a tax time bomb in retirement. Diversifying across all three buckets gives you flexibility to minimize lifetime taxes."
      },
      {
        question: "How much should I save for retirement?",
        answer: "A general guideline is to replace 70-80% of your pre-retirement income. The exact amount depends on your lifestyle goals, Social Security benefits, healthcare costs, and inflation. Our advisors create personalized projections that account for all these factors, typically recommending saving 15-20% of income starting as early as possible."
      },
      {
        question: "Do you serve clients in all 50 states?",
        answer: "Yes, Everence Wealth is licensed to serve clients across all 50 states. We conduct consultations via video call, making our services accessible regardless of location. Our bilingual team provides full guidance in both English and Spanish."
      }
    ]
  },
  es: {
    sectionTitle: "Preguntas Frecuentes",
    sectionSubtitle: "Preguntas comunes sobre planificación de jubilación y gestión patrimonial",
    faqs: [
      {
        question: "¿Qué es un asesor fiduciario y por qué es importante?",
        answer: "Un asesor fiduciario está legalmente obligado a actuar en su mejor interés en todo momento. A diferencia de los vendedores basados en comisiones, los fiduciarios deben recomendar estrategias que lo beneficien a usted. Esto significa tarifas transparentes, recomendaciones imparciales de más de 75 aseguradoras y un enfoque en sus metas financieras a largo plazo."
      },
      {
        question: "¿Cómo proporciona el Seguro de Vida Universal Indexado (IUL) ingresos libres de impuestos?",
        answer: "Las pólizas IUL crecen en valor vinculadas a índices del mercado como el S&P 500 con un piso del 0% que protege contra pérdidas. Los préstamos contra el valor acumulado generalmente están libres de impuestos. Esto crea un flujo de ingresos complementario para la jubilación que no aumenta su categoría impositiva."
      },
      {
        question: "¿Qué son los Tres Cubos Fiscales y por qué debo preocuparme?",
        answer: "El marco de los Tres Cubos Fiscales divide los ahorros en cuentas gravables, con impuestos diferidos (401k/IRA) y exentas de impuestos (Roth/IUL). La mayoría de los estadounidenses concentran demasiado en cuentas con impuestos diferidos, creando una bomba fiscal en la jubilación. Diversificar entre los tres cubos le da flexibilidad para minimizar impuestos."
      },
      {
        question: "¿Cuánto debo ahorrar para la jubilación?",
        answer: "Una guía general es reemplazar el 70-80% de sus ingresos previos a la jubilación. La cantidad exacta depende de sus metas de estilo de vida, beneficios del Seguro Social, costos de atención médica e inflación. Nuestros asesores crean proyecciones personalizadas, generalmente recomendando ahorrar del 15-20% de los ingresos."
      },
      {
        question: "¿Atienden clientes en los 50 estados?",
        answer: "Sí, Everence Wealth tiene licencia para atender clientes en los 50 estados. Realizamos consultas por videollamada, haciendo nuestros servicios accesibles sin importar la ubicación. Nuestro equipo bilingüe brinda orientación completa en inglés y español."
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