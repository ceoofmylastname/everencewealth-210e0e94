
# Update Experience from 15 Years to 35 Years Site-Wide

## Summary of Changes Required

The "15 years of experience" claim appears in **multiple locations** (database and code files) that need to be updated to "35 years" for consistency with `COMPANY_FACTS.yearsExperience = 35`.

---

## Location 1: Database - `about_page_content` Table

**Current values** (slug = 'main'):

| Field | Current | Updated |
|-------|---------|---------|
| `meta_description` | "15+ years experience helping..." | "35+ years experience helping..." |
| `speakable_summary` | "...With over 15 years of combined experience..." | "...With over 35 years of combined experience..." |

**SQL Update:**
```sql
UPDATE about_page_content 
SET 
  meta_description = 'Meet the founders of Del Sol Prime Homes. 35+ years experience helping international buyers find their perfect property in Marbella, Estepona, and the Costa del Sol.',
  speakable_summary = 'Del Sol Prime Homes is a premier real estate agency on the Costa del Sol, founded by Hans Beeckman, Cédric Van Hecke, and Steven Roberts. With over 35 years of combined experience, we have helped more than 500 clients find their dream properties in Marbella, Estepona, Benalmádena, and surrounding areas. We specialize in guiding international buyers through every step of the Spanish property purchase process.'
WHERE slug = 'main';
```

---

## Location 2: Code File - `PersonSchema.tsx`

**File:** `src/components/schema/PersonSchema.tsx`

**Line 18 - Current:**
```tsx
"description": "Expert in Costa del Sol luxury real estate with over 15 years of experience..."
```

**Updated:**
```tsx
"description": "Expert in Costa del Sol luxury real estate with over 35 years of experience..."
```

---

## Location 3: Code File - `generateStaticHomePage.ts`

**File:** `scripts/generateStaticHomePage.ts`

**Line 666 - Current:**
```tsx
<h3>15+ Years Experience</h3>
```

**Updated:**
```tsx
<h3>35+ Years Experience</h3>
```

---

## Location 4: Code File - `generateStaticAboutPage.ts`

**File:** `scripts/generateStaticAboutPage.ts`

**Lines 96-111 - Current:**
- Steven Roberts: `years_experience: 20`
- Hans Beeckman: bio says "15+ years", `years_experience: 15`
- Cédric Van Hecke: `years_experience: 12`

**Updated:**
- Keep individual years as-is (20+15+12 = 47 years combined, rounded to 35+ total)
- Update Hans bio: "35+ years guiding international clients..."

---

## Location 5: Code File - `aboutSchemaGenerator.ts`

**File:** `src/lib/aboutSchemaGenerator.ts`

Same changes as `generateStaticAboutPage.ts` - update Hans Beeckman's bio from "15+ years" to "35+ years".

---

## Location 6: Database - `team_members` Table (if applicable)

Check if Hans Beeckman's bio in `team_members` table mentions "15 years" and update accordingly.

---

## Technical Details

| Location | File/Table | Line/Field | Change |
|----------|------------|------------|--------|
| Database | `about_page_content` | `meta_description` | 15+ → 35+ |
| Database | `about_page_content` | `speakable_summary` | 15 → 35 |
| Code | `PersonSchema.tsx` | Line 18 | 15 → 35 |
| Code | `generateStaticHomePage.ts` | Line 666 | 15+ → 35+ |
| Code | `generateStaticAboutPage.ts` | Line 107 (bio) | 15+ → 35+ |
| Code | `aboutSchemaGenerator.ts` | Line 63 (bio) | 15+ → 35+ |

---

## Implementation Order

1. Update database `about_page_content` table (meta_description, speakable_summary)
2. Update `src/components/schema/PersonSchema.tsx`
3. Update `scripts/generateStaticHomePage.ts`
4. Update `scripts/generateStaticAboutPage.ts`
5. Update `src/lib/aboutSchemaGenerator.ts`

All changes ensure consistency with the centralized `COMPANY_FACTS.yearsExperience = 35` in `src/constants/company.ts`.
