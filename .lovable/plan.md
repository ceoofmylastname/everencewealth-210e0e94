
# Crawlability Test Admin Page

## Overview
Create an admin tool at `/admin/crawlability-test` that lets you input any Q&A URL, fetch the page as Googlebot would see it (raw HTML, no JavaScript), and display a color-coded report of SEO element presence.

## Architecture
Since browsers can't fetch external pages due to CORS, we need a backend function to act as a proxy that fetches the target URL with a Googlebot user-agent and returns the raw HTML.

## Changes

### 1. New backend function: `supabase/functions/crawlability-test/index.ts`
- Accepts a `url` query parameter
- Fetches the URL using a Googlebot user-agent string (no JS execution)
- Returns the raw HTML plus parsed checks:
  - Meta title (text + present boolean)
  - Meta description (text + present boolean)
  - H1 tags (text + present boolean)
  - Body text word count
  - Whether main content keywords appear
  - Robots meta tag value
  - Canonical URL

### 2. New page: `src/pages/admin/CrawlabilityTest.tsx`
- Input field for URL (pre-filled with `https://www.delsolprimehomes.com/`)
- Quick-test buttons for sample Q&A paths
- "Test Crawlability" button that calls the edge function
- Results panel with color-coded checks (green checkmark / red X):
  - Meta title present and content
  - Meta description present and content
  - H1 tag present and content
  - Word count (green if 300+, yellow if 100-299, red if under 100)
  - Robots directive (green if "index", red if "noindex")
  - Canonical URL present
- Collapsible raw HTML source viewer
- Follows existing admin page patterns (AdminLayout, Card components, Badge, toast)

### 3. Route registration: `src/App.tsx`
- Add route: `/admin/crawlability-test` pointing to the new page

### 4. Navigation: `src/components/AdminLayout.tsx`
- Add "Crawlability Test" link under the "SEO and Health" nav group with an appropriate icon

## Technical Details
- The edge function uses `Deno.fetch` with `User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` to simulate how Google crawls the page
- HTML parsing done server-side using regex/string matching (lightweight, no dependencies needed in Deno)
- Word count calculated by stripping HTML tags and counting whitespace-delimited tokens in the body
- No database changes required
- No new npm dependencies required
