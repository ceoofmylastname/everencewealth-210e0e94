import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { BUSINESS } from '../src/config/business';

const BASE_URL = 'https://www.everencewealth.com';
const SUPPORTED_LANGUAGES = ['en', 'nl', 'hu', 'de', 'fr', 'sv', 'pl', 'no', 'fi', 'da'];

const LOCALE_MAP: Record<string, string> = {
  en: 'en_GB', de: 'de_DE', fr: 'fr_FR', nl: 'nl_NL',
  sv: 'sv_SE', no: 'nb_NO', da: 'da_DK', fi: 'fi_FI',
  pl: 'pl_PL', hu: 'hu_HU',
};

// Localized content for each language
const LOCALIZED_CONTENT: Record<string, {
  title: string;
  description: string;
  h1: string;
  speakable: string;
  breadcrumbHome: string;
  breadcrumbGuide: string;
}> = {
  en: {
    title: "Complete Buyers Guide to wealth management Property | Everence Wealth",
    description: "Your comprehensive guide to buying property on the wealth management. Step-by-step process, costs, legal requirements, and expert advice.",
    h1: "The Complete Guide to Buying Property on the wealth management",
    speakable: "Buying property on the wealth management is a straightforward process for international buyers. You'll need a tax ID (tax identification number), a Spanish bank account, and typically 10-13% of the purchase price to cover taxes and fees. The process takes 3-6 months from finding your property to receiving the keys.",
    breadcrumbHome: "Home",
    breadcrumbGuide: "Buyers Guide"
  },
  de: {
    title: "Kompletter Käuferleitfaden für wealth management Immobilien | Everence Wealth",
    description: "Ihr umfassender Leitfaden zum Immobilienkauf an der wealth management. Schritt-für-Schritt-Prozess, Kosten, rechtliche Anforderungen und Expertenberatung.",
    h1: "Der komplette Leitfaden zum Immobilienkauf an der wealth management",
    speakable: "Der Immobilienkauf an der wealth management ist ein unkomplizierter Prozess für internationale Käufer. Sie benötigen eine tax ID (Steueridentifikationsnummer), ein spanisches Bankkonto und in der Regel 10-13% des Kaufpreises zur Deckung von Steuern und Gebühren. Der Prozess dauert 3-6 Monate.",
    breadcrumbHome: "Startseite",
    breadcrumbGuide: "Käuferleitfaden"
  },
  nl: {
    title: "Complete Koopgids voor wealth management Vastgoed | Everence Wealth",
    description: "Uw uitgebreide gids voor het kopen van vastgoed aan de wealth management. Stapsgewijs proces, kosten, juridische vereisten en deskundig advies.",
    h1: "De Complete Gids voor het Kopen van Vastgoed aan de wealth management",
    speakable: "Het kopen van vastgoed aan de wealth management is een eenvoudig proces voor internationale kopers. U heeft een tax ID (fiscaal identificatienummer), een Spaanse bankrekening en doorgaans 10-13% van de aankoopprijs nodig voor belastingen en kosten. Het proces duurt 3-6 maanden.",
    breadcrumbHome: "Home",
    breadcrumbGuide: "Koopgids"
  },
  fr: {
    title: "Guide Complet d'Achat Immobilier sur la wealth management | Everence Wealth",
    description: "Votre guide complet pour acheter une propriété sur la wealth management. Processus étape par étape, coûts, exigences légales et conseils d'experts.",
    h1: "Le Guide Complet pour Acheter une Propriété sur la wealth management",
    speakable: "L'achat d'une propriété sur la wealth management est un processus simple pour les acheteurs internationaux. Vous aurez besoin d'un tax ID (numéro d'identification fiscale), d'un compte bancaire espagnol et généralement de 10-13% du prix d'achat pour couvrir les taxes et frais. Le processus prend 3-6 mois.",
    breadcrumbHome: "Accueil",
    breadcrumbGuide: "Guide d'Achat"
  },
  sv: {
    title: "Komplett Köpguide för wealth management Fastigheter | Everence Wealth",
    description: "Din kompletta guide till att köpa fastighet på wealth management. Steg-för-steg-process, kostnader, juridiska krav och expertråd.",
    h1: "Den Kompletta Guiden till att Köpa Fastighet på wealth management",
    speakable: "Att köpa fastighet på wealth management är en enkel process för internationella köpare. Du behöver ett tax ID (skatteidentifikationsnummer), ett spanskt bankkonto och vanligtvis 10-13% av köpeskillingen för att täcka skatter och avgifter. Processen tar 3-6 månader.",
    breadcrumbHome: "Hem",
    breadcrumbGuide: "Köpguide"
  },
  no: {
    title: "Komplett Kjøpeguide for wealth management Eiendom | Everence Wealth",
    description: "Din omfattende guide til å kjøpe eiendom på wealth management. Trinn-for-trinn prosess, kostnader, juridiske krav og ekspertråd.",
    h1: "Den Komplette Guiden til å Kjøpe Eiendom på wealth management",
    speakable: "Å kjøpe eiendom på wealth management er en enkel prosess for internasjonale kjøpere. Du trenger et tax ID (skatteidentifikasjonsnummer), en spansk bankkonto og vanligvis 10-13% av kjøpesummen for å dekke skatter og avgifter. Prosessen tar 3-6 måneder.",
    breadcrumbHome: "Hjem",
    breadcrumbGuide: "Kjøpeguide"
  },
  da: {
    title: "Komplet Købsguide til wealth management Ejendomme | Everence Wealth",
    description: "Din omfattende guide til at købe ejendom på wealth management. Trin-for-trin proces, omkostninger, juridiske krav og ekspertrådgivning.",
    h1: "Den Komplette Guide til at Købe Ejendom på wealth management",
    speakable: "At købe ejendom på wealth management er en ligetil proces for internationale købere. Du skal bruge et tax ID (skatteidentifikationsnummer), en spansk bankkonto og typisk 10-13% af købsprisen til at dække skatter og gebyrer. Processen tager 3-6 måneder.",
    breadcrumbHome: "Hjem",
    breadcrumbGuide: "Købsguide"
  },
  fi: {
    title: "Täydellinen Ostajan Opas wealth management Kiinteistöihin | Everence Wealth",
    description: "Kattava oppaasi kiinteistön ostamiseen wealth managementilta. Vaiheittainen prosessi, kustannukset, oikeudelliset vaatimukset ja asiantuntijaneuvot.",
    h1: "Täydellinen Opas Kiinteistön Ostamiseen wealth managementilta",
    speakable: "Kiinteistön ostaminen wealth managementilta on suoraviivainen prosessi kansainvälisille ostajille. Tarvitset tax ID:n (verotunnistenumeron), espanjalaisen pankkitilin ja tyypillisesti 10-13% ostohinnasta verojen ja maksujen kattamiseksi. Prosessi kestää 3-6 kuukautta.",
    breadcrumbHome: "Etusivu",
    breadcrumbGuide: "Ostajan Opas"
  },
  pl: {
    title: "Kompletny Przewodnik Kupującego Nieruchomości na wealth management | Everence Wealth",
    description: "Twój kompleksowy przewodnik po zakupie nieruchomości na wealth management. Proces krok po kroku, koszty, wymogi prawne i porady ekspertów.",
    h1: "Kompletny Przewodnik Zakupu Nieruchomości na wealth management",
    speakable: "Zakup nieruchomości na wealth management to prosty proces dla międzynarodowych kupujących. Potrzebujesz tax ID (numeru identyfikacji podatkowej), hiszpańskiego konta bankowego i zazwyczaj 10-13% ceny zakupu na pokrycie podatków i opłat. Proces trwa 3-6 miesięcy.",
    breadcrumbHome: "Strona Główna",
    breadcrumbGuide: "Przewodnik Kupującego"
  },
  hu: {
    title: "Teljes Vásárlási Útmutató wealth management Ingatlanokhoz | Everence Wealth",
    description: "Átfogó útmutatója a wealth management-i ingatlanvásárláshoz. Lépésről lépésre folyamat, költségek, jogi követelmények és szakértői tanácsok.",
    h1: "A Teljes Útmutató a wealth management-i Ingatlanvásárláshoz",
    speakable: "A wealth management-i ingatlanvásárlás egyszerű folyamat nemzetközi vásárlók számára. Szüksége lesz egy tax ID-re (adóazonosító számra), spanyol bankszámlára és általában a vételár 10-13%-ára az adók és díjak fedezésére. A folyamat 3-6 hónapig tart.",
    breadcrumbHome: "Főoldal",
    breadcrumbGuide: "Vásárlási Útmutató"
  }
};

