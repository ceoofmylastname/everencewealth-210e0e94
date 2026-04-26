/**
 * Static Author Bio Page Generator (Fix 13 Phase 3)
 *
 * Emits 2 fully-rendered HTML files per author at /:lang/team/:slug
 * with:
 *   - Person + Breadcrumb + WebPage JSON-LD baked into <head>
 *   - Visible bio body (h1, photo, paragraphs, credentials, CTA) baked into
 *     <div id="root"> so crawlers and AI engines see the full content
 *     without executing JavaScript. React hydrates over the same markup
 *     for human visitors via the /:lang/team/:slug route in App.tsx.
 *
 * Slugs are explicitly mapped to author UUIDs — no DB-driven slug column
 * is needed for the founder-only Phase 3 launch.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import {
  BUSINESS,
  businessPostalAddress,
  businessAreaServed,
} from '../src/config/business';

const BASE_URL = 'https://www.everencewealth.com';
const COMPONENT_FILE = 'src/pages/TeamMember.tsx';
const PUBLISHED_DATE = '2025-01-01T00:00:00Z';
const REVIEW_FALLBACK = '2026-04-25T00:00:00Z';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: { headers: { 'x-client-info': 'static-build' } },
});

/** Phase 3 ships with Steven Rosenberg only. Add new entries here when more
 *  team-member bio pages are needed. */
const AUTHOR_SLUGS: Array<{ slug: string; authorId: string }> = [
  { slug: 'steven-rosenberg', authorId: '1a709766-817f-45b4-aea6-06f8e4fc8d6c' },
];

interface AuthorRecord {
  id: string;
  name: string;
  job_title: string | null;
  bio: string | null;
  bio_short: string | null;
  bio_full_markdown: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  credentials: string[] | null;
  years_experience: number | null;
}

interface ProductionAssets { css: string[]; js: string[] }

const COPY = {
  en: {
    breadcrumbHome: 'Home',
    breadcrumbTeam: 'Our Team',
    aboutHeading: 'About',
    credentialsHeading: 'Credentials',
    experienceLabel: (n: number) => `${n}+ years of experience`,
    ctaHeading: 'Schedule a free 30-minute consultation',
    ctaBody:
      'Talk through your retirement income, tax exposure, and asset protection with Steven directly. No sales pressure — just a clear look at whether the Everence Wealth approach fits your goals.',
    ctaButton: 'Book a consultation',
    linkedinLabel: 'LinkedIn profile',
    metaTitleSuffix: 'Everence Wealth',
  },
  es: {
    breadcrumbHome: 'Inicio',
    breadcrumbTeam: 'Nuestro Equipo',
    aboutHeading: 'Acerca de',
    credentialsHeading: 'Credenciales',
    experienceLabel: (n: number) => `${n}+ años de experiencia`,
    ctaHeading: 'Agende una consulta gratuita de 30 minutos',
    ctaBody:
      'Revise su ingreso de jubilación, exposición fiscal y protección de activos directamente con Steven. Sin presión de ventas — solo una evaluación clara de si el enfoque de Everence Wealth se ajusta a sus objetivos.',
    ctaButton: 'Reservar una consulta',
    linkedinLabel: 'Perfil de LinkedIn',
    metaTitleSuffix: 'Everence Wealth',
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

function renderParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function buildSchemas(
  author: AuthorRecord,
  slug: string,
  lang: 'en' | 'es',
  canonicalUrl: string,
  dateModified: string
) {
  const copy = COPY[lang];
  const description =
    author.bio_short || author.bio || `${author.name} at ${BUSINESS.name}.`;

  const personNode = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/#steven-rosenberg`,
    name: author.name,
    jobTitle: author.job_title || undefined,
    url: canonicalUrl,
    image: author.photo_url || undefined,
    description,
    worksFor: { '@id': `${BASE_URL}/#organization` },
    sameAs: author.linkedin_url ? [author.linkedin_url] : undefined,
    hasCredential: (author.credentials || []).map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'professional certification',
      name: c,
    })),
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': `${BASE_URL}/#organization`,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateName,
    url: BASE_URL,
    logo: BUSINESS.logo.url,
    address: businessPostalAddress(),
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    areaServed: businessAreaServed(),
    sameAs: [...BUSINESS.sameAs],
    foundingDate: BUSINESS.foundingDate,
    employee: [{ '@id': personNode['@id'] }],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${canonicalUrl}#webpage`,
    name: `${author.name} | ${author.job_title || copy.metaTitleSuffix}`,
    description,
    url: canonicalUrl,
    inLanguage: lang,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      name: 'Everence Wealth',
      url: BASE_URL,
    },
    mainEntity: { '@id': personNode['@id'] },
    about: { '@id': `${BASE_URL}/#organization` },
    datePublished: PUBLISHED_DATE,
    dateModified,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'article[data-author-id] section p'],
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: copy.breadcrumbHome, item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: copy.breadcrumbTeam, item: `${BASE_URL}/${lang}/team` },
      { '@type': 'ListItem', position: 3, name: author.name, item: canonicalUrl },
    ],
  };

  return [webPage, personNode, organization, breadcrumb];
}

