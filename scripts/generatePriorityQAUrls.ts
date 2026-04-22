import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — aborted');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: { headers: { 'x-client-info': 'static-build' } }
});

const BASE_URL = 'https://www.everencewealth.com';
const LANGUAGES = ['en', 'es'];
const URLS_PER_LANG = 100;
const BATCH_SIZE = 200;

async function fetchAllForLanguage(lang: string): Promise<string[]> {
  const slugs: string[] = [];
  let from = 0;

  while (slugs.length < URLS_PER_LANG) {
    const { data, error } = await supabase
      .from('qa_pages')
      .select('slug')
      .eq('language', lang)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, from + BATCH_SIZE - 1);

    if (error || !data || data.length === 0) break;

    slugs.push(...data.map(d => d.slug));
    from += BATCH_SIZE;
    if (data.length < BATCH_SIZE) break;
  }

  return slugs.slice(0, URLS_PER_LANG);
}

async function main() {
  console.log(`📋 Generating priority Q&A URL list (${URLS_PER_LANG} per language)...\n`);

  const lines: string[] = [];
  let totalCount = 0;

  for (const lang of LANGUAGES) {
    const slugs = await fetchAllForLanguage(lang);
    console.log(`  ${lang.toUpperCase()}: ${slugs.length} URLs`);

    lines.push(`# ${lang.toUpperCase()} - ${slugs.length} URLs`);
    for (const slug of slugs) {
      lines.push(`${BASE_URL}/${lang}/qa/${slug}`);
    }
    lines.push('');
    totalCount += slugs.length;
  }

  const outputPath = join(process.cwd(), 'public', 'priority-qa-urls.txt');
  writeFileSync(outputPath, lines.join('\n'), 'utf-8');

  console.log(`\n✅ Written ${totalCount} URLs to ${outputPath}`);
}

main().catch(console.error);
