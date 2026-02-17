/**
 * Location Hub Schema Generator
 * Generates comprehensive JSON-LD schemas for the /{lang}/locations hub page
 * Optimized for AEO, GEO, and voice assistants
 */

const BASE_URL = 'https://www.everencewealth.com';

// Locale mapping for og:locale
const LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  es: 'es_US',
};

export const SUPPORTED_LANGUAGES = ['en', 'es'];

// Organization schema (reused across all schemas)
const ORGANIZATION_SCHEMA = {
  "@type": "FinancialService",
  "@id": `${BASE_URL}/#organization`,
  "name": "Everence Wealth",
  "url": BASE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": "https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png",
    "width": 512,
    "height": 512
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "addressCountry": "US"
  }
};

export interface HubCity {
  name: string;
  slug: string;
  guideCount: number;
}

export interface LocationHubMetadata {
  language: string;
  title: string;
  description: string;
  speakableSummary: string;
  cities: HubCity[];
  totalGuides: number;
  intentTypes: number;
}

/**
 * UI labels interface for the hub
 */
interface HubUILabels {
  title: string;
  description: string;
  speakableSummary: string;
  statsLabels: {
    cities: string;
    guides: string;
    languages: string;
    dataPoints: string;
  };
  heroTitle: string;
  heroSubtitle: string;
  scrollCta: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButton1: string;
  ctaButton2: string;
  breadcrumbs: {
    home: string;
    locations: string;
  };
}

/**
 * Get localized hub content
 */
export function getLocalizedHubContent(lang: string): HubUILabels {
  const content: Record<string, HubUILabels> = {
    en: {
      title: "Location Guides | Everence Wealth",
      description: "Explore comprehensive financial planning guides for cities across the United States. Expert insights on tax strategies, retirement planning, insurance coverage, and wealth management tailored to your market.",
      speakableSummary: "Everence Wealth Location Guides are comprehensive financial planning resources covering cities across the United States. Each guide addresses specific needs including retirement planning, tax optimization, insurance coverage, estate planning, and cost of living analysis. Every page features expert insights, market breakdowns, and actionable recommendations to help you make informed financial decisions.",
      statsLabels: { cities: "Markets", guides: "Guides", languages: "Languages", dataPoints: "Data Points" },
      heroTitle: "Financial Intelligence",
      heroSubtitle: "for {count} Markets",
      scrollCta: "Explore",
      ctaTitle: "Ready to Plan Your Financial Future?",
      ctaDescription: "Our expert team is ready to help you navigate tax strategies, retirement planning, and insurance solutions for your market.",
      ctaButton1: "Schedule a Consultation",
      ctaButton2: "Explore Strategies",
      breadcrumbs: { home: "Home", locations: "Locations" }
    },
    es: {
      title: "Guías por Ubicación | Everence Wealth",
      description: "Explore guías completas de planificación financiera para ciudades en los Estados Unidos. Información experta sobre estrategias fiscales, planificación de jubilación, cobertura de seguros y gestión patrimonial adaptada a su mercado.",
      speakableSummary: "Las Guías de Ubicación de Everence Wealth son recursos completos de planificación financiera que cubren ciudades en los Estados Unidos. Cada guía aborda necesidades específicas como planificación de jubilación, optimización fiscal, cobertura de seguros, planificación patrimonial y análisis del costo de vida.",
      statsLabels: { cities: "Mercados", guides: "Guías", languages: "Idiomas", dataPoints: "Datos" },
      heroTitle: "Inteligencia Financiera",
      heroSubtitle: "para {count} Mercados",
      scrollCta: "Explorar",
      ctaTitle: "¿Listo para planificar su futuro financiero?",
      ctaDescription: "Nuestro equipo de expertos está listo para ayudarle con estrategias fiscales, planificación de jubilación y soluciones de seguros.",
      ctaButton1: "Agendar Consulta",
      ctaButton2: "Explorar Estrategias",
      breadcrumbs: { home: "Inicio", locations: "Ubicaciones" }
    }
  };

  return content[lang] || content.en;
}

/**
 * Get localized FAQ content for the hub
 */
export function getLocalizedHubFAQs(lang: string): Array<{ question: string; answer: string }> {
  const faqs: Record<string, Array<{ question: string; answer: string }>> = {
    en: [
      {
        question: "What are Location Intelligence Pages?",
        answer: "Location Intelligence Pages are comprehensive financial planning guides for US cities, covering tax strategies, retirement planning, insurance coverage, estate planning, and cost of living analysis. Each guide provides expert insights and actionable recommendations."
      },
      {
        question: "Which markets are covered in the location guides?",
        answer: "Our guides cover major US markets including cities across all 50 states. Each market has multiple guides covering different financial planning topics and strategies."
      },
      {
        question: "What topics do the location guides cover?",
        answer: "Our guides cover key financial topics: Tax Analysis, Estate Planning, Retirement Projections, Risk Assessment, Insurance Coverage, Cash Flow Planning, Market Access, and Regulatory Compliance."
      },
      {
        question: "Are the location guides available in Spanish?",
        answer: "Yes! Our guides are available in both English and Spanish, professionally translated and localized for our diverse client base."
      },
      {
        question: "How often are the location guides updated?",
        answer: "Our guides are regularly updated to reflect current tax laws, insurance rates, and market conditions. We aim to review and update content quarterly to ensure accuracy and relevance."
      }
    ],
    es: [
      {
        question: "¿Qué son las Páginas de Inteligencia por Ubicación?",
        answer: "Las Páginas de Inteligencia por Ubicación son guías completas de planificación financiera para ciudades de EE.UU., que cubren estrategias fiscales, planificación de jubilación, cobertura de seguros, planificación patrimonial y análisis del costo de vida."
      },
      {
        question: "¿Qué mercados están cubiertos en las guías de ubicación?",
        answer: "Nuestras guías cubren los principales mercados de EE.UU., incluyendo ciudades en los 50 estados. Cada mercado tiene múltiples guías que cubren diferentes temas de planificación financiera."
      },
      {
        question: "¿Qué temas cubren las guías de ubicación?",
        answer: "Nuestras guías cubren temas financieros clave: Análisis Fiscal, Planificación Patrimonial, Proyecciones de Jubilación, Evaluación de Riesgos, Cobertura de Seguros, Planificación de Flujo de Caja, Acceso al Mercado y Cumplimiento Regulatorio."
      },
      {
        question: "¿Las guías están disponibles en español?",
        answer: "¡Sí! Nuestras guías están disponibles en inglés y español, profesionalmente traducidas y localizadas."
      },
      {
        question: "¿Con qué frecuencia se actualizan las guías?",
        answer: "Nuestras guías se actualizan regularmente para reflejar las leyes fiscales actuales, tarifas de seguros y condiciones del mercado. Revisamos y actualizamos el contenido trimestralmente."
      }
    ]
  };

  return faqs[lang] || faqs.en;
}

