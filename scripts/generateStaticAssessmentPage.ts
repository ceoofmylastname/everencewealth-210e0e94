/**
 * Static Assessment Page Generator (PROMPT 26 Fix 1B)
 *
 * Bakes /en/assessment/index.html and /es/assessment/index.html with a thin
 * SSR'd intro block + meta + JSON-LD WebPage. The interactive React quiz
 * (src/pages/Assessment.tsx) hydrates over this content after JS load —
 * but AI crawlers without JS see the intro, which makes the page indexable.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://www.everencewealth.com';

interface ProductionAssets { css: string[]; js: string[] }

type Lang = 'en' | 'es';

interface AssessmentCopy {
  title: string;
  description: string;
  h1: string;
  intro: string;
  longIntro: string;
  loadingLabel: string;
}

const COPY: Record<Lang, AssessmentCopy> = {
  en: {
    title: 'Free Retirement Gap Assessment | Everence Wealth',
    description:
      '5-minute interactive assessment that maps your retirement income gap and suggests tax-advantaged strategies to close it. No login. No sales call. No data shared.',
    h1: 'Free Retirement Gap Assessment',
    intro:
      'The Everence Wealth Retirement Gap Assessment is a 5-minute interactive quiz that maps your projected retirement income against your target lifestyle. It identifies the dollar gap between what your 401(k), Social Security, and current savings will produce versus what you actually need, then suggests tax-advantaged strategies to close it. No login. No sales call. No data shared.',
    longIntro:
      'Designed by Steven Rosenberg, an independent wealth strategist licensed in all 50 states. The assessment covers retirement age, current savings, expected expenses, sequence-of-returns risk tolerance, and tax-bucket allocation. Your results show a personalized gap number and three potential paths to close it: Indexed Universal Life, Roth conversion timing, or guaranteed-income annuity laddering.',
    loadingLabel: 'Loading interactive assessment…',
  },
  es: {
    title: 'Evaluación Gratuita de la Brecha de Jubilación | Everence Wealth',
    description:
      'Evaluación interactiva de 5 minutos que mapea su brecha de ingresos de jubilación y sugiere estrategias con ventajas fiscales para cerrarla. Sin registro. Sin llamada de ventas. Sin compartir datos.',
    h1: 'Evaluación Gratuita de la Brecha de Jubilación',
    intro:
      'La Evaluación de la Brecha de Jubilación de Everence Wealth es un cuestionario interactivo de 5 minutos que mapea sus ingresos de jubilación proyectados frente al estilo de vida deseado. Identifica la brecha en dólares entre lo que producirán su 401(k), el Seguro Social y sus ahorros actuales y lo que realmente necesita, y luego sugiere estrategias con ventajas fiscales para cerrarla. Sin registro. Sin llamada de ventas. Sin compartir datos.',
    longIntro:
      'Diseñada por Steven Rosenberg, asesor independiente de patrimonio con licencia en los 50 estados. La evaluación cubre edad de jubilación, ahorros actuales, gastos esperados, tolerancia al riesgo de secuencia de retornos y asignación por cubo fiscal. Sus resultados muestran un número personalizado de brecha y tres caminos posibles para cerrarla: Seguro Universal Indexado, momento de conversión Roth o escalera de anualidades de ingresos garantizados.',
    loadingLabel: 'Cargando evaluación interactiva…',
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
  const enUrl = `${BASE_URL}/en/assessment/`;
  const esUrl = `${BASE_URL}/es/assessment/`;
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
      { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Evaluación' : 'Assessment', item: canonical },
    ],
  };

  return [webPage, breadcrumb];
}

function generateHTML(lang: Lang, assets: ProductionAssets): string {
  const copy = COPY[lang];
  const enHref = `${BASE_URL}/en/assessment/`;
  const esHref = `${BASE_URL}/es/assessment/`;
  const canonical = lang === 'es' ? esHref : enHref;
  const ogLocale = lang === 'es' ? 'es_US' : 'en_US';

  const schemas = buildSchemas(lang);
  const schemaScripts = schemas
    .map((s) => `<script type="application/ld+json" data-schema="assessment">${safeJson(s)}</script>`)
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
    <main class="ssr-assessment-intro">
      <h1>${sanitize(copy.h1)}</h1>
      <p class="speakable-answer">${sanitize(copy.intro)}</p>
      <p>${sanitize(copy.longIntro)}</p>
      <p><em>${sanitize(copy.loadingLabel)}</em></p>
    </main>
  </div>
  ${jsScripts}
</body>
</html>`;
}

export function generateStaticAssessmentPage(distDir: string = 'dist') {
  const assets = getProductionAssets(distDir);
  let written = 0;

  for (const lang of ['en', 'es'] as const) {
    const outPath = join(distDir, lang, 'assessment', 'index.html');
    mkdirSync(join(outPath, '..'), { recursive: true });
    writeFileSync(outPath, generateHTML(lang, assets), 'utf-8');
    written++;
    console.log(`   ✅ ${outPath}`);
  }
  console.log(`✅ Generated ${written} assessment pages`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = process.argv[2] || 'dist';
  generateStaticAssessmentPage(distDir);
}