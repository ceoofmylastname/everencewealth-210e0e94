/**
 * BUSINESS — Single source of truth for organization metadata.
 *
 * Every JSON-LD schema, footer, contact link, and SSR template MUST read from
 * this constant. Do not duplicate address/phone/email constants elsewhere.
 *
 * Person.sameAs for individuals (e.g. founders) is intentionally OMITTED until
 * a verified PERSONAL profile URL exists. Per schema.org, Person.sameAs must
 * point to pages ABOUT THAT PERSON — a company LinkedIn page is NOT valid here.
 *
 * Organization.sameAs may include the company LinkedIn (correct usage).
 */

export interface BusinessFounder {
  '@id': string;
  name: string;
  jobTitle: string;
  // sameAs intentionally omitted until verified personal URL is provided.
  // TODO: add Steven Rosenberg's verified personal LinkedIn / official bio URL.
}

export interface BusinessAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface BusinessGeo {
  latitude: number;
  longitude: number;
}

export interface BusinessContactPoint {
  contactType: string;
  availableLanguage: readonly string[];
  telephone: string;
  email: string;
}

export interface BusinessOpeningHours {
  dayOfWeek: readonly string[];
  opens: string;
  closes: string;
}

export interface BusinessLogo {
  url: string;
  width: number;
  height: number;
}

export const BUSINESS = Object.freeze({
  name: 'Everence Wealth',
  legalName: 'Everence Wealth',
  alternateName: 'Everence',
  url: 'https://www.everencewealth.com',
  logo: Object.freeze({
    url: 'https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png',
    width: 1200,
    height: 630,
  }) as BusinessLogo,
  description:
    'Independent wealth architects specializing in tax-efficient retirement strategies, estate planning, and asset protection. Serving clients in San Francisco and nationwide.',
  slogan: 'Architecting Your Financial Legacy',
  foundingDate: '1990',
  priceRange: '$$$',
  telephone: '+1-925-433-7724',
  telephoneE164: '+19254337724',
  email: 'info@everencewealth.com',
  address: Object.freeze({
    streetAddress: '455 Market St Ste 1940 PMB 350011',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94105',
    addressCountry: 'US',
  }) as BusinessAddress,
  /** Formatted single-line address for visible UI use. */
  addressFormatted:
    '455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105',
  geo: Object.freeze({
    latitude: 37.7897,
    longitude: -122.4014,
  }) as BusinessGeo,
  areaServed: Object.freeze({
    type: 'Country',
    name: 'United States',
  }),
  founders: Object.freeze([
    Object.freeze({
      '@id': 'https://www.everencewealth.com/#steven-rosenberg',
      name: 'Steven Rosenberg',
      jobTitle: 'Founder & Chief Wealth Strategist',
    }),
  ]) as readonly BusinessFounder[],
  contactPoint: Object.freeze({
    contactType: 'Customer Service',
    availableLanguage: Object.freeze(['en', 'es']),
    telephone: '+1-925-433-7724',
    email: 'info@everencewealth.com',
  }) as BusinessContactPoint,
  openingHours: Object.freeze([
    Object.freeze({
      dayOfWeek: Object.freeze([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ]),
      opens: '09:00',
      closes: '18:00',
    }) as BusinessOpeningHours,
  ]),
  /** Organization-level sameAs — company LinkedIn is correct here. */
  sameAs: Object.freeze([
    'https://www.linkedin.com/company/everencewealth/',
  ]),
});

export type Business = typeof BUSINESS;

/**
 * Helper: build a JSON-LD PostalAddress object from BUSINESS.address.
 */
export function businessPostalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.address.streetAddress,
    addressLocality: BUSINESS.address.addressLocality,
    addressRegion: BUSINESS.address.addressRegion,
    postalCode: BUSINESS.address.postalCode,
    addressCountry: BUSINESS.address.addressCountry,
  };
}

/**
 * Helper: build a JSON-LD GeoCoordinates object from BUSINESS.geo.
 */
export function businessGeoCoordinates() {
  return {
    '@type': 'GeoCoordinates',
    latitude: BUSINESS.geo.latitude,
    longitude: BUSINESS.geo.longitude,
  };
}

/**
 * Helper: build a JSON-LD ContactPoint object from BUSINESS.contactPoint.
 */
export function businessContactPoint() {
  return {
    '@type': 'ContactPoint',
    contactType: BUSINESS.contactPoint.contactType,
    availableLanguage: [...BUSINESS.contactPoint.availableLanguage],
    telephone: BUSINESS.contactPoint.telephone,
    email: BUSINESS.contactPoint.email,
  };
}

/**
 * Helper: build the JSON-LD openingHoursSpecification array.
 */
export function businessOpeningHoursSpecification() {
  return BUSINESS.openingHours.map((slot) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [...slot.dayOfWeek],
    opens: slot.opens,
    closes: slot.closes,
  }));
}

/**
 * Helper: build a JSON-LD AreaServed (Country) object.
 */
export function businessAreaServed() {
  return {
    '@type': BUSINESS.areaServed.type,
    name: BUSINESS.areaServed.name,
  };
}

/**
 * Helper: build the JSON-LD founders array (Person stubs without sameAs).
 */
export function businessFounderStubs() {
  return BUSINESS.founders.map((f) => ({
    '@type': 'Person',
    '@id': f['@id'],
    name: f.name,
    jobTitle: f.jobTitle,
  }));
}
