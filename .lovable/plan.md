

## Add Assessment Leads to Admin Dashboard

### Problem
1. **No admin view** — `assessment_leads` data is saved but not visible anywhere in the admin/CRM dashboards
2. **Missing DB columns** — The table lacks scoring columns (`overall_score`, `score_savings`, `score_tax`, `score_protection`, `score_timeline`, `score_tier`, `recommendations`, etc.), so the full insert fails and falls back to base columns only

### Plan

#### 1. Database Migration — Add missing columns to `assessment_leads`
Add these columns to capture the full assessment results:
- `savings_status`, `income_range`, `tax_diversification`, `insurance_coverage`, `market_volatility`, `retirement_plan_formality`, `legacy_planning` (all `text`, nullable)
- `overall_score` (`integer`, nullable)
- `score_savings`, `score_tax`, `score_protection`, `score_timeline` (`integer`, nullable)
- `score_tier` (`text`, nullable)
- `recommendations` (`jsonb`, nullable)
- `page_url`, `user_agent`, `language` (`text`, nullable)
- `utm_source`, `utm_medium`, `utm_campaign` (`text`, nullable)

#### 2. New Page — `src/pages/crm/admin/AssessmentLeads.tsx`
Create a new admin page that displays a table of all assessment submissions with:
- Columns: Date, Name, Email, Phone, Age Range, Concern, Score, Tier
- Expandable row or detail modal showing full answers, category scores, and recommendations
- Sort by date (newest first)
- Search/filter by name or email

#### 3. Add Route + Navigation
- Add route `/crm/admin/assessment-leads` in the CRM router
- Add a nav link in the CRM admin sidebar/layout

#### Files to create/change
- **Database migration** — ALTER TABLE `assessment_leads` ADD columns
- **`src/pages/crm/admin/AssessmentLeads.tsx`** — new page component
- **CRM routes file** — add new route
- **CRM admin layout/nav** — add sidebar link

