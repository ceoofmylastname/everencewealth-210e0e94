#!/usr/bin/env tsx
/**
 * scripts/bulkBuildClusters.ts
 *
 * Sequentially generate content clusters from a JSON manifest by invoking
 * the existing `generate-cluster` edge function. Polls cluster_generations
 * until both EN and ES are completed (auto-translate pipeline produces ES).
 *
 * Usage:
 *   npx tsx scripts/bulkBuildClusters.ts --manifest manifests/everencewealth-75-cluster-manifest.json
 *   npx tsx scripts/bulkBuildClusters.ts --manifest <path> --dry-run --limit=5
 *   npx tsx scripts/bulkBuildClusters.ts --manifest <path> --start-from=20 --force
 *
 * Required env vars on operator's machine:
 *   VITE_SUPABASE_URL                — public URL (also in .env)
 *   SUPABASE_SERVICE_ROLE_KEY        — service-role key (NOT the anon key)
 *
 * The CLI runs strictly sequential. ~5-6 min per cluster (EN ~2-3 + ES ~2-3
 * + 10s gap). 75 clusters ≈ 6.5-7.5 hours.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

// Use an untyped client so this script doesn't depend on the auto-generated
// Database types (the new flagged_articles table won't be in them until the
// next type sync).
type AnyClient = ReturnType<typeof createClient>;

// ---------- Constants (mirror the manifest contract) ----------

const MONEY_PAGE_WHITELIST = new Set([
  "/en/strategies/iul",
  "/en/strategies/whole-life",
  "/en/strategies/tax-free-retirement",
  "/en/strategies/asset-protection",
  "/en/strategies/",
  "/en/buyers-guide/",
  "/contracting/intake",
]);

const COMPLIANCE_CLASSES = new Set([
  "wealth_standard",
  "recruiting_no_income_claims",
]);

const FIDUCIARY_BLOCK = /\bfiduciar/i;

const INCOME_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\$\s?\d[\d,.]*\s*(per|a|each|every)?\s*(year|month|week|hour|day|annually|annual)/i, label: "dollar_per_period" },
  { pattern: /\bearn(ing|s|ed)?\s+\$\s?\d/i, label: "earn_dollars" },
  { pattern: /\bincome\s+(potential|of\s+\$|up\s+to|range)/i, label: "income_phrasing" },
  { pattern: /\bmak(e|ing)\s+(money|\$\s?\d)/i, label: "make_money" },
  { pattern: /\b(salary|commission|compensation)\s+(range|of\s+\$|up\s+to|structure\s+example)/i, label: "salary_commission_range" },
  { pattern: /\b(average|typical|median)\s+(compensation|earnings|income|salary)/i, label: "average_compensation" },
  { pattern: /\btop[-\s]?(earner|earning|paid|paying)\b/i, label: "top_earner" },
  { pattern: /\b(highest|best)[-\s]?(paid|paying)\b/i, label: "best_paying" },
  { pattern: /\b\$\s?\d[\d,.]*\s*(k|m|million|grand)\b/i, label: "dollar_shorthand" },
];

const POLL_INTERVAL_MS = 15_000;
const TIMEOUT_MS = 30 * 60 * 1000;
const INTER_CLUSTER_GAP_MS = 10_000;

// ---------- Types ----------

type ComplianceClass = "wealth_standard" | "recruiting_no_income_claims";

interface ManifestEntry {
  id: number;
  name: string;
  topic: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetAudience: string;
  searchIntent: string;
  moneyPageTarget: string;
  compliance_class: ComplianceClass;
  tofu_titles: string[];
  mofu_titles: string[];
  bofu_title: string;
  internal_link_anchors: string[];
  language: "en";
  skip_by_default: boolean;
  skip_reason?: string;
}

interface Manifest {
  manifest_version: string;
  total_count: number;
  clusters: ManifestEntry[];
}

interface ReportRow {
  id: number;
  name: string;
  jobId: string | null;
  status: "built" | "skipped" | "failed" | "timeout" | "flagged";
  durationSec: number;
  flaggedCount?: number;
  error?: string;
  resumeFrom?: number;
}

// ---------- CLI flag parsing ----------

interface Flags {
  manifest: string;
  dryRun: boolean;
  limit?: number;
  startFrom?: number;
  force: boolean;
  debug: boolean;
  report: string;
}

function parseFlags(argv: string[]): Flags {
  const f: Flags = {
    manifest: "",
    dryRun: false,
    force: false,
    debug: false,
    report: "cluster-generation-report.json",
  };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--manifest=")) f.manifest = arg.slice("--manifest=".length);
    else if (arg === "--manifest") {
      const idx = argv.indexOf("--manifest");
      f.manifest = argv[idx + 1] ?? "";
    }
    else if (arg === "--dry-run") f.dryRun = true;
    else if (arg.startsWith("--limit=")) f.limit = Number(arg.slice("--limit=".length));
    else if (arg.startsWith("--start-from=")) f.startFrom = Number(arg.slice("--start-from=".length));
    else if (arg === "--force") f.force = true;
    else if (arg === "--debug") f.debug = true;
    else if (arg.startsWith("--report=")) f.report = arg.slice("--report=".length);
  }
  if (!f.manifest) {
    console.error("Missing required flag: --manifest <path>");
    process.exit(2);
  }
  return f;
}

// ---------- Validation ----------

function validateEntry(e: ManifestEntry): string | null {
  if (e.language !== "en") return `language must be 'en' (got '${e.language}')`;
  if (!MONEY_PAGE_WHITELIST.has(e.moneyPageTarget)) {
    return `moneyPageTarget '${e.moneyPageTarget}' not in whitelist`;
  }
  if (!COMPLIANCE_CLASSES.has(e.compliance_class)) {
    return `compliance_class '${e.compliance_class}' not allowed`;
  }
  // Pre-flight fiduciary block (matches DB enforce_fiduciary_term_block trigger)
  const blob = [
    e.name, e.topic, e.primaryKeyword, ...e.secondaryKeywords,
    ...e.tofu_titles, ...e.mofu_titles, e.bofu_title,
    ...e.internal_link_anchors,
  ].join(" | ");
  if (FIDUCIARY_BLOCK.test(blob)) {
    return `fiduciary stem detected — blocked by compliance trigger`;
  }
  return null;
}

// ---------- Dedupe ----------

function normTheme(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

async function buildDedupeIndex(supabase: AnyClient) {
  const themes = new Set<string>();
  const topics = new Set<string>();
  const primaryKws = new Set<string>();

  // Existing cluster_themes from blog_articles
  const { data: articles } = await supabase
    .from("blog_articles")
    .select("cluster_theme")
    .not("cluster_theme", "is", null);
  for (const r of (articles ?? []) as { cluster_theme: string }[]) {
    if (r.cluster_theme) themes.add(normTheme(r.cluster_theme));
  }

  // Completed cluster_generations
  const { data: gens } = await supabase
    .from("cluster_generations")
    .select("topic, primary_keyword")
    .eq("status", "completed");
  for (const r of (gens ?? []) as { topic: string; primary_keyword: string }[]) {
    if (r.topic) topics.add(normTheme(r.topic));
    if (r.primary_keyword) primaryKws.add(normTheme(r.primary_keyword));
  }

  return { themes, topics, primaryKws };
}

function isDuplicate(
  e: ManifestEntry,
  idx: { themes: Set<string>; topics: Set<string>; primaryKws: Set<string> },
): { dup: boolean; matched?: string } {
  const candidates = [normTheme(e.name), normTheme(e.topic), normTheme(e.primaryKeyword)];
  for (const ex of idx.themes) {
    for (const c of candidates) {
      if (c && (c === ex || c.includes(ex) || ex.includes(c))) {
        return { dup: true, matched: `cluster_theme:${ex}` };
      }
    }
  }
  for (const c of candidates) {
    if (c && (idx.topics.has(c) || idx.primaryKws.has(c))) {
      return { dup: true, matched: `cluster_generations:${c}` };
    }
  }
  return { dup: false };
}

// ---------- Edge function calls ----------

async function invokeGenerateCluster(
  supabase: AnyClient,
  e: ManifestEntry,
): Promise<{ jobId: string | null; error?: string }> {
  const { data, error } = await supabase.functions.invoke("generate-cluster", {
    body: {
      topic: e.topic,
      language: "en",
      target_audience: e.targetAudience,
      primary_keyword: e.primaryKeyword,
    },
  });
  if (error) return { jobId: null, error: error.message ?? String(error) };
  const jobId = (data as { jobId?: string; job_id?: string })?.jobId
    ?? (data as { jobId?: string; job_id?: string })?.job_id
    ?? null;
  return { jobId };
}

async function killJob(supabase: AnyClient, jobId: string): Promise<void> {
  try {
    await supabase.functions.invoke("kill-cluster-job", { body: { jobId } });
  } catch (err) {
    console.warn(`  ⚠️  kill-cluster-job failed for ${jobId}:`, err);
  }
}

interface JobStatusRow {
  status: string | null;
  completed_languages: string[] | null;
  error: string | null;
  is_multilingual: boolean | null;
}

async function pollUntilDone(
  supabase: AnyClient,
  jobId: string,
  startedAt: number,
  debug: boolean,
): Promise<{ ok: true } | { ok: false; reason: "failed" | "timeout"; error?: string }> {
  while (true) {
    const elapsed = Date.now() - startedAt;
    if (elapsed > TIMEOUT_MS) {
      await killJob(supabase, jobId);
      return { ok: false, reason: "timeout", error: `>${TIMEOUT_MS / 60000}min` };
    }
    const { data, error } = await supabase
      .from("cluster_generations")
      .select("status, completed_languages, error, is_multilingual")
      .eq("id", jobId)
      .maybeSingle();
    if (error) {
      if (debug) console.warn("  poll error:", error.message);
    } else {
      const row = data as JobStatusRow | null;
      if (row) {
        if (debug) {
          const elapsedMin = Math.round((elapsed / 60000) * 10) / 10;
          console.log(`  [${elapsedMin}m] status=${row.status} completed=${JSON.stringify(row.completed_languages ?? [])}`);
        }
        if (row.status === "failed") {
          return { ok: false, reason: "failed", error: row.error ?? "unknown" };
        }
        if (row.status === "completed") {
          const langs = row.completed_languages ?? [];
          const hasEn = langs.includes("en");
          const hasEs = langs.includes("es");
          // If multilingual job, require both EN and ES; otherwise EN is enough.
          if (row.is_multilingual === false || (hasEn && hasEs)) {
            return { ok: true };
          }
          if (hasEn && !row.is_multilingual) {
            return { ok: true };
          }
          // Otherwise keep polling — translate-cluster still running
        }
      }
    }
    await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));
  }
}

// ---------- Compliance scan (recruiting only) ----------

interface FlagHit {
  articleId: string;
  pattern: string;
  excerpt: string;
}

function scanText(text: string): { pattern: string; excerpt: string } | null {
  for (const { pattern, label } of INCOME_PATTERNS) {
    const m = text.match(pattern);
    if (m && typeof m.index === "number") {
      const start = Math.max(0, m.index - 60);
      const end = Math.min(text.length, m.index + m[0].length + 60);
      return { pattern: label, excerpt: text.slice(start, end).replace(/\s+/g, " ").trim() };
    }
  }
  return null;
}

async function scanRecruitingCluster(
  supabase: AnyClient,
  jobId: string,
  complianceClass: ComplianceClass,
): Promise<number> {
  const { data: arts } = await supabase
    .from("blog_articles")
    .select("id, headline, meta_title, meta_description, speakable_answer, detailed_content, status")
    .eq("cluster_id", jobId);

  let flagged = 0;
  for (const a of (arts ?? []) as Array<{
    id: string; headline?: string | null; meta_title?: string | null;
    meta_description?: string | null; speakable_answer?: string | null;
    detailed_content?: string | null; status: string;
  }>) {
    const fields = [a.headline, a.meta_title, a.meta_description, a.speakable_answer, a.detailed_content];
    let hit: { pattern: string; excerpt: string } | null = null;
    for (const t of fields) {
      if (typeof t === "string" && t.length) {
        const h = scanText(t);
        if (h) { hit = h; break; }
      }
    }
    if (!hit) continue;

    // Flip to draft
    await supabase
      .from("blog_articles")
      .update({ status: "draft" })
      .eq("id", a.id);

    // Insert flag (unique constraint on (article_id, reason))
    await supabase.from("flagged_articles" as never).upsert(
      {
        article_id: a.id,
        reason: "income_claim_detected",
        matched_pattern: hit.pattern,
        matched_excerpt: hit.excerpt,
        cluster_generation_id: jobId,
        compliance_class: complianceClass,
        status: "pending_review",
      } as never,
      { onConflict: "article_id,reason" },
    );
    flagged++;
  }
  return flagged;
}

// ---------- Main ----------

async function main() {
  const flags = parseFlags(process.argv);

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL) {
    console.error("Missing env var: VITE_SUPABASE_URL");
    process.exit(2);
  }
  if (!SERVICE_KEY) {
    console.error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");
    console.error("This CLI requires service-role access to poll private rows and write flagged_articles.");
    console.error("Anon key is not sufficient.");
    process.exit(2);
  }

  const manifestPath = path.resolve(flags.manifest);
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(2);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
  if (!Array.isArray(manifest.clusters)) {
    console.error("Manifest missing 'clusters' array");
    process.exit(2);
  }

  console.log(`📋 Manifest: ${manifest.manifest_version} (${manifest.clusters.length} entries)`);

  // Per-entry validation
  const validationErrors: { id: number; name: string; reason: string }[] = [];
  for (const e of manifest.clusters) {
    const err = validateEntry(e);
    if (err) validationErrors.push({ id: e.id, name: e.name, reason: err });
  }
  if (validationErrors.length) {
    console.error(`❌ ${validationErrors.length} validation errors. Aborting (no edge calls made).`);
    for (const e of validationErrors) console.error(`  ID ${e.id} (${e.name}): ${e.reason}`);
    process.exit(1);
  }
  console.log("✅ All entries pass validation.");

  // Filter range
  let entries = manifest.clusters.slice();
  if (flags.startFrom !== undefined) {
    entries = entries.filter((e) => e.id >= flags.startFrom!);
  }
  if (flags.limit !== undefined) {
    entries = entries.slice(0, flags.limit);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  console.log("🔎 Building dedupe index from production data...");
  const dedupeIdx = await buildDedupeIndex(supabase);
  console.log(`   ${dedupeIdx.themes.size} themes / ${dedupeIdx.topics.size} topics / ${dedupeIdx.primaryKws.size} primary keywords`);

  // Pre-pass: classify each entry
  const plan: Array<{ entry: ManifestEntry; action: "build" | "skip"; skipReason?: string }> = [];
  for (const e of entries) {
    const prod = isDuplicate(e, dedupeIdx);
    const skipManifest = e.skip_by_default && !flags.force;
    const skipProd = prod.dup && !flags.force;
    if (skipManifest || skipProd) {
      const reason = skipManifest
        ? `manifest skip_by_default${e.skip_reason ? `: ${e.skip_reason}` : ""}`
        : `prod overlap (${prod.matched})`;
      plan.push({ entry: e, action: "skip", skipReason: reason });
    } else {
      plan.push({ entry: e, action: "build" });
    }
  }

  const buildCount = plan.filter((p) => p.action === "build").length;
  const skipCount = plan.filter((p) => p.action === "skip").length;

  console.log(`\n📊 Plan: ${buildCount} to build, ${skipCount} to skip`);

  if (flags.dryRun) {
    console.log("\n🟡 DRY RUN — printing plan, no edge calls made.\n");
    for (const p of plan) {
      const tag = p.action === "build" ? "🟢 BUILD" : "⏭️  SKIP ";
      console.log(`${tag} #${p.entry.id.toString().padStart(2)} ${p.entry.name}`);
      console.log(`         topic: ${p.entry.topic}`);
      console.log(`         money: ${p.entry.moneyPageTarget}`);
      console.log(`         class: ${p.entry.compliance_class}`);
      if (p.skipReason) console.log(`         reason: ${p.skipReason}`);
    }
    process.exit(0);
  }

  // ---------- Live execution ----------
  const report: ReportRow[] = [];
  const startedAtRun = Date.now();
  let builtCount = 0, failedCount = 0, flaggedTotal = 0;

  for (let i = 0; i < plan.length; i++) {
    const { entry: e, action, skipReason } = plan[i];
    const human = `${i + 1}/${plan.length}`;

    if (action === "skip") {
      console.log(`⏭️  [${human}] Skip #${e.id} "${e.name}" — ${skipReason}`);
      report.push({ id: e.id, name: e.name, jobId: null, status: "skipped", durationSec: 0, error: skipReason });
      continue;
    }

    console.log(`\n🚀 [${human}] Build #${e.id} "${e.name}"`);
    console.log(`     topic="${e.topic}" | audience="${e.targetAudience}" | class=${e.compliance_class}`);

    const startedAt = Date.now();
    const inv = await invokeGenerateCluster(supabase, e);
    if (!inv.jobId) {
      const msg = inv.error ?? "no jobId returned";
      console.error(`  ❌ generate-cluster invoke failed: ${msg}`);
      report.push({ id: e.id, name: e.name, jobId: null, status: "failed", durationSec: 0, error: msg, resumeFrom: e.id });
      failedCount++;
      continue;
    }
    console.log(`  jobId: ${inv.jobId}`);

    const result = await pollUntilDone(supabase, inv.jobId, startedAt, flags.debug);
    const durationSec = Math.round((Date.now() - startedAt) / 1000);

    if (!result.ok) {
      const failResult = result; // narrow
      console.error(`  ❌ ${failResult.reason} after ${durationSec}s${failResult.error ? `: ${failResult.error}` : ""}`);
      report.push({ id: e.id, name: e.name, jobId: inv.jobId, status: failResult.reason === "timeout" ? "timeout" : "failed", durationSec, error: failResult.error, resumeFrom: e.id });
      failedCount++;
      // Continue to next cluster after gap
      await new Promise((res) => setTimeout(res, INTER_CLUSTER_GAP_MS));
      continue;
    }

    let flaggedCount = 0;
    if (e.compliance_class === "recruiting_no_income_claims") {
      console.log("  🔍 Compliance scan (recruiting)...");
      flaggedCount = await scanRecruitingCluster(supabase, inv.jobId, e.compliance_class);
      flaggedTotal += flaggedCount;
      if (flaggedCount > 0) {
        console.log(`  🚩 Flagged ${flaggedCount} article(s) for compliance review`);
      } else {
        console.log("  ✅ No income-claim hits");
      }
    }

    console.log(`  ✅ Built in ${durationSec}s${flaggedCount ? ` (🚩 ${flaggedCount} flagged)` : ""}`);
    report.push({ id: e.id, name: e.name, jobId: inv.jobId, status: flaggedCount > 0 ? "flagged" : "built", durationSec, flaggedCount });
    builtCount++;

    // Inter-cluster gap
    if (i < plan.length - 1) {
      await new Promise((res) => setTimeout(res, INTER_CLUSTER_GAP_MS));
    }
  }

  // ---------- Write report ----------
  const reportPath = path.resolve(flags.report);
  fs.writeFileSync(reportPath, JSON.stringify({
    started_at: new Date(startedAtRun).toISOString(),
    completed_at: new Date().toISOString(),
    manifest: flags.manifest,
    summary: { built: builtCount, skipped: skipCount, failed: failedCount, flagged: flaggedTotal },
    rows: report,
  }, null, 2));

  const totalSec = Math.round((Date.now() - startedAtRun) / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);

  console.log("\n=========================");
  console.log("Bulk build complete");
  console.log("=========================");
  console.log(`Built:    ${builtCount}`);
  console.log(`Skipped:  ${skipCount}`);
  console.log(`Failed:   ${failedCount}`);
  console.log(`Flagged:  ${flaggedTotal}`);
  console.log(`Total:    ${h}h ${m}m`);
  console.log(`Report:   ${reportPath}`);
  if (failedCount > 0) {
    const firstFailed = report.find((r) => r.status === "failed" || r.status === "timeout");
    if (firstFailed) {
      console.log(`\nResume from first failure: --start-from=${firstFailed.id}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
