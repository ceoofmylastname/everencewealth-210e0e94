/**
 * Static Informational Pages Generator (PROMPT 12)
 *
 * Replaces generateStaticTeamPage.ts and generateStaticPhilosophyPage.ts and
 * adds /:lang/contact/. Emits 6 fully-rendered HTML files (3 slugs × 2 langs)
 * with:
 *   - JSON-LD schemas baked into <head> (page-type specific)
 *   - Visible H1, breadcrumb, body content baked into <div id="root">
 *   - Inline CRITICAL_CSS so humans see styled content pre-hydration
 *   - Trailing-slash directory routing: dist/{lang}/{slug}/index.html
 *
 * dateModified pulls from static_pages.updated_at per row (the trigger only
 * bumps it on actual content change), NOT from git log of the React file.
 *
 * Schemas per page:
 *   - team:       AboutPage + FinancialService + Person (full) + BreadcrumbList
 *   - philosophy: WebPage + FinancialService (founder @id-ref) + Person + BreadcrumbList + SpeakableSpecification
 *   - contact:    ContactPage + FinancialService + BreadcrumbList
 *
 * Person @id discipline: the canonical Person definition lives at
 * /en/team/steven-rosenberg/#person (bio page). Cross-page Person references
 * use { "@id": "..." } only — never duplicate Person objects.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import {
  BUSINESS,
  businessPostalAddress,
  businessAreaServed,
} from '../src/config/business';

const BASE_URL = 'https://www.everencewealth.com';
const PUBLISHED_DATE = '2025-01-01T00:00:00Z';
const FALLBACK_MODIFIED = '2026-04-12T00:00:00Z';
const PERSON_CANONICAL_ID = `${BASE_URL}/en/team/steven-rosenberg/#person`;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: { headers: { 'x-client-info': 'static-build' } },
});

type Slug = 'team' | 'philosophy' | 'contact';
type Lang = 'en' | 'es';

interface StaticPageRow {
  slug: Slug;
  language: Lang;
  page_type: 'AboutPage' | 'WebPage' | 'ContactPage';
  title: string;
  meta_description: string;
  h1: string;
  body_markdown: string;
  created_at: string;
  updated_at: string | null;
}

interface ProductionAssets { css: string[]; js: string[] }

const BREADCRUMB_LABELS: Record<Slug, Record<Lang, string>> = {
  team: { en: 'Our Team', es: 'Nuestro Equipo' },
  philosophy: { en: 'Philosophy', es: 'Filosofía' },
  contact: { en: 'Contact', es: 'Contacto' },
};

const HOME_LABEL: Record<Lang, string> = { en: 'Home', es: 'Inicio' };

/** Inline critical CSS — bots ignore, humans get styled pre-hydration.
 *  Mirrors generateStaticAuthorBioPage.ts conventions. */
