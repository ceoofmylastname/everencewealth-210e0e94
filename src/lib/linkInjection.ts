import { ExternalCitation } from "@/types/blog";

/**
 * Safely get citation source name, handling different field names
 */
const getCitationSource = (citation: ExternalCitation): string => {
  return citation.source || citation.sourceName || '';
};

/**
 * Safely get citation text, handling different field names
 */
const getCitationText = (citation: ExternalCitation): string => {
  return citation.text || citation.anchorText || '';
};

/**
 * Extract domain from a URL (e.g., "https://www.irs.gov/page" -> "irs.gov")
 */
const extractDomain = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/**
 * Domain-to-entity mapping for financial planning
 */
const domainEntityMap: Record<string, string[]> = {
  'irs.gov': ['IRS'],
  'sec.gov': ['SEC'],
  'finra.org': ['FINRA'],
  'ssa.gov': ['Social Security'],
  'medicare.gov': ['Medicare'],
  'fdic.gov': ['FDIC'],
  'cfp.net': ['CFP Board', 'CFP'],
  'napfa.org': ['NAPFA'],
  'federalreserve.gov': ['Federal Reserve', 'Fed'],
  'treasury.gov': ['Treasury'],
  'investor.vanguard.com': ['Vanguard'],
  'vanguard.com': ['Vanguard'],
  'fidelity.com': ['Fidelity'],
  'schwab.com': ['Schwab', 'Charles Schwab'],
  'blackrock.com': ['BlackRock'],
  'morningstar.com': ['Morningstar'],
  'nerdwallet.com': ['NerdWallet'],
  'investopedia.com': ['Investopedia'],
  'bankrate.com': ['Bankrate'],
};

/**
 * Injects external links into article content using:
 * 1. Domain-based matching (citation URL domain -> entity mentions in text)
 * 2. Text/anchor-text matching (citation text field -> find in article)
 * 3. Entity pattern matching (financial terms matched to relevant citations)
 */
export const injectExternalLinks = (
  content: string,
  citations: ExternalCitation[]
): string => {
  if (!citations || citations.length === 0) return content;

  try {
    let processedContent = content;
    const linkedEntities = new Set<string>();

    const isInsideTag = (text: string, index: number): boolean => {
      const before = text.substring(0, index);
      const lastOpen = before.lastIndexOf('<');
      const lastClose = before.lastIndexOf('>');
      return lastOpen > lastClose;
    };

    const linkFirstOccurrence = (text: string, term: string, url: string): string => {
      const key = term.toLowerCase();
      if (linkedEntities.has(key)) return text;

      // Escape special regex chars in the term
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'g');
      const match = regex.exec(text);
      if (!match) return text;

      if (isInsideTag(text, match.index)) return text;

      const link = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="external-link">${match[0]}</a>`;
      linkedEntities.add(key);
      return text.substring(0, match.index) + link + text.substring(match.index + match[0].length);
    };

    // Pass 1: Domain-based matching
    citations.forEach((citation) => {
      try {
        const url = citation.url;
        if (!url) return;
        const domain = extractDomain(url);
        if (!domain) return;

        const entities = domainEntityMap[domain];
        if (entities) {
          entities.forEach((entity) => {
            processedContent = linkFirstOccurrence(processedContent, entity, url);
          });
        }
      } catch (e) {
        console.warn('Domain matching error:', e);
      }
    });

    // Pass 2: Text/anchor-text matching
    citations.forEach((citation) => {
      try {
        const url = citation.url;
        if (!url) return;
        const anchorText = getCitationText(citation);
        if (anchorText && anchorText.length >= 4 && anchorText.length <= 80) {
          processedContent = linkFirstOccurrence(processedContent, anchorText, url);
        }
      } catch (e) {
        console.warn('Text matching error:', e);
      }
    });

    // Pass 3: Financial entity pattern matching
    const entityPatterns = [
      // Regulatory bodies
      { pattern: /\b(SEC)\b/g, category: 'regulatory' },
      { pattern: /\b(FINRA)\b/g, category: 'regulatory' },
      { pattern: /\b(IRS)\b/g, category: 'regulatory' },
      { pattern: /\b(CFP Board)\b/gi, category: 'regulatory' },
      { pattern: /\b(NAPFA)\b/g, category: 'regulatory' },
      { pattern: /\b(FDIC)\b/g, category: 'regulatory' },
      // Financial products/terms
      { pattern: /\b(401\(k\))\b/g, category: 'retirement' },
      { pattern: /\b(Roth IRA)\b/gi, category: 'retirement' },
      { pattern: /\b(Traditional IRA)\b/gi, category: 'retirement' },
      { pattern: /\b(S&P 500)\b/gi, category: 'investment' },
      { pattern: /\b(Social Security)\b/gi, category: 'government' },
      { pattern: /\b(Medicare)\b/gi, category: 'government' },
      // Institutions
      { pattern: /\b(Federal Reserve)\b/gi, category: 'institution' },
      { pattern: /\b(Vanguard)\b/gi, category: 'institution' },
      { pattern: /\b(Fidelity)\b/gi, category: 'institution' },
      { pattern: /\b(Schwab)\b/gi, category: 'institution' },
      { pattern: /\b(BlackRock)\b/gi, category: 'institution' },
      { pattern: /\b(Morningstar)\b/gi, category: 'institution' },
    ];

    citations.forEach((citation) => {
      try {
        const url = citation.url;
        if (!url) return;
        const sourceName = getCitationSource(citation).toLowerCase();
        const domain = extractDomain(url);

        entityPatterns.forEach(({ pattern }) => {
          const matches = [...processedContent.matchAll(pattern)];
          matches.forEach((match) => {
            const entity = match[0];
            const key = entity.toLowerCase();
            if (linkedEntities.has(key)) return;

            const isRelevant =
              (sourceName && sourceName.includes(key)) ||
              (domain && domain.includes(key.replace(/[^a-z]/g, '')));

            if (isRelevant) {
              if (isInsideTag(processedContent, match.index!)) return;
              const link = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="external-link">${entity}</a>`;
              processedContent = processedContent.substring(0, match.index!) + link + processedContent.substring(match.index! + entity.length);
              linkedEntities.add(key);
            }
          });
        });
      } catch (e) {
        console.warn('Entity matching error:', e);
      }
    });

    return processedContent;
  } catch (error) {
    console.error('Error in injectExternalLinks:', error);
    return content;
  }
};

