import 'dotenv/config';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

interface GlossaryTerm {
  term: string;
  full_name?: string;
  definition: string;
  related_terms?: string[];
  see_also?: string[];
}

interface GlossaryCategory {
  title: string;
  description: string;
  terms: GlossaryTerm[];
}

interface GlossaryData {
  version: string;
  last_updated: string;
  total_terms: number;
  categories: Record<string, GlossaryCategory>;
}

interface ProductionAssets {
  css: string[];
  js: string[];
}

/**
 * Extract production asset paths from built index.html
 */
function getProductionAssets(distDir: string): ProductionAssets {
  const indexPath = join(distDir, 'index.html');
  
  if (!existsSync(indexPath)) {
    console.log('⚠️ Built index.html not found, skipping asset injection');
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
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://www.delsolprimehomes.com/#organization",
    "name": "Del Sol Prime Homes",
    "url": "https://www.delsolprimehomes.com/"
  };
}

function generateDefinedTermListSchema(categories: Record<string, GlossaryCategory>) {
  const allTerms: any[] = [];
  
  Object.entries(categories).forEach(([_, category]) => {
    category.terms.forEach((term, index) => {
      allTerms.push({
        "@type": "DefinedTerm",
        "name": term.term,
        "description": term.definition,
        "inDefinedTermSet": {
          "@type": "DefinedTermSet",
          "name": "Costa del Sol Real Estate Glossary",
          "@id": "https://www.delsolprimehomes.com/glossary#termset"
        }
      });
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": "https://www.delsolprimehomes.com/glossary#termset",
    "name": "Costa del Sol Real Estate Glossary",
    "description": "Comprehensive glossary of Spanish real estate, legal, and property terms for international buyers",
    "url": "https://www.delsolprimehomes.com/glossary",
    "inLanguage": "en",
    "hasDefinedTerm": allTerms.slice(0, 50) // Limit to avoid huge JSON
  };
}

function generateBreadcrumbSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://www.delsolprimehomes.com/glossary#breadcrumb",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.delsolprimehomes.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Glossary",
        "item": "https://www.delsolprimehomes.com/glossary"
      }
    ]
  };
}

function generateWebPageSchema(totalTerms: number) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.delsolprimehomes.com/glossary#webpage",
    "url": "https://www.delsolprimehomes.com/glossary",
    "name": "Spanish Real Estate Glossary | Property Terms Explained",
    "description": "Comprehensive glossary of Spanish property, legal, and tax terms for international buyers. From NIE numbers to notary fees - all terms explained.",
    "inLanguage": "en-GB",
    "isPartOf": {
      "@id": "https://www.delsolprimehomes.com/#website"
    },
    "about": {
      "@type": "Thing",
      "name": "Spanish Real Estate Terminology"
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalTerms,
      "name": "Real Estate Terms"
    }
  };
}

function generateSpeakableSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": [".glossary-term-definition", ".glossary-intro"]
  };
}

const CRITICAL_CSS = `
  :root {
    --prime-gold: 43 74% 49%;
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
  
  #root {
    animation: staticFadeIn 0.3s ease-out;
  }
  
  @keyframes staticFadeIn {
    from { opacity: 0.97; }
    to { opacity: 1; }
  }
  
  .glossary-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 3rem 1.5rem 4rem;
  }
  
  .glossary-header {
    text-align: center;
    padding: 2rem 0 3rem;
  }
  
  .glossary-header h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: hsl(var(--foreground));
    margin-bottom: 1rem;
  }
  
  .glossary-intro {
    font-size: 1.125rem;
    color: hsl(var(--muted-foreground));
    max-width: 700px;
    margin: 0 auto;
  }
  
  .glossary-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: hsl(var(--prime-gold) / 0.05);
    border-radius: 0.5rem;
  }
  
  .glossary-nav a {
    padding: 0.5rem 1rem;
    color: hsl(var(--foreground));
    text-decoration: none;
    border-radius: 0.25rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .glossary-nav a:hover {
    background: hsl(var(--prime-gold) / 0.2);
    color: hsl(var(--prime-gold));
  }
  
  .glossary-category {
    margin-bottom: 3rem;
  }
  
  .category-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.75rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid hsl(var(--prime-gold) / 0.3);
  }
  
  .category-description {
    color: hsl(var(--muted-foreground));
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }
  
  .glossary-term {
    padding: 1.25rem;
    margin-bottom: 1rem;
    background: hsl(var(--prime-gold) / 0.03);
    border-left: 3px solid hsl(var(--prime-gold));
    border-radius: 0.5rem;
  }
  
  .term-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: hsl(var(--foreground));
    margin-bottom: 0.25rem;
  }
  
  .term-full-name {
    font-size: 0.9rem;
    color: hsl(var(--prime-gold));
    font-style: italic;
    margin-bottom: 0.75rem;
  }
  
  .glossary-term-definition {
    font-size: 1rem;
    line-height: 1.7;
    color: hsl(var(--foreground));
    margin-bottom: 0.75rem;
  }
  
  .term-related {
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
  }
  
  .term-related a {
    color: hsl(var(--prime-gold));
    text-decoration: none;
  }
  
  .term-related a:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    .glossary-page { padding: 2rem 1rem 3rem; }
    .glossary-header h1 { font-size: 1.75rem; }
    .category-title { font-size: 1.5rem; }
  }
`;

