
### Why you’re seeing that error (confirmed)

I traced the exact failing request in your current session:

```text
PATCH /rest/v1/advisor_slugs?advisor_id=eq.2202819c-...&slug=eq.davidrosenberg&is_active=eq.true
Body: {"is_active": false}
Response: 403
Message: "new row violates row-level security policy for table advisor_slugs"
```

The issue is the new UPDATE policy that was added:

```sql
advisor_id = get_my_advisor_id_from_portal(auth.uid())
```

For your logged-in user, that helper returns `NULL`, while your slug row’s `advisor_id` is a real advisor UUID (`2202819c-...`). So the UPDATE check fails and deletion/edit deactivation is blocked.

### Root cause in plain language

- The policy compares against the wrong identity source for this table.
- `advisor_slugs.advisor_id` stores advisor record IDs.
- `get_my_advisor_id_from_portal(...)` does not reliably return that advisor record ID for your account context.
- Result: policy condition is false during update, so backend blocks it.

### Implementation plan to fix

1. **Replace the broken UPDATE policy with a canonical one**
   - Drop conflicting/duplicate UPDATE policies on `advisor_slugs`.
   - Recreate one UPDATE policy using the advisor-ID helper that maps auth user → advisor record ID (`get_advisor_id_for_auth(auth.uid())`), not the portal helper.
   - Include explicit `USING` and `WITH CHECK` with the same condition.

2. **(Recommended) Align INSERT policy the same way**
   - Update slug INSERT policy to use the same advisor-ID helper.
   - This avoids policy drift and future “works for create but not update” inconsistencies.

3. **Keep frontend logic as-is**
   - `WorkshopSlugSetup.tsx` delete/edit flow is structurally fine.
   - No UI redesign needed for core fix.

4. **Add clearer UI error handling (small enhancement)**
   - Map policy errors (`42501`) to a user-friendly message like:
     - “You don’t have permission to modify this URL. Please refresh and try again.”
   - Prevents confusing raw backend error text.

### Technical details

- Observed identity values for your session:
  - `get_my_advisor_id_from_portal(auth_uid)` → `NULL`
  - `get_advisor_id_for_auth(auth_uid)` → `2202819c-df54-435b-b86c-c6d65f363d4c`
- Active slug row being updated:
  - `advisor_id = 2202819c-df54-435b-b86c-c6d65f363d4c`
- That mismatch is exactly why the current UPDATE policy denies the operation.

### Validation checklist after fix

1. On `/portal/advisor/workshops/slug-setup`, click **Delete URL** → confirm → should succeed.
2. Create a new URL afterward → should succeed.
3. Edit existing URL (deactivate old + insert new) → should succeed.
4. Confirm only one active slug exists per advisor (unique partial index behavior still intact).
5. Confirm another advisor cannot deactivate someone else’s slug.

<lov-actions>
<lov-suggestion message="Test the slug delete and edit flow end-to-end on /portal/advisor/workshops/slug-setup and verify no permission errors appear.">Verify end-to-end</lov-suggestion>
<lov-suggestion message="Replace duplicate advisor_slugs UPDATE policies with one canonical policy using get_advisor_id_for_auth(auth.uid()) for both USING and WITH CHECK.">Harden slug RLS policy</lov-suggestion>
<lov-suggestion message="Add friendly handling for backend permission error code 42501 in WorkshopSlugSetup so users see actionable guidance instead of raw policy errors.">Improve error messaging</lov-suggestion>
</lov-actions>