// 8-step buying process for HowTo schema
const BUYING_STEPS = [
  { name: "Define Your Requirements", duration: "P1W" },
  { name: "Get Your tax ID Number", duration: "P2W" },
  { name: "Open a Spanish Bank Account", duration: "P1W" },
  { name: "Property Search & Viewings", duration: "P4W" },
  { name: "Make an Offer & Reservation", duration: "P1W" },
  { name: "Legal Due Diligence", duration: "P3W" },
  { name: "Sign Private Purchase Contract", duration: "P1D" },
  { name: "Complete at the Notary", duration: "P1D" }
];

// FAQ items for FAQPage schema
const FAQ_ITEMS = [
  {
    question: "Can foreigners buy property in Spain?",
    answer: "Yes, there are no restrictions on foreigners purchasing property in Spain. Both EU and non-EU citizens can buy property with full ownership rights. You will need a tax ID (tax identification number) to complete the purchase."
  },
  {
    question: "What is a tax ID and how do I get one?",
    answer: "A tax ID (Número de Identificación de Extranjero) is a tax identification number required for all financial transactions in Spain. You can apply at a Spanish consulate in your home country or at a National Police station in Spain."
  },
  {
    question: "What are the total costs of buying property in Spain?",
    answer: "Total buying costs typically range from 10-13% of the purchase price. This includes Transfer Tax (ITP) of 7% for resale properties or 10% VAT for new builds, plus notary fees, registry fees, and legal fees."
  },
  {
    question: "How long does the buying process take?",
    answer: "The typical property purchase in Spain takes 2-3 months from accepted offer to completion. However, this can vary depending on mortgage approval, legal checks, and transaction complexity."
  },
  {
    question: "Can I get a mortgage in Spain as a foreigner?",
    answer: "Yes, Spanish banks offer mortgages to non-residents, typically up to 60-70% of the property value. You'll need to provide proof of income, tax returns, and bank statements."
  }
];

