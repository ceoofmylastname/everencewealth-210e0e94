// Competitor citation detection and classification

export interface CitationClassification {
  url: string;
  domain: string;
  source: string;
  text: string;
  classification: 'approved' | 'low-value' | 'competitor' | 'blocked';
  reason: string;
  trustScore?: number;
}

export interface ScanResult {
  totalCitations: number;
  approved: CitationClassification[];
  lowValue: CitationClassification[];
  competitors: CitationClassification[];
  blocked: CitationClassification[];
}

export interface ClusterScanResult {
  totalArticles: number;
  totalCitations: number;
  byLanguage: Record<string, {
    articleCount: number;
    citationCount: number;
    competitorCount: number;
    lowValueCount: number;
    approvedCount: number;
    competitors: Array<{
      articleId: string;
      articleHeadline: string;
      citation: CitationClassification;
    }>;
  }>;
  allCompetitors: Array<{
    articleId: string;
    articleHeadline: string;
    language: string;
    citation: CitationClassification;
  }>;
  allLowValue: Array<{
    articleId: string;
    articleHeadline: string;
    language: string;
    citation: CitationClassification;
  }>;
}

// Known real estate competitor domains - COMPREHENSIVE LIST
const COMPETITOR_DOMAINS = [
  // International giants
  'sothebysrealty.com', 'christiesrealestate.com', 'knightfrank.com',
  'savills.com', 'savills.es', 'engelvoelkers.com', 'engel-voelkers.es',
  'remax.com', 'remax.es', 'coldwellbanker.com', 'coldwellbanker.es',
  'century21.com', 'century21.es', 'kellerwilliams.com', 'compass.com',
  'berkshirehathaway.com',
  
  // US portals
  'zillow.com', 'trulia.com', 'realtor.com', 'redfin.com', 'apartments.com',
  
  // UK portals
  'rightmove.co.uk', 'zoopla.co.uk', 'onthemarket.com', 'primelocation.com',
  'propertypal.com', 'mouseprice.com', 'propertyguides.com',
  
  // Spanish portals
  'idealista.com', 'fotocasa.com', 'fotocasa.es', 'pisos.com', 'habitaclia.com',
  'kyero.com', 'thinkspain.com', 'spanishpropertyinsight.com', 'yaencontre.com',
  'tucasa.com', 'enalquiler.com', 'milanuncios.com', 'spanish-property-choice.com',
  'propertiesabroadspain.com', 'spainhouses.net', 'eyeonspain.com',
  'aplaceinthesun.com', 'spanishpropertychoice.com',
  
  // Netherlands
  'funda.nl', 'huislijn.nl', 'jaap.nl', 'pararius.nl',
  
  // Germany
  'immobilienscout24.de', 'immowelt.de', 'immonet.de',
  
  // France
  'seloger.com', 'pap.fr', 'leboncoin.fr', 'logic-immo.com',
  
  // Nordic
  'hemnet.se', 'boligsiden.dk', 'finn.no', 'etuovi.com',
  
  // Other EU
  'ingatlan.com', 'properstar.com',
  
  // Luxury/Costa del Sol specific competitors
  'lucasfox.com', 'drumelia.com', 'mpdunne.com', 'pure-living-properties.com',
  'nvoga.com', 'immoabroad.com', 'terrameridiana.com', 'marbellaforsaleblog.com',
  
  // Malaga-specific competitors
  'movetomalagaspain.com', 'movetomalaga.com', 'propertyfindermalaga.com',
  'homenetspain.com',
];