function generateGlossaryHTML(data: GlossaryData, productionAssets: ProductionAssets): string {
  const baseUrl = 'https://www.delsolprimehomes.com';
  
  const termSetSchema = generateDefinedTermListSchema(data.categories);
  const breadcrumbSchema = generateBreadcrumbSchema();
  const webPageSchema = generateWebPageSchema(data.total_terms);
  const speakableSchema = generateSpeakableSchema();
  const organizationSchema = generateOrganizationSchema();
  
  const schemaScripts = [
    `<script type="application/ld+json" data-schema="organization">${JSON.stringify(organizationSchema, null, 2)}</script>`,
    `<script type="application/ld+json" data-schema="termset">${JSON.stringify(termSetSchema, null, 2)}</script>`,
    `<script type="application/ld+json" data-schema="webpage">${JSON.stringify(webPageSchema, null, 2)}</script>`,
    `<script type="application/ld+json" data-schema="breadcrumb">${JSON.stringify(breadcrumbSchema, null, 2)}</script>`,
    `<script type="application/ld+json" data-schema="speakable">${JSON.stringify(speakableSchema, null, 2)}</script>`
  ].join('\n  ');

  const cssLinks = productionAssets.css.map(href => 
    `<link rel="stylesheet" href="${href}" />`
  ).join('\n  ');
  
  const jsScripts = productionAssets.js.map(src => 
    `<script type="module" src="${src}"></script>`
  ).join('\n  ');

  // Build category navigation
  const categoryNav = Object.entries(data.categories).map(([key, cat]) => 
    `<a href="#${key}">${sanitizeForHTML(cat.title)}</a>`
  ).join('');

  // Build category sections
  const categorySections = Object.entries(data.categories).map(([key, category]) => {
    const termsHtml = category.terms.map(term => {
      const termSlug = term.term.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const relatedHtml = term.related_terms && term.related_terms.length > 0
        ? `<div class="term-related">Related: ${term.related_terms.map(r => 
            `<a href="#${r.toLowerCase().replace(/\s+/g, '-')}">${sanitizeForHTML(r)}</a>`
          ).join(', ')}</div>`
        : '';
      
      return `
        <div class="glossary-term" id="${termSlug}">
          <div class="term-name">${sanitizeForHTML(term.term)}</div>
          ${term.full_name ? `<div class="term-full-name">${sanitizeForHTML(term.full_name)}</div>` : ''}
          <p class="glossary-term-definition">${sanitizeForHTML(term.definition)}</p>
          ${relatedHtml}
        </div>
      `;
    }).join('');

    return `
      <section class="glossary-category" id="${key}">
        <h2 class="category-title">${sanitizeForHTML(category.title)}</h2>
        <p class="category-description">${sanitizeForHTML(category.description)}</p>
        ${termsHtml}
      </section>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en" data-static="true">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Comprehensive glossary of Spanish property, legal, and tax terms for international buyers. From NIE numbers to notary fees - ${data.total_terms} terms explained.">
  <title>Spanish Real Estate Glossary | ${data.total_terms} Property Terms Explained | Del Sol Prime Homes</title>
  
  <link rel="canonical" href="${baseUrl}/glossary" />
  
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/favicon.png">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700&family=Playfair+Display:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>${CRITICAL_CSS}</style>
  
  ${cssLinks}
  
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Spanish Real Estate Glossary | ${data.total_terms} Terms Explained" />
  <meta property="og:description" content="Comprehensive glossary of Spanish property, legal, and tax terms for international buyers." />
  <meta property="og:url" content="${baseUrl}/glossary" />
  <meta property="og:site_name" content="Del Sol Prime Homes" />
  
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Spanish Real Estate Glossary | ${data.total_terms} Terms Explained" />
  <meta name="twitter:description" content="Comprehensive glossary of Spanish property, legal, and tax terms for international buyers." />
  
  ${schemaScripts}
</head>
<body>
  <div id="root">
    <main class="glossary-page static-content">
      <header class="glossary-header">
        <h1>Spanish Real Estate Glossary</h1>
        <p class="glossary-intro">Your comprehensive guide to Spanish property terms, legal terminology, and real estate jargon. ${data.total_terms} essential terms explained for international buyers.</p>
      </header>
      
      <nav class="glossary-nav" aria-label="Jump to category">
        ${categoryNav}
      </nav>
      
      ${categorySections}
    </main>
  </div>
  
  ${jsScripts}
</body>
</html>`;
}

function loadGlossaryData(): GlossaryData | null {
  try {
    const glossaryPath = join(process.cwd(), 'public', 'glossary.json');
    const content = readFileSync(glossaryPath, 'utf-8');
    return JSON.parse(content) as GlossaryData;
  } catch (err) {
    console.error('❌ Failed to load glossary.json:', err);
    return null;
  }
}

export async function generateStaticGlossaryPage(distDir: string) {
  console.log('\n📖 Starting static glossary page generation...');
  
  try {
    const productionAssets = getProductionAssets(distDir);
    const glossaryData = loadGlossaryData();
    
    if (!glossaryData) {
      console.log('⚠️ No glossary data found, skipping generation');
      return;
    }
    
    console.log(`📝 Found ${glossaryData.total_terms} glossary terms in ${Object.keys(glossaryData.categories).length} categories`);
    
    const html = generateGlossaryHTML(glossaryData, productionAssets);
    const filePath = join(distDir, 'glossary', 'index.html');
    
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, html, 'utf-8');
    
    console.log(`✅ Generated static glossary page with DefinedTermSet schema`);
    console.log(`   📦 Production assets injected: ${productionAssets.css.length} CSS, ${productionAssets.js.length} JS`);
  } catch (err) {
    console.error('❌ Static glossary generation failed:', err);
    throw err;
  }
}

// Run if called directly
const distDir = join(process.cwd(), 'dist');
generateStaticGlossaryPage(distDir).catch(console.error);
