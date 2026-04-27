import 'dotenv/config';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  BUSINESS,
  businessPostalAddress,
  businessGeoCoordinates,
  businessContactPoint,
  businessAreaServed,
  businessOpeningHoursSpecification,
  businessFounderStubs,
} from '../src/config/business';

/**
 * Static Homepage Generator for SSG - Multi-Language Version
 * 
 * This script generates static index.html files for ALL 10 supported languages
 * with fully rendered content for search engine and AI bot crawlers. Each page includes:
 * - Correct <html lang="XX"> attribute
 * - Language-specific title and description
 * - Self-referencing canonical URL
 * - Full hreflang tags (10 languages + x-default)
 * - Correct Open Graph locale
 * - Critical CSS for immediate rendering
 * - Complete JSON-LD structured data
 */

interface ProductionAssets {
  css: string[];
  js: string[];
}

const BASE_URL = 'https://www.everencewealth.com';

// Official 2 languages
const LANGUAGES = ['en', 'es'] as const;
type Language = typeof LANGUAGES[number];

// Language-specific metadata for homepage
const HOMEPAGE_META: Record<Language, {
  title: string;
  description: string;
  ogLocale: string;
  heroHeadline: string;
  heroHighlight: string;
  heroDescription: string;
  speakableSummary: string;
}> = {
  en: {
    title: 'Everence Wealth - Bridge the Retirement Gap',
    description: 'Specializing in tax-efficient retirement strategies, estate planning, and asset protection. Serving clients in San Francisco and nationwide.',
    ogLocale: 'en_US',
    heroHeadline: 'Bridge the Retirement',
    heroHighlight: 'Gap',
    heroDescription: 'Independent broker offering tax-free retirement strategies, indexed universal life, and guaranteed income solutions for families across the United States.',
    speakableSummary: `Everence Wealth is an independent broker specializing in tax-free retirement strategies, indexed universal life, and guaranteed income planning for clients nationwide. Contact us at ${BUSINESS.telephone}.`,
  },
  es: {
    title: 'Everence Wealth | Cierra la Brecha de Jubilación',
    description: 'Especializados en estrategias de jubilación fiscalmente eficientes, planificación patrimonial y protección de activos. Sirviendo a clientes en San Francisco y a nivel nacional.',
    ogLocale: 'es_US',
    heroHeadline: 'Cierra la Brecha de',
    heroHighlight: 'Jubilación',
    heroDescription: 'Bróker independiente que ofrece estrategias de jubilación libres de impuestos, seguros de vida universal indexados y soluciones de ingreso garantizado para familias en todo Estados Unidos.',
    speakableSummary: `Everence Wealth es un bróker independiente especializado en estrategias de jubilación libres de impuestos, seguros de vida universal indexados y planificación de ingreso garantizado para clientes a nivel nacional. Contáctenos al ${BUSINESS.telephone}.`,
  },
};

function getProductionAssets(distDir: string): ProductionAssets {
  const indexPath = join(distDir, 'index.html');
  
  if (!existsSync(indexPath)) {
    return { css: [], js: [] };
  }
  
  const indexHtml = readFileSync(indexPath, 'utf-8');
  
  const cssMatches = indexHtml.match(/href="(\/assets\/[^"]+\.css)"/g) || [];
  const css = cssMatches.map(m => {
    const match = m.match(/href="([^"]+)"/);
    return match ? match[1] : '';
  }).filter(Boolean);
  
  const jsMatches = indexHtml.match(/src="(\/assets\/[^"]+\.js)"/g) || [];
  const js = jsMatches.map(m => {
    const match = m.match(/src="([^"]+)"/);
    return match ? match[1] : '';
  }).filter(Boolean);
  
  return { css, js };
}