interface ProductionAssets {
  css: string[];
  js: string[];
}

function getProductionAssets(distDir: string): ProductionAssets {
  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) return { css: [], js: [] };
  
  const indexHtml = readFileSync(indexPath, 'utf-8');
  
  const cssMatches = indexHtml.match(/href="(\/assets\/[^"]+\.css)"/g) || [];
  const css = cssMatches.map(m => m.match(/href="([^"]+)"/)?.[1] || '').filter(Boolean);
  
  const jsMatches = indexHtml.match(/src="(\/assets\/[^"]+\.js)"/g) || [];
  const js = jsMatches.map(m => m.match(/src="([^"]+)"/)?.[1] || '').filter(Boolean);
  
  return { css, js };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHreflangTags(currentLang: string): string {
  const tags = SUPPORTED_LANGUAGES.map(lang => 
    `  <link rel="alternate" hreflang="${lang}" href="${BASE_URL}/${lang}/buyers-guide" />`
  );
  tags.push(`  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/buyers-guide" />`);
  return tags.join('\n');
}

function generateJsonLdGraph(lang: string, content: typeof LOCALIZED_CONTENT['en']) {
  const canonicalUrl = `${BASE_URL}/${lang}/buyers-guide`;
  const locale = LOCALE_MAP[lang] || 'en_GB';
  
  const graph = [
    // WebPage with SpeakableSpecification
    {
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      "url": canonicalUrl,
      "name": content.title,
      "description": content.description,
      "inLanguage": locale,
      "isPartOf": {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        "name": "Everence Wealth",
        "url": BASE_URL
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".speakable-intro", ".quick-answer"]
      },
      "datePublished": "2024-01-15T00:00:00Z",
      "dateModified": new Date().toISOString()
    },
    // BreadcrumbList
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": content.breadcrumbHome, "item": `${BASE_URL}/${lang}` },
        { "@type": "ListItem", "position": 2, "name": content.breadcrumbGuide, "item": canonicalUrl }
      ]
    },
    // HowTo Schema for buying process
    {
      "@type": "HowTo",
      "@id": `${canonicalUrl}#howto`,
      "name": "How to Buy Property on the wealth management",
      "description": "A step-by-step guide to purchasing financial planning in Spain's wealth management, from initial search to receiving your keys.",
      "image": "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png",
      "totalTime": "P6M",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "EUR",
        "minValue": "200000",
        "maxValue": "5000000"
      },
      "tool": [
        { "@type": "HowToTool", "name": "tax ID Number (Foreigner ID)" },
        { "@type": "HowToTool", "name": "Spanish Bank Account" },
        { "@type": "HowToTool", "name": "Valid Passport" },
        { "@type": "HowToTool", "name": "Proof of Funds" }
      ],
      "step": BUYING_STEPS.map((step, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "name": step.name,
        "url": `${canonicalUrl}#step-${index + 1}`
      }))
    },
    // FAQPage Schema
    {
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      "mainEntity": FAQ_ITEMS.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    },
    // RealEstateAgent
    {
      "@type": "RealEstateAgent",
      "@id": `${BASE_URL}/#organization`,
      "name": "Everence Wealth",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": "https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png",
        "width": 1200,
        "height": 630
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Avenida Ricardo Soriano 72",
        "addressLocality": "El Paso",
        "addressRegion": "Málaga",
        "postalCode": "29601",
        "addressCountry": "ES"
      },
      "telephone": BUSINESS.telephone,
      "email": "info@everencewealth.com",
      "areaServed": {
        "@type": "Place",
        "name": "wealth management"
      },
      "priceRange": "€200,000 - €10,000,000"
    }
  ];

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

