

# Fix "Select your manager" -- No Managers Showing

## Problem
The intake form queries `crm_agents` using the anonymous (unauthenticated) client. The table has RLS policies that only allow authenticated agents/admins to read data. Since the `/apply` form is public (no login required), the query returns zero rows.

## Solution
Create a lightweight backend function called `list-contracting-managers` that uses the service role to fetch active CRM agents and returns only their id, first name, and last name. The intake form will call this function instead of querying the table directly.

This avoids weakening RLS on `crm_agents` while still letting public applicants see the manager list.

## Changes

### 1. New backend function: `list-contracting-managers`
- File: `supabase/functions/list-contracting-managers/index.ts`
- Uses service role client to query `crm_agents` where `is_active = true`
- Returns only `id`, `first_name`, `last_name` (no sensitive data)
- Supports GET requests, returns JSON array

### 2. Update `src/pages/ContractingIntake.tsx`
- Replace the direct `supabase.from("crm_agents")` query in the `useEffect`
- Instead call `supabase.functions.invoke("list-contracting-managers")`
- Parse the response and set the managers list

No database or RLS changes needed.

