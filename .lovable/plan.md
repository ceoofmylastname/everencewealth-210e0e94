

# Create Phone Number Matching Database Function

## Overview

This plan creates a PostgreSQL function `match_lead_by_phone` that enables flexible phone number matching by stripping all formatting characters (spaces, dashes, parentheses) before comparison.

---

## Problem Being Solved

| Issue | Example |
|-------|---------|
| Lead phone in database | `765 476 4675` (with spaces) |
| Webhook search pattern | `654764675` (digits only) |
| Current ILIKE query | `phone_number ILIKE '%654764675%'` → **No match** |

The spaces in the stored phone numbers prevent the ILIKE pattern from matching.

---

## Solution: Database Function

### SQL to Execute

```sql
CREATE OR REPLACE FUNCTION public.match_lead_by_phone(
  search_digits text,
  agent_uuid uuid
)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  phone_number text,
  full_phone text,
  assigned_agent_id uuid,
  first_contact_at timestamptz,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id, 
    l.first_name, 
    l.last_name, 
    l.phone_number, 
    l.full_phone, 
    l.assigned_agent_id,
    l.first_contact_at,
    l.created_at
  FROM crm_leads l
  WHERE l.assigned_agent_id = agent_uuid
    AND (
      regexp_replace(l.phone_number, '[^0-9]', '', 'g') LIKE '%' || search_digits || '%'
      OR regexp_replace(COALESCE(l.full_phone, ''), '[^0-9]', '', 'g') LIKE '%' || search_digits || '%'
    )
  ORDER BY l.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';
```

---

## How It Works

1. **Input Parameters**:
   - `search_digits`: The last 9 digits of the phone number (e.g., `654764675`)
   - `agent_uuid`: The agent's UUID for security filtering

2. **Processing**:
   - `regexp_replace(phone_number, '[^0-9]', '', 'g')` strips all non-digit characters
   - `765 476 4675` becomes `7654764675`
   - LIKE pattern `%654764675%` now matches!

3. **Security**:
   - Only returns leads assigned to the specified agent
   - `SECURITY DEFINER` allows bypassing RLS for webhook use
   - `SET search_path = 'public'` prevents search path attacks

---

## Implementation Steps

1. **Create migration file** with the function definition
2. **Run migration** to add function to database
3. **Update webhook** to use this function instead of ILIKE query

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/20260203213500_add_match_lead_by_phone_function.sql` | Create new migration |

---

## After Migration

The Salestrail webhook can call this function:

```typescript
const { data: matchedLeads } = await supabase
  .rpc('match_lead_by_phone', { 
    search_digits: last9,  // e.g., "654764675"
    agent_uuid: agent.id 
  });

const lead = matchedLeads?.[0] || null;
```

