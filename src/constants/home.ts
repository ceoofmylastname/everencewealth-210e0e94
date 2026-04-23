import { Language, Area, BlogPost } from '../types/home';
import { BUSINESS, businessPostalAddress } from '../config/business';

// Neutral wealth-strategy imagery (no legacy real-estate assets)
const STRATEGY_PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/wealth/800/600';

// Map of full language names
export const LANGUAGE_NAMES: Record<Language, string> = {
  [Language.EN]: 'English',
  [Language.ES]: 'Español',
};

// Locations for dropdown - will be updated to states in Phase 2
export const LOCATIONS = [
  { label: 'California', value: 'California' },
  { label: 'Texas', value: 'Texas' },
  { label: 'Florida', value: 'Florida' },
  { label: 'New York', value: 'New York' },
  { label: 'Illinois', value: 'Illinois' },
  { label: 'Pennsylvania', value: 'Pennsylvania' },
  { label: 'Arizona', value: 'Arizona' },
  { label: 'Colorado', value: 'Colorado' },
  { label: 'Washington', value: 'Washington' },
  { label: 'Oregon', value: 'Oregon' },
];

export const PROPERTY_TYPES = [
  { label: 'All Products', value: 'all' },
  { label: 'Index Strategy', value: 'INDEX_STRATEGY' },
  { label: 'Whole Life', value: 'WL' },
  { label: 'Term Life', value: 'Term' },
  { label: 'Fixed Indexed Annuity', value: 'FIA' },
  { label: 'Long-Term Care', value: 'LTC' },
  { label: 'Disability Income', value: 'DI' },
];

export const BUDGET_RANGES = [
  { label: '$100 - $300/mo', value: '100-300' },
  { label: '$300 - $500/mo', value: '300-500' },
  { label: '$500 - $1,000/mo', value: '500-1000' },
  { label: '$1,000 - $2,500/mo', value: '1000-2500' },
  { label: '$2,500+/mo', value: '2500+' },
];

// Featured Wealth Strategies
export const FEATURED_AREAS: Area[] = [
  {
    id: 'indexed-strategies',
    name: 'Indexed Strategies',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Market-linked growth with downside protection for tax-free retirement income.'
  },
  {
    id: 'annuities',
    name: 'Fixed Indexed Annuities',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Guaranteed income streams for retirement security with tax-deferred growth.'
  },
  {
    id: 'roth-conversions',
    name: 'Roth Conversions',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Proactive tax planning to convert pre-tax accounts into tax-free retirement income.'
  },
  {
    id: 'estate-planning',
    name: 'Estate Planning',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Preserve and transfer wealth across generations with tax-efficient strategies.'
  },
  {
    id: 'long-term-care',
    name: 'Long-Term Care',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Protect your retirement savings from the rising cost of extended care.'
  },
  {
    id: 'tax-diversification',
    name: 'Tax Diversification',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Balance taxable, tax-deferred, and tax-free accounts for maximum retirement flexibility.'
  },
  {
    id: 'social-security',
    name: 'Social Security Optimization',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Timing and claiming strategies to maximize lifetime Social Security benefits.'
  },
  {
    id: 'asset-protection',
    name: 'Asset Protection',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Shield your retirement assets from litigation, creditors, and market downturns.'
  },
  {
    id: 'business-succession',
    name: 'Business Succession',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Plan the tax-efficient transfer, sale, or exit of your closely held business.'
  },
  {
    id: 'wealth-preservation',
    name: 'Wealth Preservation',
    image: STRATEGY_PLACEHOLDER_IMAGE,
    description: 'Comprehensive strategies to preserve purchasing power through retirement.'
  }
];

// Mock Blog Posts
export const LATEST_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding the Three Tax Buckets',
    excerpt: 'Learn how to strategically allocate your retirement savings across taxable, tax-deferred, and tax-exempt accounts.',
    date: 'Jan 15, 2026',
    image: 'https://picsum.photos/id/450/600/400'
  },
  {
    id: '2',
    title: 'Index Strategy vs 401(k): Which Builds More Tax-Free Retirement Income?',
    excerpt: 'A comprehensive comparison of Index Strategies and traditional 401(k) retirement plans - discover which builds more tax-free income.',
    date: 'Jan 10, 2026',
    image: 'https://picsum.photos/id/3/600/400'
  },
  {
    id: '3',
    title: 'The Three Silent Killers of Retirement Savings',
    excerpt: 'How hidden fees, market volatility, and tax exposure can erode your retirement nest egg.',
    date: 'Jan 5, 2026',
    image: 'https://picsum.photos/id/20/600/400'
  }
];

// Navigation Structure
export const NAV_LINKS = [
  { label: 'Strategies', href: '/properties' },
  { label: 'States', href: '/locations' },
  { label: 'Our Philosophy', href: '/about' },
  { label: 'Client Guide', href: '/buyers-guide' },
  { label: 'Education', href: '/blog' },
];

// JSON-LD Structured Data Generator
export const getStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": BUSINESS.name,
  "description": BUSINESS.description,
  "image": BUSINESS.logo.url,
  "logo": BUSINESS.logo.url,
  "url": BUSINESS.url,
  "telephone": BUSINESS.telephone,
  "email": BUSINESS.email,
  "address": businessPostalAddress(),
  "priceRange": BUSINESS.priceRange,
  "areaServed": {
    "@type": "Country",
    "name": BUSINESS.areaServed.name
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": [...BUSINESS.contactPoint.availableLanguage],
    "telephone": BUSINESS.telephone,
    "email": BUSINESS.email
  }
});