function buildBodyHTML(
  author: AuthorRecord,
  slug: string,
  lang: 'en' | 'es'
): string {
  const copy = COPY[lang];
  const paragraphs = author.bio_full_markdown
    ? renderParagraphs(author.bio_full_markdown)
    : author.bio
      ? [author.bio]
      : [];
  const firstName = author.name.split(' ')[0] || author.name;

  const photoHTML = author.photo_url
    ? `<img src="${sanitizeForHTML(author.photo_url)}" alt="${sanitizeForHTML(author.name)}" width="176" height="176" style="width:11rem;height:11rem;border-radius:1rem;object-fit:cover;border:1px solid #e5e7eb;flex-shrink:0;" loading="eager" />`
    : '';

  const linkedinHTML = author.linkedin_url
    ? `<a href="${sanitizeForHTML(author.linkedin_url)}" target="_blank" rel="noopener noreferrer me" style="display:inline-block;margin-top:0.75rem;color:#d4a574;text-decoration:underline;font-size:0.875rem;">${copy.linkedinLabel}</a>`
    : '';

  const yearsHTML = author.years_experience
    ? `<p style="margin-top:0.25rem;font-size:0.875rem;color:#6b7280;">${copy.experienceLabel(author.years_experience)}</p>`
    : '';

  const paragraphsHTML = paragraphs
    .map(
      (p) =>
        `<p style="margin-bottom:1rem;line-height:1.7;color:#1f2937;">${sanitizeForHTML(p)}</p>`
    )
    .join('\n          ');

  const credentialsHTML =
    author.credentials && author.credentials.length > 0
      ? `<section style="margin-bottom:2.5rem;">
          <h2 style="font-size:1.5rem;font-weight:600;margin-bottom:1rem;">${copy.credentialsHeading}</h2>
          <ul style="list-style:none;padding:0;margin:0;">
            ${author.credentials
              .map(
                (c) =>
                  `<li style="display:flex;gap:0.5rem;margin-bottom:0.5rem;color:#1f2937;"><span style="color:#d4a574;">•</span><span>${sanitizeForHTML(c)}</span></li>`
              )
              .join('\n            ')}
          </ul>
        </section>`
      : '';

  return `<div class="min-h-screen bg-background">
    <main style="margin:0 auto;padding:1.5rem 1rem;max-width:64rem;">
      <article data-author-id="${author.id}" style="background:#ffffff;border-radius:1.5rem;padding:2rem;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
        <nav aria-label="Breadcrumb" style="font-size:0.875rem;color:#6b7280;margin-bottom:1.5rem;">
          <a href="/${lang}" style="color:inherit;">${copy.breadcrumbHome}</a>
          <span style="margin:0 0.5rem;">/</span>
          <a href="/${lang}/team" style="color:inherit;">${copy.breadcrumbTeam}</a>
          <span style="margin:0 0.5rem;">/</span>
          <span style="color:#111827;">${sanitizeForHTML(author.name)}</span>
        </nav>

        <header style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start;margin-bottom:2.5rem;">
          ${photoHTML}
          <div style="flex:1;min-width:240px;">
            <h1 style="font-size:2.25rem;font-weight:600;letter-spacing:-0.025em;margin:0;">${sanitizeForHTML(author.name)}</h1>
            ${author.job_title ? `<p style="margin-top:0.5rem;font-size:1.125rem;color:#6b7280;">${sanitizeForHTML(author.job_title)}</p>` : ''}
            ${yearsHTML}
            ${linkedinHTML}
          </div>
        </header>

        ${
          paragraphs.length > 0
            ? `<section style="margin-bottom:2.5rem;">
          <h2 style="font-size:1.5rem;font-weight:600;margin-bottom:1rem;">${copy.aboutHeading} ${sanitizeForHTML(firstName)}</h2>
          ${paragraphsHTML}
        </section>`
            : ''
        }

        ${credentialsHTML}

        <aside style="border-radius:1rem;background:#f9fafb;padding:1.5rem;border:1px solid #e5e7eb;">
          <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;">${copy.ctaHeading}</h2>
          <p style="color:#6b7280;margin-bottom:1rem;">${copy.ctaBody}</p>
          <a href="/${lang}/contact" style="display:inline-flex;align-items:center;justify-content:center;border-radius:0.5rem;background:#d4a574;color:#ffffff;padding:0.75rem 1.25rem;font-weight:500;text-decoration:none;">${copy.ctaButton}</a>
        </aside>
      </article>
    </main>
  </div>`;
}

