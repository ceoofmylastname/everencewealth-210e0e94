

# Enhanced Carrier Detail Page with Tabs

## Overview
Rebuild the Carrier Detail page with a tabbed interface (Overview, Products, Tools, News) using the existing database columns. Several columns from the spec (`founded`, `employees`, `headquarters`, `phone`, `website`, `history`, etc.) do not exist in the `carriers` table. Rather than adding 10+ mostly-empty columns, this plan maps existing data to the tabbed layout and uses `contact_info` (JSONB) and `notes` for the Overview tab.

## No Database Migration Needed
All required data is already available:
- `carrier_name`, `carrier_logo_url`, `am_best_rating`, `short_code`, `featured` -- Header
- `products_offered`, `niches` -- Products tab
- `portal_url`, `contact_info` (JSONB, can contain phone/email/website) -- Overview tab
- `notes`, `contracting_requirements`, `commission_structure` -- Overview tab
- `quoting_tools` table -- Tools tab
- `carrier_news` table -- News tab

## Changes

### Rebuild `src/pages/portal/advisor/CarrierDetail.tsx`

**Header section** (same as current but polished):
- Back button, logo/shield icon, carrier name + short code, AM Best badge, featured star, portal link

**Tabbed layout** using Radix Tabs (already installed):

| Tab | Content |
|---|---|
| **Overview** | Contact info (parsed from `contact_info` JSONB), notes, contracting requirements, commission structure |
| **Products** | Products offered badges, niche/specialty badges |
| **Tools** | Quoting tools list with type badges and open links, portal URL card |
| **News** | Published carrier news with priority badges and dates |

**Key implementation details:**
- Use `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`
- Parse `contact_info` JSONB for phone, email, website display
- Use `.maybeSingle()` instead of `.single()` for the carrier query to handle missing data gracefully
- Show "Carrier not found" with a back link if no data
- Loading spinner consistent with existing pattern

