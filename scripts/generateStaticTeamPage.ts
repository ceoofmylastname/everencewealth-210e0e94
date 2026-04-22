/**
 * Static Team Page Generator (SSR JSON-LD migration)
 *
 * Emits 2 fully-rendered HTML files (EN + ES) at /:lang/team with
 * Organization + Person schema baked into pre-hydration HTML.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const BASE_URL = 'https://www.everencewealth.com';
const COMPONENT_FILE = 'src/pages/Team.tsx';
const PUBLISHED_DATE = '2025-01-01T00:00:00Z';
const REVIEW_FALLBACK = '2026-04-12T00:00:00Z';

interface ProductionAssets { css: string[]; js: string[] }

const META = {
  en: {
    title: 'Our Team | Everence Wealth Independent Advisors',
    description: 'Meet the expert wealth advisors at Everence Wealth. Independent brokers with decades of experience in tax-free retirement strategies and asset protection.',
    breadcrumb: 'Our Team',
  },
  es: {
    title: 'Nuestro Equipo | Asesores Independientes de Everence Wealth',
    description: 'Conozca a los asesores expertos de Everence Wealth. Brokers independientes con décadas de experiencia en estrategias de jubilación libres de impuestos y protección de activos.',
    breadcrumb: 'Nuestro Equipo',
  },
} as const;

function gitLastModified(file: string): string {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, { encoding: 'utf-8' }).trim();
    if (out) return out;
  } catch { /* shallow clone */ }
  return REVIEW_FALLBACK;
}

function getProductionAssets(distDir: string): ProductionAssets {
  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) return { css: [], js: [] };
  const indexHtml = readFileSync(indexPath, 'utf-8');
  const cssMatches = indexHtml.match(/href="(\/assets\/[^"]+\.css)"/g) || [];
  const css = cssMatches.map(m => m.match(/href="([^"]+)"/)?.[1]).filter((v): v is string => Boolean(v));
  const jsMatches = indexHtml.match(/src="(\/assets\/[^"]+\.js)"/g) || [];
  const js = jsMatches.map(m => m.match(/src="([^"]+)"/)?.[1]).filter((v): v is string => Boolean(v));
  return { css, js };
}

function sanitizeForHTML(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function safeJsonForScript(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function buildSchemas(lang: 'en' | 'es', canonicalUrl: string, dateModified: string) {
  const meta = META[lang];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${canonicalUrl}#webpage`,
    name: meta.title,
    description: meta.description,
    url: canonicalUrl,
    inLanguage: lang,
    isPartOf: { '@type': 'WebSite', '@id': `${BASE_URL}/#website`, name: 'Everence Wealth', url: BASE_URL },
    about: { '@id': `${BASE_URL}/#organization` },
    datePublished: PUBLISHED_DATE,
    dateModified,
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': `${BASE_URL}/#organization`,
    name: 'Everence Wealth',
    description: meta.description,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '455 Market St Ste 1940 PMB 350011',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94105',
      addressCountry: 'US',
    },
    telephone: '+1-415-555-0100',
    email: 'info@everencewealth.com',
    areaServed: { '@type': 'Country', name: 'United States' },
    knowsLanguage: ['en', 'es'],
    employee: [{ '@id': `${BASE_URL}/#steven-rosenberg` }],
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/#steven-rosenberg`,
    name: 'Steven Rosenberg',
    jobTitle: 'Founder & Chief Wealth Strategist',
    description: 'Founder & Chief Wealth Strategist at Everence Wealth. Independent insurance broker and licensed professional serving families across all 50 states.',
    image: 'https://www.everencewealth.com/images/steven-blog.jpg',
    sameAs: ['https://www.linkedin.com/in/stevenrosenberg/'],
    worksFor: { '@id': `${BASE_URL}/#organization` },
    knowsAbout: [
      'Indexed Universal Life Insurance',
      'Tax-Free Retirement Strategies',
      'Three Tax Buckets Framework',
      'Independent Financial Planning',
      'Retirement Gap Analysis',
    ],
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: meta.breadcrumb, item: canonicalUrl },
    ],
  };

  return [webPage, organization, person, breadcrumb];
}

function generateHTML(lang: 'en' | 'es', assets: ProductionAssets): string {
  const meta = META[lang];
  const canonicalUrl = `${BASE_URL}/${lang}/team`;
  const dateModified = gitLastModified(COMPONENT_FILE);
  const schemas = buildSchemas(lang, canonicalUrl, dateModified);
  const schemaScripts = schemas
    .map(s => `<script type="application/ld+json" data-schema="team">${safeJsonForScript(s)}</script>`)
    .join('\n  ');

  const cssLinks = assets.css.map(href => `<link rel="stylesheet" href="${href}" />`).join('\n  ');
  const jsScripts = assets.js.map(src => `<script type="module" src="${src}"></script>`).join('\n  ');
  const ogLocale = lang === 'es' ? 'es_US' : 'en_US';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#d4a574" />
  <title>${sanitizeForHTML(meta.title)}</title>
  <meta name="description" content="${sanitizeForHTML(meta.description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="en" href="${BASE_URL}/en/team" />
  <link rel="alternate" hreflang="es" href="${BASE_URL}/es/team" />
  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/team" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${sanitizeForHTML(meta.title)}" />
  <meta property="og:description" content="${sanitizeForHTML(meta.description)}" />
  <meta property="og:site_name" content="Everence Wealth" />
  <meta property="og:locale" content="${ogLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${sanitizeForHTML(meta.title)}" />
  <meta name="twitter:description" content="${sanitizeForHTML(meta.description)}" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  ${schemaScripts}
  ${cssLinks}
</head>
<body>
  <div id="root"></div>
  ${jsScripts}
</body>
</html>`;
}

export function generateStaticTeamPage(distDir: string = 'dist') {
  const assets = getProductionAssets(distDir);
  for (const lang of ['en', 'es'] as const) {
    const outPath = join(distDir, lang, 'team.html');
    mkdirSync(join(outPath, '..'), { recursive: true });
    writeFileSync(outPath, generateHTML(lang, assets), 'utf-8');
    console.log(`   ✅ ${outPath}`);
  }
  console.log('✅ Generated 2 team pages');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = process.argv[2] || 'dist';
  generateStaticTeamPage(distDir);
}