function sanitizeForHTML(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate comprehensive JSON-LD structured data
function generateStructuredData(language: Language) {
  const meta = HOMEPAGE_META[language];
  const canonicalUrl = language === 'en' ? BASE_URL : `${BASE_URL}/${language}`;
  
  const organizationSchema = {
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
    "description": meta.description,
    "foundingDate": BUSINESS.foundingDate,
    "slogan": BUSINESS.slogan,
    "telephone": BUSINESS.telephone,
    "email": BUSINESS.email,
    "address": businessPostalAddress(),
    "areaServed": businessAreaServed(),
    "founders": businessFounderStubs(),
    "contactPoint": businessContactPoint(),
    "sameAs": [...BUSINESS.sameAs],
    "priceRange": BUSINESS.priceRange
  };

  const webSiteSchema = {
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    "url": BASE_URL,
    "name": "Everence Wealth",
    "description": "Independent Wealth Management",
    "publisher": { "@id": `${BASE_URL}/#organization` },
    "inLanguage": language,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/${language}/properties?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const webPageSchema = {
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    "url": canonicalUrl,
    "name": meta.title,
    "description": meta.description,
    "isPartOf": { "@id": `${BASE_URL}/#website` },
    "about": { "@id": `${BASE_URL}/#organization` },
    "inLanguage": language,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".speakable-summary", "h1", ".hero-description"]
    }
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": canonicalUrl }
    ]
  };

  const localBusinessSchema = {
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#localbusiness`,
    "name": BUSINESS.name,
    "priceRange": BUSINESS.priceRange,
    "address": businessPostalAddress(),
    "geo": businessGeoCoordinates(),
    "url": BASE_URL,
    "telephone": BUSINESS.telephone,
    "email": BUSINESS.email,
    "openingHoursSpecification": businessOpeningHoursSpecification()
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      webSiteSchema,
      webPageSchema,
      breadcrumbSchema,
      localBusinessSchema
    ]
  };
}

// Critical CSS for immediate rendering
const CRITICAL_CSS = `
  :root {
    --prime-gold: 43 74% 49%;
    --prime-50: 45 75% 96%;
    --prime-100: 44 74% 90%;
    --prime-900: 160 48% 4%;
    --prime-950: 160 48% 3%;
    --foreground: 220 20% 10%;
    --muted-foreground: 220 10% 45%;
    --background: 0 0% 100%;
  }
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.7;
    color: hsl(var(--foreground));
    background: hsl(var(--background));
    -webkit-font-smoothing: antialiased;
  }
  
  #root { animation: staticFadeIn 0.3s ease-out; }
  
  @keyframes staticFadeIn {
    from { opacity: 0.97; }
    to { opacity: 1; }
  }
  
  .static-homepage {
    min-height: 100vh;
  }
  
  .static-header {
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border-bottom: 1px solid hsl(var(--prime-gold) / 0.2);
  }
  
  .static-header img {
    height: 48px;
  }
  
  .static-hero {
    background:
      radial-gradient(60vw 60vw at 10% 30%, hsla(160,48%,25%,0.12), transparent 70%),
      radial-gradient(50vw 50vw at 100% 100%, hsla(160,48%,30%,0.08), transparent 70%),
      linear-gradient(135deg, hsl(var(--prime-900)), hsl(var(--prime-950)));
    color: white;
    padding: 5rem 2rem;
    text-align: center;
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .static-hero h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1.5rem;
    max-width: 900px;
  }
  
  .hero-highlight {
    color: hsl(var(--prime-gold));
  }
  
  .hero-description {
    font-size: 1.25rem;
    max-width: 700px;
    margin-bottom: 2.5rem;
    opacity: 0.9;
    line-height: 1.6;
  }
  
  .speakable-summary {
    background: hsl(var(--prime-gold) / 0.15);
    border: 1px solid hsl(var(--prime-gold) / 0.3);
    border-radius: 0.75rem;
    padding: 1.5rem 2rem;
    max-width: 800px;
    margin: 2rem auto;
    text-align: left;
  }
  
  .speakable-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: hsl(var(--prime-gold));
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .static-section {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .static-section h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .areas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }
  
  .area-card {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  
  .area-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .area-card-content {
    padding: 1.5rem;
  }
  
  .area-card h3 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .area-card p {
    color: hsl(var(--muted-foreground));
    line-height: 1.6;
  }
  
  .usp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }
  
  .usp-item {
    text-align: center;
    padding: 2rem;
    background: hsl(var(--prime-50));
    border-radius: 1rem;
  }
  
  .usp-item h3 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    color: hsl(var(--prime-900));
  }
  
  .usp-item p {
    color: hsl(var(--muted-foreground));
    font-size: 0.95rem;
  }
  
  .static-footer {
    background: hsl(var(--prime-950));
    color: white;
    padding: 3rem 2rem;
    text-align: center;
  }
  
  .static-footer p {
    opacity: 0.8;
    margin-bottom: 1rem;
  }
  
  .static-footer a {
    color: hsl(var(--prime-gold));
    text-decoration: none;
  }
  
  @media (max-width: 768px) {
    .static-hero { padding: 3rem 1rem; }
    .static-section { padding: 3rem 1rem; }
    .static-header { padding: 1rem; }
  }
`;