const CRITICAL_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:'Lato',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1f2937;background:#fafaf9;-webkit-font-smoothing:antialiased}
.sp-shell{min-height:100vh;background:#fafaf9}
.sp-main{margin:0 auto;padding:1.5rem 1rem;max-width:48rem}
.sp-card{background:#ffffff;border-radius:1.5rem;padding:2rem 1.75rem;box-shadow:0 1px 2px rgba(0,0,0,0.05);border:1px solid #e5e7eb}
@media (min-width:768px){.sp-card{padding:3rem 2.75rem}}
.sp-breadcrumb{font-size:0.875rem;color:#6b7280;margin-bottom:1.5rem}
.sp-breadcrumb a{color:inherit;text-decoration:none}
.sp-breadcrumb a:hover{text-decoration:underline}
.sp-breadcrumb span.sep{margin:0 0.5rem;color:#9ca3af}
.sp-breadcrumb span.current{color:#111827}
.sp-h1{font-family:'Playfair Display',Georgia,serif;font-size:2rem;font-weight:600;letter-spacing:-0.02em;line-height:1.15;margin:0 0 1.75rem;color:#0f172a}
@media (min-width:768px){.sp-h1{font-size:2.75rem}}
.sp-body h2{font-family:'Playfair Display',Georgia,serif;font-size:1.5rem;font-weight:600;letter-spacing:-0.015em;margin:2.25rem 0 1rem;color:#0f172a}
.sp-body h3{font-family:'Raleway','Lato',sans-serif;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;color:#1f2937}
.sp-body p{margin:0 0 1rem;line-height:1.7;color:#1f2937}
.sp-body strong{color:#0f172a;font-weight:600}
.sp-body ul,.sp-body ol{margin:0 0 1rem;padding-left:1.5rem}
.sp-body li{margin-bottom:0.5rem;line-height:1.65}
.sp-body blockquote{border-left:3px solid #d4a574;margin:1.5rem 0;padding:0.75rem 1.25rem;font-style:italic;color:#4b5563;background:#fefcf8}
.sp-body a{color:#a87339;text-decoration:underline}
.sp-body a:hover{color:#8a5d28}
`;

function gitFallbackUnused() { /* noop, kept for parity */ }

function getProductionAssets(distDir: string): ProductionAssets {
  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) return { css: [], js: [] };
  const indexHtml = readFileSync(indexPath, 'utf-8');
  const cssMatches = indexHtml.match(/href="(\/assets\/[^"]+\.css)"/g) || [];
  const css = cssMatches
    .map((m) => m.match(/href="([^"]+)"/)?.[1])
    .filter((v): v is string => Boolean(v));
  const jsMatches = indexHtml.match(/src="(\/assets\/[^"]+\.js)"/g) || [];
  const js = jsMatches
    .map((m) => m.match(/src="([^"]+)"/)?.[1])
    .filter((v): v is string => Boolean(v));
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

function safeJsonForScript(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function resolveDateModified(row: StaticPageRow): string {
  if (row.updated_at) return new Date(row.updated_at).toISOString();
  if (row.created_at) return new Date(row.created_at).toISOString();
  return FALLBACK_MODIFIED;
}

function buildOrganizationNode(opts: { withFounderRef: boolean; description?: string }) {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': `${BASE_URL}/#organization`,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateName,
    url: BASE_URL,
    logo: BUSINESS.logo.url,
    description: opts.description || BUSINESS.description,
    address: businessPostalAddress(),
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    areaServed: businessAreaServed(),
    sameAs: [...BUSINESS.sameAs],
    foundingDate: BUSINESS.foundingDate,
    slogan: BUSINESS.slogan,
    priceRange: BUSINESS.priceRange,
    knowsLanguage: ['en', 'es'],
  };
  if (opts.withFounderRef) {
    node.founder = { '@id': PERSON_CANONICAL_ID };
  }
  return node;
}

function buildPersonNode() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_CANONICAL_ID,
    name: BUSINESS.founders[0].name,
    jobTitle: BUSINESS.founders[0].jobTitle,
    url: `${BASE_URL}/en/team/steven-rosenberg/`,
    worksFor: { '@id': `${BASE_URL}/#organization` },
    knowsAbout: [
      'Indexed Universal Life Insurance',
      'Tax-Free Retirement Strategies',
      'Three Tax Buckets Framework',
      'Independent Financial Planning',
      'Retirement Gap Analysis',
    ],
  };
}

function buildBreadcrumb(slug: Slug, lang: Lang, canonicalUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: HOME_LABEL[lang], item: `${BASE_URL}/${lang}/` },
      { '@type': 'ListItem', position: 2, name: BREADCRUMB_LABELS[slug][lang], item: canonicalUrl },
    ],
  };
}

function buildSchemas(row: StaticPageRow, canonicalUrl: string, dateModified: string) {
  const { slug, language, page_type, title, meta_description } = row;

  const pageNode = {
    '@context': 'https://schema.org',
    '@type': page_type,
    '@id': `${canonicalUrl}#webpage`,
    name: title,
    description: meta_description,
    url: canonicalUrl,
    inLanguage: language,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      name: 'Everence Wealth',
      url: BASE_URL,
    },
    about: { '@id': `${BASE_URL}/#organization` },
    datePublished: PUBLISHED_DATE,
    dateModified,
  };

  const breadcrumb = buildBreadcrumb(slug, language, canonicalUrl);

  if (slug === 'team') {
    return [
      pageNode,
      buildOrganizationNode({ withFounderRef: false, description: meta_description }),
      buildPersonNode(),
      breadcrumb,
    ];
  }

  if (slug === 'philosophy') {
    const speakable = {
      '@context': 'https://schema.org',
      '@type': 'SpeakableSpecification',
      cssSelector: ['.speakable-philosophy-quote'],
    };
    return [
      pageNode,
      buildOrganizationNode({ withFounderRef: true, description: meta_description }),
      buildPersonNode(),
      breadcrumb,
      speakable,
    ];
  }

  // contact
  return [
    pageNode,
    buildOrganizationNode({ withFounderRef: false, description: meta_description }),
    breadcrumb,
  ];
}

function buildBodyHTML(row: StaticPageRow): string {
  const { slug, language, h1 } = row;
  const homeLabel = HOME_LABEL[language];
  const crumbLabel = BREADCRUMB_LABELS[slug][language];
  const renderedMarkdown = marked.parse(row.body_markdown, { async: false }) as string;

  return `<div class="sp-shell">
    <main class="sp-main">
      <article class="sp-card">
        <nav aria-label="Breadcrumb" class="sp-breadcrumb">
          <a href="/${language}/">${homeLabel}</a>
          <span class="sep">/</span>
          <span class="current">${sanitizeForHTML(crumbLabel)}</span>
        </nav>
        <h1 class="sp-h1">${sanitizeForHTML(h1)}</h1>
        <div class="sp-body">${renderedMarkdown}</div>
      </article>
    </main>
  </div>`;
}

function generateHTML(row: StaticPageRow, assets: ProductionAssets): string {
  const { slug, language, title, meta_description } = row;
  const canonicalUrl = `${BASE_URL}/${language}/${slug}/`;
  const altLang: Lang = language === 'en' ? 'es' : 'en';
  const altUrl = `${BASE_URL}/${altLang}/${slug}/`;
  const xDefaultUrl = `${BASE_URL}/en/${slug}/`;
  const dateModified = resolveDateModified(row);
  const schemas = buildSchemas(row, canonicalUrl, dateModified);
  const schemaScripts = schemas
    .map(
      (s) =>
        `<script type="application/ld+json" data-schema="${slug}">${safeJsonForScript(s)}</script>`
    )
    .join('\n  ');

  const cssLinks = assets.css
    .map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join('\n  ');
  const jsScripts = assets.js
    .map((src) => `<script type="module" src="${src}"></script>`)
    .join('\n  ');
  const ogLocale = language === 'es' ? 'es_US' : 'en_US';

  const bodyHTML = buildBodyHTML(row);

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#d4a574" />
  <title>${sanitizeForHTML(title)}</title>
  <meta name="description" content="${sanitizeForHTML(meta_description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="en" href="${BASE_URL}/en/${slug}/" />
  <link rel="alternate" hreflang="es" href="${BASE_URL}/es/${slug}/" />
  <link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${sanitizeForHTML(title)}" />
  <meta property="og:description" content="${sanitizeForHTML(meta_description)}" />
  <meta property="og:site_name" content="Everence Wealth" />
  <meta property="og:locale" content="${ogLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${sanitizeForHTML(title)}" />
  <meta name="twitter:description" content="${sanitizeForHTML(meta_description)}" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@400;700&family=Raleway:wght@500;600;700&display=swap" rel="stylesheet" />
  <style>${CRITICAL_CSS}</style>
  ${schemaScripts}
  ${cssLinks}
</head>
<body data-prebuilt="static-page" data-slug="${slug}">
  <div id="root">${bodyHTML}</div>
  ${jsScripts}
</body>
</html>`;
}

async function fetchAllRows(): Promise<StaticPageRow[]> {
  const { data, error } = await supabase
    .from('static_pages')
    .select('slug, language, page_type, title, meta_description, h1, body_markdown, created_at, updated_at')
    .in('slug', ['team', 'philosophy', 'contact']);
  if (error) {
    throw new Error(`static_pages fetch failed: ${error.message}`);
  }
  return (data || []) as StaticPageRow[];
}

export async function generateStaticInformationalPages(distDir: string = 'dist') {
  const assets = getProductionAssets(distDir);
  const rows = await fetchAllRows();
  if (rows.length === 0) {
    console.warn('   ⚠️  No rows found in static_pages — skipping');
    return;
  }
  let count = 0;
  for (const row of rows) {
    const outPath = join(distDir, row.language, row.slug, 'index.html');
    mkdirSync(join(outPath, '..'), { recursive: true });
    writeFileSync(outPath, generateHTML(row, assets), 'utf-8');
    console.log(`   ✅ ${outPath} (${row.body_markdown.length}c body, dateModified=${resolveDateModified(row)})`);
    count++;
  }
  console.log(`✅ Generated ${count} informational pages (team/philosophy/contact × en/es)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = process.argv[2] || 'dist';
  generateStaticInformationalPages(distDir).catch((err) => {
    console.error('❌ Informational pages generation failed:', err);
    process.exit(1);
  });
}