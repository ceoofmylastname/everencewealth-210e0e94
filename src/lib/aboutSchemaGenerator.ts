// About Page Schema Generator for comprehensive JSON-LD
// Supports: Organization, LocalBusiness, Person, FAQPage, BreadcrumbList, WebPage with Speakable
import { truncateForAEO } from "./aeoUtils";
import {
  BUSINESS,
  businessPostalAddress,
  businessGeoCoordinates,
  businessAreaServed,
} from "@/config/business";

interface Founder {
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  linkedin_url: string;
  credentials: string[];
  years_experience: number;
  languages: string[];
  specialization: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Citation {
  source: string;
  url: string;
  text: string;
}

interface AboutPageContent {
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  speakable_summary: string;
  hero_headline: string;
  hero_subheadline: string;
  mission_statement: string;
  years_in_business: number;
  properties_sold: number;
  client_satisfaction_percent: number;
  faq_entities: FAQ[];
  citations: Citation[];
  founders: Founder[];
  language: string;
}

const BASE_URL = 'https://www.everencewealth.com';

// Founder bio data (rendered in HTML, expanded beyond BUSINESS.founders stubs).
// Person.sameAs / linkedin_url is intentionally a company page here ONLY because
// the existing UI uses it for an external link, not for schema.org sameAs.
// generatePersonSchemas() below now omits sameAs entirely.
export const FOUNDERS_DATA: Founder[] = [
  {
    name: BUSINESS.founders[0].name,
    role: BUSINESS.founders[0].jobTitle,
    bio: "Founder & Chief Wealth Strategist at Everence Wealth. Independent insurance broker and licensed professional serving families across all 50 states.",
    photo_url: BUSINESS.logo.url,
    linkedin_url: BUSINESS.sameAs[0],
    credentials: ["Series 65", "Life & Health Licensed (All 50 States)"],
    years_experience: 25,
    languages: ["English", "Spanish"],
    specialization: "Tax-Exempt Retirement Strategies & IUL"
  }
];

// Organization Schema (FinancialService type)
export function generateOrganizationSchema(content: AboutPageContent) {
  return {
    "@type": ["Organization", "FinancialService"],
    "@id": `${BASE_URL}/#organization`,
    "name": BUSINESS.name,
    "alternateName": BUSINESS.alternateName,
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": BUSINESS.logo.url,
      "width": BUSINESS.logo.width,
      "height": BUSINESS.logo.height
    },
    "image": BUSINESS.logo.url,
    "description": content.speakable_summary,
    "foundingDate": BUSINESS.foundingDate,
    "telephone": BUSINESS.telephone,
    "email": BUSINESS.email,
    "priceRange": BUSINESS.priceRange,

    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "minValue": 3,
      "maxValue": 10
    },
    "slogan": BUSINESS.slogan,
    "knowsAbout": [
      "Retirement Planning",
      "Indexed Universal Life Insurance",
      "Tax-Exempt Strategies",
      "Fixed Indexed Annuities",
      "Estate Planning",
      "Wealth Management",
      "Three Tax Buckets Framework"
    ],
    "areaServed": businessAreaServed(),
    "address": businessPostalAddress(),
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "email": BUSINESS.email,
        "telephone": BUSINESS.telephone,
        "contactType": "customer service",
        "availableLanguage": ["English", "Spanish"]
      }
    ],
    "sameAs": [...BUSINESS.sameAs],
    "founder": FOUNDERS_DATA.map((f, i) => ({ "@id": `${BASE_URL}/about#founder-${i + 1}` })),
    "employee": FOUNDERS_DATA.map((f, i) => ({ "@id": `${BASE_URL}/about#founder-${i + 1}` })),
  };
}

// LocalBusiness Schema
export function generateLocalBusinessSchema(content: AboutPageContent) {
  return {
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#localbusiness`,
    "name": BUSINESS.name,
    "image": BUSINESS.logo.url,
    "priceRange": BUSINESS.priceRange,
    "address": businessPostalAddress(),
    "geo": businessGeoCoordinates(),
    "telephone": BUSINESS.telephone,
    "email": BUSINESS.email,
    "url": BASE_URL,
  };
}

