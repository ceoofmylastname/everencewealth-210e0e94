/**
 * GSC URL-List Triage Script
 * ==========================
 *
 * Ingests 6 GSC Page Indexing CSV exports from raw/ and emits 5 deterministic
 * triage outputs in outputs/. Does NOT mutate the database, sitemap, or call
 * any edge function. The user reviews outputs/triage_report.csv first, then
 * applies each output file manually.
 *
 * Usage:
 *   1. Drop these 6 files into raw/ (export from GSC > Indexing > Pages):
 *      - raw/gsc-2026-04-26-soft-404.csv
 *      - raw/gsc-2026-04-26-page-with-redirect.csv
 *      - raw/gsc-2026-04-26-duplicate-no-canonical.csv
 *      - raw/gsc-2026-04-26-not-found.csv
 *      - raw/gsc-2026-04-26-crawled-not-indexed.csv
 *      - raw/gsc-2026-04-26-discovered-not-indexed.csv
 *   2. Run: bun run scripts/gscTriageURLs.ts
 *   3. Inspect outputs/triage_report.csv before applying anything.
 *
 * Hard guard rails:
 *   - ADD_TO_GONE_URLS only fires when URL is NOT in all_published_slugs.
 *   - INDEXNOW_PUSH only includes URLs confirmed in all_published_slugs.
 *   - Re-running overwrites outputs/. Snapshot to outputs/<date>/ first if needed.
 */
import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ---------- Config ----------

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[gsc-triage] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in env. Aborting.');
  process.exit(1);
}

const RAW_DIR = 'raw';
const OUT_DIR = 'outputs';
const SOURCE_TAG = 'manual-gsc-triage-2026-04-26';
const GONE_REASON = 'gsc-soft-404-2026-04-26';
const BASE_URL = 'https://www.everencewealth.com';

type Category =
  | 'soft-404'
  | 'page-with-redirect'
  | 'duplicate-no-canonical'
  | 'not-found'
  | 'crawled-not-indexed'
  | 'discovered-not-indexed';

const CSV_FILES: { path: string; category: Category }[] = [
  { path: join(RAW_DIR, 'gsc-2026-04-26-soft-404.csv'),               category: 'soft-404' },
  { path: join(RAW_DIR, 'gsc-2026-04-26-page-with-redirect.csv'),     category: 'page-with-redirect' },
  { path: join(RAW_DIR, 'gsc-2026-04-26-duplicate-no-canonical.csv'), category: 'duplicate-no-canonical' },
  { path: join(RAW_DIR, 'gsc-2026-04-26-not-found.csv'),              category: 'not-found' },
  { path: join(RAW_DIR, 'gsc-2026-04-26-crawled-not-indexed.csv'),    category: 'crawled-not-indexed' },
  { path: join(RAW_DIR, 'gsc-2026-04-26-discovered-not-indexed.csv'), category: 'discovered-not-indexed' },
];

type Action =
  | 'ADD_TO_GONE_URLS'
  | 'REMOVE_FROM_SITEMAP'
  | 'FIX_CANONICAL'
  | 'CONTENT_QUALITY_REVIEW'
  | 'INDEXNOW_PUSH'
  | 'IGNORE';

interface TriageRow {
  url: string;
  category: Category;
  action: Action;
  reason: string;
}

// ---------- Path matchers ----------

const CONTENT_PATH_REGEX_ONE =
  /^https:\/\/www\.everencewealth\.com\/(en|es)\/(blog|qa|compare|comparisons|comparar|estrategias|strategies|guides|glossary|state-guides)\/[^\/]+\/?$/;
const CONTENT_PATH_REGEX_TWO =
  /^https:\/\/www\.everencewealth\.com\/(en|es)\/(locations|ubicaciones)\/[^\/]+\/[^\/]+\/?$/;

const STATE_ABBR =
  '(ca|tx|fl|ny|wa|or|ga|nc|sc|az|nv|co|il|pa|oh|mi|nj|md|va|mn|ma|wi|in|mo|tn|al|la|ky|ok|ar|ms|ut|ks|nm|nh|me|hi|id|ne|wv|ri|mt|de|sd|nd|ak|vt|wy)';
const COMMA_LEGACY_REGEX = new RegExp(`,-${STATE_ABBR}\\b`, 'i');

