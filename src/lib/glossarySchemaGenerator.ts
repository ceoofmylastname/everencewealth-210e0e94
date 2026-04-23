import { truncateForAEO } from "./aeoUtils";

interface GlossaryTerm {
  term: string;
  full_name: string;
  definition: string;
  related_terms: string[];
  see_also: string[];
}

interface GlossaryCategory {
  title: string;
  description: string;
  terms: GlossaryTerm[];
}

interface GlossaryData {
  version: string;
  last_updated: string;
  total_terms: number;
  categories: Record<string, GlossaryCategory>;
}

const BASE_URL = "https://www.everencewealth.com";

// Localized glossary names for each language
const GLOSSARY_NAMES: Record<string, string> = {
  en: "Wealth Management Glossary | Everence Wealth",
  es: "Glosario de Gestión Patrimonial | Everence Wealth",
};

// Localized descriptions
const GLOSSARY_DESCRIPTIONS: Record<string, string> = {
  en: "Comprehensive glossary of wealth management, retirement planning, tax strategy, and insurance terms. Expert-compiled definitions for IUL, RMD, Roth IRA, Tax Buckets, and 60+ essential financial terms.",
  es: "Glosario completo de gestión patrimonial, planificación de jubilación, estrategia fiscal y términos de seguros. Definiciones compiladas por expertos para más de 60 términos financieros esenciales.",
};

// OG Locale mapping
const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  nl: "nl_NL",
  de: "de_DE",
  fr: "fr_FR",
  fi: "fi_FI",
  pl: "pl_PL",
  da: "da_DK",
  hu: "hu_HU",
  sv: "sv_SE",
  no: "nb_NO",
};

// Author/Expert for E-E-A-T signals
const glossaryAuthor = {
  "@type": "Person",
  "name": "Everence Wealth Team",
  "jobTitle": "Licensed Financial Advisors",
  "worksFor": {
    "@type": "FinancialService",
    "name": "Everence Wealth",
    "url": BASE_URL
  },
  "knowsAbout": [
    "Retirement Planning",
    "Tax-Free Income Strategies",
    "Indexed Universal Life Insurance",
    "Wealth Protection",
    "Legacy Planning"
  ]
};

const organizationSchema = {
  "@type": "FinancialService",
  "name": "Everence Wealth",
  "url": BASE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png",
    "width": 1200,
    "height": 630
  },
  "sameAs": [
    "https://www.linkedin.com/company/everencewealth/"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ED SAN FERNAN, C. Alfonso XIII, 6, 1 OFICINA",
    "addressLocality": "Fuengirola",
    "addressRegion": "Málaga",
    "postalCode": "29640",
    "addressCountry": "ES"
  }
};

export function getGlossaryName(language: string): string {
  return GLOSSARY_NAMES[language] || GLOSSARY_NAMES.en;
}

export function getGlossaryDescription(language: string): string {
  return GLOSSARY_DESCRIPTIONS[language] || GLOSSARY_DESCRIPTIONS.en;
}

export function getOGLocale(language: string): string {
  return OG_LOCALES[language] || OG_LOCALES.en;
}

export function generateDefinedTermSetSchema(glossaryData: GlossaryData, language: string = 'en') {
  const allTerms: GlossaryTerm[] = [];
  
  Object.values(glossaryData.categories).forEach(category => {
    allTerms.push(...category.terms);
  });

  const glossaryUrl = `${BASE_URL}/${language}/glossary`;

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": glossaryUrl,
    "name": getGlossaryName(language),
    "description": getGlossaryDescription(language),
    "url": glossaryUrl,
    "inLanguage": language,
    "author": glossaryAuthor,
    "publisher": organizationSchema,
    "datePublished": "2024-01-15",
    "dateModified": glossaryData.last_updated,
    "numberOfItems": glossaryData.total_terms,
    "hasDefinedTerm": allTerms.map(term => ({
      "@type": "DefinedTerm",
      "name": term.term,
      "description": term.definition,
      "termCode": term.term.toLowerCase().replace(/\s+/g, '-'),
      "inDefinedTermSet": glossaryUrl,
      "url": `${glossaryUrl}#${term.term.toLowerCase().replace(/\s+/g, '-')}`
    }))
  };
}