// Person Schema for founders (E-E-A-T)
export function generatePersonSchemas(founders: Founder[]) {
  return founders.map((founder, index) => ({
    "@type": "Person",
    "@id": `${BASE_URL}/about#founder-${index + 1}`,
    "name": founder.name,
    "jobTitle": founder.role,
    "description": founder.bio,
    "image": founder.photo_url.startsWith('http') ? founder.photo_url : `${BASE_URL}${founder.photo_url}`,
    // url / sameAs intentionally omitted — pending verified PERSONAL profile URL.
    // Per schema.org, Person.sameAs must point to pages ABOUT THAT PERSON;
    // a company LinkedIn page is NOT valid here.
    "worksFor": {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`
    },
    "knowsAbout": [
      "Wealth Management",
      founder.specialization,
      "Retirement Planning"
    ],
    "knowsLanguage": founder.languages.map(lang => ({
      "@type": "Language",
      "name": lang
    })),
    "hasCredential": founder.credentials.map(cred => ({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "Professional Certification",
      "name": cred
    })),
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Financial Advisor",
      "occupationLocation": {
        "@type": "Country",
        "name": "United States"
      }
    }
  }));
}

// Generate API Credential Schema
export function generateAPICredentialSchema() {
  return {
    "@type": "EducationalOccupationalCredential",
    "@id": `${BASE_URL}/#credential`,
    "credentialCategory": "license",
    "name": "Series 65 - Uniform Investment Adviser Law Examination",
    "description": "Insurance broker license"
  };
}

// FAQPage Schema (AEO)
export function generateFAQPageSchema(faqs: FAQ[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@type": "FAQPage",
    "@id": `${BASE_URL}/about#faq`,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": truncateForAEO(faq.answer)
      }
    }))
  };
}

// BreadcrumbList Schema
export function generateBreadcrumbSchema() {
  return {
    "@type": "BreadcrumbList",
    "@id": `${BASE_URL}/about#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About Us",
        "item": `${BASE_URL}/about`
      }
    ]
  };
}

// WebPage with SpeakableSpecification (AEO)
export function generateWebPageSchema(content: AboutPageContent) {
  return {
    "@type": "WebPage",
    "@id": `${BASE_URL}/about#webpage`,
    "url": `${BASE_URL}/about`,
    "name": content.meta_title,
    "description": content.meta_description,
    "inLanguage": content.language || "en",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      "url": BASE_URL,
      "name": "Everence Wealth",
      "publisher": {
        "@id": `${BASE_URL}/#organization`
      }
    },
    "about": {
      "@id": `${BASE_URL}/#organization`
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png"
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [
        ".speakable-summary",
        ".mission-statement",
        "h1",
        ".faq-answer"
      ]
    },
    "mainContentOfPage": {
      "@type": "WebPageElement",
      "cssSelector": "main"
    }
  };
}

// AboutPage specific schema
export function generateAboutPageSchema(content: AboutPageContent) {
  return {
    "@type": "AboutPage",
    "@id": `${BASE_URL}/about#aboutpage`,
    "url": `${BASE_URL}/about`,
    "name": content.meta_title,
    "description": content.meta_description,
    "mainEntity": {
      "@id": `${BASE_URL}/#organization`
    },
    "significantLink": content.citations.map(c => c.url)
  };
}

// Generate complete schema graph
export function generateAllAboutSchemas(content: AboutPageContent): string {
  const founders = content.founders && content.founders.length > 0
    ? content.founders
    : FOUNDERS_DATA;

  const schemas = [
    generateOrganizationSchema({ ...content, founders }),
    generateLocalBusinessSchema(content),
    generateAPICredentialSchema(),
    ...generatePersonSchemas(founders),
    generateFAQPageSchema(content.faq_entities || []),
    generateBreadcrumbSchema(),
    generateWebPageSchema(content),
    generateAboutPageSchema(content)
  ].filter(Boolean);

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemas
  });
}

// Export individual generators for flexibility
export {
  type AboutPageContent,
  type Founder,
  type FAQ,
  type Citation
};