// Generate hreflang tags for all 10 languages + x-default
function generateHreflangTags(): string {
  const tags: string[] = [];
  
  for (const lang of LANGUAGES) {
    const url = lang === 'en' ? BASE_URL : `${BASE_URL}/${lang}`;
    tags.push(`<link rel="alternate" hreflang="${lang}" href="${url}" />`);
  }
  
  // x-default points to English (root URL)
  tags.push(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}" />`);
  
  return tags.join('\n    ');
}

function generateStaticHTML(productionAssets: ProductionAssets, language: Language): string {
  const meta = HOMEPAGE_META[language];
  const structuredData = generateStructuredData(language);
  const schemaScript = `<script type="application/ld+json" data-schema="homepage-graph">${JSON.stringify(structuredData, null, 2)}</script>`;

  const cssLinks = productionAssets.css.map(href => 
    `<link rel="stylesheet" href="${href}" />`
  ).join('\n  ');
  
  const jsScripts = productionAssets.js.map(src => 
    `<script type="module" src="${src}"></script>`
  ).join('\n  ');

  const hreflangTags = generateHreflangTags();
  
  // Canonical URL: English uses root, others use /{lang}
  const canonicalUrl = language === 'en' ? BASE_URL : `${BASE_URL}/${language}`;

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#020806" />
  
  <!-- Primary Meta Tags -->
  <title>${sanitizeForHTML(meta.title)}</title>
  <meta name="title" content="${sanitizeForHTML(meta.title)}" />
  <meta name="description" content="${sanitizeForHTML(meta.description)}" />
  <meta name="keywords" content="wealth management, tax-free retirement, IUL insurance, asset protection, independent financial advisor, Everence Wealth" />
  <meta name="author" content="Everence Wealth" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Hreflang Tags (10 languages + x-default) -->
    ${hreflangTags}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${sanitizeForHTML(meta.title)}" />
  <meta property="og:description" content="${sanitizeForHTML(meta.description)}" />
  <meta property="og:image" content="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Everence Wealth - Independent Wealth Management" />
  <meta property="og:site_name" content="Everence Wealth" />
  <meta property="og:locale" content="${meta.ogLocale}" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${sanitizeForHTML(meta.title)}" />
  <meta name="twitter:description" content="${sanitizeForHTML(meta.description)}" />
  <meta name="twitter:image" content="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png" />
  <meta name="twitter:image:alt" content="Everence Wealth - Independent Wealth Management" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
  <link rel="manifest" href="/site.webmanifest" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@400;700&family=Raleway:wght@400;500;600;700&display=swap" as="style">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@400;700&family=Raleway:wght@400;500;600;700&display=swap">
  
  <!-- LCP hero image preload — desktop + mobile, fetchpriority high -->
  <link rel="preload" as="image"
        href="/hero/hero-landing-desktop.jpg"
        fetchpriority="high"
        media="(min-width: 768px)">
  <link rel="preload" as="image"
        href="/hero/hero-landing-mobile.jpg"
        fetchpriority="high"
        media="(max-width: 767px)">

  <!-- Critical CSS -->
  <style>${CRITICAL_CSS}</style>
  
  <!-- Production Assets -->
  ${cssLinks}
  
  <!-- JSON-LD Structured Data -->
  ${schemaScript}
</head>
<body>
  <div id="root">
    <!-- Static content for SEO - will be replaced by React hydration -->
    <div class="static-homepage">
      
      <!-- Header -->
      <header class="static-header">
        <img src="/assets/logo-new.png" alt="Everence Wealth" />
        <nav>
          <a href="/${language}/strategies" style="margin-right: 1.5rem; color: hsl(43 74% 49%); text-decoration: none; font-weight: 500;">Strategies</a>
          <a href="/${language}/philosophy" style="margin-right: 1.5rem; color: inherit; text-decoration: none;">Philosophy</a>
          <a href="/${language}/about" style="margin-right: 1.5rem; color: inherit; text-decoration: none;">About</a>
          <a href="/${language}/blog" style="margin-right: 1.5rem; color: inherit; text-decoration: none;">Blog</a>
          <a href="/${language}/contact" style="color: inherit; text-decoration: none;">Contact</a>
        </nav>
      </header>
      
      <!-- Hero Section with H1 -->
      <section class="static-hero">
        <h1>${sanitizeForHTML(meta.heroHeadline)} <span class="hero-highlight">${sanitizeForHTML(meta.heroHighlight)}</span></h1>
        <p class="hero-description">
          ${sanitizeForHTML(meta.heroDescription)}
        </p>
        
        <!-- Speakable Summary for Voice Assistants -->
        <div class="speakable-summary">
          <div class="speakable-label">Quick Answer</div>
          <p>
            ${sanitizeForHTML(meta.speakableSummary)}
          </p>
        </div>
      </section>
      
      <!-- Core Strategies Section -->
      <section class="static-section">
        <h2>Our Wealth Management Strategies</h2>
        <div class="areas-grid">
          <article class="area-card">
            <div class="area-card-content">
              <h3>Tax-Free Retirement</h3>
              <p>Build tax-free retirement income using properly structured life insurance vehicles and IUL strategies.</p>
            </div>
          </article>
          <article class="area-card">
            <div class="area-card-content">
              <h3>Indexed Universal Life</h3>
              <p>Market-linked growth potential with downside protection. Access your cash value tax-free in retirement.</p>
            </div>
          </article>
          <article class="area-card">
            <div class="area-card-content">
              <h3>Asset Protection</h3>
              <p>Shield your wealth from creditors, lawsuits, and market volatility with proven legal strategies.</p>
            </div>
          </article>
          <article class="area-card">
            <div class="area-card-content">
              <h3>Legacy Planning</h3>
              <p>Transfer wealth to the next generation efficiently with tax-advantaged insurance structures.</p>
            </div>
          </article>
        </div>
      </section>
      
      <!-- Why Choose Us Section -->
      <section class="static-section" style="background: hsl(45 75% 96%); max-width: none; padding: 4rem 2rem;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h2>Why Choose Everence Wealth?</h2>
          <div class="usp-grid">
            <div class="usp-item">
              <h3>30+ Years Experience</h3>
              <p>Deep expertise in wealth management, tax-free retirement strategies, and independent financial advising.</p>
            </div>
            <div class="usp-item">
              <h3>Independent Broker</h3>
              <p>Not tied to any single carrier. We shop the market to find the best solutions for your specific needs.</p>
            </div>
            <div class="usp-item">
              <h3>Client-First Approach</h3>
              <p>Your interests come first. We provide transparent, unbiased financial guidance with no hidden fees.</p>
            </div>
            <div class="usp-item">
              <h3>Proven Results</h3>
              <p>Hundreds of clients building tax-free retirement income and protecting their wealth.</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Services Overview -->
      <section class="static-section">
        <h2>Our Services</h2>
        <div class="usp-grid">
          <div class="usp-item">
            <h3>Retirement Planning</h3>
            <p>Custom tax-free retirement strategies using IUL, whole life, and other insurance-based vehicles.</p>
          </div>
          <div class="usp-item">
            <h3>Wealth Protection</h3>
            <p>Asset protection strategies, estate planning, and wealth preservation for high-net-worth individuals.</p>
          </div>
          <div class="usp-item">
            <h3>Insurance Solutions</h3>
            <p>Life insurance, disability coverage, and long-term care planning tailored to your financial goals.</p>
          </div>
          <div class="usp-item">
            <h3>Financial Education</h3>
            <p>Workshops, webinars, and one-on-one consultations to help you understand your options.</p>
          </div>
        </div>
      </section>
      
      <!-- Footer -->
      <footer class="static-footer">
        <p><strong>Everence Wealth</strong></p>
        <p>${BUSINESS.addressFormatted}</p>
        <p>
          <a href="tel:${BUSINESS.telephoneE164}">${BUSINESS.telephone}</a> |
          <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>
        </p>
        <p style="margin-top: 1.5rem; font-size: 0.875rem;">© ${new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
      </footer>
      
    </div>
  </div>
  
  <!-- React App Scripts for Hydration -->
  ${jsScripts}
</body>
</html>`;
}

export async function generateStaticHomePage(distDir: string) {
  console.log('🏠 Generating static homepages (EN to dist/index.html, ES to /es/index.html)...');
  
  try {
    const productionAssets = getProductionAssets(distDir);
    console.log(`   Found ${productionAssets.css.length} CSS and ${productionAssets.js.length} JS assets`);
    
    const results: { lang: string; path: string }[] = [];
    
    for (const language of LANGUAGES) {
      const html = generateStaticHTML(productionAssets, language);
      
      if (language === 'en') {
        // English: write to BOTH dist/index.html (root /) AND dist/en/index.html.
        // This makes Cloudflare serve real pre-hydration HTML for "/" without
        // any middleware rewrite. The clean React shell remains available as
        // dist/app-shell.html (generated by scripts/generateAppShell.ts) for
        // any route that needs the generic SPA boot (404, dynamic routes, etc).
        const rootPath = join(distDir, 'index.html');
        writeFileSync(rootPath, html, 'utf-8');
        results.push({ lang: 'en (root)', path: rootPath });

        const enDir = join(distDir, 'en');
        mkdirSync(enDir, { recursive: true });
        const enPath = join(enDir, 'index.html');
        writeFileSync(enPath, html, 'utf-8');
        results.push({ lang: 'en', path: enPath });
      } else {
        // Other languages: Write to /{lang}/index.html
        const langDir = join(distDir, language);
        mkdirSync(langDir, { recursive: true });
        const langPath = join(langDir, 'index.html');
        writeFileSync(langPath, html, 'utf-8');
        results.push({ lang: language, path: langPath });
      }
    }
    
    console.log(`   ✅ Generated ${results.length} static homepage files:`);
    console.log(`   ✅ dist/index.html now contains the EN homepage (was the React shell)`);
    results.forEach(r => console.log(`      - ${r.lang}: ${r.path}`));
    
    return { success: true, results };
  } catch (error) {
    console.error('   ❌ Failed to generate static homepages:', error);
    return { success: false, error };
  }
}

// Run if executed directly (not when imported as module)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const distDir = process.argv[2] || 'dist';
  generateStaticHomePage(distDir);
}
