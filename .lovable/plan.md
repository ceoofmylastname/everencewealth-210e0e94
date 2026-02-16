

# Phase 7.13: Enhanced Carrier News Feed

## Overview
Rebuild the Carrier News page with stats cards, priority/type filter badges, view tracking, carrier name search, and an improved empty state with a "Clear Filters" button.

## No Database Migration Needed
The `carrier_news` table already has all required columns including `views`, `article_type`, `priority`, `carrier_id`, and the `carriers` relation provides `carrier_name` and `carrier_logo_url`.

## Changes

### Rebuild `src/pages/portal/advisor/CarrierNews.tsx`

**1. Header:**
- Title "Carrier News & Updates" with subtitle (Playfair Display heading)

**2. Stats Row** (4 cards):
- Total Articles (Newspaper icon)
- Urgent Updates (AlertCircle icon, count of priority=urgent)
- Rate Updates (TrendingUp icon, count of article_type=rate_update)
- Product Launches (Star icon, count of article_type=product_launch)

**3. Search and Filters Card:**
- Search input with Search icon (searches title, content, and carrier name)
- Priority filter row: clickable Badge chips for All / low / normal / high / urgent (active state uses primary color)
- Type filter row: clickable Badge chips for All Types / rate_update / product_launch / general / compliance / promotion (active state uses primary color)

**4. News Feed:**
- Each article rendered as a Card with:
  - Type-specific icon (TrendingUp for rate_update, AlertCircle for compliance, Newspaper default)
  - Title, carrier name, content preview (line-clamped to 3 lines)
  - Priority badge (color-coded)
  - Meta row: Eye icon + view count, published date, article type label
- On card click: increment `views` count via supabase update

**5. Empty/No Results State:**
- Newspaper icon, "No news articles match your filters" message
- "Clear Filters" button that resets search, priority, and type selections

**6. Loading State:**
- Existing spinner pattern

## Technical Details

- **State**: `news` (all articles), `searchQuery`, `selectedPriority` (string | null), `selectedType` (string | null), `loading`
- **Filtering**: `useMemo` to derive `filteredNews` from news array based on searchQuery, selectedPriority, and selectedType
- **Query**: `carrier_news` select with `*, carriers(carrier_name, carrier_logo_url)` filtered by status=published, ordered by published_at desc
- **View tracking**: `incrementViews` function updates views column on click
- **Imports**: Add TrendingUp, AlertCircle, Star, Eye from lucide-react; keep existing Search, Newspaper, Badge, Card, Input imports
- **No route or nav changes** needed -- the existing route and "News" nav item already point to this page
