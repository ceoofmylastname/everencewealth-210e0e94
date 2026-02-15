/**
 * Centralized company contact information.
 * Update these values in one place to reflect across the entire site.
 */
export const COMPANY_CONTACT = {
  phone: '+1 (415) 555-0100',
  phoneClean: '14155550100',
  email: 'info@everencewealth.com',
  whatsappBase: 'https://wa.me/14155550100',
  whatsappWithMessage: (msg: string) => 
    `https://wa.me/14155550100?text=${encodeURIComponent(msg)}`,
} as const;

/**
 * Centralized company address information.
 */
export const COMPANY_ADDRESS = {
  street: '455 Market St Ste 1940 PMB 350011',
  building: '',
  floor: '',
  postalCode: '94105',
  city: 'San Francisco',
  province: 'CA',
  country: 'United States',
  full: '455 Market St Ste 1940 PMB 350011, San Francisco, CA 94105, United States',
  googleMapsUrl: 'https://maps.app.goo.gl/example',
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0!2d-122.3989!3d37.7908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s455+Market+St!5e0!3m2!1sen!2sus'
} as const;

/**
 * Centralized company office hours.
 */
export const COMPANY_HOURS = {
  weekdays: { open: '09:00', close: '18:00' },
  saturday: { open: '10:00', close: '14:00' },
  sunday: null, // Closed
  timezone: 'PT'
} as const;

/**
 * Company information
 */
export const COMPANY_INFO = {
  name: 'Everence Wealth',
  legalName: 'Everence Wealth LLC',
  tagline: 'Independent Fiduciary Wealth Architects',
} as const;

/**
 * Centralized company facts and statistics.
 * Update these values in one place to reflect across the entire site.
 */
export const COMPANY_FACTS = {
  /** Total years of combined experience in the founding team */
  yearsExperience: 35,
  
  /** Year the company was established */
  foundedYear: 1990,
  
  /** Number of clients served */
  propertiesSold: 500,
  
  /** Client satisfaction percentage */
  clientSatisfaction: 98,
  
  /** Number of happy clients */
  happyClients: 1000,
  
  /** Number of supported languages */
  languages: 2,
  
  /** Number of states served */
  locations: 50,
  
  /** Number of carrier partners */
  propertiesInPortfolio: 75,
  
  /** Number of team members */
  teamMembers: 3,
} as const;

/**
 * Formatted display values for UI components
 */
export const COMPANY_DISPLAY = {
  yearsExperience: `${COMPANY_FACTS.yearsExperience}+`,
  propertiesSold: `${COMPANY_FACTS.propertiesSold}+`,
  happyClients: `${COMPANY_FACTS.happyClients}+`,
  languages: `${COMPANY_FACTS.languages}`,
  locations: `${COMPANY_FACTS.locations}`,
  propertiesInPortfolio: `${COMPANY_FACTS.propertiesInPortfolio}+`,
  clientSatisfaction: `${COMPANY_FACTS.clientSatisfaction}%`,
} as const;

/**
 * Centralized company resources and downloadable content URLs.
 */
export const COMPANY_RESOURCES = {
  buyersGuideUrl: '/downloads/The-Complete-Retirement-Planning-Guide-2026.pdf',
} as const;