// Real estate keyword patterns (multi-language) - EXPANDED
const COMPETITOR_KEYWORDS = [
  // Direct real estate terms (English)
  'realty', 'realtor', 'real-estate', 'realestate', 'estate-agent', 'estate-agents',
  'property-sales', 'property-agency', 'homes-for-sale', 'house-sales',
  'luxury-homes', 'property', 'properties', 'homes', 'housing', 'estate', 'estates',
  'villas', 'apartments', 'condos', 'rentals', 'lettings', 'forsale', 'for-sale',
  'listing', 'listings', 'broker', 'brokerage', 'realtors',
  'estate-services', 'property-finder', 'home-finder',
  
  // Spanish
  'inmobiliaria', 'inmobiliarias', 'inmueble', 'inmuebles', 'vivienda', 'viviendas',
  'casas', 'pisos', 'chalets', 'apartamentos', 'alquileres', 'propiedades',
  
  // German
  'immobilien', 'makler', 'hauskauf', 'wohnung', 'wohnungen', 'haus',
  
  // French
  'immo', 'immobilier', 'agence-immobiliere', 'maison', 'appartement', 'logement',
  
  // Dutch
  'makelaar', 'vastgoed', 'woningen', 'huizen', 'woning',
  
  // Finnish
  'kiinteisto', 'asunto', 'kiinteistot', 'asunnot',
  
  // Norwegian
  'eiendom', 'bolig', 'eiendommer', 'boliger',
  
  // Swedish
  'fastighet', 'bostader', 'fast-egendom', 'bostäder',
  
  // Danish
  'ejendom', 'ejendomme',
  
  // Hungarian
  'ingatlan', 'lakás', 'ingatlanok',
  
  // Italian
  'immobiliare', 'agenzia', 'case', 'appartamenti',
  
  // General
  'relocation',
];

// Low-value domain patterns
const LOW_VALUE_PATTERNS = [
  // Forums & Q&A
  'forum', 'forums', 'reddit.com', 'quora.com', 'answers.com',
  'stackexchange.com', 'stackoverflow.com', 'yahoo.com/answers',
  // Social media
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 
  'linkedin.com/posts', 'tiktok.com', 'pinterest.com', 'youtube.com',
  // User-generated blogs
  'wordpress.com', 'blogspot.com', 'medium.com', 'tumblr.com',
  'wix.com', 'weebly.com', 'squarespace.com',
  // Aggregators
  'trulia.com', 'zillow.com', 'redfin.com', 'apartments.com',
  // Wiki
  'wikipedia.org', 'wikihow.com', 'fandom.com',
];

// High-authority approved domain patterns
const APPROVED_PATTERNS = {
  government: [
    '.gov', '.gob.es', '.gov.uk', '.gouv.fr', '.gov.de', '.gov.pl',
    '.europa.eu', '.gov.nl', '.regeringen.se', '.gov.hu', '.gov.fi',
    'ine.es', 'boe.es', 'catastro.es', 'agenciatributaria.es',
    'bankofspain.es', 'bde.es', 'ecb.europa.eu', 'ecb.int',
  ],
  academic: [
    '.edu', '.ac.uk', '.edu.es', '.uni-', 'university', 'college',
    'oxford', 'cambridge', 'harvard', 'mit.edu', 'stanford.edu',
  ],
  majorNews: [
    'elpais.com', 'elmundo.es', 'abc.es', 'lavanguardia.com',
    'ft.com', 'wsj.com', 'reuters.com', 'bloomberg.com', 
    'bbc.com', 'bbc.co.uk', 'theguardian.com', 'nytimes.com',
    'economist.com', 'forbes.com', 'businessinsider.com',
    'cnbc.com', 'cnn.com', 'euronews.com', 'dw.com',
  ],
  financial: [
    'bankofspain.es', 'ecb.europa.eu', 'imf.org', 'worldbank.org',
    'bis.org', 'oecd.org', 'esrb.europa.eu', 'eba.europa.eu',
    'cnmv.es', 'fca.org.uk', 'sec.gov', 'fincen.gov',
  ],
  industry: [
    'idealista.com/news', 'cushmanwakefield.com', 'cbre.com',
    'jll.com', 'colliers.com', 'statista.com', 'eurostat.ec.europa.eu',
  ],
};

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    // Fallback for malformed URLs
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    return match ? match[1].toLowerCase() : url.toLowerCase();
  }
}

