/**
 * Build-time guard for the IndexNow key file.
 *
 * Checks that `public/` contains exactly one file matching
 * `[0-9a-f]{64}.txt` whose contents (trimmed) equal its basename
 * (sans .txt). This file is the public IndexNow ownership proof —
 * it must match the INDEXNOW_KEY secret used by the edge function.
 *
 * The script does NOT require the secret. It only validates
 * file/filename consistency. Secret-vs-file alignment is verified
 * at runtime by IndexNow's keyLocation check.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const KEY_PATTERN = /^([0-9a-f]{64})\.txt$/;

function fail(msg: string): never {
  console.error(`\n[indexnow-key-assert] FAIL: ${msg}\n`);
  process.exit(1);
}

const matches = readdirSync(PUBLIC_DIR).filter((f) => KEY_PATTERN.test(f));

if (matches.length === 0) {
  fail(
    'No IndexNow key file found in public/. ' +
    'Expected one file named <64-hex>.txt matching the INDEXNOW_KEY secret.',
  );
}

if (matches.length > 1) {
  fail(
    `Multiple IndexNow key files in public/: ${matches.join(', ')}. ` +
    'Only one is allowed; remove the stale ones.',
  );
}

const filename = matches[0];
const expectedKey = filename.replace(/\.txt$/, '');
const contents = readFileSync(join(PUBLIC_DIR, filename), 'utf8').trim();

if (contents !== expectedKey) {
  fail(
    `File ${filename} contents do not match its name. ` +
    `Expected body to equal "${expectedKey}" (length ${expectedKey.length}), ` +
    `got "${contents.slice(0, 16)}..." (length ${contents.length}).`,
  );
}

console.log(`[indexnow-key-assert] OK — ${filename} (key length ${expectedKey.length})`);
