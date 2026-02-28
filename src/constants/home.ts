import { Language, Area, BlogPost } from '../types/home';

// Import location-specific hero images from brochures
import marbellaHero from '@/assets/brochures/marbella-hero.jpg';
import esteponaHero from '@/assets/brochures/estepona-hero.jpg';
import sotograndeHero from '@/assets/brochures/sotogrande-hero.jpg';
import malagaHero from '@/assets/brochures/malaga-hero.jpg';
import fuengirolaHero from '@/assets/brochures/fuengirola-hero.jpg';
import benalmadenaHero from '@/assets/brochures/benalmadena-hero.jpg';
import mijasHero from '@/assets/brochures/mijas-hero.jpg';
import casaresHero from '@/assets/brochures/casares-hero.jpg';
import manilvaHero from '@/assets/brochures/manilva-hero.jpg';
import torremolinosHero from '@/assets/brochures/torremolinos-hero.jpg';

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

// Featured Areas Data - will be updated to strategies in Phase 2
export const FEATURED_AREAS: Area[] = [
  {
    id: 'marbella',
    name: 'Marbella',
    image: marbellaHero,
    description: 'Premier indexed strategies for tax-free retirement income with market-linked growth.'
  },
  {
    id: 'estepona',
    name: 'Estepona',
    image: esteponaHero,
    description: 'Guaranteed income streams for retirement security with tax-deferred growth.'
  },
  {
    id: 'fuengirola',
    name: 'Fuengirola',
    image: fuengirolaHero,
    description: 'Family-friendly beach town with vibrant promenade and excellent amenities.'
  },
  {
    id: 'benalmadena',
    name: 'Benalmádena',
    image: benalmadenaHero,
    description: 'Marina lifestyle and hillside charm with stunning coastal panoramas.'
  },
  {
    id: 'mijas',
    name: 'Mijas',
    image: mijasHero,
    description: 'Authentic white village with panoramic views and traditional Andalusian character.'
  },
  {
    id: 'sotogrande',
    name: 'Sotogrande',
    image: sotograndeHero,
    description: 'Privacy and prestige. World-class polo, golf, and marina lifestyle.'
  },
  {
    id: 'malaga-city',
    name: 'Málaga City',
    image: malagaHero,
    description: 'A vibrant cultural hub blending history with futuristic urban living.'
  },
  {
    id: 'casares',
    name: 'Casares',
    image: casaresHero,
    description: 'Traditional pueblo blanco perched on a hillside with breathtaking valley views.'
  },
  {
    id: 'manilva',
    name: 'Manilva',
    image: manilvaHero,
    description: 'Marina and vineyard lifestyle where the mountains meet the Mediterranean.'
  },
  {
    id: 'torremolinos',
    name: 'Torremolinos',
    image: torremolinosHero,
    description: 'Classic beach promenade destination with a vibrant entertainment scene.'
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
  "name": "Everence Wealth",
  "description": "Independent wealth architects specializing in tax-efficient retirement strategies and asset protection.",
  "image": "https://www.everencewealth.com/assets/logo.png",
  "logo": "https://www.everencewealth.com/assets/logo.png",
  "url": "https://www.everencewealth.com",
  "telephone": "+1-415-555-0100",
  "email": "info@everencewealth.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "455 Market St Ste 1940 PMB 350011",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94105",
    "addressCountry": "US"
  },
  "priceRange": "$$$",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": ["en", "es"],
    "telephone": "+1-415-555-0100",
    "email": "info@everencewealth.com"
  }
});
