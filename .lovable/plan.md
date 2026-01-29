

# Create About Us and Team Pages - Implementation Plan

## Executive Summary

The project already has a well-developed About page (`/about`) with founder profiles, but it lacks:
1. **Language-prefixed URLs** (`/{lang}/about-us`, `/{lang}/team`)
2. **Dedicated Team page** with full team member grid and modals
3. **Database table** for team members (currently founders are in JSONB)
4. **Admin interface** for team management
5. **Full translations** for all 10 languages

This plan extends the existing About architecture while creating a new Team page and admin system.

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| About page (`/about`) | ✅ Exists | Has hero, mission, story, founders, why choose us, credentials, FAQ, CTA |
| `about_page_content` table | ✅ Exists | Stores founders in JSONB, has full content |
| FounderProfiles component | ✅ Exists | Displays 3 founders from JSONB |
| Language-prefixed route | ❌ Missing | Only `/about` exists, no `/:lang/about-us` |
| Team page | ❌ Missing | Need new page |
| Team members table | ❌ Missing | Need new database table |
| Admin team management | ❌ Missing | Need new admin page |

---

## Phase 1: Database Schema

### Create `team_members` Table

```sql
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  role_translations JSONB DEFAULT '{}', -- {en: "Sales Director", nl: "Verkoopdirecteur", de: "Verkaufsleiter", ...}
  bio TEXT,
  bio_translations JSONB DEFAULT '{}', -- {en: "...", nl: "...", de: "...", ...}
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  linkedin_url TEXT,
  languages_spoken TEXT[] DEFAULT '{}', -- ['English', 'Spanish', 'Dutch']
  specializations TEXT[] DEFAULT '{}', -- ['Marbella', 'Golf Properties', 'New Builds']
  areas_of_expertise TEXT[] DEFAULT '{}', -- ['Luxury Villas', 'Off-Plan', 'Investment']
  years_experience INTEGER DEFAULT 0,
  credentials TEXT[] DEFAULT '{}', -- ['API Licensed', 'RICS Affiliate']
  is_founder BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public read policy (team members are public info)
CREATE POLICY "Team members are publicly readable"
  ON public.team_members
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Admin write policy
CREATE POLICY "Admins can manage team members"
  ON public.team_members
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

### Seed with Existing Founders

Migrate the 3 founders from the existing `about_page_content.founders` JSONB into the new table.

---

## Phase 2: Translation Updates

### Add to all 10 language files (`src/i18n/translations/*.ts`)

```typescript
aboutUs: {
  meta: {
    title: "About Del Sol Prime Homes | Costa del Sol Real Estate Experts",
    description: "Learn about our expert team with 35+ years experience helping international buyers find property on the Costa del Sol."
  },
  hero: {
    headline: "35 Years of Excellence in Costa del Sol Real Estate",
    subheadline: "Three founders, one mission: making your Spanish property dreams a reality."
  },
  story: {
    title: "Our Story",
    subtitle: "From three individual journeys to one shared mission"
  },
  mission: {
    title: "Our Mission",
    statement: "We believe everyone deserves expert guidance when making one of life's biggest investments."
  },
  whyChoose: {
    title: "Why Choose Us",
    items: {
      experience: { title: "35+ Years Experience", description: "Combined expertise in Costa del Sol real estate" },
      multilingual: { title: "10 Languages", description: "Communicate in your preferred language" },
      local: { title: "Local Expertise", description: "Deep knowledge of every neighborhood" },
      endToEnd: { title: "End-to-End Service", description: "From search to after-sales support" }
    }
  },
  values: {
    title: "Our Values",
    items: {
      integrity: { title: "Integrity", description: "Honest, transparent dealings" },
      clientFirst: { title: "Client-First", description: "Your interests always come first" },
      expertise: { title: "Expertise", description: "Knowledge you can trust" },
      transparency: { title: "Transparency", description: "No hidden fees, no surprises" }
    }
  },
  stats: {
    yearsInBusiness: "Years Experience",
    propertiesSold: "Properties Sold",
    happyClients: "Happy Clients",
    languages: "Languages",
    teamMembers: "Team Members"
  },
  cta: {
    meetTeam: "Meet Our Team",
    contactUs: "Contact Us"
  }
},
team: {
  meta: {
    title: "Meet Our Team | Del Sol Prime Homes",
    description: "Meet the expert real estate professionals at Del Sol Prime Homes. Multilingual team with 35+ years combined experience."
  },
  hero: {
    headline: "Meet Our Expert Team",
    subheadline: "Dedicated professionals ready to help you find your perfect Costa del Sol property"
  },
  card: {
    yearsExperience: "years experience",
    languages: "Languages",
    specializations: "Specializations",
    contact: "Contact",
    viewProfile: "View Profile"
  },
  modal: {
    about: "About",
    expertise: "Areas of Expertise",
    credentials: "Credentials",
    contact: "Contact",
    sendMessage: "Send Message",
    whatsapp: "WhatsApp",
    email: "Email",
    call: "Call"
  },
  filters: {
    all: "All Team Members",
    founders: "Founders"
  }
}
```

Repeat with translations for: NL, DE, FR, SV, NO, DA, FI, PL, HU

---

## Phase 3: New Components

### Create Team Page Components

| Component | Purpose |
|-----------|---------|
| `src/components/team/TeamHero.tsx` | Hero section with headline |
| `src/components/team/TeamGrid.tsx` | Grid of team member cards |
| `src/components/team/TeamMemberCard.tsx` | Individual card with photo, name, role, languages, specializations |
| `src/components/team/TeamMemberModal.tsx` | Full profile modal with bio, contact options, send message form |
| `src/components/team/TeamMemberContactForm.tsx` | Contact form within modal |

### Update About Page Components

| Component | Changes |
|-----------|---------|
| `AboutHero.tsx` | Add translations support, accept language prop |
| `FounderProfiles.tsx` | Fetch from `team_members` table, add link to Team page |
| `AboutCTA.tsx` | Add "Meet Our Team" button linking to `/{lang}/team` |

---

## Phase 4: Create Team Page

### File: `src/pages/Team.tsx`

Structure:
```
<Header />
<main>
  <TeamHero />
  <TeamGrid />  {/* Fetches from team_members table */}