export function generateGlossaryWebPageSchema(glossaryData: GlossaryData, language: string = 'en') {
  const glossaryUrl = `${BASE_URL}/${language}/glossary`;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${glossaryUrl}#webpage`,
    "url": glossaryUrl,
    "name": getGlossaryName(language),
    "description": getGlossaryDescription(language),
    "isPartOf": {
      "@type": "WebSite",
      "name": "Everence Wealth",
      "url": BASE_URL
    },
    "about": {
      "@type": "Thing",
      "name": "Spanish Financial Planning Terminology"
    },
    "mainEntity": {
      "@type": "DefinedTermSet",
      "@id": glossaryUrl
    },
    "author": glossaryAuthor,
    "publisher": organizationSchema,
    "datePublished": "2024-01-15",
    "dateModified": glossaryData.last_updated,
    "inLanguage": language,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${glossaryUrl}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateGlossaryBreadcrumbSchema(language: string = 'en') {
  const glossaryUrl = `${BASE_URL}/${language}/glossary`;
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${BASE_URL}/${language}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": getGlossaryName(language),
        "item": glossaryUrl
      }
    ]
  };
}

export function generateGlossarySpeakableSchema(language: string = 'en') {
  const glossaryUrl = `${BASE_URL}/${language}/glossary`;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        ".glossary-term-name",
        ".glossary-term-definition",
        ".glossary-category-title"
      ]
    },
    "url": glossaryUrl
  };
}

// ItemList schema for each category - enhances AI understanding
export function generateCategoryItemListSchemas(glossaryData: GlossaryData, language: string = 'en') {
  const glossaryUrl = `${BASE_URL}/${language}/glossary`;
  
  const itemLists = Object.entries(glossaryData.categories).map(([key, category]) => ({
    "@type": "ItemList",
    "@id": `${glossaryUrl}#category-${key}`,
    "name": category.title,
    "description": category.description,
    "numberOfItems": category.terms.length,
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "itemListElement": category.terms.map((term, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": term.term,
      "description": term.definition,
      "url": `${glossaryUrl}#${term.term.toLowerCase().replace(/\s+/g, '-')}`
    }))
  }));

  return itemLists;
}

// FAQPage schema for popular terms - great for featured snippets
export function generateGlossaryFAQSchema(glossaryData: GlossaryData, language: string = 'en') {
  const glossaryUrl = `${BASE_URL}/${language}/glossary`;
  
  // Select top 10 most important terms for FAQ schema
  const popularTerms = [
    "Notario", "Gestor", "Comunidad", "Catastro", "API"
  ];
  
  const allTerms: GlossaryTerm[] = [];
  Object.values(glossaryData.categories).forEach(category => {
    allTerms.push(...category.terms);
  });

  const faqTerms = allTerms.filter(term => 
    popularTerms.some(p => term.term.toLowerCase().includes(p.toLowerCase()))
  ).slice(0, 10);

  if (faqTerms.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${glossaryUrl}#faq`,
    "mainEntity": faqTerms.map(term => ({
      "@type": "Question",
      "name": `What is ${term.term} in Spanish financial planning?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": truncateForAEO(term.definition)
      }
    }))
  };
}

// Organization schema with expertise signals
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${BASE_URL}#organization`,
    "name": "Everence Wealth",
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png",
      "width": 1200,
      "height": 630
    },
    "description": "Expert financial planning consultancy specializing in wealth management properties for international buyers. Licensed professionals with deep knowledge of Spanish property law and tax regulations.",
    "areaServed": {
      "@type": "Place",
      "name": "wealth management, Spain"
    },
    "knowsAbout": [
      "Spanish Financial Planning",
      "wealth management Properties",
      "Golden Visa Spain",
      "Spanish Property Law",
      "International Property Investment"
    ],
    "slogan": "Your Gateway to wealth management Living"
  };
}

export function generateAllGlossarySchemas(glossaryData: GlossaryData, language: string = 'en') {
  const categoryItemLists = generateCategoryItemListSchemas(glossaryData, language);
  const faqSchema = generateGlossaryFAQSchema(glossaryData, language);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphItems: any[] = [
    generateDefinedTermSetSchema(glossaryData, language),
    generateGlossaryWebPageSchema(glossaryData, language),
    generateGlossaryBreadcrumbSchema(language),
    generateGlossarySpeakableSchema(language),
    generateOrganizationSchema(),
    ...categoryItemLists
  ];

  // Add FAQ schema if we have terms
  if (faqSchema) {
    graphItems.push(faqSchema);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graphItems
  };
}
