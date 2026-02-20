

# Add All 16 Carriers with Rich Data and Modern Card Design

## Summary

The carriers table is currently empty and its schema only supports basic fields. This plan extends the database schema to store all the detailed carrier information provided, inserts all 16 carriers with comprehensive data, creates a carrier_documents table for PDF resources, and redesigns both the agent-facing carrier cards and detail page to be modern, sleek, and professional -- turning the Carrier Directory into a true agent resource hub.

## Phase 1: Database Schema Changes

Add new columns to the `carriers` table to support the full dataset:

- `description` (text) -- short marketing description
- `founded_year` (integer) -- e.g. 1910
- `employees` (text) -- e.g. "500+"
- `headquarters` (text) -- full address
- `phone` (text) -- main phone number
- `website` (text) -- public website URL
- `quotes_url` (text) -- agent quoting link
- `illustration_url` (text) -- illustration tool link
- `turnaround` (text) -- "Fast" or "Average"
- `special_products` (text[]) -- array of product names/descriptions
- `underwriting_strengths` (text) -- paragraph describing UW advantages
- `reparenting_info` (jsonb) -- email, subject, template for reparenting

Create a new `carrier_documents` table:
- `id` (uuid, PK)
- `carrier_id` (uuid, FK to carriers)
- `document_name` (text) -- e.g. "Senior Choice Guide"
- `document_url` (text) -- path or URL to PDF
- `document_type` (text) -- e.g. "guide", "highlight_sheet", "underwriting"
- `created_at` (timestamptz)

With RLS policies matching the carriers table (admin full access, advisors read-only).

## Phase 2: Insert All 16 Carriers

Insert complete records for all 16 carriers using the data provided:

1. Allianz Life Insurance Company of North America
2. American Amicable
3. American General (AIG)
4. Americo
5. Assurity
6. Athene
7. Baltimore Life
8. Continental General
9. Ethos
10. Fidelity and Guaranty Life (F&G)
11. Foresters Financial
12. Mutual of Omaha
13. North American
14. Royal Neighbors of America
15. Transamerica Life Insurance Company
16. TruStage

Each record will include all available fields: name, short code, AM Best rating, products, niches, headquarters, phone, website, portal URL, quotes URL, illustration URL, founded year, employees, turnaround, special products, underwriting strengths, reparenting info, notes, and featured status.

Also insert all 17 PDF document records into `carrier_documents`.

## Phase 3: Redesign Agent-Facing Carrier Cards (CarrierDirectory.tsx)

Transform the current minimal cards into rich, information-dense cards that agents actually want to use as a resource:

- **Logo + Name header** with AM Best rating badge and turnaround speed indicator
- **Quick stats row**: Founded year, Headquarters city/state, Employees count
- **Products offered** as styled pills/badges
- **Niche specialties** as subtle tags
- **Key strengths** -- 1-2 line summary from underwriting_strengths
- **Action buttons**: View Details, Agent Portal (if URL exists), Quick Quote (if quotes_url exists)
- **Document count badge** showing how many PDFs are available

Card style: white background, rounded-xl, subtle shadow, hover elevation, brand green accents -- matching the existing design system.

## Phase 4: Enhance CarrierDetail.tsx

Update the carrier detail page to display all the new data in organized sections:

- **Hero section**: Logo, name, rating, turnaround badge, founded year, HQ
- **Contact bar**: Phone, website, portal, quoting, illustrations -- all as clickable links
- **Overview tab**: Description, underwriting strengths, headquarters/employees details
- **Products tab**: Products offered, niches, special products list
- **Documents tab** (new): List of downloadable PDFs with icons and download buttons
- **Tools tab**: Existing quoting tools
- **News tab**: Existing carrier news
- **Reparenting tab** (conditional): Only shows if reparenting_info exists (currently just Ethos)

## Phase 5: Update Admin Form (AdminCarriers.tsx)

Extend the admin add/edit dialog to include all the new fields so admins can manage the full dataset:

- Add inputs for: description, founded year, employees, headquarters, phone, website, quotes URL, illustration URL, turnaround (dropdown: Fast/Average), special products (comma-separated input), underwriting strengths (textarea), reparenting info fields
- Add a section to manage carrier documents (add/remove PDFs)

## Files to Create
- None (carrier_documents table via migration)

## Files to Edit
- `src/pages/portal/advisor/CarrierDirectory.tsx` -- Redesigned modern carrier cards
- `src/pages/portal/advisor/CarrierDetail.tsx` -- Enhanced detail page with all new data sections
- `src/pages/portal/admin/AdminCarriers.tsx` -- Extended admin form with all new fields

## Technical Notes

- The `contact_info` jsonb column already exists but is underused. The new dedicated columns (phone, website, headquarters) are more explicit and easier to query/display. The contact_info field can remain for any additional freeform contact data.
- All 16 carriers will be inserted via the data tool after schema migration.
- The 17 PDF documents reference paths under `/carriers/` in public storage; the carrier_documents table stores these references.
- Turnaround values will be limited to "Fast" and "Average" as provided in the dataset.
- Reparenting info is jsonb to accommodate varying structures (only Ethos currently has it).