</main>
<Footer />
<TeamMemberModal />  {/* Opens when card clicked */}
```

Features:
- Fetch team members from database with `active = true`
- Sort by `display_order`
- Filter option: All / Founders only
- Responsive grid: 3 cols desktop, 2 tablet, 1 mobile
- Click card → opens modal with full profile
- Modal has WhatsApp, Email, Call buttons + Send Message form

---

## Phase 5: Update Routes

### Modify `src/App.tsx`

```typescript
// Add lazy import
const Team = lazy(() => import("./pages/Team"));

// Add routes (near existing About route)
{/* About Us - language prefixed */}
<Route path="/:lang/about-us" element={<About />} />
<Route path="/:lang/about" element={<Navigate to="/:lang/about-us" replace />} />
<Route path="/about" element={<Navigate to="/en/about-us" replace />} />

{/* Team page - language prefixed */}
<Route path="/:lang/team" element={<Team />} />
<Route path="/team" element={<Navigate to="/en/team" replace />} />
```

---

## Phase 6: Admin Team Management

### Create `src/pages/admin/TeamMembers.tsx`

Features:
- List all team members (active and inactive)
- Add new team member button
- Edit/Delete buttons per member
- Drag-and-drop reordering for `display_order`
- Toggle active/inactive status
- Photo upload to storage bucket
- Multi-language bio/role editor (tabs for each language)

### Create `src/components/admin/TeamMemberDialog.tsx`

Form fields:
- Name (text)
- Role (text + translations tabs)
- Bio (textarea + translations tabs)
- Photo upload
- Email, Phone, WhatsApp
- LinkedIn URL
- Languages spoken (multi-select)
- Specializations (tags input)
- Areas of expertise (tags input)
- Years experience (number)
- Credentials (tags input)
- Is Founder (checkbox)
- Display Order (number)
- Active (toggle)

---

## Phase 7: SEO & Schema

### JSON-LD for About Page

```typescript
// Organization schema (already exists, enhance)
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Del Sol Prime Homes",
  "description": "...",
  "founder": [...team members with is_founder=true],
  "employee": [...all team members],
  "numberOfEmployees": { "@type": "QuantitativeValue", "value": X }
}
```

### JSON-LD for Team Page

```typescript
// Each team member as Person schema
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "...",
  "jobTitle": "...",
  "description": "...",
  "image": "...",
  "sameAs": ["linkedin_url"],
  "worksFor": { "@id": "delsolprimehomes.com/#organization" },
  "knowsLanguage": [...],
  "hasOccupation": { "@type": "Occupation", "name": "Real Estate Agent" }
}
```

### Hreflang Tags

Both pages include 10 language hreflang tags + x-default.

---

## Phase 8: URL Structure

| Language | About Us URL | Team URL |
|----------|--------------|----------|
| EN | `/en/about-us` | `/en/team` |
| NL | `/nl/over-ons` | `/nl/team` |
| DE | `/de/uber-uns` | `/de/team` |
| FR | `/fr/a-propos` | `/fr/equipe` |
| SV | `/sv/om-oss` | `/sv/team` |
| NO | `/no/om-oss` | `/no/team` |
| DA | `/da/om-os` | `/da/team` |
| FI | `/fi/meista` | `/fi/tiimi` |
| PL | `/pl/o-nas` | `/pl/zespol` |
| HU | `/hu/rolunk` | `/hu/csapat` |

**Note**: Implementing localized slugs requires additional routing logic. For Phase 1, use consistent `/about-us` and `/team` slugs with language prefix only.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Team.tsx` | Team page |
| `src/components/team/TeamHero.tsx` | Hero section |
| `src/components/team/TeamGrid.tsx` | Team member grid |
| `src/components/team/TeamMemberCard.tsx` | Individual card |
| `src/components/team/TeamMemberModal.tsx` | Profile modal |
| `src/components/team/TeamMemberContactForm.tsx` | Contact form in modal |
| `src/pages/admin/TeamMembers.tsx` | Admin team management |
| `src/components/admin/TeamMemberDialog.tsx` | Add/edit team member form |
| `src/lib/teamSchemaGenerator.ts` | JSON-LD schema generators |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add Team import and routes |
| `src/pages/About.tsx` | Update to use language prefix, fetch from team_members |
| `src/components/about/FounderProfiles.tsx` | Fetch from team_members table |
| `src/components/about/AboutCTA.tsx` | Add "Meet Our Team" button |
| `src/i18n/translations/en.ts` | Add aboutUs and team sections |
| `src/i18n/translations/nl.ts` | Add aboutUs and team sections |
| `src/i18n/translations/de.ts` | Add aboutUs and team sections |
| `src/i18n/translations/fr.ts` | Add aboutUs and team sections |
| `src/i18n/translations/sv.ts` | Add aboutUs and team sections |
| `src/i18n/translations/no.ts` | Add aboutUs and team sections |
| `src/i18n/translations/da.ts` | Add aboutUs and team sections |
| `src/i18n/translations/fi.ts` | Add aboutUs and team sections |
| `src/i18n/translations/pl.ts` | Add aboutUs and team sections |
| `src/i18n/translations/hu.ts` | Add aboutUs and team sections |
| `src/components/home/Footer.tsx` | Update About link to use language prefix |
| `src/components/home/Header.tsx` | Update About link to use language prefix |