/**
 * Converts [INTERNAL_LINK: text] markers to actual internal links
 */
export const processInternalLinks = (content: string): string => {
  const internalLinkPattern = /\[INTERNAL_LINK:\s*([^\]]+)\]/g;
  
  return content.replace(internalLinkPattern, (match, linkText) => {
    const slug = linkText
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    return `<a href="/blog/${slug}" class="internal-link font-medium text-primary hover:text-primary/80 transition-colors underline">${linkText}</a>`;
  });
};

/**
 * Adds citation superscript markers throughout the content
 */
export const addCitationMarkers = (
  content: string,
  citations: ExternalCitation[]
): string => {
  if (!citations || citations.length === 0) return content;

  try {
    let processedContent = content;

    const claimIndicators = [
      'returns',
      'interest rate',
      'inflation',
      'tax',
      'retirement',
      'portfolio',
      'investment',
      'fiduciary',
      'estate planning',
      'wealth',
      'fees',
      'risk',
      'compound',
      'diversification',
      'annuity',
      'capital gains',
      'dividend',
      'asset allocation',
      'rebalancing',
      'beneficiary',
      'contribution',
      'distribution',
      'premium',
      'deductible',
      'insurance',
      'annualized',
      'yield',
      'expense ratio',
    ];

    const sentences = processedContent.split(/\.\s+/);
    let citationIndex = 0;

    const processedSentences = sentences.map((sentence, idx) => {
      if (sentence.includes('<a href') || sentence.includes('<sup>')) {
        return sentence;
      }

      const hasClaim = claimIndicators.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      );

      if (hasClaim && citationIndex < citations.length && idx % 3 === 0) {
        citationIndex++;
        return `${sentence}<sup class="citation-marker"><a href="#citation-${citationIndex}">[${citationIndex}]</a></sup>`;
      }

      return sentence;
    });

    return processedSentences.join('. ');
  } catch (error) {
    console.error('Error in addCitationMarkers:', error);
    return content;
  }
};
