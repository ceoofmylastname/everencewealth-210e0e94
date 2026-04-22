/**
 * Static Strategy Page Generator (SSR JSON-LD migration)
 *
 * Emits 8 fully-rendered HTML files (4 strategies × EN+ES) with all schemas
 * baked into pre-hydration HTML. Required because React Helmet only emits
 * JSON-LD post-hydration, which AI crawlers (ClaudeBot, GPTBot,
 * PerplexityBot, Applebot-Extended, Google-Extended) never see.
 *
 * Schemas per page: WebPage + Article + BreadcrumbList + FinancialService +
 * Service + SpeakableSpecification.
 *
 * dateModified is sourced from `git log -1 --format=%cI` against the route
 * component file. If git history is unavailable (shallow clone), falls back
 * to REVIEW_DATES. Never NOW(), never build date.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const BASE_URL = 'https://www.everencewealth.com';

interface ProductionAssets { css: string[]; js: string[] }

interface StrategyDef {
  key: 'iul' | 'wholeLife' | 'taxFreeRetirement' | 'assetProtection';
  enSlug: string;
  esSlug: string;
  componentFile: string;
  speakableSelector: string;
  en: { title: string; description: string; serviceType: string; breadcrumbName: string };
  es: { title: string; description: string; serviceType: string; breadcrumbName: string };
}

const STRATEGIES: StrategyDef[] = [
  {
    key: 'iul',
    enSlug: 'strategies/iul',
    esSlug: 'estrategias/seguro-universal-indexado',
    componentFile: 'src/pages/strategies/IndexedUniversalLife.tsx',
    speakableSelector: '.iul-speakable-content',
    en: {
      title: 'Indexed Universal Life Insurance: Tax-Free Growth with 0% Floor | Everence Wealth',
      description: 'Discover how Indexed Universal Life (IUL) combines market-linked growth, downside protection, tax-free income, and living benefits.',
      serviceType: 'Indexed Universal Life Insurance',
      breadcrumbName: 'Indexed Universal Life',
    },
    es: {
      title: 'Seguro Universal Indexado: Crecimiento Libre de Impuestos con Piso del 0% | Everence Wealth',
      description: 'Descubra cómo el Seguro Universal Indexado (IUL) combina crecimiento ligado al mercado, protección a la baja, ingresos libres de impuestos y beneficios en vida.',
      serviceType: 'Vida Universal Indexada',
      breadcrumbName: 'Vida Universal Indexada',
    },
  },
  {
    key: 'wholeLife',
    enSlug: 'strategies/whole-life',
    esSlug: 'estrategias/seguro-vida-entera',
    componentFile: 'src/pages/strategies/WholeLife.tsx',
    speakableSelector: '.wl-speakable-content',
    en: {
      title: 'Whole Life Insurance: Guaranteed Growth & Infinite Banking | Everence Wealth',
      description: 'Permanent life insurance with guaranteed cash value growth, tax-free dividends, and the foundation of the Infinite Banking Concept.',
      serviceType: 'Whole Life Insurance',
      breadcrumbName: 'Whole Life',
    },
    es: {
      title: 'Seguro de Vida Entera: Crecimiento Garantizado y Banca Infinita | Everence Wealth',
      description: 'Seguro de vida permanente con crecimiento garantizado del valor en efectivo, dividendos libres de impuestos y la base del Concepto de Banca Infinita.',
      serviceType: 'Seguro de Vida Entera',
      breadcrumbName: 'Vida Entera',
    },
  },
  {
    key: 'taxFreeRetirement',
    enSlug: 'strategies/tax-free-retirement',
    esSlug: 'estrategias/retiro-libre-impuestos',
    componentFile: 'src/pages/strategies/TaxFreeRetirement.tsx',
    speakableSelector: '.tfr-speakable-content',
    en: {
      title: 'Tax-Free Retirement: Roth, IUL, Munis & HSA Strategies | Everence Wealth',
      description: 'Combine Roth IRAs, IUL, municipal bonds, and HSAs for 100% tax-free retirement income with no RMDs and no Social Security taxation triggers.',
      serviceType: 'Tax-Free Retirement Planning',
      breadcrumbName: 'Tax-Free Retirement',
    },
    es: {
      title: 'Retiro Libre de Impuestos: Estrategias Roth, IUL, Bonos Municipales y HSA | Everence Wealth',
      description: 'Combine Roth IRAs, IUL, bonos municipales y HSAs para ingresos de jubilación 100% libres de impuestos sin RMDs ni gatillos de tributación del Seguro Social.',
      serviceType: 'Planificación de Retiro Libre de Impuestos',
      breadcrumbName: 'Retiro Libre de Impuestos',
    },
  },
  {
    key: 'assetProtection',
    enSlug: 'strategies/asset-protection',
    esSlug: 'estrategias/proteccion-de-activos',
    componentFile: 'src/pages/strategies/AssetProtection.tsx',
    speakableSelector: '.ap-speakable-content',
    en: {
      title: 'Asset Protection Strategies: ILITs, FLPs, IUL & Annuities | Everence Wealth',
      description: 'Shield your wealth from lawsuits, creditors, divorce, and estate taxes with ILITs, FLPs, IUL cash value, and annuity-based asset protection planning.',
      serviceType: 'Asset Protection Planning',
      breadcrumbName: 'Asset Protection',
    },
    es: {
      title: 'Estrategias de Protección de Activos: ILITs, FLPs, IUL y Anualidades | Everence Wealth',
      description: 'Proteja su patrimonio de demandas, acreedores, divorcio e impuestos sucesorios con ILITs, FLPs, valor en efectivo del IUL y planificación con anualidades.',
      serviceType: 'Planificación de Protección de Activos',
      breadcrumbName: 'Protección de Activos',
    },
  },
];

// Hardcoded review dates (fallback only — used when git history is unavailable, e.g. shallow CI clones)
const REVIEW_DATES: Record<string, string> = {
  'src/pages/strategies/IndexedUniversalLife.tsx': '2026-04-12T00:00:00Z',
  'src/pages/strategies/WholeLife.tsx': '2026-04-12T00:00:00Z',
  'src/pages/strategies/TaxFreeRetirement.tsx': '2026-04-12T00:00:00Z',
  'src/pages/strategies/AssetProtection.tsx': '2026-04-12T00:00:00Z',
};

const PUBLISHED_DATE = '2025-01-01T00:00:00Z';

function gitLastModified(file: string): string {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, { encoding: 'utf-8' }).trim();
    if (out) return out;
  } catch {
    /* fall through */
  }
  return REVIEW_DATES[file] ?? PUBLISHED_DATE;
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
  // Prevent </script> in user data from breaking the inline script tag
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function buildSchemas(strategy: StrategyDef, lang: 'en' | 'es', canonicalUrl: string, dateModified: string) {
  const meta = strategy[lang];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
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

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    headline: meta.title,
    description: meta.description,
    url: canonicalUrl,
    inLanguage: lang,
    datePublished: PUBLISHED_DATE,
    dateModified,
    author: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'Everence Wealth' },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Everence Wealth',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo-icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalUrl}#webpage` },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Estrategias' : 'Strategies', item: `${BASE_URL}/${lang}/${lang === 'es' ? 'estrategias' : 'strategies'}` },
      { '@type': 'ListItem', position: 3, name: meta.breadcrumbName, item: canonicalUrl },
    ],
  };

  const financialService = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': `${BASE_URL}/#organization`,
    name: 'Everence Wealth',
    url: BASE_URL,
    logo: `${BASE_URL}/logo-icon.png`,
    description: 'Independent wealth advisory firm specializing in tax-efficient retirement strategies with access to 75+ carrier partnerships.',
    slogan: 'Bridge the Retirement Gap',
    areaServed: { '@type': 'Country', name: 'United States' },
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${canonicalUrl}#service`,
    serviceType: meta.serviceType,
    provider: { '@id': `${BASE_URL}/#organization` },
    description: meta.description,
    areaServed: { '@type': 'Country', name: 'United States' },
  };

  const speakable = {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    cssSelector: [strategy.speakableSelector],
  };

  return [webPage, article, breadcrumb, financialService, service, speakable];
}

