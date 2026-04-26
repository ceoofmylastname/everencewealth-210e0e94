/**
 * One-shot WebP conversion for article hero images.
 *
 * Lists every PNG/JPG in the `article-images` Supabase Storage bucket,
 * downloads each, converts to WebP via sharp (q=85), and uploads the
 * `<basename>.webp` sibling to the same path. Skips files that already
 * have a .webp sibling.
 *
 * Does NOT mutate `featured_image_url` — the renderer derives the .webp
 * URL on the fly via deriveWebpUrl() in src/components/OptimizedImage.tsx.
 *
 * Usage:
 *   npx tsx scripts/convertHerosToWebp.ts
 *
 * Required env (in .env or shell):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (write access to article-images bucket)
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'article-images';

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

interface StorageEntry {
  name: string;
  id: string | null;
  metadata?: { mimetype?: string; size?: number } | null;
}

async function listAll(prefix = ''): Promise<string[]> {
  const out: string[] = [];
  const stack: string[] = [prefix];
  while (stack.length) {
    const dir = stack.pop()!;
    let offset = 0;
    while (true) {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(dir, { limit: 1000, offset });
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const entry of data as StorageEntry[]) {
        const fullPath = dir ? `${dir}/${entry.name}` : entry.name;
        // Folders have id === null in Supabase Storage list output.
        if (entry.id === null) {
          stack.push(fullPath);
        } else {
          out.push(fullPath);
        }
      }
      if (data.length < 1000) break;
      offset += data.length;
    }
  }
  return out;
}

function isConvertible(path: string): boolean {
  return /\.(png|jpe?g)$/i.test(path);
}

function webpPath(path: string): string {
  return path.replace(/\.(png|jpe?g)$/i, '.webp');
}

async function convertOne(path: string, existing: Set<string>) {
  const target = webpPath(path);
  if (existing.has(target)) {
    return { path, status: 'skipped-exists' as const };
  }
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) {
    return { path, status: 'download-failed' as const, error: error?.message };
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  const webp = await sharp(buffer).webp({ quality: 85 }).toBuffer();
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(target, webp, {
      contentType: 'image/webp',
      upsert: false,
      cacheControl: '2592000',
    });
  if (upErr) {
    return { path, status: 'upload-failed' as const, error: upErr.message };
  }
  return {
    path,
    status: 'converted' as const,
    originalBytes: buffer.length,
    webpBytes: webp.length,
  };
}

async function main() {
  console.log(`📦 Listing ${BUCKET}…`);
  const all = await listAll();
  const existing = new Set(all);
  const candidates = all.filter(isConvertible);
  console.log(
    `🔍 ${all.length} total objects, ${candidates.length} convertible (.png/.jpg/.jpeg)`
  );

  let converted = 0;
  let skipped = 0;
  let failed = 0;
  let savedBytes = 0;

  for (const path of candidates) {
    const result = await convertOne(path, existing);
    if (result.status === 'converted') {
      converted++;
      savedBytes += (result.originalBytes ?? 0) - (result.webpBytes ?? 0);
      console.log(
        `  ✅ ${path} → ${webpPath(path)} (${result.originalBytes}→${result.webpBytes} bytes)`
      );
    } else if (result.status === 'skipped-exists') {
      skipped++;
    } else {
      failed++;
      console.error(`  ❌ ${path}: ${result.status} ${result.error ?? ''}`);
    }
  }

  console.log(`\n— Summary —`);
  console.log(`  Converted : ${converted}`);
  console.log(`  Skipped   : ${skipped} (already had .webp)`);
  console.log(`  Failed    : ${failed}`);
  console.log(`  Saved     : ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});