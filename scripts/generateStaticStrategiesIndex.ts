/**
 * Static Strategies Index Generator (PROMPT 26 Fix 1A)
 *
 * Bakes /en/strategies/index.html and /es/estrategias/index.html with full
 * meta + JSON-LD CollectionPage so AI crawlers (ClaudeBot, GPTBot,
 * PerplexityBot, Applebot-Extended, Google-Extended) get the hub copy
 * without executing JavaScript. The React StrategiesIndex component
 * hydrates over the same content for users.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://www.everencewealth.com';

interface ProductionAssets { css: string[]; js: string[] }

type Lang = 'en' | 'es';

interface HubCopy {
  pathname: string;          // e.g. /en/strategies
  title: string;
  description: string;
  h1: string;
  intro: string;
  cards: { title: string; href: string; description: string }[];
  ctaHeading: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
  breadcrumbHome: string;
  breadcrumbCurrent: string;
}

const COPY: Record<Lang, HubCopy> = {
  en: {
    pathname: '/en/strategies',
    title: 'Wealth Management Strategies | Everence Wealth',
    description:
      'Indexed Universal Life, Whole Life, Tax-Free Retirement, and Asset Protection strategies from Everence Wealth — independent advisor licensed in 50 states.',
    h1: 'Wealth Management Strategies',
    intro:
      'Everence Wealth builds tax-advantaged retirement income through four core strategies: Indexed Universal Life (IUL), Whole Life, Tax-Free Retirement planning, and Asset Protection. Each strategy is independently advised by Steven Rosenberg, licensed in 50 states, and structured around the Three Tax Buckets framework.',
    cards: [
      {
        title: 'Indexed Universal Life Insurance (IUL)',
        href: '/en/strategies/iul/',
        description:
          'Build cash value tied to market index performance with a 0% floor that protects principal against losses. IUL combines life insurance protection with tax-free retirement income potential, no contribution limits, and no required minimum distributions.',
      },
      {
        title: 'Whole Life Insurance',
        href: '/en/strategies/whole-life/',
        description:
          'Permanent life insurance with guaranteed cash value growth, lifetime protection, and dividend potential when issued by a mutual carrier. Stable, contractually guaranteed, and the foundation of many high-net-worth banking strategies.',
      },
      {
        title: 'Tax-Free Retirement',
        href: '/en/strategies/tax-free-retirement/',
        description:
          'Build retirement income you will never owe taxes on. Combines Roth conversion timing, cash-value life insurance, and asset location strategy to insulate income from rising tax rates.',
      },
      {
        title: 'Asset Protection',
        href: '/en/strategies/asset-protection/',
        description:
          'Shield wealth from lawsuits, creditors, and avoidable taxes. Includes irrevocable life insurance trusts, properly structured annuities, and state-specific creditor-protection planning.',
      },
    ],
    ctaHeading: 'Talk to an Independent Advisor',
    ctaBody:
      'Free 30-minute consultation. No sales pressure. We map your retirement gap before recommending any strategy.',
    ctaLabel: 'Contact Us',
    ctaHref: '/en/contact/',
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Strategies',
  },
  es: {
    pathname: '/es/estrategias',
    title: 'Estrategias de Gestión Patrimonial | Everence Wealth',
    description:
      'Estrategias de Seguro Universal Indexado, Seguro de Vida Entera, Retiro Libre de Impuestos y Protección de Activos de Everence Wealth — asesor independiente con licencia en los 50 estados.',
    h1: 'Estrategias de Gestión Patrimonial',
    intro:
      'Everence Wealth construye ingresos de jubilación con ventajas fiscales a través de cuatro estrategias principales: Seguro Universal Indexado (IUL), Seguro de Vida Entera, planificación de Retiro Libre de Impuestos y Protección de Activos. Cada estrategia es asesorada de forma independiente por Steven Rosenberg, con licencia en los 50 estados, y estructurada en torno al marco de los Tres Cubos Fiscales.',
    cards: [
      {
        title: 'Seguro Universal Indexado (IUL)',
        href: '/es/estrategias/seguro-universal-indexado/',
        description:
          'Acumule valor en efectivo ligado al rendimiento de un índice de mercado con un piso del 0% que protege el capital contra pérdidas. El IUL combina protección de vida con ingresos de jubilación libres de impuestos, sin límites de contribución y sin distribuciones mínimas obligatorias.',
      },
      {
        title: 'Seguro de Vida Entera',
        href: '/es/estrategias/seguro-vida-entera/',
        description:
          'Seguro de vida permanente con crecimiento garantizado del valor en efectivo, protección vitalicia y potencial de dividendos cuando es emitido por una aseguradora mutualista. Estable, garantizado contractualmente y base de muchas estrategias de banca personal de alto patrimonio.',
      },
      {
        title: 'Retiro Libre de Impuestos',
        href: '/es/estrategias/retiro-libre-impuestos/',
        description:
          'Construya ingresos de jubilación por los que nunca pagará impuestos. Combina el momento óptimo de conversión Roth, seguro de vida con valor en efectivo y estrategia de ubicación de activos para aislar sus ingresos de futuras subidas de impuestos.',
      },
      {
        title: 'Protección de Activos',
        href: '/es/estrategias/proteccion-de-activos/',
        description:
          'Proteja su patrimonio de demandas, acreedores e impuestos evitables. Incluye fideicomisos irrevocables de seguro de vida (ILIT), anualidades correctamente estructuradas y planificación de protección frente a acreedores específica por estado.',
      },
    ],
    ctaHeading: 'Hable con un asesor independiente',
    ctaBody:
      'Consulta gratuita de 30 minutos. Sin presión comercial. Analizamos su brecha de jubilación antes de recomendar cualquier estrategia.',
    ctaLabel: 'Contáctenos',
    ctaHref: '/es/contact/',
    breadcrumbHome: 'Inicio',
    breadcrumbCurrent: 'Estrategias',
  },
};

function getProductionAssets(distDir: string): ProductionAssets {
  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) return { css: [], js: [] };
  const html = readFileSync(indexPath, 'utf-8');
  const cssMatches = html.match(/href="(\/assets\/[^"]+\.css)"/g) || [];
  const css = cssMatches.map(m => m.match(/href="([^"]+)"/)?.[1]).filter((v): v is string => Boolean(v));
  const jsMatches = html.match(/src="(\/assets\/[^"]+\.js)"/g) || [];
  const js = jsMatches.map(m => m.match(/src="([^"]+)"/)?.[1]).filter((v): v is string => Boolean(v));
  return { css, js };
}

function sanitize(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function safeJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function buildSchemas(lang: Lang) {
  const enHubUrl = `${BASE_URL}/en/strategies/`;
  const esHubUrl = `${BASE_URL}/es/estrategias/`;
  const canonical = lang === 'es' ? esHubUrl : enHubUrl;
  const copy = COPY[lang];

  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: copy.title,
    description: copy.description,
    inLanguage: lang,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    about: { '@id': `${BASE_URL}/#organization` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.speakable-answer', 'h1'],
    },
    hasPart: copy.cards.map((c) => ({
      '@type': 'FinancialProduct',
      name: c.title,
      url: `${BASE_URL}${c.href}`,
    })),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: copy.breadcrumbHome, item: `${BASE_URL}/${lang}/` },
      { '@type': 'ListItem', position: 2, name: copy.breadcrumbCurrent, item: canonical },
    ],
  };

  return [collectionPage, breadcrumb];
}

function generateHTML(lang: Lang, assets: ProductionAssets): string {
  const copy = COPY[lang];
  const enHref = `${BASE_URL}/en/strategies/`;
  const esHref = `${BASE_URL}/es/estrategias/`;
  const canonical = lang === 'es' ? esHref : enHref;
  const ogLocale = lang === 'es' ? 'es_US' : 'en_US';

  const schemas = buildSchemas(lang);
  const schemaScripts = schemas
    .map((s) => `<script type="application/ld+json" data-schema="strategies-index">${safeJson(s)}</script>`)
    .join('\n  ');

  const cssLinks = assets.css.map((href) => `<link rel="stylesheet" href="${href}" />`).join('\n  ');
  const jsScripts = assets.js.map((src) => `<script type="module" src="${src}"></script>`).join('\n  ');

  const cardsHtml = copy.cards
    .map(
      (c) => `<article class="strategy-card">
        <h2><a href="${c.href}">${sanitize(c.title)}</a></h2>
        <p>${sanitize(c.description)}</p>
      </article>`
    )
    .join('\n        ');

  return `<!DOCTYPE html>
<html lang="${lang}" data-static="true">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${sanitize(copy.title)}</title>
  <meta name="description" content="${sanitize(copy.description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${enHref}" />
  <link rel="alternate" hreflang="es" href="${esHref}" />
  <link rel="alternate" hreflang="x-default" href="${enHref}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${sanitize(copy.title)}" />
  <meta property="og:description" content="${sanitize(copy.description)}" />
  <meta property="og:site_name" content="Everence Wealth" />
  <meta property="og:locale" content="${ogLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="manifest" href="/site.webmanifest" />
  ${schemaScripts}
  ${cssLinks}
</head>
<body>
  <div id="root">
    <main class="ssr-strategies-index">
      <nav aria-label="Breadcrumb">
        <a href="/${lang}/">${sanitize(copy.breadcrumbHome)}</a>
        <span> / </span>
        <span>${sanitize(copy.breadcrumbCurrent)}</span>
      </nav>
      <h1>${sanitize(copy.h1)}</h1>
      <p class="speakable-answer">${sanitize(copy.intro)}</p>
      <section class="strategy-cards">
        ${cardsHtml}
      </section>
      <section class="strategies-cta">
        <h2>${sanitize(copy.ctaHeading)}</h2>
        <p>${sanitize(copy.ctaBody)}</p>
        <a href="${copy.ctaHref}" class="cta-button">${sanitize(copy.ctaLabel)}</a>
      </section>
    </main>
  </div>
  ${jsScripts}
</body>
</html>`;
}

export function generateStaticStrategiesIndex(distDir: string = 'dist') {
  const assets = getProductionAssets(distDir);
  let written = 0;

  for (const lang of ['en', 'es'] as const) {
    const subPath = lang === 'es' ? 'es/estrategias' : 'en/strategies';
    const outPath = join(distDir, subPath, 'index.html');
    mkdirSync(join(outPath, '..'), { recursive: true });
    writeFileSync(outPath, generateHTML(lang, assets), 'utf-8');
    written++;
    console.log(`   ✅ ${outPath}`);
  }
  console.log(`✅ Generated ${written} strategies index pages`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = process.argv[2] || 'dist';
  generateStaticStrategiesIndex(distDir);
}