function generateHTML(strategy: StrategyDef, lang: 'en' | 'es', assets: ProductionAssets): string {
  const meta = strategy[lang];
  const slug = lang === 'es' ? strategy.esSlug : strategy.enSlug;
  const canonicalUrl = `${BASE_URL}/${lang}/${slug}`;
  const altEnUrl = `${BASE_URL}/en/${strategy.enSlug}`;
  const altEsUrl = `${BASE_URL}/es/${strategy.esSlug}`;
  const dateModified = gitLastModified(strategy.componentFile);
  const schemas = buildSchemas(strategy, lang, canonicalUrl, dateModified);
  const schemaScripts = schemas
    .map(s => `<script type="application/ld+json" data-schema="strategy-${strategy.key}">${safeJsonForScript(s)}</script>`)
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
  <link rel="alternate" hreflang="en" href="${altEnUrl}" />
  <link rel="alternate" hreflang="es" href="${altEsUrl}" />
  <link rel="alternate" hreflang="x-default" href="${altEnUrl}" />
  <meta property="og:type" content="article" />
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

export function generateStaticStrategyPages(distDir: string = 'dist') {
  const assets = getProductionAssets(distDir);
  let written = 0;
  for (const strategy of STRATEGIES) {
    for (const lang of ['en', 'es'] as const) {
      const slug = lang === 'es' ? strategy.esSlug : strategy.enSlug;
      const outPath = join(distDir, lang, `${slug}.html`);
      mkdirSync(join(outPath, '..'), { recursive: true });
      writeFileSync(outPath, generateHTML(strategy, lang, assets), 'utf-8');
      written++;
      console.log(`   ✅ ${outPath}`);
    }
  }
  console.log(`✅ Generated ${written} strategy pages`);
}

// CLI entry: `npx tsx scripts/generateStaticStrategyPages.ts [distDir]`
if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = process.argv[2] || 'dist';
  generateStaticStrategyPages(distDir);
}