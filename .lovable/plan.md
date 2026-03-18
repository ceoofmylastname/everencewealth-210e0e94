

## Remove All Google Tags from Everence Wealth

### Scope
Remove Google Tag Manager (GTM-MNQLS97C) and all `gtag()` tracking calls across the site. **14 files** need changes.

### Changes

**1. `index.html`** — Remove GTM script block (lines 4-10) and noscript fallback (lines 80-83)

**2. `public/app-shell.html`** — Remove identical GTM script block and noscript fallback

**3. Remove all `gtag()` event tracking calls from these component files** (remove the `if (window.gtag)` blocks but keep surrounding logic):
- `src/components/contact/ContactForm.tsx`
- `src/components/contact/ContactHeroSplit.tsx`
- `src/components/contact/ContactOptions.tsx`
- `src/components/contact/EmmaCallout.tsx`
- `src/components/contact/MobileStickyContact.tsx`
- `src/components/contact/OfficeInfo.tsx`
- `src/components/team/TeamMemberContactForm.tsx`
- `src/components/team/TeamMemberCard.tsx`
- `src/components/team/TeamMemberModal.tsx`
- `src/components/brochures/BrochureHero.tsx`

**4. `src/utils/landing/analytics.ts`** — Remove the GA4 `gtag()` section from `trackEvent` function

**5. `supabase/functions/production-site-audit/index.ts`** — Remove `www.googletagmanager.com` and `www.google-analytics.com` from the allowed domains list

### Not touched
- Google Fonts (`fonts.googleapis.com`) — these are font loading, not tracking
- Google Search Console references in admin UI — these are content labels, not tags
- `storage.googleapis.com` image URLs — cloud storage, not tracking