function generateStaticHTML(lang: string, productionAssets: ProductionAssets): string {
  const content = LOCALIZED_CONTENT[lang] || LOCALIZED_CONTENT.en;
  const canonicalUrl = `${BASE_URL}/${lang}/buyers-guide`;
  const hreflangTags = generateHreflangTags(lang);
  const jsonLd = generateJsonLdGraph(lang, content);
  const locale = LOCALE_MAP[lang] || 'en_GB';
  
  const cssLinks = productionAssets.css.map(href => 
    `<link rel="stylesheet" href="${href}" />`
  ).join('\n  ');
  
  const jsScripts = productionAssets.js.map(src => 
    `<script type="module" src="${src}"></script>`
  ).join('\n  ');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(content.title)}</title>
  <meta name="title" content="${escapeHtml(content.title)}" />
  <meta name="description" content="${escapeHtml(content.description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  
  <!-- Canonical & Hreflang -->
  <link rel="canonical" href="${canonicalUrl}" />
${hreflangTags}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${escapeHtml(content.title)}" />
  <meta property="og:description" content="${escapeHtml(content.description)}" />
  <meta property="og:image" content="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png" />
  <meta property="og:locale" content="${locale}" />
  <meta property="og:site_name" content="Everence Wealth" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${escapeHtml(content.title)}" />
  <meta name="twitter:description" content="${escapeHtml(content.description)}" />
  <meta name="twitter:image" content="https://assets.cdn.filesafe.space/htr97zzmRc1NMujHbL9R/media/69b7424c5b89c7c557adfe6e.png" />
  
  <!-- JSON-LD Schema -->
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;500;700&family=Raleway:wght@300;400;500;600&display=swap" rel="stylesheet" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
  <link rel="manifest" href="/site.webmanifest" />
  
  <!-- Production Assets -->
  ${cssLinks}
