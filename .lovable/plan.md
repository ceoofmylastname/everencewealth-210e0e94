

# Build Apartments Landing Page System

## Overview

Create a public-facing apartments landing page at `/:lang/apartments` with 3 new components and routing, following the existing landing page patterns (LandingLayout, Hero, LandingPageForm). The database tables (`apartments_page_content` and `apartments_properties`) are already set up with seed data and RLS policies.

## New Files to Create

### 1. `src/components/apartments/ApartmentsHero.tsx`

Fetches from `apartments_page_content` filtered by `language` and `is_published=true`. Renders:
- Full-screen hero with `hero_image_url` as background (with fallback placeholder if the image path is relative/missing)
- Gradient overlay: `from-black/50 via-black/30 to-black/60`
- `headline` and `subheadline` text in white
- Gold CTA button (`cta_text`) that smooth-scrolls to `#properties-section`
- Animated bounce scroll indicator at bottom
- Skeleton loading state while fetching

### 2. `src/components/apartments/ApartmentsPropertiesSection.tsx`

Fetches from `apartments_properties` filtered by `language` and `visible=true`, ordered by `display_order`. Renders:
- Section with `id="properties-section"` for scroll targeting
- Responsive grid: 1 col mobile, 2 cols tablet (`md:`), 3 cols desktop (`lg:`)
- Property cards showing:
  - `featured_image_url` with `property_type` badge (gold, top-right) and `status` badge (red, top-left, if not "available")
  - `title`, `location` (MapPin icon), specs row: bedrooms (Bed), bathrooms (Bath), sqm (Maximize)
  - Price formatted with `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`
  - "Request Information" gold button
- On card click: increment `views` column via Supabase update, open lead form modal with property context
- Skeleton cards during loading

### 3. `src/components/apartments/ApartmentsLeadFormModal.tsx`

Reuses the same form pattern as the existing `LandingPageForm` component. Uses `Dialog` from `@/components/ui/dialog`.
- Form fields: `full_name`, `email`, `phone` (with `PhoneInput`), `message` (textarea), `gdpr_consent` (checkbox, required)
- Shows selected property title and location in the dialog header
- On submit: calls `registerCrmLead` with:
  - `leadSource: 'Landing Form'`
  - `leadSourceDetail: 'apartments_landing_{language}'`
  - `propertyRef: property.title`
  - UTM params from URL search params
  - `pageUrl: window.location.href`
- After success: increments `apartments_properties.inquiries`, shows success toast, resets form, closes modal
- Zod validation, loading spinner on submit button

### 4. `src/pages/apartments/ApartmentsLanding.tsx`

Main page component. Extracts `lang` from `useParams()`, defaults to `'en'`.
- Fixed header with logo, `LanguageSelector` (reused from landing), and CTA
- Sections in order:
  1. `ApartmentsHero` (language)
  2. `ExplainerVideo` (reused from `@/components/landing/ExplainerVideo`)
  3. `ApartmentsPropertiesSection` (language) -- with lead form modal state
  4. Google Reviews via Elfsight widget (using `elfsight_widget_id` from page content, or hardcoded map as fallback)
  5. `Footer` (reused from `@/components/landing/Footer`)
- Helmet for SEO: title, description, canonical, hreflang tags for all 10 languages
- Schema.org JSON-LD for RealEstateAgent

### 5. Routing in `src/App.tsx`

Add lazy import and routes after the retargeting block (around line 333):

```typescript
const ApartmentsLanding = lazy(() => import("./pages/apartments/ApartmentsLanding"));

// Routes:
<Route path="/apartments" element={<Navigate to="/en/apartments" replace />} />
<Route path="/:lang/apartments" element={<ApartmentsLanding />} />
```

## Styling

All components follow existing brand standards:
- Gold: `#D4A853` (bg-landing-gold, hover:bg-landing-goldDark)
- Navy: text-landing-navy
- White backgrounds, rounded-xl cards, shadow transitions
- Container: `container mx-auto px-4`
- Section padding: `py-20`

## Data Flow

```text
URL /:lang/apartments
       |
  ApartmentsLanding (reads lang param)
       |
  +----+----+----+----+
  |         |         |
Hero    Properties  Reviews
(DB)      (DB)     (Elfsight)
           |
     Card Click
           |
   LeadFormModal
           |
   registerCrmLead() --> CRM pipeline
```

## Dependencies

No new packages needed. Uses existing: `react-phone-number-input`, `zod`, `react-hook-form`, `lucide-react`, `framer-motion`, `react-helmet`, Supabase client.

## What Is NOT Built (Per Instructions)

- Admin dashboard for managing apartments content (future task)
- Seeding additional language data beyond English (only EN has `is_published=true` currently)

