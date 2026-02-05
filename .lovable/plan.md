
## Update About Us Page LinkedIn Links

### Problem Identified
The LinkedIn URLs in the `about_page_content.founders` JSONB column are incorrect. The FounderProfiles component reads `linkedin_url` from this data, causing the wrong links to appear.

### Current State vs Required State

| Founder | Current (Broken) | Required (Correct) |
|---------|------------------|-------------------|
| Cédric Van Hecke | `https://linkedin.com/in/cedricvanhecke` | `https://www.linkedin.com/company/delsolprimehomes/` |
| Steven Roberts | `https://linkedin.com/in/stevenroberts` | `https://www.linkedin.com/company/delsolprimehomes/` |
| Hans Beeckman | `https://linkedin.com/in/hansbeeckman` | `https://www.linkedin.com/in/hansbeeckman/` |

### Solution
Update the `founders` JSONB array in the `about_page_content` table to use the correct LinkedIn URLs.

### Technical Details

**Database Change Required:**
Run an UPDATE query on `about_page_content` table to fix the `linkedin` field in the founders JSONB array.

**SQL to Execute:**
```sql
UPDATE about_page_content
SET founders = jsonb_set(
  jsonb_set(
    jsonb_set(
      founders,
      '{0,linkedin}', '"https://www.linkedin.com/company/delsolprimehomes/"'
    ),
    '{1,linkedin}', '"https://www.linkedin.com/company/delsolprimehomes/"'
  ),
  '{2,linkedin}', '"https://www.linkedin.com/in/hansbeeckman/"'
)
WHERE slug = 'main';
```

**Note:** The founders array order is:
- Index 0: Steven Roberts → Company page
- Index 1: Cédric Van Hecke → Company page  
- Index 2: Hans Beeckman → Personal profile

### Already Correct
- The `team_members` database table has the correct URLs
- The hardcoded `FOUNDERS_DATA` in `aboutSchemaGenerator.ts` has the correct URLs

### Testing Checklist
1. Visit the About Us page in any language
2. Verify all three LinkedIn buttons are visible on founder cards
3. Click each button and confirm correct destination:
   - Steven Roberts → Company page opens
   - Cédric Van Hecke → Company page opens
   - Hans Beeckman → Personal profile opens
4. Confirm all links open in a new tab
5. Test on desktop and mobile views
6. Verify consistency across multiple language versions
