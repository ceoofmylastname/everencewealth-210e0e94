#!/bin/bash
# Build v2026.01.18 - Sitemap fix: always generate 42 child sitemaps
# Last deployment: 2026-01-02 10:02 - Generate static pages for new Q&As
set -euo pipefail
export VITE_SUPABASE_URL="https://zbzrmpmqijvmjbhctfoe.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienJtcG1xaWp2bWpiaGN0Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjk1MzUsImV4cCI6MjA4Njc0NTUzNX0.cI7HQmbY1XF_wmPMSm9ofbQdR3iujQ5_YNg8h_YLkVg"

# Build the React app (vite only — must NOT recurse into `npm run build`)
npm run build:app

# Generate production app-shell.html with correct asset paths
echo "📦 Generating production app-shell.html..."
npx tsx scripts/generateAppShell.ts dist

# IMPORTANT: Generate static HOMEPAGE FIRST (creates language-specific homepages)
# This creates dist/index.html + dist/{en,de,nl,fr,pl,sv,da,hu,fi,no}/index.html
echo "🏠 Generating static homepage (11 language versions)..."
npx tsx scripts/generateStaticHomePage.ts dist

# Generate static blog article pages
echo "📄 Generating static blog pages..."
npx tsx scripts/generateStaticPages.ts

# Generate static QA pages
echo "🔍 Generating static QA pages..."
npx tsx scripts/generateStaticQAPages.ts

# Generate static comparison pages
echo "⚖️ Generating static comparison pages..."
npx tsx scripts/generateStaticComparisonPages.ts

# Generate static location pages
echo "📍 Generating static location pages..."
npx tsx scripts/generateStaticLocationPages.ts

# Generate static location hub pages
echo "🌍 Generating static location hub pages..."
npx tsx scripts/generateStaticLocationHub.ts dist

# Generate static about page
echo "👤 Generating static about page..."
npx tsx scripts/generateStaticAboutPage.ts

# Generate static buyers guide pages
echo "📖 Generating static buyers guide pages..."
npx tsx scripts/generateStaticBuyersGuide.ts dist

# === SSR JSON-LD migration: bake schemas into pre-hydration HTML ===
# Lets ClaudeBot, GPTBot, PerplexityBot, Applebot-Extended, Google-Extended
# read JSON-LD without executing JavaScript.
echo "🎯 Generating static strategy pages (8 routes)..."
npx tsx scripts/generateStaticStrategyPages.ts dist

echo "📚 Generating static glossary index + term pages..."
npx tsx scripts/generateStaticGlossary.ts dist

echo "🏛️  Generating static informational pages (team, philosophy, contact × en/es)..."
npx tsx scripts/generateStaticInformationalPages.ts dist

echo "👤 Generating static author bio pages (EN + ES)..."
npx tsx scripts/generateStaticAuthorBioPage.ts dist

# Generate sitemap with all pages - OUTPUT TO dist/ for Cloudflare
echo "🗺️ Generating sitemap..."
npx tsx scripts/generateSitemap.ts dist

# Copy Cloudflare Pages Functions to dist directory
# This ensures Cloudflare Pages detects and deploys the middleware
echo "🔧 Setting up Cloudflare Pages Functions..."
if [ -d "functions" ]; then
  cp -r functions dist/functions
  echo "   ✅ Copied functions/ to dist/functions/"
else
  echo "   ⚠️ No functions/ directory found"
fi

echo "✅ Build complete with SSG!"
echo ""
echo "📋 SSG Summary:"
echo "   - Homepage: Static index.html with full H1, body, JSON-LD"
echo "   - Blog: Pre-rendered article pages"
echo "   - QA: Pre-rendered Q&A pages"
echo "   - Comparisons: Pre-rendered comparison pages"
echo "   - Locations: Pre-rendered location pages"
echo "   - About: Pre-rendered about page"
echo "   - Strategies: 8 SSR pages with WebPage+Article+Breadcrumb+FinancialService+Service+Speakable"
echo "   - Philosophy: EN+ES SSR pages with WebPage+Org+Breadcrumb+Speakable"
echo "   - Glossary: index + per-term SSR pages with DefinedTermSet/DefinedTerm"
echo "   - Team: EN+ES SSR pages with Org+Person+Breadcrumb"
echo "   - Author bios: EN+ES SSR bio pages with Person+ProfilePage+Org+Breadcrumb"