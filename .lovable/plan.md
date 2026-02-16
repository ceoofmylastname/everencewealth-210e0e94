

# Phase 7.8: Enhanced Marketing Resources Hub

## Overview
Rebuild the Marketing Resources page with stats cards, dual filters (category + resource type), tag display, download tracking, and richer card layout with thumbnail/preview support.

## No Database Migration Needed
The `marketing_resources` table already has all required columns: `title`, `category`, `resource_type`, `file_url`, `thumbnail_url`, `tags` (array), `description`, `download_count`.

## Changes

### Rebuild `src/pages/portal/advisor/MarketingResources.tsx`

**1. Stats Cards Row** (4 cards):
- Total Resources count
- Creatives count (resource_type = 'creative')
- Templates count (resource_type = 'template')
- Videos count (resource_type = 'video')
- Each with a relevant icon (Megaphone, ImageIcon, FileText, Video)

**2. Search and Dual Filters:**
- Search bar filtering by title or tags
- Category filter badges: All, Recruiting, Client Acquisition, Social Media, Email Templates, Presentations, Brochures, Video Content (single-select pills)
- Type filter badges: All Types, Creative, Template, Video, Document, Script (single-select pills)

**3. Resource Cards Grid** (1-2-3 column responsive):
Each card shows:
- Thumbnail image (from `thumbnail_url`), or file_url as image for creatives, or icon placeholder
- Resource type badge
- Title (truncated)
- Description (truncated, 2 lines)
- Tags shown as small outline badges (max 3 visible, "+N" overflow)
- Download count with icon
- Action buttons: "Download" (increments download_count then opens file_url) and "Preview" (opens file_url in new tab)

**4. Empty State:**
- Search icon with "No resources match your filters" message and a "Clear Filters" button

## Technical Details

- **State**: `searchQuery`, `selectedCategory` (string | null), `selectedType` (string | null)
- **Filtering**: Client-side with `useMemo` -- search matches title and tags array, category and type are exact matches
- **Download tracking**: On download click, fire an update to increment `download_count` then open the file URL, show a toast confirmation
- **Imports**: Add `Video`, `Share2`, `Megaphone`, `Eye`, `Copy` and `Image as ImageIcon` from lucide-react; add `toast` from sonner
- **Patterns**: Maintains Playfair Display heading, existing spinner, and pill-filter pattern from Tools Hub and Training Center