/**
 * Check if domain matches any pattern in list
 */
function matchesPattern(domain: string, patterns: string[]): boolean {
  const lowerDomain = domain.toLowerCase();
  return patterns.some(pattern => {
    const lowerPattern = pattern.toLowerCase();
    return lowerDomain.includes(lowerPattern) || lowerDomain.endsWith(lowerPattern);
  });
}

/**
 * Check if domain is a known competitor
 */
export function isCompetitorDomain(domain: string): { isCompetitor: boolean; reason: string } {
  const lowerDomain = domain.toLowerCase();
  
  // Check exact match first
  if (COMPETITOR_DOMAINS.some(c => lowerDomain === c || lowerDomain.endsWith('.' + c))) {
    return { isCompetitor: true, reason: `Known competitor: ${domain}` };
  }
  
  // Check for keyword patterns
  for (const keyword of COMPETITOR_KEYWORDS) {
    if (lowerDomain.includes(keyword)) {
      return { isCompetitor: true, reason: `Contains real estate keyword: "${keyword}"` };
    }
  }
  
  return { isCompetitor: false, reason: '' };
}

/**
 * Check if domain is low-value
 */
export function isLowValueDomain(domain: string): { isLowValue: boolean; reason: string } {
  const lowerDomain = domain.toLowerCase();
  
  for (const pattern of LOW_VALUE_PATTERNS) {
    if (lowerDomain.includes(pattern)) {
      return { isLowValue: true, reason: `Low-value source: ${pattern}` };
    }
  }
  
  return { isLowValue: false, reason: '' };
}

/**
 * Check if domain is approved high-authority
 */
export function isApprovedDomain(domain: string): { isApproved: boolean; reason: string; category?: string } {
  const lowerDomain = domain.toLowerCase();
  
  for (const [category, patterns] of Object.entries(APPROVED_PATTERNS)) {
    if (matchesPattern(lowerDomain, patterns)) {
      return { 
        isApproved: true, 
        reason: `High-authority ${category} source`, 
        category 
      };
    }
  }
  
  return { isApproved: false, reason: '' };
}

/**
 * Classify a single citation
 */
export function classifyCitation(citation: { url: string; source?: string; text?: string }): CitationClassification {
  const domain = extractDomain(citation.url);
  
  // Check blocked competitors first
  const competitorCheck = isCompetitorDomain(domain);
  if (competitorCheck.isCompetitor) {
    return {
      url: citation.url,
      domain,
      source: citation.source || domain,
      text: citation.text || '',
      classification: 'competitor',
      reason: competitorCheck.reason,
      trustScore: 10,
    };
  }
  
  // Check approved domains
  const approvedCheck = isApprovedDomain(domain);
  if (approvedCheck.isApproved) {
    return {
      url: citation.url,
      domain,
      source: citation.source || domain,
      text: citation.text || '',
      classification: 'approved',
      reason: approvedCheck.reason,
      trustScore: 90,
    };
  }
  
  // Check low-value
  const lowValueCheck = isLowValueDomain(domain);
  if (lowValueCheck.isLowValue) {
    return {
      url: citation.url,
      domain,
      source: citation.source || domain,
      text: citation.text || '',
      classification: 'low-value',
      reason: lowValueCheck.reason,
      trustScore: 40,
    };
  }
  
  // Default to approved (neutral)
  return {
    url: citation.url,
    domain,
    source: citation.source || domain,
    text: citation.text || '',
    classification: 'approved',
    reason: 'No issues detected',
    trustScore: 60,
  };
}

/**
 * Scan all citations for an article and classify them
 */
