

## Add Admin-Editable Compliance Resources

### Current State
The Compliance Resources (FastrackCE, ExamFX, State CE Requirements, NAIC Producer Database) are hardcoded in the advisor's `ComplianceCenter.tsx`. Admins cannot edit them.

### Plan

**1. Create `compliance_resources` database table**
- Columns: `id`, `title`, `description`, `url`, `promo_code`, `promo_text`, `contact_email`, `discount_text`, `color_theme` (blue/emerald/neutral), `type` (partner/link), `sort_order`, `is_active`, `created_at`, `updated_at`
- Seed with the 4 existing hardcoded resources
- RLS: public read for authenticated users, write restricted to admins

**2. Add "Resources" tab to `AdminCompliance.tsx`**
- New tab alongside Documents, Contracts, etc.
- CRUD table listing all compliance resources with Add/Edit/Delete
- Dialog form with fields: title, description, URL, promo code, promo text, contact email, discount text, color theme dropdown, type (partner vs link), sort order, active toggle

**3. Update `ComplianceCenter.tsx` (advisor view)**
- Replace hardcoded resources with a query to `compliance_resources` table
- Render partner-type resources as the current styled cards (with promo codes/contact info)
- Render link-type resources in the grid layout
- Maintain the same visual design from the screenshot