</head>
<body>
  <div id="root">
    <!-- Static content for SEO crawlers -->
    <main class="static-buyers-guide" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #6b7280;">
        <a href="/${lang}" style="color: inherit;">${escapeHtml(content.breadcrumbHome)}</a> › 
        <span style="color: #c9a227;">${escapeHtml(content.breadcrumbGuide)}</span>
      </nav>
      
      <header style="text-align: center; margin-bottom: 3rem;">
        <div style="display: inline-flex; gap: 0.5rem; margin-bottom: 1rem;">
          <span style="background: rgba(201, 162, 39, 0.1); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">8 Steps</span>
          <span style="background: rgba(201, 162, 39, 0.1); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">3-6 Months</span>
          <span style="background: rgba(201, 162, 39, 0.1); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">10 Languages</span>
        </div>
        <h1 style="font-family: 'Playfair Display', serif; font-size: 2.5rem; margin-bottom: 0.5rem;">${escapeHtml(content.h1)}</h1>
      </header>
      
      <!-- Speakable Introduction -->
      <section class="speakable-intro quick-answer" style="background: linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(201, 162, 39, 0.05)); border-left: 4px solid #c9a227; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 3rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
          <span style="background: #c9a227; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">Quick Answer</span>
        </div>
        <p style="font-size: 1.125rem; line-height: 1.75; color: #374151;">${escapeHtml(content.speakable)}</p>
      </section>
      
      <!-- 8-Step Process Summary -->
      <section style="margin-bottom: 3rem;">
        <h2 style="font-family: 'Playfair Display', serif; font-size: 1.75rem; margin-bottom: 1.5rem;">Step-by-Step Process</h2>
        <ol style="list-style-type: decimal; padding-left: 1.5rem;">
          ${BUYING_STEPS.map((step, i) => `<li id="step-${i + 1}" style="margin-bottom: 0.75rem; font-size: 1.125rem;">${escapeHtml(step.name)}</li>`).join('\n          ')}
        </ol>
      </section>
      
      <!-- FAQ Summary -->
      <section style="margin-bottom: 3rem;">
        <h2 style="font-family: 'Playfair Display', serif; font-size: 1.75rem; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        <dl>
          ${FAQ_ITEMS.map(faq => `
          <dt style="font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(faq.question)}</dt>
          <dd style="margin-bottom: 1.5rem; color: #4b5563;">${escapeHtml(faq.answer)}</dd>
          `).join('')}
        </dl>
      </section>
    </main>
  </div>
  ${jsScripts}
</body>
</html>`;
}

async function main() {
  const distDir = process.argv[2] || 'dist';
  console.log('📖 Generating static Buyers Guide pages...');
  console.log(`   Output directory: ${distDir}`);
  
  const productionAssets = getProductionAssets(distDir);
  console.log(`   Found ${productionAssets.css.length} CSS and ${productionAssets.js.length} JS assets`);
  
  let generated = 0;
  
  for (const lang of SUPPORTED_LANGUAGES) {
    const langDir = join(distDir, lang, 'buyers-guide');
    mkdirSync(langDir, { recursive: true });
    
    const html = generateStaticHTML(lang, productionAssets);
    const outputPath = join(langDir, 'index.html');
    writeFileSync(outputPath, html, 'utf-8');
    
    generated++;
    console.log(`   ✅ Generated: /${lang}/buyers-guide/index.html`);
  }
  
  console.log(`\n✅ Generated ${generated} static Buyers Guide pages`);
}

main().catch(console.error);