/**
 * Generate WebPage schema with SpeakableSpecification for the hub
 */
export function generateHubWebPageSchema(lang: string): object {
  const content = getLocalizedHubContent(lang);
  const canonicalUrl = `${BASE_URL}/${lang}/locations`;

  return {
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    "url": canonicalUrl,
    "name": content.title,
    "description": content.description,
    "inLanguage": LOCALE_MAP[lang] || 'en_US',
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      "name": "Everence Wealth",
      "url": BASE_URL,
      "publisher": { "@id": `${BASE_URL}/#organization` }
    },
    "about": {
      "@type": "Place",
      "name": "United States",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      }
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["#speakable-summary", ".speakable-hub-intro", ".speakable-answer", ".speakable-box"]
    },
    "datePublished": "2024-01-15",
    "dateModified": new Date().toISOString().split('T')[0]
  };
}

/**
 * Generate CollectionPage schema
 */
export function generateHubCollectionPageSchema(lang: string, metadata: LocationHubMetadata): object {
  const canonicalUrl = `${BASE_URL}/${lang}/locations`;

  return {
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#collectionpage`,
    "name": metadata.title,
    "description": metadata.description,
    "url": canonicalUrl,
    "inLanguage": LOCALE_MAP[lang] || 'en_US',
    "mainEntity": {
      "@type": "ItemList",
      "@id": `${canonicalUrl}#citylist`,
      "name": "US Market Guides",
      "numberOfItems": metadata.cities.length,
      "itemListElement": metadata.cities.map((city, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": city.name,
        "url": `${BASE_URL}/${lang}/locations/${city.slug}`,
        "item": {
          "@type": "Place",
          "name": city.name,
          "description": `${city.guideCount} financial planning guides available for ${city.name}`
        }
      }))
    }
  };
}

/**
 * Generate BreadcrumbList schema for the hub
 */
export function generateHubBreadcrumbSchema(lang: string): object {
  const canonicalUrl = `${BASE_URL}/${lang}/locations`;

  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${BASE_URL}/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Locations",
        "item": canonicalUrl
      }
    ]
  };
}

/**
 * Generate FAQPage schema for the hub
 */
export function generateHubFAQSchema(lang: string): object | null {
  const faqs = getLocalizedHubFAQs(lang);
  if (!faqs.length) return null;

  const canonicalUrl = `${BASE_URL}/${lang}/locations`;

  return {
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate hreflang tags for the hub
 */
export function generateHubHreflangTags(currentLang: string): string {
  const tags: string[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    const url = `${BASE_URL}/${lang}/locations`;
    tags.push(`  <link rel="alternate" hreflang="${lang}" href="${url}" />`);
  }

  // x-default points to English
  tags.push(`  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/locations" />`);

  return tags.join('\n');
}

/**
 * Generate complete @graph JSON-LD for the hub page
 */
export function generateHubSchemaGraph(lang: string, metadata: LocationHubMetadata): object {
  const webPage = generateHubWebPageSchema(lang);
  const collectionPage = generateHubCollectionPageSchema(lang, metadata);
  const breadcrumb = generateHubBreadcrumbSchema(lang);
  const faq = generateHubFAQSchema(lang);

  const graph: object[] = [
    ORGANIZATION_SCHEMA,
    webPage,
    collectionPage,
    breadcrumb
  ];

  if (faq) {
    graph.push(faq);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

/**
 * Get canonical URL for the hub
 */
export function getHubCanonicalUrl(lang: string): string {
  return `${BASE_URL}/${lang}/locations`;
}

/**
 * Get og:locale for the hub
 */
export function getHubLocale(lang: string): string {
  return LOCALE_MAP[lang] || 'en_US';
}

/**
 * Get hreflang array for React rendering in Helmet
 */
export function getHubHreflangArray(): Array<{ lang: string; href: string }> {
  const tags = SUPPORTED_LANGUAGES.map(langCode => ({
    lang: langCode,
    href: `${BASE_URL}/${langCode}/locations`
  }));
  
  // Add x-default pointing to English
  tags.push({ lang: 'x-default', href: `${BASE_URL}/en/locations` });
  
  return tags;
}
