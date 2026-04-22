

## Final placeholder purge — fix 2 missed leaks, remove wrong-person photos, full dist verification

### Step 1 — Fix the 2 missed visible leaks

**`src/components/home/Footer.tsx` line 52**

Replace the hardcoded `contactInfo` phone entry. Add `import { BUSINESS } from '@/config/business';` at the top, then change the phone entry to:
```ts
{ icon: <Phone size={18} className="text-prime-gold" />, text: '(925) 433-7724', href: `tel:${BUSINESS.telephoneE164}` }
```
Also reconcile the email entry to read `BUSINESS.email` for the text and `mailto:${BUSINESS.email}` for the href, so both display values flow from one source.

**`src/pages/Team.tsx` line 38**

Replace the inline `"telephone": "+1-415-555-0100"` placeholder in the `organizationSchema` with `BUSINESS.telephone`. Also replace the hardcoded address block (street/locality/postal/region/country) with `businessPostalAddress()` from `@/config/business`, and the `email` line with `BUSINESS.email`. This kills four placeholders in one edit and prevents future drift on the Team page.

### Step 2 — Remove wrong-person photo references (E-E-A-T integrity)

**`src/components/schema/PersonSchema.tsx`**

Remove the `image: photoUrl` field and the `photoUrl` const entirely. Drop the `context` prop logic since it only existed to switch between blog and QA photos. Add a top-of-file TODO:
```ts
// TODO: Person.image pending verified headshots of Steven Rosenberg.
// Do NOT substitute placeholder photos — schema.org E-E-A-T integrity rule:
// the image MUST be a verified photo of the named person.
```
Update the two consumers (Blog article + Q&A page) to drop the `context` prop. Search for `<PersonSchema` usages and remove the prop everywhere it appears.

**`scripts/generateStaticTeamPage.ts`**

Remove the `image` field from the Person schema for Steven Rosenberg. Same TODO comment in the source.

**`docs/AUTHORITY_POLICY.md`**

Keep the path rename to `/images/steven-blog.jpg` and `/images/steven-qa.jpg` as planned, but add a TODO block:
```md
## TODO: Pending Assets
- /public/images/steven-blog.jpg — verified headshot of Steven Rosenberg
- /public/images/steven-qa.jpg — verified headshot of Steven Rosenberg

These files must be uploaded BEFORE the Person.image field can be re-added
to PersonSchema.tsx, generateStaticTeamPage.ts, or any other schema.
Do NOT substitute the legacy hans-*.jpg files — those are photos of a
different person and substituting them violates schema.org E-E-A-T rules.
```

### Step 3 — Delete wrong-person photo files

Delete `/public/images/hans-blog.jpg` and `/public/images/hans-qa.jpg` so nothing in the future codebase can accidentally reference them.

### Step 4 — Full build + dist verification

```bash
npm run build

# Negative — must be empty
grep -rE "415-555-0100|14155550100|14155551234|One Embarcadero|94111|hans\.?beeckman|hansbeeckman" dist/

# Positive — must show many
grep -rE "925-433-7724|9254337724|455 Market St|94105|Steven Rosenberg" dist/

# First 400 chars of homepage JSON-LD
python3 -c "import re; h=open('dist/index.html').read(); m=re.search(r'<script type=\"application/ld\\+json\"[^>]*>([^<]+)</script>', h); print(m.group(1)[:400] if m else 'no JSON-LD block found')"
```

### Post-deploy report

1. Negative grep count from `dist/` (expect 0)
2. Positive grep count broken down by pattern
3. First 400 chars of homepage JSON-LD `@graph` from `dist/index.html`
4. Confirmation `/public/images/hans-blog.jpg` and `/public/images/hans-qa.jpg` were deleted
5. Flags:
   - *Steven Rosenberg `Person.image` pending — real headshots required at `/public/images/steven-blog.jpg` and `/public/images/steven-qa.jpg` before re-adding the field*
   - *Steven Rosenberg `Person.sameAs` pending — verified personal LinkedIn or official bio URL still required*

### Files to change (5 code + 1 doc + 2 deletes)

**Code:**
- `src/components/home/Footer.tsx`
- `src/pages/Team.tsx`
- `src/components/schema/PersonSchema.tsx`
- `scripts/generateStaticTeamPage.ts`
- Any consumers of `<PersonSchema context=...>` (drop the prop) — likely `src/pages/BlogArticle.tsx` and `src/pages/QAPage.tsx`; will grep to confirm exact paths

**Doc:**
- `docs/AUTHORITY_POLICY.md`

**Delete:**
- `public/images/hans-blog.jpg`
- `public/images/hans-qa.jpg`

**Explicitly NOT changed:**
- `src/i18n/translations/buyersGuide/en.ts` (legitimate San Diego content)
- `src/pages/admin/{LocationGenerator,NavbarImageGenerator,QAGenerator}.tsx` (admin dropdown options)
- `src/integrations/supabase/types.ts`, applied SQL migrations, `.env`, `src/integrations/supabase/client.ts`

