
# Fix Founder Experience Years on About Page

## Issue Identified

The About page (`/en/about`) displays founder data from two different data sources:
1. **`team_members` table** - Used on the Team page (already updated correctly)
2. **`about_page_content.founders` JSONB column** - Used on the About page (**outdated values**)

### Current Values in `about_page_content.founders`:
| Founder | Current Value | Should Be |
|---------|---------------|-----------|
| Cédric Van Hecke | 26 years | **15 years** |
| Hans Beeckman | 5 years | **6 years** |

## Solution

Update the `founders` JSONB column in the `about_page_content` table to set:
- Cédric Van Hecke: `years_experience: 15`
- Hans Beeckman: `years_experience: 6`

---

## Technical Details

### Database Update Required

Execute a SQL UPDATE on the `about_page_content` table that modifies the JSONB `founders` array:

```sql
UPDATE about_page_content 
SET founders = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem->>'name' = 'Cédric Van Hecke' 
        THEN jsonb_set(elem, '{years_experience}', '15')
      WHEN elem->>'name' = 'Hans Beeckman' 
        THEN jsonb_set(elem, '{years_experience}', '6')
      ELSE elem
    END
  )
  FROM jsonb_array_elements(founders) AS elem
)
WHERE slug = 'main';
```

This updates the embedded founder data within the JSONB column while preserving all other fields.

### Files Involved
- No code changes required
- Database update only (`about_page_content` table)

### After Update
The About page will automatically display:
- Steven Roberts: **15+ yrs** (unchanged)
- Cédric Van Hecke: **15+ yrs** ✓
- Hans Beeckman: **6+ yrs** ✓