---

## Implementation Order

1. **Database**: Create `team_members` table with RLS
2. **Seed Data**: Migrate existing founders to new table
3. **Translations**: Add aboutUs/team sections to all 10 languages
4. **Team Components**: Create TeamHero, TeamGrid, TeamMemberCard, TeamMemberModal
5. **Team Page**: Create Team.tsx page
6. **Routes**: Update App.tsx with language-prefixed routes
7. **About Updates**: Enhance About page to use new team_members table
8. **Admin Interface**: Create TeamMembers.tsx admin page
9. **SEO**: Add JSON-LD schemas and hreflang tags
10. **Testing**: Verify all languages and functionality

---

## Testing Checklist

- [ ] Visit `/en/about-us` - verify content loads
- [ ] Visit `/nl/about-us` - verify Dutch translations
- [ ] Visit all 10 language versions of About
- [ ] Visit `/en/team` - verify team grid displays
- [ ] Click team member card - modal opens with full profile
- [ ] WhatsApp button opens WhatsApp with pre-filled message
- [ ] Send Message form submits to leads table
- [ ] Admin: Add new team member
- [ ] Admin: Edit existing team member
- [ ] Admin: Reorder team members
- [ ] Admin: Toggle active/inactive
- [ ] SEO: Check JSON-LD schemas in page source
- [ ] Mobile: Verify responsive layouts

