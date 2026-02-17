/**
 * Entity Extractor for Blog Articles
 * Extracts cities, glossary terms, and organizations for JSON-LD about/mentions properties
 */

export interface ExtractedEntity {
  type: 'Place' | 'DefinedTerm' | 'Organization' | 'Thing';
  name: string;
  description?: string;
  sameAs?: string;
  inDefinedTermSet?: string;
}

export interface EntityExtractionResult {
  about: ExtractedEntity[];
  mentions: ExtractedEntity[];
}

// Wikidata entity IDs for US cities and key concepts
const WIKIDATA_ENTITIES: Record<string, string> = {
  // US Cities
  "Los Angeles": "https://www.wikidata.org/wiki/Q65",
  "Austin": "https://www.wikidata.org/wiki/Q30656",
  "Phoenix": "https://www.wikidata.org/wiki/Q16556",
  "New York": "https://www.wikidata.org/wiki/Q60",
  "Chicago": "https://www.wikidata.org/wiki/Q1297",
  "Houston": "https://www.wikidata.org/wiki/Q16555",
  "San Diego": "https://www.wikidata.org/wiki/Q16552",
  "Dallas": "https://www.wikidata.org/wiki/Q16557",
  "Miami": "https://www.wikidata.org/wiki/Q8652",
  "San Francisco": "https://www.wikidata.org/wiki/Q62",
  "Denver": "https://www.wikidata.org/wiki/Q16554",
  "Seattle": "https://www.wikidata.org/wiki/Q5083",

  // Regions
  "California": "https://www.wikidata.org/wiki/Q99",
  "Texas": "https://www.wikidata.org/wiki/Q1439",
  "Arizona": "https://www.wikidata.org/wiki/Q816",
  "Florida": "https://www.wikidata.org/wiki/Q812",
  "United States": "https://www.wikidata.org/wiki/Q30",

  // Key financial concepts
  "IUL": "https://www.wikidata.org/wiki/Q1142847",
  "401k": "https://www.wikidata.org/wiki/Q244499",
  "Roth IRA": "https://www.wikidata.org/wiki/Q1434230",
  "Fiduciary": "https://www.wikidata.org/wiki/Q17519",
};

// Known organizations that may be mentioned in articles
const KNOWN_ORGANIZATIONS: Record<string, { wikidata?: string; description: string }> = {
  "IRS": { wikidata: "https://www.wikidata.org/wiki/Q42429", description: "United States Internal Revenue Service" },
  "SEC": { wikidata: "https://www.wikidata.org/wiki/Q953944", description: "Securities and Exchange Commission" },
  "FINRA": { description: "Financial Industry Regulatory Authority" },
  "FDIC": { wikidata: "https://www.wikidata.org/wiki/Q571823", description: "Federal Deposit Insurance Corporation" },
  "Federal Reserve": { wikidata: "https://www.wikidata.org/wiki/Q53536", description: "Central banking system of the United States" },
};

// US cities to detect in content
const US_CITIES = [
  "Los Angeles", "Austin", "Phoenix", "New York", "Chicago",
  "Houston", "San Diego", "Dallas", "Miami", "San Francisco",
  "Denver", "Seattle"
];

// Common financial terms to detect
const KEY_GLOSSARY_TERMS = [
  "IUL", "401k", "Roth IRA", "Traditional IRA", "SEP IRA",
  "Fiduciary", "Annuity", "Term Life", "Whole Life", "Universal Life",
  "Estate Planning", "Tax Deferral", "Capital Gains",
  "S&P 500", "Index Fund", "ETF",
  "Social Security", "Medicare", "Long-Term Care",
  "Living Trust", "Irrevocable Trust", "Power of Attorney"
];

// Financial term definitions for schema
const GLOSSARY_DEFINITIONS: Record<string, string> = {
  "IUL": "Indexed Universal Life - A permanent life insurance policy with cash value growth tied to a market index",
  "401k": "Employer-sponsored retirement savings plan with tax advantages",
  "Roth IRA": "Individual retirement account funded with after-tax dollars, offering tax-free growth and withdrawals",
  "Traditional IRA": "Individual retirement account with tax-deductible contributions and tax-deferred growth",
  "SEP IRA": "Simplified Employee Pension IRA for self-employed individuals and small business owners",
  "Fiduciary": "A financial advisor legally obligated to act in the client's best interest",
  "Annuity": "Insurance product providing guaranteed income stream, typically for retirement",
  "Term Life": "Life insurance coverage for a specific period, typically 10-30 years",
  "Whole Life": "Permanent life insurance with guaranteed cash value accumulation",
  "Universal Life": "Flexible permanent life insurance with adjustable premiums and death benefit",
  "Estate Planning": "Process of arranging for the management and disposal of a person's estate",
  "Tax Deferral": "Strategy to postpone paying taxes on income or gains to a future date",
  "Capital Gains": "Profit from the sale of an asset such as stocks, bonds, or real estate",
  "S&P 500": "Stock market index tracking 500 of the largest U.S. publicly traded companies",
  "Index Fund": "Mutual fund designed to track the performance of a market index",
  "ETF": "Exchange-Traded Fund - A marketable security that tracks an index, commodity, or basket of assets",
  "Social Security": "Federal insurance program providing retirement, disability, and survivor benefits",
  "Medicare": "Federal health insurance program for people 65 and older",
  "Long-Term Care": "Insurance covering extended care services not covered by regular health insurance",
  "Living Trust": "Legal document that places assets in a trust for the benefit of beneficiaries",
  "Irrevocable Trust": "Trust that cannot be modified after creation without beneficiary consent",
  "Power of Attorney": "Legal document authorizing someone to act on another's behalf in financial matters"
};