function isContentPath(url: string): boolean {
  return CONTENT_PATH_REGEX_ONE.test(url) || CONTENT_PATH_REGEX_TWO.test(url);
}

function urlPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

// ---------- DB helpers (with cache to avoid N round trips) ----------

const publishedCache = new Map<string, boolean>();

async function existsInPublished(supabase: SupabaseClient, path: string): Promise<boolean> {
  if (publishedCache.has(path)) return publishedCache.get(path)!;

  // Try the path as-is, with trailing slash, and without trailing slash.
  // all_published_slugs paths are stored with trailing slash (verified during plan phase).
  const candidates = [path];
  if (path.endsWith('/')) {
    candidates.push(path.slice(0, -1));
  } else {
    candidates.push(path + '/');
  }

  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from('all_published_slugs')
      .select('full_path')
      .eq('full_path', candidate)
      .maybeSingle();
    if (error) {
      console.warn(`[gsc-triage] published lookup error for ${candidate}: ${error.message}`);
      continue;
    }
    if (data) {
      publishedCache.set(path, true);
      return true;
    }
  }

  publishedCache.set(path, false);
  return false;
}

// ---------- Decision tree ----------

async function decide(
  supabase: SupabaseClient,
  category: Category,
  url: string,
): Promise<{ action: Action; reason: string }> {
  const path = urlPath(url);

  switch (category) {
    case 'soft-404': {
      if (isContentPath(url)) {
        const exists = await existsInPublished(supabase, path);
        if (!exists) {
          return { action: 'ADD_TO_GONE_URLS', reason: 'soft-404 + content-path + not-published' };
        }
      }
      return { action: 'CONTENT_QUALITY_REVIEW', reason: 'soft-404 + non-content-path or still-published' };
    }

    case 'page-with-redirect': {
      if (path.includes(',') || COMMA_LEGACY_REGEX.test(path)) {
        return {
          action: 'REMOVE_FROM_SITEMAP',
          reason: 'comma-legacy slug from pre-PROMPT-10 migration',
        };
      }
      return {
        action: 'FIX_CANONICAL',
        reason: 'redirect chain — manual canonical inspection needed',
      };
    }

    case 'duplicate-no-canonical': {
      return {
        action: 'FIX_CANONICAL',
        reason: 'duplicate detected — manual canonical inspection',
      };
    }

    case 'not-found': {
      const exists = await existsInPublished(supabase, path);
      if (!exists) {
        return { action: 'ADD_TO_GONE_URLS', reason: '404 + slug not in published surface' };
      }
      return { action: 'FIX_CANONICAL', reason: '404 but slug exists — likely path malformation' };
    }

    case 'crawled-not-indexed':
      return {
        action: 'CONTENT_QUALITY_REVIEW',
        reason: 'Google quality signal — content team review',
      };

    case 'discovered-not-indexed': {
      const exists = await existsInPublished(supabase, path);
      if (exists) {
        return { action: 'INDEXNOW_PUSH', reason: 'in published surface — IndexNow accelerates discovery' };
      }
      return {
        action: 'CONTENT_QUALITY_REVIEW',
        reason: 'discovered but not in all_published_slugs — investigate before pinging',
      };
    }

    default:
      return { action: 'IGNORE', reason: `unknown category: ${category}` };
  }
}

// ---------- CSV I/O ----------

function parseCsv(filePath: string): string[] {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  // GSC export: first row is "URL,..." header. Strip it.
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (i === 0 && /^url\b/i.test(line)) continue; // skip header
    // First column is the URL. Handle two formats:
    //   1. "https://...with,commas/" , "Last crawled"   <- quoted (RFC 4180)
    //   2. https://.../path/,2026-04-20                  <- unquoted; commas in URL are
    //      legal per RFC 3986 but rare. GSC exports state-comma slugs unquoted, e.g.
    //      https://www.everencewealth.com/en/locations/los-angeles,-ca/iul/,2026-04-20
    //   We split on the LAST comma whose suffix looks like a date/timestamp; if no
    //   such suffix, take the whole line as the URL.
    let url: string;
    if (line.startsWith('"')) {
      // RFC 4180 quoted: take everything up to the matching close-quote.
      const close = line.indexOf('"', 1);
      url = close > 0 ? line.slice(1, close) : line.slice(1);
    } else {
      // Unquoted: trim trailing ",YYYY-MM-DD..." columns if present.
      const dateTrailMatch = line.match(/,\d{4}-\d{2}-\d{2}.*$/);
      url = dateTrailMatch ? line.slice(0, dateTrailMatch.index) : line;
    }
    url = url.trim();
    if (!url) continue;
    if (!url.startsWith('http')) continue; // skip stray rows
    out.push(url);
  }
  return out;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function rowsToCsv(rows: TriageRow[]): string {
  const header = 'url,category,action,reason\n';
  const body = rows
    .map((r) => [r.url, r.category, r.action, r.reason].map(csvEscape).join(','))
    .join('\n');
  return header + body + '\n';
}

