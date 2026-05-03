/**
 * Static Calculator Page Generator (PROMPT 27 Fix 1C)
 *
 * Bakes /en/calculator/index.html and /es/calculator/index.html with a thin
 * SSR'd intro block + meta + JSON-LD WebPage. The interactive React calculator
 * (src/pages/Calculator.tsx) hydrates over this content after JS load — but
 * AI crawlers without JS see the intro, which makes the page indexable and
 * cures the soft-404 GSC was reporting.
 *
 * Mirrors the structure of generateStaticAssessmentPage.ts.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://www.everencewealth.com';

interface ProductionAssets { css: string[]; js: string[] }

type Lang = 'en' | 'es';

interface CalculatorCopy {
  title: string;
  description: string;
  h1: string;
  intro: string;
  longIntro: string;
  loadingLabel: string;
}

const COPY: Record<Lang, CalculatorCopy> = {
  en: {
    title: 'Retirement Income Calculator | Everence Wealth',
    description:
      'Project how much tax-free retirement income your savings, 401(k), and Social Security will produce, then map the gap against your target lifestyle.',
    h1: 'Retirement Income Calculator',
    intro:
      'The Everence Wealth Retirement Income Calculator projects how much tax-free retirement income your current savings, 401(k), and Social Security will produce, then maps the gap against your target lifestyle. Inputs include current age, target retirement age, current savings, monthly contribution, expected return assumption, and target monthly retirement income. Output shows projected portfolio value at retirement, sustainable monthly withdrawal at the 4% rule, and the dollar gap to close.',
    longIntro:
      'Designed by Steven Rosenberg, an independent wealth strategist licensed in 50 states. The calculator uses standard sequence-of-returns assumptions and does not factor advanced strategies like Indexed Universal Life cash value, Roth conversion timing, or annuity laddering. For a personalized strategy that incorporates those, schedule a 30-minute consultation after running your calculation.',
    loadingLabel: 'Loading interactive calculator…',
  },
  es: {
    title: 'Calculadora de Ingresos de Jubilación | Everence Wealth',
    description:
      'Proyecte cuántos ingresos libres de impuestos producirán sus ahorros, 401(k) y Seguro Social en la jubilación, y mapee la brecha contra el estilo de vida deseado.',
    h1: 'Calculadora de Ingresos de Jubilación',
    intro:
      'La Calculadora de Ingresos de Jubilación de Everence Wealth proyecta cuántos ingresos libres de impuestos producirán sus ahorros actuales, 401(k) y Seguro Social, y luego mapea la brecha contra el estilo de vida deseado. Las entradas incluyen edad actual, edad objetivo de jubilación, ahorros actuales, contribución mensual, supuesto de retorno esperado e ingresos mensuales objetivo. La salida muestra el valor proyectado del portafolio al jubilarse, el retiro mensual sostenible bajo la regla del 4% y la brecha en dólares por cerrar.',
    longIntro:
      'Diseñada por Steven Rosenberg, asesor independiente de patrimonio con licencia en los 50 estados. La calculadora usa supuestos estándar de secuencia de retornos y no incluye estrategias avanzadas como el valor en efectivo del Seguro Universal Indexado, momento de conversiones Roth o escaleras de anualidades. Para una estrategia personalizada que las incorpore, agende una consulta de 30 minutos tras correr el cálculo.',
    loadingLabel: 'Cargando calculadora interactiva…',
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
  const enUrl = `${BASE_URL}/en/calculator/`;
  const esUrl = `${BASE_URL}/es/calculator/`;
  const canonical = lang === 'es' ? esUrl : enUrl;
  const copy = COPY[lang];

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
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
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: `${BASE_URL}/${lang}/` },
      { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Calculadora' : 'Calculator', item: canonical },
    ],
  };

  return [webPage, breadcrumb];
}

function generateHTML(lang: Lang, assets: ProductionAssets): string {
  const copy = COPY[lang];
  const enHref = `${BASE_URL}/en/calculator/`;
  const esHref = `${BASE_URL}/es/calculator/`;
  const canonical = lang === 'es' ? esHref : enHref;
  const ogLocale = lang === 'es' ? 'es_US' : 'en_US';

  const schemas = buildSchemas(lang);
  const schemaScripts = schemas
    .map((s) => `<script type="application/ld+json" data-schema="calculator">${safeJson(s)}</script>`)
    .join('\n  ');

  const cssLinks = assets.css.map((href) => `<link rel="stylesheet" href="${href}" />`).join('\n  ');
  const jsScripts = assets.js.map((src) => `<script type="module" src="${src}"></script>`).join('\n  ');

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
    <main class="ssr-calculator-intro">
      <header>
        <h1>${sanitize(copy.h1)}</h1>
        <div class="speakable-summary speakable-answer" id="speakable-summary">
          <p>${sanitize(copy.intro)}</p>
        </div>
        <p>${sanitize(copy.longIntro)}</p>
      </header>
      <div id="calculator-mount"><p><em>${sanitize(copy.loadingLabel)}</em></p></div>
    </main>
  </div>
  ${jsScripts}
</body>
</html>`;
}

export function generateStaticCalculatorPage(distDir: string = 'dist') {
  const assets = getProductionAssets(distDir);
  let written = 0;

  for (const lang of ['en', 'es'] as const) {
    const outPath = join(distDir, lang, 'calculator', 'index.html');
    mkdirSync(join(outPath, '..'), { recursive: true });
    writeFileSync(outPath, generateHTML(lang, assets), 'utf-8');
    written++;
    console.log(`   ✅ ${outPath}`);
  }
  console.log(`✅ Generated ${written} calculator pages`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = process.argv[2] || 'dist';
  generateStaticCalculatorPage(distDir);
}