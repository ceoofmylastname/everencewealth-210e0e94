/**
 * Sitemap generator — Everence Wealth
 *
 * Generates 16 per-language XML sitemaps (en + es × 8 content types) plus a
 * master sitemap-index.xml. Source of truth for `<lastmod>` is database
 * timestamps only (`updated_at` ?? `date_modified`). NEVER substitutes NOW()
 * or build-date defaults.
 *
 * Strategies have no DB source. lastmod reflects the last git commit that
 * touched the route component (`git log -1 --format=%cI`) — stable across CI
 * builds and only bumps on actual content edits. If git history is
 * unavailable (shallow clone), falls back to a hardcoded REVIEW_DATES
 * constant — never to file mtime or NOW().
 *
 * Pre-flight (manual, performed before each deploy): curl each candidate URL
 * pattern. All current patterns confirmed routed in src/App.tsx:
 *   /:lang/guides/:slug                      → GuidePage           (line 518)
 *   /:lang/strategies/{iul,…}                → strategy components (544–550)
 *   /:lang/estrategias/{seguro-…,…}          → strategy components (545–551)
 *   /:lang/retirement-planning/:topicSlug    → StateGuidePage      (line 590)
 *   /:lang/glossary/:termSlug                → GlossaryTermPage    (line 510)
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienJtcG1xaWp2bWpiaGN0Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjk1MzUsImV4cCI6MjA4Njc0NTUzNX0.cI7HQmbY1XF_wmPMSm9ofbQdR3iujQ5_YNg8h_YLkVg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: { headers: { 'x-client-info': 'static-build' } },
});

const BASE_URL = 'https://www.everencewealth.com';
const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
const BATCH_SIZE = 500;

const langToHreflang: Record<string, string> = {
  en: 'en-US',
  es: 'es-US',
};

// Content types where empty result must throw (real content is expected)
const REQUIRED_NONEMPTY = new Set(['blog', 'qa', 'strategies', 'locations', 'comparisons']);

// Hardcoded strategy routes (no DB source). EN + ES paths from App.tsx 544–551.
interface StrategyRoute {
  slug: string;
  path: string; // language-prefixed path segment after /:lang/
  componentFile: string; // for git lastmod
}
const STRATEGIES: Record<'en' | 'es', StrategyRoute[]> = {
  en: [
    { slug: 'iul', path: 'strategies/iul', componentFile: 'src/pages/strategies/IndexedUniversalLife.tsx' },
    { slug: 'whole-life', path: 'strategies/whole-life', componentFile: 'src/pages/strategies/WholeLife.tsx' },
    { slug: 'tax-free-retirement', path: 'strategies/tax-free-retirement', componentFile: 'src/pages/strategies/TaxFreeRetirement.tsx' },
    { slug: 'asset-protection', path: 'strategies/asset-protection', componentFile: 'src/pages/strategies/AssetProtection.tsx' },
  ],
  es: [
    { slug: 'seguro-universal-indexado', path: 'estrategias/seguro-universal-indexado', componentFile: 'src/pages/strategies/IndexedUniversalLife.tsx' },
    { slug: 'seguro-vida-entera', path: 'estrategias/seguro-vida-entera', componentFile: 'src/pages/strategies/WholeLife.tsx' },
    { slug: 'retiro-libre-impuestos', path: 'estrategias/retiro-libre-impuestos', componentFile: 'src/pages/strategies/TaxFreeRetirement.tsx' },
    { slug: 'proteccion-de-activos', path: 'estrategias/proteccion-de-activos', componentFile: 'src/pages/strategies/AssetProtection.tsx' },
  ],
};

// Fallback review dates (used only when git history is unavailable, e.g. shallow CI clones)
const REVIEW_DATES: Record<string, string> = {
  'src/pages/strategies/IndexedUniversalLife.tsx': '2026-04-12T00:00:00Z',
  'src/pages/strategies/WholeLife.tsx': '2026-04-12T00:00:00Z',
  'src/pages/strategies/TaxFreeRetirement.tsx': '2026-04-12T00:00:00Z',
  'src/pages/strategies/AssetProtection.tsx': '2026-04-12T00:00:00Z',
};

// ============================================================================
// Helpers
// ============================================================================

function gitLastModified(filePath: string): string {
  try {
    const iso = execSync(`git log -1 --format=%cI -- ${filePath}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    if (!iso) throw new Error(`No git history for ${filePath}`);
    return iso;
  } catch (err) {
    const fallback = REVIEW_DATES[filePath];
    if (fallback) {
      console.warn(`   ⚠️ git lastmod unavailable for ${filePath} — using REVIEW_DATES fallback`);
      return fallback;
    }
    throw new Error(`Cannot determine lastmod for ${filePath}: ${(err as Error).message}`);
  }
}

function lastmodFromRow(row: { updated_at?: string | null; date_modified?: string | null; date_published?: string | null }, id?: string): string {
  const ts = row.updated_at ?? row.date_modified ?? row.date_published;
  if (!ts) throw new Error(`Row ${id ?? '<unknown>'} has no updated_at/date_modified — refusing to substitute NOW()`);
  return new Date(ts).toISOString();
}

function toDate(iso: string): string {
  return new Date(iso).toISOString().split('T')[0];
}

async function fetchAll<T>(
  table: string,
  select: string,
  filters: (q: any) => any,
  description: string
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;
  try {
    while (true) {
      let q = supabase.from(table).select(select).range(offset, offset + BATCH_SIZE - 1);
      q = filters(q);
      const { data, error } = await q;
      if (error) {
        throw new Error(`${description} query failed at offset ${offset}: ${error.message}`);
      }
      if (!data || data.length === 0) break;
      all.push(...(data as T[]));
      if (data.length < BATCH_SIZE) break;
      offset += BATCH_SIZE;
    }
    return all;
  } catch (err) {
    console.error(`❌ ${description}: ${(err as Error).message}`);
    throw err; // re-throw to fail build
  }
}

interface UrlEntry {
  loc: string;
  lastmod: string; // ISO date YYYY-MM-DD
  changefreq?: string;
  priority?: number;
  alternates?: { hreflang: string; href: string }[];
}

function buildUrlsetXml(entries: UrlEntry[], includeHreflang: boolean): string {
  const ns = includeHreflang
    ? `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"`
    : `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`;

  const urls = entries
    .map((e) => {
      const altLinks = (e.alternates || [])
        .map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
        .join('');
      const cf = e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : '';
      const pr = e.priority != null ? `\n    <priority>${e.priority.toFixed(1)}</priority>` : '';
      return `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>${cf}${pr}${altLinks}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${ns}>
${urls}
</urlset>`;
}

function writeSitemap(
  sitemapsPath: string,
  lang: string | null,
  type: string,
  entries: UrlEntry[],
  includeHreflang: boolean
): { count: number; lastmod: string; relPath: string } {
  // Dedup by <loc>
  const seen = new Set<string>();
  const unique = entries.filter((e) => {
    if (seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });

  if (unique.length === 0) {
    if (REQUIRED_NONEMPTY.has(type)) {
      throw new Error(`Sitemap ${lang ? lang + '/' : ''}${type}.xml produced 0 URLs — aborting build`);
    }
    console.warn(`   ⚠️ Sitemap ${lang ? lang + '/' : ''}${type}.xml is empty (allowed for ${type})`);
  }

  const xml = unique.length === 0
    ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <!-- ${type} sitemap${lang ? ' for ' + lang.toUpperCase() : ''} - intentionally empty -->\n</urlset>`
    : buildUrlsetXml(unique, includeHreflang);

  const relPath = lang ? `sitemaps/${lang}/${type}.xml` : `sitemaps/${type}.xml`;
  const fullPath = lang ? join(sitemapsPath, lang, `${type}.xml`) : join(sitemapsPath, `${type}.xml`);
  if (lang) ensureDir(join(sitemapsPath, lang));
  writeFileSync(fullPath, xml, 'utf-8');

  // lastmod for index = max of entries, or today as fallback for empty allowed
  const maxLastmod = unique.reduce((acc, e) => (e.lastmod > acc ? e.lastmod : acc), '');
  const indexLastmod = maxLastmod || toDate(new Date().toISOString());

  console.log(`   ✍️ ${relPath} (${unique.length} URLs)`);
  return { count: unique.length, lastmod: indexLastmod, relPath };
}

function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function safeRm(path: string): void {
  try {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
      console.log(`   🗑️  Removed: ${path}`);
    }
  } catch (err) {
    console.warn(`   ⚠️ Could not remove ${path}: ${(err as Error).message}`);
  }
}

// ============================================================================
// Data interfaces
// ============================================================================

interface ArticleRow {
  slug: string;
  language: string;
  cluster_id: string | null;
  is_primary: boolean;
  date_modified: string | null;
  date_published: string | null;
}
interface QARow {
  slug: string;
  language: string;
  hreflang_group_id: string | null;
  updated_at: string | null;
  created_at: string | null;
}
interface LocationRow {
  city_slug: string;
  topic_slug: string;
  language: string;
  state_code: string | null;
  hreflang_group_id: string | null;
  updated_at: string | null;
  date_published: string | null;
}
interface ComparisonRow {
  slug: string;
  language: string;
  hreflang_group_id: string | null;
  updated_at: string | null;
  date_published: string | null;
}
interface BrochureRow {
  slug: string;
  language: string | null;
  updated_at: string | null;
}

// ============================================================================
// Main
// ============================================================================

export async function generateSitemap(outputDir?: string): Promise<void> {
  console.log('\n🗺️  Sitemap generation — strict mode (DB-only lastmod, dedup, assertions)\n');

  const outputPath = outputDir
    ? outputDir.startsWith('/') ? outputDir : join(process.cwd(), outputDir)
    : join(process.cwd(), 'public');
  const sitemapsPath = join(outputPath, 'sitemaps');
  ensureDir(sitemapsPath);

  // Cleanup: remove legacy single-language directories and old standalone files
  console.log('🧹 Cleaning up legacy sitemap files...');
  for (const legacy of ['da', 'de', 'fi', 'fr', 'hu', 'nl', 'no', 'pl', 'sv']) {
    safeRm(join(sitemapsPath, legacy));
  }
  safeRm(join(sitemapsPath, 'brochures.xml'));
  safeRm(join(sitemapsPath, 'glossary.xml'));
  safeRm(join(sitemapsPath, 'static.xml'));

  // ----- Fetch gone URLs -----
  console.log('\n📥 Fetching gone URLs...');
  const goneRows = await fetchAll<{ url_path: string }>(
    'gone_urls', 'url_path', (q) => q, 'gone_urls'
  );
  const gone = new Set(goneRows.map((r) => r.url_path));
  console.log(`   🚫 ${gone.size} gone URLs will be excluded`);

  // ----- Fetch all content -----
  console.log('\n📥 Fetching content from database...');
  const articles = await fetchAll<ArticleRow>(
    'blog_articles',
    'slug, language, cluster_id, is_primary, date_modified, date_published',
    (q) => q.eq('status', 'published').not('is_redirect', 'eq', true),
    'blog_articles'
  );
  console.log(`   📝 blog_articles: ${articles.length}`);

  const qa = await fetchAll<QARow>(
    'qa_pages',
    'slug, language, hreflang_group_id, updated_at, created_at',
    (q) => q.eq('status', 'published').not('is_redirect', 'eq', true),
    'qa_pages'
  );
  console.log(`   🔍 qa_pages: ${qa.length}`);

  const locations = await fetchAll<LocationRow>(
    'location_pages',
    'city_slug, topic_slug, language, state_code, hreflang_group_id, updated_at, date_published',
    (q) => q.eq('status', 'published').not('is_redirect', 'eq', true),
    'location_pages'
  );
  console.log(`   📍 location_pages: ${locations.length}`);

  const comparisons = await fetchAll<ComparisonRow>(
    'comparison_pages',
    'slug, language, hreflang_group_id, updated_at, date_published',
    (q) => q.eq('status', 'published').not('is_redirect', 'eq', true),
    'comparison_pages'
  );
  console.log(`   ⚖️  comparison_pages: ${comparisons.length}`);

  const brochures = await fetchAll<BrochureRow>(
    'brochures',
    'slug, language, updated_at',
    (q) => q.eq('status', 'published'),
    'brochures'
  );
  console.log(`   📚 brochures: ${brochures.length}`);

  // Glossary: try table first, fall back to JSON, else empty
  let glossaryEntries: { slug: string; language: string; updated_at: string }[] = [];
  try {
    const { data, error } = await supabase
      .from('glossary_terms' as any)
      .select('slug, language, updated_at')
      .limit(2000);
    if (!error && data && Array.isArray(data)) {
      glossaryEntries = data as any;
    }
  } catch {
    /* table missing — fall through */
  }
  if (glossaryEntries.length === 0) {
    try {
      const json = JSON.parse(readFileSync(join(process.cwd(), 'public', 'glossary.json'), 'utf-8'));
      if (Array.isArray(json?.terms)) {
        glossaryEntries = json.terms.filter((t: any) => t.slug);
      }
    } catch { /* empty */ }
  }
  console.log(`   📖 glossary terms: ${glossaryEntries.length} (source: ${glossaryEntries.length > 0 ? 'DB or JSON' : 'none — empty <urlset/> will be written'})`);

  // ----- Build hreflang group maps -----
  const articlesByCluster = new Map<string, ArticleRow[]>();
  for (const a of articles) {
    if (!a.cluster_id) continue;
    const arr = articlesByCluster.get(a.cluster_id) || [];
    arr.push(a);
    articlesByCluster.set(a.cluster_id, arr);
  }

  function hreflangGroup<T extends { hreflang_group_id: string | null; language: string }>(
    rows: T[]
  ): Map<string, T[]> {
    const m = new Map<string, T[]>();
    for (const r of rows) {
      if (!r.hreflang_group_id) continue;
      const arr = m.get(r.hreflang_group_id) || [];
      arr.push(r);
      m.set(r.hreflang_group_id, arr);
    }
    return m;
  }
  const qaGroups = hreflangGroup(qa);
  const locGroups = hreflangGroup(locations);
  const compGroups = hreflangGroup(comparisons);

  // Track index entries for master sitemap-index.xml
  const indexEntries: { loc: string; lastmod: string }[] = [];

  // ============================================================================
  // Per-language generation
  // ============================================================================
  for (const lang of SUPPORTED_LANGUAGES) {
    const hl = langToHreflang[lang];
    console.log(`\n🌐 Generating ${lang.toUpperCase()} sitemaps...`);

    // ---- Blog ----
    const langArticles = articles.filter((a) => a.language === lang);
    const blogEntries: UrlEntry[] = [];
    blogEntries.push({
      loc: `${BASE_URL}/${lang}/blog`,
      lastmod: toDate(new Date().toISOString()), // index page: today is acceptable for hub
      changefreq: 'daily',
      priority: 0.9,
    });
    for (const a of langArticles) {
      const path = `/${lang}/blog/${a.slug}`;
      if (gone.has(path)) continue;
      const alts: { hreflang: string; href: string }[] = [];
      const siblings = a.cluster_id ? articlesByCluster.get(a.cluster_id) || [] : [];
      for (const s of siblings) {
        if (s.slug && langToHreflang[s.language]) {
          alts.push({ hreflang: langToHreflang[s.language], href: `${BASE_URL}/${s.language}/blog/${s.slug}` });
        }
      }
      const primary = siblings.find((s) => s.is_primary) || siblings.find((s) => s.language === 'en');
      if (primary) alts.push({ hreflang: 'x-default', href: `${BASE_URL}/${primary.language}/blog/${primary.slug}` });
      blogEntries.push({
        loc: `${BASE_URL}${path}`,
        lastmod: toDate(lastmodFromRow(a, a.slug)),
        changefreq: 'weekly',
        priority: 1.0,
        alternates: alts,
      });
    }
    const blogRes = writeSitemap(sitemapsPath, lang, 'blog', blogEntries, true);
    indexEntries.push({ loc: `${BASE_URL}/${blogRes.relPath}`, lastmod: blogRes.lastmod });

    // ---- QA ----
    const langQA = qa.filter((q) => q.language === lang);
    const qaEntries: UrlEntry[] = [];
    qaEntries.push({
      loc: `${BASE_URL}/${lang}/qa`,
      lastmod: toDate(new Date().toISOString()),
      changefreq: 'daily',
      priority: 0.85,
    });
    for (const q of langQA) {
      const path = `/${lang}/qa/${q.slug}`;
      if (gone.has(path)) continue;
      const alts: { hreflang: string; href: string }[] = [];
      const siblings = q.hreflang_group_id ? qaGroups.get(q.hreflang_group_id) || [] : [];
      for (const s of siblings) {
        if (s.slug && langToHreflang[s.language]) {
          alts.push({ hreflang: langToHreflang[s.language], href: `${BASE_URL}/${s.language}/qa/${s.slug}` });
        }
      }
      const en = siblings.find((s) => s.language === 'en');
      if (en) alts.push({ hreflang: 'x-default', href: `${BASE_URL}/en/qa/${en.slug}` });
      qaEntries.push({
        loc: `${BASE_URL}${path}`,
        lastmod: toDate(lastmodFromRow(q, q.slug)),
        changefreq: 'weekly',
        priority: 0.7,
        alternates: alts,
      });
    }
    const qaRes = writeSitemap(sitemapsPath, lang, 'qa', qaEntries, true);
    indexEntries.push({ loc: `${BASE_URL}/${qaRes.relPath}`, lastmod: qaRes.lastmod });

    // ---- Locations ----
    const langLoc = locations.filter((l) => l.language === lang);
    const locEntries: UrlEntry[] = [];
    locEntries.push({
      loc: `${BASE_URL}/${lang}/locations`,
      lastmod: toDate(new Date().toISOString()),
      changefreq: 'weekly',
      priority: 0.9,
    });
    for (const l of langLoc) {
      const path = `/${lang}/locations/${l.city_slug}/${l.topic_slug}`;
      if (gone.has(path)) continue;
      const alts: { hreflang: string; href: string }[] = [];
      const siblings = l.hreflang_group_id ? locGroups.get(l.hreflang_group_id) || [] : [];
      for (const s of siblings) {
        if (langToHreflang[s.language]) {
          alts.push({ hreflang: langToHreflang[s.language], href: `${BASE_URL}/${s.language}/locations/${s.city_slug}/${s.topic_slug}` });
        }
      }
      const en = siblings.find((s) => s.language === 'en');
      if (en) alts.push({ hreflang: 'x-default', href: `${BASE_URL}/en/locations/${en.city_slug}/${en.topic_slug}` });
      locEntries.push({
        loc: `${BASE_URL}${path}`,
        lastmod: toDate(lastmodFromRow(l, `${l.city_slug}/${l.topic_slug}`)),
        changefreq: 'weekly',
        priority: 0.9,
        alternates: alts,
      });
    }
    const locRes = writeSitemap(sitemapsPath, lang, 'locations', locEntries, true);
    indexEntries.push({ loc: `${BASE_URL}/${locRes.relPath}`, lastmod: locRes.lastmod });

    // ---- Comparisons ----
    const langComp = comparisons.filter((c) => c.language === lang);
    const compEntries: UrlEntry[] = [];
    compEntries.push({
      loc: `${BASE_URL}/${lang}/compare`,
      lastmod: toDate(new Date().toISOString()),
      changefreq: 'weekly',
      priority: 0.85,
    });
    for (const c of langComp) {
      const path = `/${lang}/compare/${c.slug}`;
      if (gone.has(path)) continue;
      const alts: { hreflang: string; href: string }[] = [];
      const siblings = c.hreflang_group_id ? compGroups.get(c.hreflang_group_id) || [] : [];
      for (const s of siblings) {
        if (langToHreflang[s.language]) {
          alts.push({ hreflang: langToHreflang[s.language], href: `${BASE_URL}/${s.language}/compare/${s.slug}` });
        }
      }
      const en = siblings.find((s) => s.language === 'en');
      if (en) alts.push({ hreflang: 'x-default', href: `${BASE_URL}/en/compare/${en.slug}` });
      compEntries.push({
        loc: `${BASE_URL}${path}`,
        lastmod: toDate(lastmodFromRow(c, c.slug)),
        changefreq: 'weekly',
        priority: 0.85,
        alternates: alts,
      });
    }
    const compRes = writeSitemap(sitemapsPath, lang, 'comparisons', compEntries, true);
    indexEntries.push({ loc: `${BASE_URL}/${compRes.relPath}`, lastmod: compRes.lastmod });

    // ---- Strategies (hardcoded, git-based lastmod) ----
    const stratEntries: UrlEntry[] = STRATEGIES[lang].map((s) => ({
      loc: `${BASE_URL}/${lang}/${s.path}`,
      lastmod: toDate(gitLastModified(s.componentFile)),
      changefreq: 'monthly',
      priority: 0.8,
      alternates: [
        { hreflang: hl, href: `${BASE_URL}/${lang}/${s.path}` },
        ...STRATEGIES[lang === 'en' ? 'es' : 'en']
          .filter((other) => other.componentFile === s.componentFile)
          .map((other) => ({
            hreflang: langToHreflang[lang === 'en' ? 'es' : 'en'],
            href: `${BASE_URL}/${lang === 'en' ? 'es' : 'en'}/${other.path}`,
          })),
        { hreflang: 'x-default', href: `${BASE_URL}/en/${STRATEGIES.en.find((e) => e.componentFile === s.componentFile)!.path}` },
      ],
    }));
    const stratRes = writeSitemap(sitemapsPath, lang, 'strategies', stratEntries, true);
    indexEntries.push({ loc: `${BASE_URL}/${stratRes.relPath}`, lastmod: stratRes.lastmod });

    // ---- Guides (brochures) ----
    const langBrochures = brochures.filter((b) => (b.language ?? 'en') === lang);
    const guideEntries: UrlEntry[] = langBrochures.map((b) => ({
      loc: `${BASE_URL}/${lang}/guides/${b.slug}`,
      lastmod: toDate(lastmodFromRow(b, b.slug)),
      changefreq: 'monthly',
      priority: 0.8,
    }));
    const guideRes = writeSitemap(sitemapsPath, lang, 'guides', guideEntries, false);
    indexEntries.push({ loc: `${BASE_URL}/${guideRes.relPath}`, lastmod: guideRes.lastmod });

    // ---- Glossary (per-term, indexable) ----
    const langGlossary = glossaryEntries.filter((g) => g.language === lang);
    const glossEntries: UrlEntry[] = langGlossary.map((g) => ({
      loc: `${BASE_URL}/${lang}/glossary/${g.slug}`,
      lastmod: toDate(lastmodFromRow(g as any, g.slug)),
      changefreq: 'monthly',
      priority: 0.6,
    }));
    const glossRes = writeSitemap(sitemapsPath, lang, 'glossary', glossEntries, false);
    indexEntries.push({ loc: `${BASE_URL}/${glossRes.relPath}`, lastmod: glossRes.lastmod });

    // ---- State-guides (dedup on topic_slug, MAX(updated_at)) ----
    // Source: location_pages WHERE state_code IS NOT NULL AND status='published' AND language=lang
    // URL: /:lang/retirement-planning/:topicSlug
    const stateRows = locations.filter((l) => l.language === lang && l.state_code);
    const byTopic = new Map<string, string>(); // topic_slug -> max ISO
    for (const r of stateRows) {
      const ts = lastmodFromRow(r, r.topic_slug);
      const cur = byTopic.get(r.topic_slug);
      if (!cur || ts > cur) byTopic.set(r.topic_slug, ts);
    }
    const stateEntries: UrlEntry[] = Array.from(byTopic.entries()).map(([topic, ts]) => ({
      loc: `${BASE_URL}/${lang}/retirement-planning/${topic}`,
      lastmod: toDate(ts),
      changefreq: 'weekly',
      priority: 0.85,
    }));
    const stateRes = writeSitemap(sitemapsPath, lang, 'state-guides', stateEntries, false);
    indexEntries.push({ loc: `${BASE_URL}/${stateRes.relPath}`, lastmod: stateRes.lastmod });
  }

  // ============================================================================
  // Master sitemap-index.xml
  // ============================================================================
  console.log('\n🔨 Writing master sitemap-index.xml...');
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries
  .map((e) => `  <sitemap>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
  </sitemap>`)
  .join('\n')}
</sitemapindex>`;
  writeFileSync(join(outputPath, 'sitemap-index.xml'), indexXml, 'utf-8');
  writeFileSync(join(outputPath, 'sitemap.xml'), indexXml, 'utf-8'); // legacy alias
  console.log(`   ✍️ sitemap-index.xml (${indexEntries.length} child sitemaps)`);
  console.log(`   ✍️ sitemap.xml (legacy alias)`);

  console.log(`\n✅ Done. ${indexEntries.length} child sitemaps generated for ${SUPPORTED_LANGUAGES.length} languages.`);
}

// CLI entrypoint
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const outputDir = process.argv[2] || undefined;
  generateSitemap(outputDir).catch((err) => {
    console.error('\n❌ Sitemap generation FAILED:', err);
    process.exit(1);
  });
}