// ---------- Main ----------

async function main() {
  // Pre-flight: every CSV must exist
  const missing = CSV_FILES.filter((f) => !existsSync(f.path));
  if (missing.length > 0) {
    console.error('[gsc-triage] Missing required CSVs in raw/:');
    for (const m of missing) console.error(`  - ${m.path}`);
    console.error('\nExport each from GSC > Indexing > Pages > <reason row> > Export, then re-run.');
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
    global: { headers: { 'x-client-info': 'gsc-triage' } },
  });

  const allRows: TriageRow[] = [];

  for (const { path, category } of CSV_FILES) {
    const urls = parseCsv(path);
    console.log(`[gsc-triage] ${category}: parsed ${urls.length} URLs from ${path}`);
    for (const url of urls) {
      const { action, reason } = await decide(supabase, category, url);
      allRows.push({ url, category, action, reason });
    }
  }

  // ---------- Sort & write outputs ----------

  allRows.sort((a, b) => {
    if (a.action !== b.action) return a.action.localeCompare(b.action);
    return a.category.localeCompare(b.category);
  });

  // 1. Full triage report
  writeFileSync(join(OUT_DIR, 'triage_report.csv'), rowsToCsv(allRows));

  // 2. SQL for gone_urls inserts
  const goneRows = allRows.filter((r) => r.action === 'ADD_TO_GONE_URLS');
  const sqlLines: string[] = [];
  sqlLines.push('-- GSC triage 2026-04-26.');
  sqlLines.push('-- Review outputs/triage_report.csv before running.');
  sqlLines.push('-- Adds rows to gone_urls so the PROMPT 17 catchall returns 410 instead of 404.');
  sqlLines.push('-- Schema verified: (url_path, reason, marked_gone_at). pattern_match defaults false.');
  sqlLines.push('');
  if (goneRows.length === 0) {
    sqlLines.push('-- No URLs qualified for gone_urls insertion.');
  } else {
    sqlLines.push('INSERT INTO public.gone_urls (url_path, reason, marked_gone_at) VALUES');
    const values = goneRows.map((r, i) => {
      const path = urlPath(r.url).replace(/'/g, "''");
      const reason = GONE_REASON.replace(/'/g, "''");
      const sep = i === goneRows.length - 1 ? '' : ',';
      return `  ('${path}', '${reason}', NOW())${sep}`;
    });
    sqlLines.push(...values);
    sqlLines.push('ON CONFLICT (url_path) DO NOTHING;');
  }
  sqlLines.push('');
  writeFileSync(join(OUT_DIR, 'triage_add_to_gone_urls.sql'), sqlLines.join('\n'));

  // 3. Sitemap blocklist
  const blocklistRows = allRows.filter((r) => r.action === 'REMOVE_FROM_SITEMAP');
  const blocklistLines: string[] = [];
  blocklistLines.push('# GSC triage 2026-04-26 — sitemap blocklist');
  blocklistLines.push('# Feed these paths into a Set used by scripts/generateSitemap.ts to filter URLs.');
  blocklistLines.push('# Then regenerate the sitemap and redeploy.');
  blocklistLines.push('# Format: one path per line. Lines starting with # are comments.');
  blocklistLines.push('');
  if (blocklistRows.length === 0) {
    blocklistLines.push('# No URLs qualified for sitemap removal.');
  } else {
    for (const r of blocklistRows) blocklistLines.push(urlPath(r.url));
  }
  blocklistLines.push('');
  writeFileSync(join(OUT_DIR, 'triage_remove_from_sitemap.txt'), blocklistLines.join('\n'));

  // 4. IndexNow push payload
  const indexnowRows = allRows.filter((r) => r.action === 'INDEXNOW_PUSH');
  // Defense in depth: re-validate every URL is in the published surface.
  const validatedUrls: string[] = [];
  for (const r of indexnowRows) {
    const path = urlPath(r.url);
    const ok = await existsInPublished(supabase, path);
    if (ok) {
      validatedUrls.push(`${BASE_URL}${path.endsWith('/') ? path : path + '/'}`);
    } else {
      // Demote to manual review
      r.action = 'CONTENT_QUALITY_REVIEW';
      r.reason = 'discovered-not-indexed but not confirmed in all_published_slugs at push time';
    }
  }
  const indexnowPayload = { urls: validatedUrls, source: SOURCE_TAG };
  writeFileSync(
    join(OUT_DIR, 'triage_indexnow_push.json'),
    JSON.stringify(indexnowPayload, null, 2) + '\n',
  );

  // 5. Manual review (FIX_CANONICAL + CONTENT_QUALITY_REVIEW after demotions)
  const manualRows = allRows.filter(
    (r) => r.action === 'FIX_CANONICAL' || r.action === 'CONTENT_QUALITY_REVIEW',
  );
  writeFileSync(join(OUT_DIR, 'triage_manual_review.csv'), rowsToCsv(manualRows));

  // ---------- Summary ----------

  const counts: Record<Action, number> = {
    ADD_TO_GONE_URLS: 0,
    REMOVE_FROM_SITEMAP: 0,
    FIX_CANONICAL: 0,
    CONTENT_QUALITY_REVIEW: 0,
    INDEXNOW_PUSH: 0,
    IGNORE: 0,
  };
  for (const r of allRows) counts[r.action]++;

  console.log('');
  console.log('=========================================');
  console.log(`Total URLs processed: ${allRows.length}`);
  console.log('Action distribution:');
  console.log(`  ADD_TO_GONE_URLS:        ${counts.ADD_TO_GONE_URLS}`);
  console.log(`  REMOVE_FROM_SITEMAP:     ${counts.REMOVE_FROM_SITEMAP}`);
  console.log(`  FIX_CANONICAL:           ${counts.FIX_CANONICAL}`);
  console.log(`  CONTENT_QUALITY_REVIEW:  ${counts.CONTENT_QUALITY_REVIEW}`);
  console.log(`  INDEXNOW_PUSH:           ${counts.INDEXNOW_PUSH} (validated: ${validatedUrls.length})`);
  console.log(`  IGNORE:                  ${counts.IGNORE}`);
  console.log('');
  console.log('Output files written to outputs/ (5 files):');
  console.log('  - triage_report.csv             (review this FIRST)');
  console.log('  - triage_add_to_gone_urls.sql   (run with psql after review)');
  console.log('  - triage_remove_from_sitemap.txt (wire into scripts/generateSitemap.ts blocklist)');
  console.log('  - triage_indexnow_push.json     (POST to ping-indexnow with admin auth)');
  console.log('  - triage_manual_review.csv      (hand to content/SEO)');
  console.log('');
  console.log('Apply order (after reviewing triage_report.csv):');
  console.log('  1. psql "$SUPABASE_DB_URL" < outputs/triage_add_to_gone_urls.sql');
  console.log('  2. wire blocklist into scripts/generateSitemap.ts, regenerate, redeploy');
  console.log('  3. curl -X POST -H "Authorization: Bearer $SUPABASE_ANON_KEY" \\');
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       --data @outputs/triage_indexnow_push.json \\');
  console.log(`       ${SUPABASE_URL}/functions/v1/ping-indexnow`);
  console.log('  4. hand triage_manual_review.csv to content/SEO');
  console.log('  5. wait 14 days, re-screenshot GSC');
  console.log('');
  console.log('To snapshot this run: cp -r outputs/ outputs/2026-04-26/  before applying.');
  console.log('=========================================');
}

main().catch((err) => {
  console.error('[gsc-triage] fatal:', err);
  process.exit(1);
});