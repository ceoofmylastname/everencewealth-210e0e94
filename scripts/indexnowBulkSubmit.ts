/**
 * One-shot bulk IndexNow submission.
 *
 * Pulls every published URL from `public.all_published_slugs` (DB)
 * + glossary URLs from `public/glossary.json` (file), batches into
 * chunks of 10000, and POSTs each chunk to the deployed
 * `ping-indexnow` edge function with source='manual-bulk'.
 *
 * Run after a major content shift or to re-warm IndexNow after
 * the trigger pipeline goes live.
 *
 * Usage:
 *   bun run scripts/indexnowBulkSubmit.ts
 *
 * Env required:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY  (anon, used for read + invoke)
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? 'https://zbzrmpmqijvmjbhctfoe.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const BASE_URL = 'https://www.everencewealth.com';
const BATCH_SIZE = 10000;

if (!ANON_KEY) {
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function fetchAllPublishedPaths(): Promise<string[]> {
  // Paginate through all_published_slugs view (1000 row PostgREST limit)
  const all: string[] = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('all_published_slugs')
      .select('full_path')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`all_published_slugs read failed: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...data.map((r: { full_path: string }) => r.full_path));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

function loadGlossaryPaths(): string[] {
  const path = join(process.cwd(), 'public', 'glossary.json');
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    console.warn('[bulk] public/glossary.json not readable, skipping glossary URLs');
    return [];
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    console.warn('[bulk] glossary.json invalid JSON, skipping');
    return [];
  }

  // Glossary file is currently a stub with no `terms` array. Try a few
  // shapes; emit nothing if no entries are found (build-time graceful).
  const candidates: string[] = [];
  const obj = json as Record<string, unknown>;
  const terms = (obj?.terms ?? obj?.entries) as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(terms)) {
    for (const t of terms) {
      const slug = (t.slug ?? t.term_slug ?? t.id) as string | undefined;
      if (typeof slug === 'string' && slug.length > 0) {
        candidates.push(`/en/glossary/${slug}/`);
        candidates.push(`/es/glossary/${slug}/`);
      }
    }
  }
  return candidates;
}

async function pingBatch(urls: string[]): Promise<void> {
  const url = `${SUPABASE_URL}/functions/v1/ping-indexnow`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ urls, source: 'manual-bulk' }),
  });
  const body = await res.text();
  console.log(`  -> HTTP ${res.status} (batch of ${urls.length})`);
  if (!res.ok) console.log(`     body: ${body.slice(0, 300)}`);
}

async function main() {
  console.log('[bulk] fetching paths from all_published_slugs view...');
  const dbPaths = await fetchAllPublishedPaths();
  console.log(`[bulk]   ${dbPaths.length} from DB`);

  const glossaryPaths = loadGlossaryPaths();
  console.log(`[bulk]   ${glossaryPaths.length} from glossary.json`);

  const allPaths = Array.from(new Set([...dbPaths, ...glossaryPaths]));
  const allUrls = allPaths.map((p) => `${BASE_URL}${p}`);
  console.log(`[bulk] total unique URLs: ${allUrls.length}`);

  for (let i = 0; i < allUrls.length; i += BATCH_SIZE) {
    const chunk = allUrls.slice(i, i + BATCH_SIZE);
    console.log(`[bulk] submitting batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} URLs)`);
    await pingBatch(chunk);
  }

  console.log('[bulk] done.');
}

main().catch((e) => {
  console.error('[bulk] FATAL:', e);
  process.exit(1);
});