function generateHTML(
  author: AuthorRecord,
  slug: string,
  lang: 'en' | 'es',
  assets: ProductionAssets
): string {
  const copy = COPY[lang];
  const canonicalUrl = `${BASE_URL}/${lang}/team/${slug}/`;
  const altLang = lang === 'en' ? 'es' : 'en';
  const altUrl = `${BASE_URL}/${altLang}/team/${slug}/`;
  const dateModified = gitLastModified(COMPONENT_FILE);

  const description =
    author.bio_short || author.bio || `${author.name} at ${BUSINESS.name}.`;
  const title = `${author.name} | ${author.job_title || copy.metaTitleSuffix}`;

  const schemas = buildSchemas(author, slug, lang, canonicalUrl, dateModified);
  const schemaScripts = schemas
    .map(
      (s) =>
        `<script type="application/ld+json" data-schema="team-member">${safeJsonForScript(s)}</script>`
    )
    .join('\n  ');

  const cssLinks = assets.css
    .map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join('\n  ');
  const jsScripts = assets.js
    .map((src) => `<script type="module" src="${src}"></script>`)
    .join('\n  ');
  const ogLocale = lang === 'es' ? 'es_US' : 'en_US';

  const bodyHTML = buildBodyHTML(author, slug, lang);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#d4a574" />
  <title>${sanitizeForHTML(title)}</title>
  <meta name="description" content="${sanitizeForHTML(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="en" href="${BASE_URL}/en/team/${slug}/" />
  <link rel="alternate" hreflang="es" href="${BASE_URL}/es/team/${slug}/" />
  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/team/${slug}/" />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${sanitizeForHTML(title)}" />
  <meta property="og:description" content="${sanitizeForHTML(description)}" />
  <meta property="og:site_name" content="Everence Wealth" />
  <meta property="og:locale" content="${ogLocale}" />
  ${author.photo_url ? `<meta property="og:image" content="${sanitizeForHTML(author.photo_url)}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${sanitizeForHTML(title)}" />
  <meta name="twitter:description" content="${sanitizeForHTML(description)}" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  ${schemaScripts}
  ${cssLinks}
</head>
<body>
  <div id="root">${bodyHTML}</div>
  ${jsScripts}
</body>
</html>`;
}

async function fetchAuthor(authorId: string): Promise<AuthorRecord | null> {
  const { data, error } = await supabase
    .from('authors')
    .select(
      'id, name, job_title, bio, bio_short, bio_full_markdown, photo_url, linkedin_url, credentials, years_experience'
    )
    .eq('id', authorId)
    .maybeSingle();
  if (error) {
    console.error(`❌ Author fetch failed for ${authorId}:`, error.message);
    return null;
  }
  return data as AuthorRecord | null;
}

export async function generateStaticAuthorBioPage(distDir: string = 'dist') {
  const assets = getProductionAssets(distDir);
  let generated = 0;

  for (const { slug, authorId } of AUTHOR_SLUGS) {
    const author = await fetchAuthor(authorId);
    if (!author) {
      console.error(`   ⚠️  Skipping ${slug} — author ${authorId} not found`);
      continue;
    }
    for (const lang of ['en', 'es'] as const) {
      const outPath = join(distDir, lang, 'team', slug, 'index.html');
      mkdirSync(join(outPath, '..'), { recursive: true });
      writeFileSync(outPath, generateHTML(author, slug, lang, assets), 'utf-8');
      console.log(`   ✅ ${outPath}`);
      generated++;
    }
  }

  console.log(`✅ Generated ${generated} author bio pages`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = process.argv[2] || 'dist';
  generateStaticAuthorBioPage(distDir).catch((err) => {
    console.error('❌ Author bio page generation failed:', err);
    process.exit(1);
  });
}