/**
 * Normalize text for matching (remove accents, lowercase)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Extract city mentions from content
 */
export function extractCityMentions(content: string, headline: string): ExtractedEntity[] {
  const cities: ExtractedEntity[] = [];
  const combinedText = `${headline} ${content}`;
  const seenCities = new Set<string>();

  for (const city of US_CITIES) {
    // Create regex for whole word matching
    const regex = new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    
    if (regex.test(combinedText)) {
      // Normalize city name to avoid duplicates (e.g., Málaga and Malaga)
      const normalizedCity = normalizeText(city);
      
      if (!seenCities.has(normalizedCity)) {
        seenCities.add(normalizedCity);
        
        const entity: ExtractedEntity = {
          type: 'Place',
          name: city,
        };
        
        if (WIKIDATA_ENTITIES[city]) {
          entity.sameAs = WIKIDATA_ENTITIES[city];
        }
        
        cities.push(entity);
      }
    }
  }

  return cities;
}

/**
 * Extract glossary term mentions from content
 */
export function extractGlossaryTerms(content: string, headline: string): ExtractedEntity[] {
  const terms: ExtractedEntity[] = [];
  const combinedText = `${headline} ${content}`;
  const seenTerms = new Set<string>();

  for (const term of KEY_GLOSSARY_TERMS) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    
    if (regex.test(combinedText) && !seenTerms.has(term.toLowerCase())) {
      seenTerms.add(term.toLowerCase());
      
      const entity: ExtractedEntity = {
        type: 'DefinedTerm',
        name: term,
        inDefinedTermSet: 'https://www.everencewealth.com/glossary'
      };
      
      if (GLOSSARY_DEFINITIONS[term]) {
        entity.description = GLOSSARY_DEFINITIONS[term];
      }
      
      if (WIKIDATA_ENTITIES[term]) {
        entity.sameAs = WIKIDATA_ENTITIES[term];
      }
      
      terms.push(entity);
    }
  }

  return terms;
}

/**
 * Extract organization mentions from content
 */
export function extractOrganizationMentions(content: string): ExtractedEntity[] {
  const orgs: ExtractedEntity[] = [];
  const seenOrgs = new Set<string>();

  for (const [orgName, orgData] of Object.entries(KNOWN_ORGANIZATIONS)) {
    const regex = new RegExp(`\\b${orgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    
    if (regex.test(content) && !seenOrgs.has(normalizeText(orgName))) {
      seenOrgs.add(normalizeText(orgName));
      
      const entity: ExtractedEntity = {
        type: 'Organization',
        name: orgName,
        description: orgData.description
      };
      
      if (orgData.wikidata) {
        entity.sameAs = orgData.wikidata;
      }
      
      orgs.push(entity);
    }
  }

  return orgs;
}

/**
 * Get category as a Thing entity
 */
export function getCategoryEntity(category: string): ExtractedEntity {
  return {
    type: 'Thing',
    name: category,
    sameAs: `https://www.everencewealth.com/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`
  };
}

/**
 * Main extraction function - extracts all entities from article content
 * Returns structured about/mentions for JSON-LD
 */
export function extractEntitiesFromArticle(
  headline: string,
  content: string,
  category: string
): EntityExtractionResult {
  // Strip HTML tags for text analysis
  const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  // Extract all entity types
  const cities = extractCityMentions(plainContent, headline);
  const glossaryTerms = extractGlossaryTerms(plainContent, headline);
  const organizations = extractOrganizationMentions(plainContent);
  
  // Determine primary subject (about) - category + main city from headline
  const about: ExtractedEntity[] = [];
  
  // Add category as primary subject
  about.push(getCategoryEntity(category));
  
  // Check if headline contains a city - that's the primary city
  const headlineCities = extractCityMentions('', headline);
  if (headlineCities.length > 0) {
    about.push(headlineCities[0]);
  }
  
  // Mentions are secondary references (exclude what's in about)
  const aboutNames = new Set(about.map(e => normalizeText(e.name)));
  
  const mentions: ExtractedEntity[] = [
    ...cities.filter(c => !aboutNames.has(normalizeText(c.name))),
    ...glossaryTerms,
    ...organizations
  ];
  
  // Limit mentions to avoid bloating the schema (max 15)
  const limitedMentions = mentions.slice(0, 15);
  
  return {
    about,
    mentions: limitedMentions
  };
}

/**
 * Convert extracted entities to JSON-LD format
 */
export function entitiesToJsonLd(entities: ExtractedEntity[]): any[] {
  return entities.map(entity => {
    const jsonLd: any = {
      "@type": entity.type,
      "name": entity.name
    };
    
    if (entity.description) {
      jsonLd.description = entity.description;
    }
    
    if (entity.sameAs) {
      jsonLd.sameAs = entity.sameAs;
    }
    
    if (entity.inDefinedTermSet) {
      jsonLd.inDefinedTermSet = entity.inDefinedTermSet;
    }
    
    return jsonLd;
  });
}
