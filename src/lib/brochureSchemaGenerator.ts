import { CityBrochureData } from '@/constants/brochures';
import { truncateForAEO } from "./aeoUtils";

const BASE_URL = 'https://www.everencewealth.com';

interface BrochureSchemaOptions {
  city: CityBrochureData;
  language?: string;
}

export const generateBrochureSchemas = ({ city, language = 'en' }: BrochureSchemaOptions): string => {
  const schemas = [
    generatePlaceSchema(city),
    generateRealEstateAgentSchema(city),
    generateBreadcrumbSchema(city),
    generateFAQSchema(city),
    generateSpeakableSchema(city),
  ];

  return JSON.stringify(schemas);
};

const generatePlaceSchema = (city: CityBrochureData) => ({
  '@context': 'https://schema.org',
  '@type': 'Place',
  name: city.name,
  description: `${city.name} - Premium wealth management destination. Financial planning, insurance, and investment services.`,
  geo: {
    '@type': 'GeoCoordinates',
    latitude: city.coordinates.lat,
    longitude: city.coordinates.lng,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: city.name,
    addressRegion: city.coordinates.lat > 35 ? 'United States' : 'United States',
    addressCountry: 'US',
  },
});

const generateRealEstateAgentSchema = (city: CityBrochureData) => ({
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'Everence Wealth',
  description: `Licensed financial advisory firm specializing in wealth management and insurance solutions in ${city.name}.`,
  url: BASE_URL,
  logo: `${BASE_URL}/assets/logo-new.png`,
  telephone: '+1 (555) 123-4567',
  email: 'info@everencewealth.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: city.name,
    addressCountry: 'US',
  },
  areaServed: [
    {
      '@type': 'Place',
      name: city.name,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: city.coordinates.lat,
        longitude: city.coordinates.lng,
      },
    },
  ],
  knowsLanguage: ['en', 'es'],
});

const generateBreadcrumbSchema = (city: CityBrochureData) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Locations',
      item: `${BASE_URL}/brochure/marbella`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: city.name,
      item: `${BASE_URL}/brochure/${city.slug}`,
    },
  ],
});

const generateFAQSchema = (city: CityBrochureData) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `Why invest in property in ${city.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: truncateForAEO(`${city.name} offers exceptional opportunities with strong growth potential, diverse financial services landscape, and access to top-tier wealth management professionals.`),
      },
    },
    {
      '@type': 'Question',
      name: `What types of properties are available in ${city.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: truncateForAEO(`${city.name} offers a diverse range of financial services including ${city.propertyTypes.slice(0, 3).join(', ')}. From retirement planning to wealth protection, there are options for every financial goal.`),
      },
    },
    {
      '@type': 'Question',
      name: `Which are the best neighborhoods in ${city.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: truncateForAEO(`The most sought-after areas in ${city.name} include ${city.neighborhoods.slice(0, 4).join(', ')}. Each area offers unique characteristics and financial planning needs.`),
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer support for foreign buyers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: truncateForAEO('Yes, Everence Wealth specializes in guiding clients through comprehensive wealth management. Our multilingual team provides end-to-end support from financial assessment to strategy implementation.'),
      },
    },
  ],
});

const generateSpeakableSchema = (city: CityBrochureData) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `Wealth Management in ${city.name} | Everence Wealth`,
  description: `Discover exceptional financial planning opportunities in ${city.name}. Expert guidance for clients seeking wealth management and insurance solutions.`,
  url: `${BASE_URL}/brochure/${city.slug}`,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['.brochure-hero h1', '.brochure-hero p', '.lifestyle-narrative h2', '.lifestyle-narrative p'],
  },
  inLanguage: 'en-US',
});

export const generateBrochureMetaTags = (city: CityBrochureData) => ({
  title: `Wealth Management in ${city.name} | Everence Wealth`,
  description: `Discover exceptional financial planning and wealth management services in ${city.name}. Expert guidance from licensed advisors. Retirement planning, insurance & investment strategies.`,
  keywords: `${city.name} wealth management, ${city.name} financial planning, retirement planning ${city.name}, insurance ${city.name}, financial advisor ${city.name}`,
  ogTitle: `${city.name} - Premium Wealth Management Services`,
  ogDescription: `Explore wealth management services in ${city.name}. From retirement planning to insurance solutions, find your financial strategy with expert guidance.`,
  ogImage: city.heroImage,
  canonical: `${BASE_URL}/brochure/${city.slug}`,
});