export function scanCitationsForCompetitors(
  citations: Array<{ url: string; source?: string; text?: string }>
): ScanResult {
  const result: ScanResult = {
    totalCitations: citations.length,
    approved: [],
    lowValue: [],
    competitors: [],
    blocked: [],
  };
  
  for (const citation of citations) {
    const classification = classifyCitation(citation);
    
    switch (classification.classification) {
      case 'approved':
        result.approved.push(classification);
        break;
      case 'low-value':
        result.lowValue.push(classification);
        break;
      case 'competitor':
        result.competitors.push(classification);
        break;
      case 'blocked':
        result.blocked.push(classification);
        break;
    }
  }
  
  return result;
}

/**
 * Remove citations from an article
 */
export function removeCitations(
  currentCitations: Array<{ url: string; source?: string; text?: string }>,
  urlsToRemove: string[]
): Array<{ url: string; source?: string; text?: string }> {
  const removeSet = new Set(urlsToRemove.map(u => u.toLowerCase()));
  return currentCitations.filter(c => !removeSet.has(c.url.toLowerCase()));
}

/**
 * Scan all articles in a cluster for competitor citations
 */
export function scanClusterForCompetitors(
  articles: Array<{
    id: string;
    headline: string;
    language: string;
    external_citations: Array<{ url: string; source?: string; text?: string }> | null;
  }>
): ClusterScanResult {
  const result: ClusterScanResult = {
    totalArticles: articles.length,
    totalCitations: 0,
    byLanguage: {},
    allCompetitors: [],
    allLowValue: [],
  };

  for (const article of articles) {
    const citations = article.external_citations || [];
    const scanResult = scanCitationsForCompetitors(citations);
    
    result.totalCitations += scanResult.totalCitations;
    
    // Initialize language bucket if needed
    if (!result.byLanguage[article.language]) {
      result.byLanguage[article.language] = {
        articleCount: 0,
        citationCount: 0,
        competitorCount: 0,
        lowValueCount: 0,
        approvedCount: 0,
        competitors: [],
      };
    }
    
    const langBucket = result.byLanguage[article.language];
    langBucket.articleCount += 1;
    langBucket.citationCount += scanResult.totalCitations;
    langBucket.competitorCount += scanResult.competitors.length;
    langBucket.lowValueCount += scanResult.lowValue.length;
    langBucket.approvedCount += scanResult.approved.length;
    
    // Track competitors with article context
    for (const competitor of scanResult.competitors) {
      const competitorEntry = {
        articleId: article.id,
        articleHeadline: article.headline,
        language: article.language,
        citation: competitor,
      };
      langBucket.competitors.push({
        articleId: article.id,
        articleHeadline: article.headline,
        citation: competitor,
      });
      result.allCompetitors.push(competitorEntry);
    }
    
    // Track low-value citations
    for (const lowValue of scanResult.lowValue) {
      result.allLowValue.push({
        articleId: article.id,
        articleHeadline: article.headline,
        language: article.language,
        citation: lowValue,
      });
    }
  }

  return result;
}

/**
 * Check if a URL is a competitor - helper for bulk add validation
 */
export function isCompetitorUrl(url: string): boolean {
  const domain = extractDomain(url);
  return isCompetitorDomain(domain).isCompetitor;
}

/**
 * Analyze citation diversity across a cluster
 */
export function analyzeCitationDiversity(
  articles: Array<{ external_citations: Array<{ url: string }> | null }>
): { 
  domainFrequency: Map<string, number>; 
  overusedDomains: string[]; 
  totalCitations: number;
} {
  const domainFrequency = new Map<string, number>();
  let totalCitations = 0;
  
  articles.forEach(article => {
    const citations = article.external_citations || [];
    totalCitations += citations.length;
    
    citations.forEach((c) => {
      try {
        const domain = extractDomain(c.url);
        domainFrequency.set(domain, (domainFrequency.get(domain) || 0) + 1);
      } catch {}
    });
  });
  
  // Flag domains used more than 10 times
  const overusedDomains = Array.from(domainFrequency.entries())
    .filter(([_, count]) => count > 10)
    .map(([domain, count]) => `${domain} (${count}x)`);
  
  return { domainFrequency, overusedDomains, totalCitations };
}
