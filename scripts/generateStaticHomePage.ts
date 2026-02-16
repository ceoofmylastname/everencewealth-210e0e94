import 'dotenv/config';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
    title: 'Everence Wealth | Independent Fiduciary Wealth Architects',
    description: 'Specializing in tax-efficient retirement strategies, estate planning, and asset protection. Serving clients in San Francisco and nationwide.',
    ogLocale: 'en_US',
    heroHeadline: 'Architecting Your',
    heroHighlight: 'Financial Legacy',
    heroDescription: 'Independent fiduciary wealth architects specializing in tax-efficient retirement strategies. We guide clients through complex financial landscapes to secure their legacy.',
    speakableSummary: 'Everence Wealth is an independent fiduciary wealth management firm based in San Francisco. We specialize in tax-efficient retirement strategies, estate planning, and asset protection. Contact us at +1-415-555-0100.',
  },
  es: {
    title: 'Everence Wealth | Arquitectos Fiduciarios Independientes de Riqueza',
    description: 'Especializados en estrategias de jubilación fiscalmente eficientes, planificación patrimonial y protección de activos. Sirviendo a clientes en San Francisco y a nivel nacional.',
    ogLocale: 'es_US',
    heroHeadline: 'Arquitectando Su',
    heroHighlight: 'Legado Financiero',
    heroDescription: 'Arquitectos fiduciarios independientes de riqueza especializados en estrategias de jubilación fiscalmente eficientes. Guiamos a los clientes a través de paisajes financieros complejos para asegurar su legado.',
    speakableSummary: 'Everence Wealth es una firma independiente de gestión de patrimonio fiduciario con sede en San Francisco. Nos especializamos en estrategias de jubilación fiscalmente eficientes, planificación patrimonial y protección de activos. Contáctenos al +1-415-555-0100.',
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
    "name": "Everence Wealth",
    "alternateName": "Everence",
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/assets/logo-new.png`,
      "width": 400,
      "height": 100
    },
    "description": meta.description,
    "foundingDate": "2024",
    "slogan": "Architecting Your Financial Legacy",
    "telephone": "+1-415-555-0100",
    "email": "info@everencewealth.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "One Embarcadero Center, Suite 500",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94111",
      "addressCountry": "US"
    },
    "areaServed": { "@type": "Country", "name": "United States" },
    "founders": [
      { "@type": "Person", "name": "Steven Rosenberg" }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["en", "es"],
      "telephone": "+1-415-555-0100",
      "email": "info@everencewealth.com"
    },
    "priceRange": "$$$"
  };

  const webSiteSchema = {
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    "url": BASE_URL,
    "name": "Everence Wealth",
    "description": "Independent Fiduciary Wealth Management",
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
    "name": "Everence Wealth",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "One Embarcadero Center, Suite 500",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94111",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.7941,
      "longitude": -122.3998
    },
    "url": BASE_URL,
    "telephone": "+1-415-555-0100",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "14:00"
      }
    ]
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
    --prime-900: 220 20% 12%;
    --prime-950: 220 20% 10%;
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
    background: linear-gradient(135deg, hsl(var(--prime-900)), hsl(var(--prime-950)));
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
  <meta name="theme-color" content="#d4a574" />
  
  <!-- Primary Meta Tags -->
  <title>${sanitizeForHTML(meta.title)}</title>
  <meta name="title" content="${sanitizeForHTML(meta.title)}" />
  <meta name="description" content="${sanitizeForHTML(meta.description)}" />
  <meta name="keywords" content="Costa del Sol real estate, Marbella properties, Estepona villas, Spanish property investment, luxury homes Spain" />
  <meta name="author" content="Del Sol Prime Homes" />
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
  <meta property="og:image" content="${BASE_URL}/assets/logo-new.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Del Sol Prime Homes - Costa del Sol Real Estate" />
  <meta property="og:site_name" content="Del Sol Prime Homes" />
  <meta property="og:locale" content="${meta.ogLocale}" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${sanitizeForHTML(meta.title)}" />
  <meta name="twitter:description" content="${sanitizeForHTML(meta.description)}" />
  <meta name="twitter:image" content="${BASE_URL}/assets/logo-new.png" />
  <meta name="twitter:image:alt" content="Del Sol Prime Homes - Costa del Sol Real Estate" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@400;700&family=Raleway:wght@400;500;600;700&display=swap" as="style">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@400;700&family=Raleway:wght@400;500;600;700&display=swap">
  
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
        <img src="/assets/logo-new.png" alt="Del Sol Prime Homes" />
        <nav>
          <a href="/${language}/properties" style="margin-right: 1.5rem; color: hsl(43 74% 49%); text-decoration: none; font-weight: 500;">Properties</a>
          <a href="/about" style="margin-right: 1.5rem; color: inherit; text-decoration: none;">About</a>
          <a href="/buyers-guide" style="margin-right: 1.5rem; color: inherit; text-decoration: none;">Buyers Guide</a>
          <a href="/${language}/blog" style="color: inherit; text-decoration: none;">Blog</a>
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
      
      <!-- Featured Areas Section -->
      <section class="static-section">
        <h2>Prime Locations on the Costa del Sol</h2>
        <div class="areas-grid">
          <article class="area-card">
            <div class="area-card-content">
              <h3>Marbella</h3>
              <p>The jewel of the Costa del Sol, famous for its Golden Mile, Puerto Banús, and year-round international community.</p>
            </div>
          </article>
          <article class="area-card">
            <div class="area-card-content">
              <h3>Estepona</h3>
              <p>The Garden of the Costa del Sol — charming Andalusian atmosphere with growing modern infrastructure and excellent value.</p>
            </div>
          </article>
          <article class="area-card">
            <div class="area-card-content">
              <h3>Sotogrande</h3>
              <p>Privacy and prestige. World-class polo, golf, and marina lifestyle in an exclusive residential community.</p>
            </div>
          </article>
          <article class="area-card">
            <div class="area-card-content">
              <h3>Málaga City</h3>
              <p>A vibrant cultural hub blending history with futuristic urban living. Excellent connectivity and amenities.</p>
            </div>
          </article>
        </div>
      </section>
      
      <!-- Why Choose Us Section -->
      <section class="static-section" style="background: hsl(45 75% 96%); max-width: none; padding: 4rem 2rem;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h2>Why Choose Del Sol Prime Homes?</h2>
          <div class="usp-grid">
            <div class="usp-item">
              <h3>35+ Years Experience</h3>
              <p>Deep local knowledge and established relationships with developers, lawyers, and notaries.</p>
            </div>
            <div class="usp-item">
              <h3>Multilingual Team</h3>
              <p>Native speakers of English, Dutch, French, German, and Spanish to guide you in your language.</p>
            </div>
            <div class="usp-item">
              <h3>Full-Service Support</h3>
              <p>From property search to key handover: NIE, banking, legal, and after-sales support included.</p>
            </div>
            <div class="usp-item">
              <h3>500+ Properties Sold</h3>
              <p>Proven track record with international buyers from across Europe and beyond.</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Services Overview -->
      <section class="static-section">
        <h2>Our Services</h2>
        <div class="usp-grid">
          <div class="usp-item">
            <h3>Property Search</h3>
            <p>Access to exclusive listings, new developments, and off-market opportunities across the Costa del Sol.</p>
          </div>
          <div class="usp-item">
            <h3>Legal & Financial</h3>
            <p>Coordination with lawyers, NIE applications, mortgage arrangements, and Golden Visa guidance.</p>
          </div>
          <div class="usp-item">
            <h3>Viewing Tours</h3>
            <p>Personalized property tours with airport pickup, area orientation, and restaurant recommendations.</p>
          </div>
          <div class="usp-item">
            <h3>After-Sales</h3>
            <p>Property management, rental setup, renovation coordination, and ongoing support after purchase.</p>
          </div>
        </div>
      </section>
      
      <!-- Footer -->
      <footer class="static-footer">
        <p><strong>Del Sol Prime Homes</strong></p>
        <p>ED SAN FERNAN, C. Alfonso XIII, 6, 1 OFICINA, 29640 Fuengirola, Málaga, Spain</p>
        <p>
          <a href="tel:+34613578416">+34 613 578 416</a> | 
          <a href="mailto:info@delsolprimehomes.com">info@delsolprimehomes.com</a>
        </p>
        <p style="margin-top: 1.5rem; font-size: 0.875rem;">© ${new Date().getFullYear()} Del Sol Prime Homes. All rights reserved.</p>
      </footer>
      
    </div>
  </div>
  
  <!-- React App Scripts for Hydration -->
  ${jsScripts}
</body>
</html>`;
}

export async function generateStaticHomePage(distDir: string) {
  console.log('🏠 Generating static homepages for all 10 languages...');
  console.log('   ⚠️  NOTE: NOT overwriting dist/index.html to keep it as clean React shell');
  
  try {
    const productionAssets = getProductionAssets(distDir);
    console.log(`   Found ${productionAssets.css.length} CSS and ${productionAssets.js.length} JS assets`);
    
    const results: { lang: string; path: string }[] = [];
    
    for (const language of LANGUAGES) {
      const html = generateStaticHTML(productionAssets, language);
      
      if (language === 'en') {
        // English: Write to home.html (NOT index.html!) + /en/index.html
        // CRITICAL: Do NOT overwrite dist/index.html - it must remain the clean React shell
        // Middleware will serve home.html for homepage requests
        const homePath = join(distDir, 'home.html');
        writeFileSync(homePath, html, 'utf-8');
        results.push({ lang: 'en (home.html)', path: homePath });
        
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
    console.log(`   ✅ dist/index.html preserved as clean React shell`);
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
