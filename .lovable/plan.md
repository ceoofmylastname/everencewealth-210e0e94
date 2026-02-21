
# Remove Director Step and Fix Manager List

## Summary
Remove the "Which director referred you?" step from the intake form (reducing from 9 to 8 steps) and update the "Select your manager" step to pull from the `crm_agents` table instead of `contracting_agents`.

## Changes

### 1. Remove Director Step (Step 1)
- Delete the `DIRECTORS` constant and the `referring_director` field from form state
- Remove step 1 (director selection) entirely
- Renumber all subsequent steps (current 2-8 become 1-7)
- Update `TOTAL_STEPS` from 9 to 8
- Update `canContinue()` switch cases accordingly

### 2. Update Manager Step to Use CRM Agents
- Change the `useEffect` query from `contracting_agents` (filtering by `contracting_role = 'manager'`) to `crm_agents` (filtering by `is_active = true`)
- This pulls the list of agents that admin has invited through the CRM system
- Display format remains the same: first_name + last_name with letter badges

### 3. Update Edge Function
- Remove `referring_director` from the request body destructuring
- Remove `referring_director` from the `contracting_agents` insert (column still exists in DB but will be null)

---

## Technical Details

### `src/pages/ContractingIntake.tsx`
- Remove `DIRECTORS` array (line 18)
- Remove `referring_director` from `FormData` interface and initial state
- Change `TOTAL_STEPS` from 9 to 8
- Update manager fetch: `supabase.from("crm_agents").select("id, first_name, last_name").eq("is_active", true)`
- Remove case 1 (director), shift all cases down by 1
- Update `canContinue()` to match new step numbers

### `supabase/functions/contracting-intake/index.ts`
- Remove `referring_director` from body destructuring and from the insert object

### New Step Order
1. Who referred you? (text)
2. What is your name? (first + last)
3. What is your email?
4. What is your phone number?
5. Where are you located? (state + address)
6. Are you currently licensed? (yes/no)
7. Select your manager (from CRM agents)
8. Consent checkbox + submit
