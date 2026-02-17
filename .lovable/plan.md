

## Build Educational Brochure Library with Email Gate, PDF Downloads, and Related Guides

The database tables (`brochures`, `brochure_downloads`), storage bucket (`brochure-pdfs`), admin CMS (list + form), and public scaffold pages already exist. This plan adds the missing functionality: email gate modal, download tracking with counter increment, AI-powered brochure content generation for states, category filtering on the library page, related guides, sticky download CTA, and share buttons.

---

### 1. Email Gate Modal Component (New)

**File: `src/components/guides/EmailGateModal.tsx`**

A Dialog-based modal triggered when users click "Download PDF" on gated brochures:
- Form fields: Name, Email, Subscribe checkbox ("Send me Everence Wealth's weekly retirement planning insights")
- On submit:
  1. Insert into `brochure_downloads` (user_email, user_name, brochure_id, source_page)
  2. Increment `brochures.download_count` via an RPC function (avoids race conditions)
  3. If `pdf_url` exists, open it / trigger download
  4. Show success toast
- Privacy note at bottom
- For non-gated brochures, clicking Download PDF just opens the PDF directly

### 2. Database: Add Increment Download Count Function

**Migration**: Create a `SECURITY DEFINER` function `increment_brochure_download_count(p_brochure_id UUID)` that atomically increments `brochures.download_count`. This avoids race conditions when multiple users download simultaneously. The RLS on brochures only allows admin writes, so this function needs to be `SECURITY DEFINER`.

### 3. Enhanced Guide Page (`src/pages/GuidePage.tsx`)

Upgrade the existing scaffold with:
- **Email gate integration**: Wire "Download PDF" button to the EmailGateModal for gated brochures, or direct download for non-gated
- **Share buttons**: LinkedIn, Email, Copy Link (in hero section)
- **Sticky download CTA**: Fixed bottom bar on mobile with download button + download count
- **Related guides**: Query 3 brochures from same category (excluding current), show as cards at bottom
- **JSON-LD schema**: Render `json_ld_schema` from brochure data in a `<script>` tag
- **Proper canonical/meta tags**: Using react-helmet

### 4. Enhanced Guides Library (`src/pages/GuidesLibrary.tsx`)

Upgrade the existing scaffold with:
- **Category filter sidebar/bar**: Checkboxes or pills for tax_planning, retirement_strategies, iul_education, estate_planning
- **Tag filter**: Show available tags as clickable pills
- **Sort options**: Featured, Most Downloaded, Newest
- **Featured section**: Top 3 featured brochures shown larger at the top with "Staff Pick" badge
- **Search**: Text search by title

### 5. AI Brochure Content Generator (New Edge Function)

**File: `supabase/functions/generate-guide-content/index.ts`**

An edge function that generates educational brochure content using Lovable AI (no API key needed):
- Input: `category`, `topic`, `target_audience`, `language`
- Uses the AI to generate:
  - title, slug, hero_headline, subtitle, speakable_intro
  - meta_title, meta_description
  - 4-6 content sections with rich HTML
  - Suggested tags
- Saves directly to `brochures` table as draft
- Returns the created brochure ID

### 6. Admin: "Generate with AI" Button on Brochure Form

**File: `src/pages/portal/admin/AdminBrochureForm.tsx`**

Add a "Generate with AI" button at the top of the form that:
- Opens a small dialog asking for topic, category, and target audience
- Calls the `generate-guide-content` edge function
- Pre-fills all form fields with the AI-generated content
- Admin can then review, edit, and save

### 7. Admin: Bulk State Guide Generator

**File: `src/pages/portal/admin/AdminBrochures.tsx`**

Add a "Generate State Guides" button that:
- Lets admin select multiple states
- Generates a retirement planning guide brochure for each selected state
- Uses the edge function with state-specific context
- Creates drafts in bulk for admin review

---

### Summary of Files

| File | Action |
|---|---|
| `src/components/guides/EmailGateModal.tsx` | Create - email capture modal |
| `src/pages/GuidePage.tsx` | Rewrite - full feature page with email gate, share, sticky CTA, related guides |
| `src/pages/GuidesLibrary.tsx` | Rewrite - filters, search, sort, featured section |
| `supabase/functions/generate-guide-content/index.ts` | Create - AI content generation |
| `src/pages/portal/admin/AdminBrochureForm.tsx` | Update - add AI generate button |
| `src/pages/portal/admin/AdminBrochures.tsx` | Update - add bulk state guide generator |
| Database migration | Create `increment_brochure_download_count` function |

### Technical Notes

- The `brochure_downloads` table already has public INSERT RLS, so anonymous users can submit download records
- The `brochures` table has public SELECT for published status, admin-only write -- the increment function uses `SECURITY DEFINER` to bypass this
- The `brochure-pdfs` storage bucket already exists and is public
- PDF upload is manual for now (admin uploads PDF in the form); automated PDF generation can be added in a future phase
- The edge function will use Lovable AI (google/gemini-2.5-flash) -- no API key needed
