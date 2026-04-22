/**
 * Static Glossary Generator (SSR JSON-LD migration)
 *
 * Emits per-language glossary index pages and per-term pages with
 * DefinedTermSet / DefinedTerm schema baked into pre-hydration HTML.
 *
 * Source priority (matches client runtime in src/pages/Glossary.tsx):
 *   1. public/glossary/{lang}.json
 *   2. public/glossary/en.json (fallback)
 *
 * dateModified is sourced from `glossaryData.last_updated` in the JSON
 * file, normalized to ISO-8601. Never NOW().
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://www.everencewealth.com';
const PUBLISHED_DATE = '2024-01-15T00:00:00Z';
const LANGUAGES = ['en', 'es'] as const;
type Lang = typeof LANGUAGES[number];

interface GlossaryTerm {
  term: string;
  full_name: string;
  definition: string;
  related_terms: string[];
  see_also: string[];
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

interface ProductionAssets { css: string[]; js: string[] }

const META = {
  en: {
    indexTitle: 'Wealth Management Glossary | Financial Terms Explained | Everence Wealth',
    indexDescription: 'Complete glossary of financial planning, insurance, retirement, and tax terms. Essential definitions for IUL, 401(k), Roth IRA, annuities, and more.',
    indexBreadcrumb: 'Glossary',
  },
  es: {
    indexTitle: 'Glosario de Gestión Patrimonial | Términos Financieros Explicados | Everence Wealth',
    indexDescription: 'Glosario completo de planificación financiera, seguros, jubilación y términos fiscales. Definiciones esenciales para IUL, 401(k), Roth IRA, anualidades y más.',
    indexBreadcrumb: 'Glosario',
  },
} as const;

function toTermSlug(term: string): string {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function toIso(dateStr: string): string {
  if (!dateStr) return PUBLISHED_DATE;
  // Accept "YYYY-MM-DD" or full ISO; normalize.
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return PUBLISHED_DATE;
  return d.toISOString();
}

function loadGlossary(lang: Lang): GlossaryData | null {
  const candidates = [
    join('public', 'glossary', `${lang}.json`),
    join('public', 'glossary', 'en.json'),
  ];
  for (const file of candidates) {
    if (existsSync(file)) {
      try {
        const data = JSON.parse(readFileSync(file, 'utf-8')) as GlossaryData;
        if (data?.categories && Object.keys(data.categories).length > 0) {
          return data;
        }
      } catch (err) {
        console.warn(`   ⚠️ Failed to parse ${file}:`, err);
      }
    }
  }
  return null;
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

function buildIndexSchemas(lang: Lang, data: GlossaryData, canonicalUrl: string, dateModified: string) {
  const meta = META[lang];

  const allTerms: GlossaryTerm[] = [];
  for (const cat of Object.values(data.categories)) {
    for (const t of cat.terms) allTerms.push(t);
  }

  const definedTermSet = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${canonicalUrl}#termset`,
    name: lang === 'es' ? 'Glosario de Gestión Patrimonial Everence' : 'Everence Wealth Management Glossary',
    description: meta.indexDescription,
    url: canonicalUrl,
    inLanguage: lang,
    datePublished: PUBLISHED_DATE,
    dateModified,
    hasDefinedTerm: allTerms.map(t => ({
      '@type': 'DefinedTerm',
      name: t.full_name,
      alternateName: t.term,
      description: t.definition,
      url: `${BASE_URL}/${lang}/glossary/${toTermSlug(t.term)}`,
    })),
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    name: meta.indexTitle,
    description: meta.indexDescription,
    url: canonicalUrl,
    inLanguage: lang,
    isPartOf: { '@type': 'WebSite', '@id': `${BASE_URL}/#website`, name: 'Everence Wealth', url: BASE_URL },
    about: { '@id': `${BASE_URL}/#organization` },
    datePublished: PUBLISHED_DATE,
    dateModified,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: meta.indexBreadcrumb, item: canonicalUrl },
    ],
  };

  return [webPage, definedTermSet, breadcrumb];
}

function buildTermSchemas(lang: Lang, term: GlossaryTerm, categoryTitle: string, canonicalUrl: string, dateModified: string) {
  const definedTerm = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${canonicalUrl}#term`,
    name: term.full_name,
    alternateName: term.term,
    description: term.definition,
    url: canonicalUrl,
    inLanguage: lang,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': `${BASE_URL}/${lang}/glossary#termset`,
      name: lang === 'es' ? 'Glosario de Gestión Patrimonial Everence' : 'Everence Wealth Management Glossary',
      url: `${BASE_URL}/${lang}/glossary`,
    },
    datePublished: PUBLISHED_DATE,
    dateModified,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Glosario' : 'Glossary', item: `${BASE_URL}/${lang}/glossary` },
      { '@type': 'ListItem', position: 3, name: term.full_name, item: canonicalUrl },
    ],
  };

  return [definedTerm, breadcrumb];
}

function generateIndexHTML(lang: Lang, data: GlossaryData, assets: ProductionAssets): string {
  const meta = META[lang];
  const canonicalUrl = `${BASE_URL}/${lang}/glossary`;
  const dateModified = toIso(data.last_updated);
  const schemas = buildIndexSchemas(lang, data, canonicalUrl, dateModified);
  const schemaScripts = schemas
    .map(s => `<script type="application/ld+json" data-schema="glossary-index">${safeJsonForScript(s)}</script>`)
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
  <title>${sanitizeForHTML(meta.indexTitle)}</title>
  <meta name="description" content="${sanitizeForHTML(meta.indexDescription)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="en" href="${BASE_URL}/en/glossary" />
  <link rel="alternate" hreflang="es" href="${BASE_URL}/es/glossary" />
  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/glossary" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${sanitizeForHTML(meta.indexTitle)}" />
  <meta property="og:description" content="${sanitizeForHTML(meta.indexDescription)}" />
  <meta property="og:site_name" content="Everence Wealth" />
  <meta property="og:locale" content="${ogLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${sanitizeForHTML(meta.indexTitle)}" />
  <meta name="twitter:description" content="${sanitizeForHTML(meta.indexDescription)}" />
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

function generateTermHTML(lang: Lang, term: GlossaryTerm, categoryTitle: string, dataLastUpdated: string, assets: ProductionAssets): string {
  const slug = toTermSlug(term.term);
  const canonicalUrl = `${BASE_URL}/${lang}/glossary/${slug}`;
  const dateModified = toIso(dataLastUpdated);
  const schemas = buildTermSchemas(lang, term, categoryTitle, canonicalUrl, dateModified);
  const pageTitle = `${term.full_name} — ${lang === 'es' ? 'Definición' : 'Definition'} | Everence Wealth Glossary`;
  const pageDescription = term.definition.slice(0, 155);

  const schemaScripts = schemas
    .map(s => `<script type="application/ld+json" data-schema="glossary-term">${safeJsonForScript(s)}</script>`)
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
  <title>${sanitizeForHTML(pageTitle)}</title>
  <meta name="description" content="${sanitizeForHTML(pageDescription)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="en" href="${BASE_URL}/en/glossary/${slug}" />
  <link rel="alternate" hreflang="es" href="${BASE_URL}/es/glossary/${slug}" />
  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/glossary/${slug}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${sanitizeForHTML(pageTitle)}" />
  <meta property="og:description" content="${sanitizeForHTML(pageDescription)}" />
  <meta property="og:site_name" content="Everence Wealth" />
  <meta property="og:locale" content="${ogLocale}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${sanitizeForHTML(pageTitle)}" />
  <meta name="twitter:description" content="${sanitizeForHTML(pageDescription)}" />
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

export function generateStaticGlossary(distDir: string = 'dist') {
  const assets = getProductionAssets(distDir);
  let totalIndex = 0;
  let totalTerms = 0;

  for (const lang of LANGUAGES) {
    const data = loadGlossary(lang);
    if (!data) {
      console.warn(`   ⚠️ No glossary data found for ${lang}; skipping`);
      continue;
    }

    // Index page — directory-based routing: dist/en/glossary/index.html
    const indexPath = join(distDir, lang, 'glossary', 'index.html');
    mkdirSync(join(indexPath, '..'), { recursive: true });
    writeFileSync(indexPath, generateIndexHTML(lang, data, assets), 'utf-8');
    console.log(`   ✅ ${indexPath}`);
    totalIndex++;

    // Per-term pages
    for (const [, category] of Object.entries(data.categories)) {
      for (const term of category.terms) {
        const slug = toTermSlug(term.term);
        // Directory-based: dist/en/glossary/{slug}/index.html
        const termPath = join(distDir, lang, 'glossary', slug, 'index.html');
        mkdirSync(join(termPath, '..'), { recursive: true });
        writeFileSync(termPath, generateTermHTML(lang, term, category.title, data.last_updated, assets), 'utf-8');
        totalTerms++;
      }
    }
  }

  console.log(`✅ Generated ${totalIndex} glossary index pages and ${totalTerms} term pages`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = process.argv[2] || 'dist';
  generateStaticGlossary(distDir);
}