#!/bin/bash
export VITE_SUPABASE_URL="https://kazggnufaoicopvmwhdl.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthemdnbnVmYW9pY29wdm13aGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzM0ODEsImV4cCI6MjA3NjEwOTQ4MX0.acQwC_xPXFXvOwwn7IATeg6OwQ2HWlu52x76iqUdhB4"

# Build the React app
npm run build

# Generate static blog article pages
echo "📄 Generating static blog pages..."
npx tsx scripts/generateStaticPages.ts

# Generate static QA pages
echo "🔍 Generating static QA pages..."
npx tsx scripts/generateStaticQAPages.ts

# Generate sitemap with all pages
echo "🗺️ Generating sitemap..."
npx tsx scripts/generateSitemap.ts

echo "✅ Build complete!"