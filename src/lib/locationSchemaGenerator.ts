import { Author } from "@/types/blog";
import { generatePersonSchema } from "./schemaGenerator";
import { truncateForAEO } from "./aeoUtils";

export interface LocationPage {
  id: string;
  city_slug: string;
  topic_slug: string;
  city_name: string;
  region: string;
  country: string;
  intent_type: string;
  headline: string;
  meta_title: string;
  meta_description: string;
  speakable_answer: string;
  location_overview?: string;
  market_breakdown?: string;
  best_areas?: BestArea[];
  cost_breakdown?: CostItem[];
  use_cases?: string;
  final_summary?: string;
  qa_entities?: QAEntity[];
  featured_image_url?: string;
  featured_image_alt?: string;
  featured_image_caption?: string;
  featured_image_width?: number;
  featured_image_height?: number;
  internal_links?: InternalLink[];
  external_citations?: ExternalCitation[];
  author_id?: string;
  reviewer_id?: string;
  language: string;
  status: string;
  date_published?: string;
  date_modified?: string;
  created_at: string;
  updated_at: string;
}

export interface BestArea {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  price_range: string;
}

export interface CostItem {
  item: string;
  range: string;
  notes: string;
}

export interface QAEntity {
  question: string;
  answer: string;
}

export interface InternalLink {
  url: string;
  anchor_text: string;
  context?: string;
}

export interface ExternalCitation {
  url: string;
  source: string;
  text?: string;
}

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "Everence Wealth",
  "description": "Independent wealth management and retirement planning",
  "url": "https://www.everencewealth.com",
  "logo": "https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "San Diego",
    "addressRegion": "CA",
    "addressCountry": "US"
  }
};

export function generatePlaceSchema(page: LocationPage): any {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": page.city_name,
    "description": page.meta_description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": page.city_name,
      "addressRegion": page.region,
      "addressCountry": page.country === 'United States' ? 'US' : page.country
    },
    "containedInPlace": {
      "@type": "AdministrativeArea",
      "name": page.region
    }
  };
}

export function generateLocalBusinessSchema(page: LocationPage, baseUrl: string = "https://www.everencewealth.com"): any {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Everence Wealth",
    "description": `Expert wealth management services in ${page.city_name}`,
    "url": `${baseUrl}/locations/${page.city_slug}/${page.topic_slug}`,
    "areaServed": {
      "@type": "Place",
      "name": page.city_name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": page.city_name,
        "addressRegion": page.region,
        "addressCountry": page.country === 'United States' ? 'US' : page.country
      }
    },
    "parentOrganization": ORGANIZATION_SCHEMA
  };
}

export function generateLocationFAQSchema(page: LocationPage, author: Author | null): any | null {
  if (!page.qa_entities || page.qa_entities.length === 0) {
    return null;
  }

  const baseUrl = 'https://www.everencewealth.com';

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${baseUrl}/locations/${page.city_slug}/${page.topic_slug}#faq`,
    "inLanguage": page.language,
    "mainEntity": page.qa_entities.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": truncateForAEO(faq.answer),
        ...(author && { "author": generatePersonSchema(author) })
      }
    }))
  };
}

export function generateLocationSpeakableSchema(page: LocationPage): any {
  return {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "inLanguage": page.language,
    "cssSelector": [".speakable-answer", ".location-summary"],
    "xpath": ["/html/body/main/section[@class='speakable-answer']"]
  };
}

export function generateLocationBreadcrumbSchema(
  page: LocationPage,
  baseUrl: string = "https://www.everencewealth.com"
): any {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Locations",
        "item": `${baseUrl}/locations`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": page.city_name,
        "item": `${baseUrl}/locations/${page.city_slug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": page.headline,
        "item": `${baseUrl}/locations/${page.city_slug}/${page.topic_slug}`
      }
    ]
  };
}

export function generateLocationWebPageSchema(
  page: LocationPage,
  author: Author | null,
  baseUrl: string = "https://www.everencewealth.com"
): any {
  const pageUrl = `${baseUrl}/locations/${page.city_slug}/${page.topic_slug}`;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.headline,
    "description": page.meta_description,
    "url": pageUrl,
    "inLanguage": page.language,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Everence Wealth",
      "url": baseUrl
    },
    "about": {
      "@type": "Place",
      "name": page.city_name
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".speakable-answer"]
    }
  };

  if (page.date_published) {
    schema.datePublished = page.date_published;
  }
  if (page.date_modified) {
    schema.dateModified = page.date_modified;
  }
  if (author) {
    schema.author = generatePersonSchema(author);
  }
  if (page.featured_image_url) {
    schema.primaryImageOfPage = generateLocationImageObjectSchema(page, baseUrl);
  }

  return schema;
}

/**
 * Generate a rich GEO-optimized ImageObject schema for location pages
 */
export function generateLocationImageObjectSchema(
  page: LocationPage,
  baseUrl: string = "https://www.everencewealth.com"
): any {
  const pageUrl = `${baseUrl}/locations/${page.city_slug}/${page.topic_slug}`;
  
  return {
    "@type": "ImageObject",
    "@id": `${pageUrl}#primaryImage`,
    "url": page.featured_image_url,
    "name": `${page.city_name} - ${page.headline}`,
    "description": page.featured_image_alt || `${page.city_name} - Everence Wealth financial planning services`,
    "caption": page.featured_image_caption || `${page.city_name} - Expert wealth management and retirement planning by Everence Wealth`,
    "contentLocation": {
      "@type": "Place",
      "name": page.city_name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": page.city_name,
        "addressRegion": page.region,
        "addressCountry": page.country === 'United States' ? 'US' : page.country
      }
    },
    "width": {
      "@type": "QuantitativeValue",
      "value": page.featured_image_width || 1920
    },
    "height": {
      "@type": "QuantitativeValue",
      "value": page.featured_image_height || 1080
    },
    "encodingFormat": page.featured_image_url?.includes('.webp') ? 'image/webp' : 
                      page.featured_image_url?.includes('.png') ? 'image/png' : 'image/jpeg',
    "representativeOfPage": true,
    "license": "https://creativecommons.org/licenses/by-nc/4.0/",
    "acquireLicensePage": `${baseUrl}/contact`,
    "creditText": "Everence Wealth",
    "creator": {
      "@type": "Organization",
      "name": "Everence Wealth",
      "url": baseUrl
    }
  };
}

export interface LocationSchemas {
  place: any;
  localBusiness: any;
  faq: any | null;
  speakable: any;
  breadcrumb: any;
  webPage: any;
  imageObject: any | null;
}

export function generateAllLocationSchemas(
  page: LocationPage,
  author: Author | null,
  baseUrl: string = "https://www.everencewealth.com"
): LocationSchemas {
  return {
    place: generatePlaceSchema(page),
    localBusiness: generateLocalBusinessSchema(page, baseUrl),
    faq: generateLocationFAQSchema(page, author),
    speakable: generateLocationSpeakableSchema(page),
    breadcrumb: generateLocationBreadcrumbSchema(page, baseUrl),
    webPage: generateLocationWebPageSchema(page, author, baseUrl),
    imageObject: page.featured_image_url ? generateLocationImageObjectSchema(page, baseUrl) : null
  };
}
